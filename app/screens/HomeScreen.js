import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Nutrio</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={styles.date}>Today, Dec 22</Text>
        <Text style={styles.calories}>2560</Text>
        <Text style={styles.kcal}>kcal left</Text>
      </View>

      {/* Meals */}
      <View style={styles.meals}>
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
          <View key={meal} style={styles.mealItem}>
            <Text style={styles.mealText}>{meal}</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  header: {
    height: 80,
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  card: {
    margin: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },
  date: { fontSize: 16, color: "#666", marginBottom: 10 },
  calories: { fontSize: 36, fontWeight: "700" },
  kcal: { fontSize: 16, color: "#888" },
  meals: { margin: 20 },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  mealText: { fontSize: 16, fontWeight: "500" },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 20, fontWeight: "600" },
});
