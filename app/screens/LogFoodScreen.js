import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MealsContext } from "../context/MealsContext";
import { UserContext } from "../context/UserContext";
import { COLORS } from "../theme/colors";
import nigeriaFoods from "../data/nigeriaFoods";

import { Text, TextInput } from "../components/MetaText";
const normalizeFood = (food) => ({
  id: food.id,
  name: food.name,
  calories: food.calories,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
  category: food.category,
  tags: food.tags || [],
  weight: food.servingLabel,
  servingGrams: food.servingGrams,
  servings: food.servings,
  source: food.source,
  dataConfidence: food.dataConfidence,
});

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function LogFoodScreen({ navigation }) {
  const { meals } = useContext(MealsContext);
  const { user } = useContext(UserContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const normalizedFoods = useMemo(() => nigeriaFoods.map(normalizeFood), []);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const consumedToday = useMemo(
    () =>
      meals
        .filter((meal) => (meal?.dateKey ?? todayKey) === todayKey)
        .reduce((sum, meal) => sum + Number(meal?.calories ?? 0), 0),
    [meals, todayKey],
  );

  const calorieTarget = Number(user?.targets?.calories ?? 0);
  const hasTarget = Number.isFinite(calorieTarget) && calorieTarget > 0;
  const remainingCalories = hasTarget
    ? Math.round(calorieTarget - consumedToday)
    : null;

  const recommendedFoods = useMemo(() => {
    const goal = String(user?.goal ?? "maintain").toLowerCase();
    const scored = normalizedFoods
      .filter((food) => Number(food?.calories ?? 0) > 0)
      .map((food) => {
        const calories = Number(food.calories ?? 0);
        const protein = Number(food.protein ?? 0);
        const carbs = Number(food.carbs ?? 0);
        const fat = Number(food.fat ?? 0);
        const proteinDensity = calories > 0 ? protein / calories : 0;

        let score = 0;
        let reason = "Balanced option";

        if (remainingCalories != null) {
          if (remainingCalories > 0) {
            const targetMealCalories = Math.min(
              600,
              Math.max(120, remainingCalories),
            );
            score += 120 - Math.abs(calories - targetMealCalories);
            if (calories <= remainingCalories) {
              score += 35;
              reason = `Fits ${remainingCalories} kcal left`;
            } else {
              score -= Math.min(80, (calories - remainingCalories) * 0.4);
            }
          } else {
            score -= calories * 0.55;
            reason = "Lighter pick after target reached";
          }
        }

        if (goal === "lose") {
          score += proteinDensity * 900;
          score -= fat * 1.8;
          if (calories <= 280) {
            reason = "Lower-calorie option";
          }
        } else if (goal === "gain") {
          score += proteinDensity * 600;
          score += carbs * 0.8;
          score += Math.min(700, calories) * 0.08;
          reason = "Energy-dense option for gain";
        } else {
          score += proteinDensity * 700;
          score += Math.min(protein, 35) * 1.2;
        }

        return {
          ...food,
          recommendationReason: reason,
          recommendationScore: score,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    const picked = [];
    const usedCategories = new Set();
    for (const food of scored) {
      if (picked.length >= 4) break;
      if (food.category && usedCategories.has(food.category)) continue;
      if (food.category) usedCategories.add(food.category);
      picked.push(food);
    }
    return picked;
  }, [normalizedFoods, remainingCalories, user?.goal]);

  const openFoodDetails = (food) => {
    navigation.navigate("FoodDetails", { food });
  };

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 1) {
      setResults([]);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    const handle = setTimeout(() => {
      const filtered = normalizedFoods
        .filter((food) => {
          const name = food.name.toLowerCase();
          const tagMatch = food.tags?.some((tag) =>
            tag.toLowerCase().includes(trimmed),
          );
          return name.includes(trimmed) || tagMatch;
        });
      setResults(filtered);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(handle);
  }, [query, normalizedFoods]);

  const data =
    query.trim().length >= 1
      ? results
      : normalizedFoods.slice(0, 10);

  const showRecommendations = query.trim().length < 1;

  const listHeader = (
    <View>
      {showRecommendations ? (
        <View style={styles.recommendSection}>
          <View style={styles.recommendTopRow}>
            <Text style={styles.recommendTitle}>Recommended for you</Text>
            {remainingCalories != null ? (
              <Text style={styles.recommendMeta}>
                {remainingCalories > 0
                  ? `${remainingCalories} kcal left`
                  : "Target reached"}
              </Text>
            ) : null}
          </View>

          {recommendedFoods.map((item) => (
            <TouchableOpacity
              key={`rec-${item.id}`}
              style={[styles.foodItem, styles.recommendedItem]}
              onPress={() => openFoodDetails(item)}
            >
              <View>
                <View style={styles.foodTitleRow}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendBadgeText}>Pick</Text>
                  </View>
                </View>
                <Text style={styles.recommendReason}>
                  {item.recommendationReason}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openFoodDetails(item)}
              >
                <Ionicons name="add" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {query.trim().length >= 1 ? "Results" : "Popular Nigerian foods"}
        </Text>
        {isSearching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : null}
      </View>
      {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Food</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search food..."
          style={styles.searchInput}
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate("Scan")}
        >
          <Ionicons name="scan" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>
        Search by name or tag • Tap scan to use your camera
      </Text>

      {/* Recent foods list */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodItem}
            onPress={() => openFoodDetails(item)}
          >
            <View>
              <View style={styles.foodTitleRow}>
                <Text style={styles.foodName}>{item.name}</Text>
                {item.dataConfidence === "proxy" ? (
                  <View style={styles.estimatedBadge}>
                    <Text style={styles.estimatedBadgeText}>Estimated</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.foodInfo}>
                {item.weight ? item.weight : "View details"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openFoodDetails(item)}
            >
              <Ionicons name="add" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.trim().length >= 1 && !isSearching ? (
            <Text style={styles.emptyText}>No matches found.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scanButton: {
    position: "absolute",
    right: 10,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -12,
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 10,
  },
  recommendSection: {
    marginBottom: 6,
  },
  recommendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  recommendTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  recommendMeta: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "700",
  },
  recommendedItem: {
    borderWidth: 1,
    borderColor: "#E3F5DF",
    backgroundColor: "#F7FCF6",
  },
  foodItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  foodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#E9F7ED",
  },
  recommendBadgeText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  recommendReason: {
    fontSize: 12,
    color: "#4B5563",
  },
  foodInfo: {
    fontSize: 13,
    color: "#6B7280",
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
  addButton: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 20,
    padding: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 20,
  },
});

