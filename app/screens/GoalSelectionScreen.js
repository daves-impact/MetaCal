import { useContext, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { computeTargets } from "../targets";
import { Text } from "../components/MetaText";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const goals = [
  { id: 1, key: "lose", label: "Lose Weight", icon: "trending-down-outline" },
  { id: 2, key: "gain", label: "Gain Muscle", icon: "fitness-outline" },
  { id: 3, key: "maintain", label: "Maintain Weight", icon: "pulse-outline" },
];

export default function GoalSelectionScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const [selectedGoal, setSelectedGoal] = useState(
    goals.find((goal) => goal.key === user.goal) || null,
  );
  const fromSettings = route?.params?.fromSettings;

  const selectGoal = (goal) => {
    setSelectedGoal(goal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your main goal?</Text>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedGoal?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.goalItem, isSelected && styles.selected]}
              onPress={() => selectGoal(item)}
            >
              <Text style={styles.goalText}>{item.label}</Text>
              <View style={styles.rightSide}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={20} color="#67bd52" />
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.continueBtn, !selectedGoal && styles.disabled]}
        onPress={() => {
          const nextUser = { ...user, goal: selectedGoal?.key || "" };
          const targets = computeTargets(nextUser);
          setUser({ ...nextUser, targets });
          if (authUser?.uid) {
            setDoc(
              doc(db, "users", authUser.uid),
              { goal: selectedGoal?.key || "", targets },
              { merge: true },
            );
          }
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("ActivityLevel");
        }}
        disabled={!selectedGoal}
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
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9F7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: "#e6f8e6", borderColor: "#4CAF50" },
  goalText: { fontSize: 16 },
  continueBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#67bd52",
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: "#C7E9BF",
  },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },
});
