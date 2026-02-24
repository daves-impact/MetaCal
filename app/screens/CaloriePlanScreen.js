import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import { computeTargets } from "../targets";
import { useAppAlert } from "../context/AlertContext";

import { Text, TextInput } from "../components/MetaText";
export default function CaloriePlanScreen({ onFinish, navigation }) {
  const { authUser } = useContext(AuthContext);
  const { user, setUser } = useContext(UserContext);
  const { showAlert } = useAppAlert();
  const [saving, setSaving] = useState(false);
  const targets = useMemo(() => computeTargets(user), [user]);

  const handleFinish = async () => {
    if (!authUser) {
      showAlert("Not signed in", "Please log in to save your profile.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: user?.name || "",
        gender: user?.gender || "",
        age: user?.age || "",
        height: user?.height || "",
        currentWeight: user?.currentWeight || "",
        targetWeight: user?.targetWeight || "",
        goal: user?.goal || "",
        activityLevel: user?.activityLevel || null,
        targets,
        profileComplete: true,
        email: authUser.email || "",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", authUser.uid), payload, { merge: true });
      setUser({ ...user, targets, profileComplete: true });
      await SecureStore.deleteItemAsync("metacal_onboarding_gate");
      onFinish?.();
      navigation?.reset?.({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (error) {
      showAlert(
        "Save failed",
        error?.message || "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your personalized calorie plan is ready!</Text>

      <View style={styles.chartContainer}>
        <Ionicons name="flame-outline" size={24} color="#67bd52" />
        <Text style={styles.calories}>{targets.calories}</Text>
        <Text style={styles.kcal}>kcal</Text>
      </View>

      <View style={styles.macros}>
        <Text style={styles.macro}>Carbs - {targets.carbs}g</Text>
        <Text style={styles.macro}>Protein - {targets.protein}g</Text>
        <Text style={styles.macro}>Fat - {targets.fat}g</Text>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={handleFinish}>
        <Text style={styles.btnText}>
          {saving ? "Saving..." : "Start Your Plan Now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  chartContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    borderColor: "#67bd52",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  calories: { fontSize: 32, fontWeight: "700" },
  kcal: { fontSize: 16, color: "#666" },
  macros: { marginTop: 20, alignItems: "center" },
  macro: { fontSize: 16, marginVertical: 5 },
  startBtn: {
    marginTop: 30,
    backgroundColor: "#67bd52",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },
});



