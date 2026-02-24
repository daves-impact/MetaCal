import { useContext, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { computeTargets } from "../targets";
import { Text } from "../components/MetaText";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const LEVELS = [
  {
    id: 1,
    key: "sedentary",
    label: "Sedentary",
    description: "Mostly sitting; little or no exercise.",
    multiplier: 1.2,
    icon: "bed-outline",
  },
  {
    id: 2,
    key: "light",
    label: "Lightly active",
    description: "Light exercise 1-3 days/week.",
    multiplier: 1.375,
    icon: "walk-outline",
  },
  {
    id: 3,
    key: "moderate",
    label: "Moderately active",
    description: "Moderate exercise 3-5 days/week.",
    multiplier: 1.55,
    icon: "bicycle-outline",
  },
  {
    id: 4,
    key: "very",
    label: "Very active",
    description: "Hard exercise 6-7 days/week.",
    multiplier: 1.725,
    icon: "barbell-outline",
  },
];

export default function ActivityLevelScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const [selected, setSelected] = useState(user?.activityLevel || null);
  const fromSettings = route?.params?.fromSettings;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How active are you?</Text>

      <FlatList
        data={LEVELS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selected?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.selected]}
              onPress={() => setSelected(item)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color="#67bd52" />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.continueBtn, !selected && styles.disabled]}
        onPress={() => {
          const nextUser = { ...user, activityLevel: selected };
          const targets = computeTargets(nextUser);
          setUser({ ...nextUser, targets });
          if (authUser?.uid) {
            setDoc(
              doc(db, "users", authUser.uid),
              { activityLevel: selected, targets },
              { merge: true },
            );
          }
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Personalization");
        }}
        disabled={!selected}
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
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9F7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    paddingRight: 12,
  },
  selected: { backgroundColor: "#e6f8e6", borderColor: "#4CAF50" },
  label: { fontSize: 16 },
  description: { fontSize: 12, color: "#6B7280", marginTop: 4 },
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
