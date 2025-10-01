import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const goals = [
  { id: 1, label: "Lose Weight" },
  { id: 2, label: "Gain Muscle" },
  { id: 3, label: "Maintain Weight" },
  { id: 4, label: "Boost Energy" },
  { id: 5, label: "Improve Nutrition" },
  { id: 6, label: "Gain Weight" },
];

export default function GoalSelectionScreen({ navigation }) {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((goal) => goal !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your main goal with Nutrio?</Text>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedGoals.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.goalItem, isSelected && styles.selected]}
              onPress={() => toggleGoal(item.id)}
            >
              <Text style={styles.goalText}>{item.label}</Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => navigation.navigate("Personalization")}
      >
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
  },
  selected: { backgroundColor: "#e6f8e6", borderColor: "#4CAF50" },
  goalText: { fontSize: 16 },
  checkmark: { fontSize: 18, color: "green" },
  continueBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#8BC34A",
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },
});
