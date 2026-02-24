import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MealsContext } from "../context/MealsContext";
import { COLORS } from "../theme/colors";
import { useAppAlert } from "../context/AlertContext";

import { Text } from "../components/MetaText";

const roundTo2 = (value) => Number(value.toFixed(2));
const formatMacro = (value) => roundTo2(value).toFixed(2);
const formatCalories = (value) => String(Math.round(value));
export default function FoodDetailsScreen({ route, navigation }) {
  const { food } = route.params ?? {};
  const { addMeal, removeMeal, meals } = useContext(MealsContext);
  const { showAlert } = useAppAlert();
  const [quantity, setQuantity] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedServing, setSelectedServing] = useState(
    food?.servings?.[0] ?? null,
  );

  const foodName = food?.name ?? "Meal";
  const baseCalories = food?.calories ?? null;
  const baseProtein = food?.protein ?? null;
  const baseCarbs = food?.carbs ?? null;
  const baseFat = food?.fat ?? null;
  const baseServingGrams = food?.servingGrams ?? selectedServing?.grams ?? null;
  const servingMultiplier =
    selectedServing?.grams && baseServingGrams
      ? selectedServing.grams / baseServingGrams
      : 1;

  const totalCaloriesRaw = (baseCalories ?? 0) * servingMultiplier * quantity;
  const totalProteinRaw = (baseProtein ?? 0) * servingMultiplier * quantity;
  const totalCarbsRaw = (baseCarbs ?? 0) * servingMultiplier * quantity;
  const totalFatRaw = (baseFat ?? 0) * servingMultiplier * quantity;
  const totalCalories = Math.round(totalCaloriesRaw);
  const totalProtein = roundTo2(totalProteinRaw);
  const totalCarbs = roundTo2(totalCarbsRaw);
  const totalFat = roundTo2(totalFatRaw);
  const isEstimated = food?.dataConfidence === "proxy";
  const weightLabel =
    selectedServing?.label ?? food?.weight ?? food?.servingLabel ?? "Serving";
  const hasNutrition =
    baseCalories !== null ||
    baseProtein !== null ||
    baseCarbs !== null ||
    baseFat !== null;

  const formatTimeLabel = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return `${hh}:${mm} ${ampm}`;
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isLoggedMeal = meals.some((meal) => meal.id === food?.id);

  const handleAddMeal = () => {
    const now = new Date();
    const meal = {
      id: Date.now().toString(),
      name: foodName,
      timeLabel: formatTimeLabel(now),
      dateKey: formatDateKey(now),
      servingLabel: weightLabel,
      servingGrams: selectedServing?.grams ?? food?.servingGrams ?? null,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      dataConfidence: food?.dataConfidence ?? "none",
    };

    addMeal(meal);

    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    setMenuVisible(false);
  };

  const handleDeleteMeal = () => {
    setMenuVisible(false);
    if (!isLoggedMeal) return;
    showAlert("Delete meal?", "This will remove it from your log.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeMeal(food.id);
          navigation.navigate("MainTabs", { screen: "Home" });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{foodName}</Text>
          <TouchableOpacity
            style={styles.menuTrigger}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.imageBox}>
          {food?.image ? (
            <Image source={food.image} style={styles.foodImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="fast-food-outline" size={32} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.foodTitleRow}>
            <Text style={styles.foodTitle}>{foodName}</Text>
            {isEstimated ? (
              <View style={styles.estimatedBadge}>
                <Text style={styles.estimatedBadgeText}>Estimated</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Nutrition Circle */}
        <View style={styles.calorieCircle}>
          <Text style={styles.kcal}>
            {hasNutrition ? formatCalories(totalCalories) : "N/A"}
          </Text>
          <Text style={styles.kcalLabel}>
            {hasNutrition ? "kcal" : "No nutrition yet"}
          </Text>
        </View>

        {/* Nutrient Breakdown */}
        <View style={styles.macros}>
          <Text style={styles.macro}>
            Carbs: {hasNutrition ? `${formatMacro(totalCarbs)}g` : "N/A"}
          </Text>
          <Text style={styles.macro}>
            Protein: {hasNutrition ? `${formatMacro(totalProtein)}g` : "N/A"}
          </Text>
          <Text style={styles.macro}>
            Fat: {hasNutrition ? `${formatMacro(totalFat)}g` : "N/A"}
          </Text>
          {isEstimated ? (
            <Text style={styles.estimateNote}>Values are estimated.</Text>
          ) : null}
        </View>

        {/* Weight and Quantity */}
        <View style={styles.controls}>
          <Text style={styles.weightLabel}>Serving size</Text>
          <Text style={styles.weightValue}>{weightLabel}</Text>
          {Array.isArray(food?.servings) && food.servings.length > 0 ? (
            <View style={styles.servingRow}>
              {food.servings.map((serving) => {
                const isActive = serving.label === selectedServing?.label;
                return (
                  <TouchableOpacity
                    key={serving.label}
                    style={[
                      styles.servingChip,
                      isActive && styles.servingChipActive,
                    ]}
                    onPress={() => setSelectedServing(serving)}
                  >
                    <Text
                      style={[
                        styles.servingChipText,
                        isActive && styles.servingChipTextActive,
                      ]}
                    >
                      {serving.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          <Text style={styles.servingHint}>Servings count</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove-circle-outline" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add-circle-outline" size={26} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color="#E11D48"
              />
              <Text style={styles.menuText}>Favorite</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={[styles.menuItem, !isLoggedMeal && styles.menuItemDisabled]}
              onPress={handleDeleteMeal}
              disabled={!isLoggedMeal}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.menuText, styles.menuDeleteText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  imageBox: {
    alignItems: "center",
    marginVertical: 20,
  },
  foodImage: { width: 80, height: 80 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  foodTitleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  estimatedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  estimatedBadgeText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  calorieCircle: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  kcal: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
  kcalLabel: { color: "#666", textAlign: "center" },
  macros: { marginVertical: 10, alignItems: "center" },
  macro: { fontSize: 16, color: "#555", marginBottom: 5, textAlign: "center" },
  estimateNote: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  controls: {
    marginTop: 20,
    alignItems: "center",
  },
  weightLabel: { fontSize: 16, color: "#777", textAlign: "center" },
  weightValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  servingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  servingChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  servingChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  servingChipText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  servingChipTextActive: {
    color: COLORS.primaryDark,
  },
  servingHint: {
    marginTop: 8,
    marginBottom: 2,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 10,
  },
  qty: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 50,
    marginTop: 30,
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 20,
  },
  menuCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemDisabled: {
    opacity: 0.4,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  menuDeleteText: {
    color: "#EF4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
});


