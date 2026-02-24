import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import nigeriaFoods from "../data/nigeriaFoods";
import { MealsContext } from "../context/MealsContext";
import { useAppAlert } from "../context/AlertContext";
import { analyzeFoodImage } from "../services/scan";

import { Text } from "../components/MetaText";

type ScanNavigation = {
  navigate: (name: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
};

type RawScannedFood = {
  name?: string;
  portionLabel?: string;
  grams?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: "high" | "medium" | "low" | string;
};

type DetectedFoodDraft = {
  name: string;
  portionLabel: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: string;
  dataConfidence: string;
  source: string;
};

type AnalyzeImageInput = {
  uri?: string;
  base64?: string | null;
  mimeType?: string;
};

const round2 = (value: number | string | undefined | null) =>
  Number((Number(value) || 0).toFixed(2));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const formatTimeLabel = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm} ${ampm}`;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeText = (value: string | undefined | null) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findLocalFoodMatch = (scanName: string | undefined) => {
  const key = normalizeText(scanName);
  if (!key) return null;

  return (
    nigeriaFoods.find((food: any) => {
      const foodName = normalizeText(food.name);
      if (!foodName) return false;
      if (foodName.includes(key) || key.includes(foodName)) return true;
      return Array.isArray(food.tags)
        ? food.tags.some((tag: string) => {
            const normalizedTag = normalizeText(tag);
            return normalizedTag && key.includes(normalizedTag);
          })
        : false;
    }) || null
  );
};

const mapScanItemToMealDraft = (item: RawScannedFood): DetectedFoodDraft => {
  const localMatch = findLocalFoodMatch(item?.name);
  const detectedGrams = Math.max(0, Number(item?.grams) || 0);

  if (localMatch) {
    const servingGrams = Number(localMatch.servingGrams) || 1;
    const grams = detectedGrams > 0 ? detectedGrams : servingGrams;
    const scale = grams / servingGrams;

    return {
      name: localMatch.name,
      portionLabel:
        String(item?.portionLabel || "").trim() || `${Math.round(grams)}g`,
      grams,
      calories: Math.round((Number(localMatch.calories) || 0) * scale),
      protein: round2((Number(localMatch.protein) || 0) * scale),
      carbs: round2((Number(localMatch.carbs) || 0) * scale),
      fat: round2((Number(localMatch.fat) || 0) * scale),
      confidence: item?.confidence || "medium",
      dataConfidence: localMatch.dataConfidence || "proxy",
      source: "scan-local",
    };
  }

  return {
    name: String(item?.name || "Food").trim() || "Food",
    portionLabel:
      String(item?.portionLabel || "").trim() ||
      (detectedGrams > 0 ? `${Math.round(detectedGrams)}g` : "1 serving"),
    grams: detectedGrams,
    calories: Math.round(Math.max(0, Number(item?.calories) || 0)),
    protein: round2(item?.protein),
    carbs: round2(item?.carbs),
    fat: round2(item?.fat),
    confidence: item?.confidence || "medium",
    dataConfidence: "proxy",
    source: "scan-openai",
  };
};

export default function ScanScreen({ navigation }: { navigation: ScanNavigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFoodDraft[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<any>(null);
  const { addMeal } = useContext(MealsContext) as {
    addMeal: (meal: Record<string, unknown>) => void;
  };
  const { showAlert } = useAppAlert() as {
    showAlert: (
      title: string,
      message: string,
      actions?: { text: string; style?: string; onPress?: () => void }[],
    ) => void;
  };

  const analyzeBase64Image = async ({ uri, base64, mimeType }: AnalyzeImageInput) => {
    if (!base64) {
      showAlert("Image error", "Could not read the image for analysis.");
      return;
    }

    setPreviewUri(uri || null);
    setAnalyzing(true);
    try {
      const rawFoods = await analyzeFoodImage(base64, mimeType || "image/jpeg");
      const mappedFoods = rawFoods.map(mapScanItemToMealDraft);
      setDetectedFoods(mappedFoods);
      if (mappedFoods.length === 0) {
        showAlert("No food found", "Try a clearer photo with better lighting.");
      }
    } catch (error) {
      showAlert("Scan failed", getErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      await analyzeBase64Image({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || "image/jpeg",
      });
    }
  };

  const handleCaptureImage = async () => {
    if (!cameraRef.current || analyzing) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });
      await analyzeBase64Image({
        uri: photo?.uri,
        base64: photo?.base64,
        mimeType: "image/jpeg",
      });
    } catch (error) {
      showAlert("Camera error", getErrorMessage(error));
    }
  };

  const handleAddDetectedFoods = () => {
    if (!detectedFoods.length) return;

    const now = new Date();
    const dateKey = formatDateKey(now);
    const timeLabel = formatTimeLabel(now);

    detectedFoods.forEach((food: DetectedFoodDraft, index: number) => {
      addMeal({
        id: `${Date.now()}-${index}`,
        name: food.name,
        timeLabel,
        dateKey,
        servingLabel: food.portionLabel,
        servingGrams: food.grams || null,
        calories: Math.round(food.calories || 0),
        protein: round2(food.protein),
        carbs: round2(food.carbs),
        fat: round2(food.fat),
        dataConfidence: food.dataConfidence || "proxy",
        scanConfidence: food.confidence || "medium",
        source: food.source || "scan-openai",
      });
    });

    navigation.navigate("MainTabs", { screen: "Home" });
    InteractionManager.runAfterInteractions(() => {
      showAlert("Meals added", `${detectedFoods.length} scanned item(s) added.`);
    });
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Enable camera permission to scan meals.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() =>
            showAlert(
              "How scan works",
              "Take a meal photo, review detected foods, then add to your log.",
            )
          }
        >
          <Ionicons name="information" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
      </View>

      {previewUri ? (
        <View style={styles.previewBadge}>
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        </View>
      ) : null}

      {analyzing ? (
        <View style={styles.analyzingBadge}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.analyzingText}>Analyzing...</Text>
        </View>
      ) : null}

      {detectedFoods.length > 0 ? (
        <View style={styles.resultSheet}>
          <Text style={styles.resultTitle}>Detected foods</Text>
          <ScrollView style={styles.resultList}>
            {detectedFoods.map((food, index) => (
              <View key={`${food.name}-${index}`} style={styles.resultRow}>
                <View style={styles.resultNameCol}>
                  <Text style={styles.resultName}>{food.name}</Text>
                  <Text style={styles.resultMeta}>{food.portionLabel}</Text>
                </View>
                <View style={styles.resultValueCol}>
                  <Text style={styles.resultKcal}>{Math.round(food.calories)} kcal</Text>
                  <Text style={styles.resultMacros}>
                    P {food.protein.toFixed(2)}  C {food.carbs.toFixed(2)}  F {food.fat.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.addDetectedButton}
            onPress={handleAddDetectedFoods}
          >
            <Text style={styles.addDetectedButtonText}>Add all to log</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.utilityButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <Pressable style={styles.shutterButton} onPress={handleCaptureImage}>
          <View style={styles.shutterInner} />
        </Pressable>

        <TouchableOpacity style={styles.galleryButton} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={18} color="#111" />
          <Text style={styles.galleryText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    position: "absolute",
    top: "20%",
    left: "12%",
    right: "12%",
    aspectRatio: 1,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "#fff",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  utilityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    gap: 8,
  },
  galleryText: { fontSize: 14, fontWeight: "600", color: "#111" },
  previewBadge: {
    position: "absolute",
    bottom: 130,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
  },
  previewImage: { width: "100%", height: "100%" },
  analyzingBadge: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  analyzingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  resultSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 122,
    maxHeight: 290,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.97)",
    padding: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  resultList: {
    maxHeight: 180,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resultNameCol: {
    flex: 1,
    paddingRight: 10,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  resultMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  resultValueCol: {
    alignItems: "flex-end",
  },
  resultKcal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  resultMacros: {
    marginTop: 2,
    fontSize: 10,
    color: "#6B7280",
  },
  addDetectedButton: {
    marginTop: 10,
    backgroundColor: "#67bd52",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  addDetectedButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#67bd52",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 22,
  },
  permissionButtonText: { color: "#fff", fontWeight: "600" },
});
