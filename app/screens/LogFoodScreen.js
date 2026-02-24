import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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
  weight: food.servingLabel,
  servingGrams: food.servingGrams,
  servings: food.servings,
  source: food.source,
  dataConfidence: food.dataConfidence,
});

export default function LogFoodScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

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
      const filtered = nigeriaFoods
        .filter((food) => {
          const name = food.name.toLowerCase();
          const tagMatch = food.tags?.some((tag) =>
            tag.toLowerCase().includes(trimmed),
          );
          return name.includes(trimmed) || tagMatch;
        })
        .map(normalizeFood);
      setResults(filtered);
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(handle);
  }, [query]);

  const data =
    query.trim().length >= 1
      ? results
      : nigeriaFoods.slice(0, 10).map(normalizeFood);

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

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {query.trim().length >= 1 ? "Results" : "Popular Nigerian foods"}
        </Text>
        {isSearching ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : null}
      </View>
      {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

      {/* Recent foods list */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
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
    marginBottom: 14,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 10,
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



