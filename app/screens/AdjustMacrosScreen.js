import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../theme/colors";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { computeTargets } from "../targets";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

import { Text, TextInput } from "../components/MetaText";
const GOALS = [
  {
    id: "calories",
    label: "Calorie goal",
    value: "0",
    icon: "flame",
    color: COLORS.primary,
  },
  {
    id: "protein",
    label: "Protein goal",
    value: "0",
    icon: "barbell-outline",
    color: COLORS.protein,
  },
  {
    id: "carbs",
    label: "Carb goal",
    value: "0",
    icon: "leaf-outline",
    color: COLORS.carbs,
  },
  {
    id: "fat",
    label: "Fat goal",
    value: "0",
    icon: "pizza-outline",
    color: COLORS.fat,
  },
];

export default function AdjustMacrosScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const [fields, setFields] = useState(() => ({
    calories: user?.targets?.calories?.toString() || "",
    protein: user?.targets?.protein?.toString() || "",
    carbs: user?.targets?.carbs?.toString() || "",
    fat: user?.targets?.fat?.toString() || "",
  }));

  const items = useMemo(
    () =>
      GOALS.map((goal) => ({
        ...goal,
        value: fields[goal.id] ?? "",
      })),
    [fields],
  );

  const updateField = (id, value) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    setFields((prev) => ({ ...prev, [id]: sanitized }));
  };

  const handleSave = () => {
    const targets = {
      calories: Number(fields.calories || 0),
      protein: Number(fields.protein || 0),
      carbs: Number(fields.carbs || 0),
      fat: Number(fields.fat || 0),
    };
    setUser({ ...user, targets });
    if (authUser?.uid) {
      setDoc(doc(db, "users", authUser.uid), { targets }, { merge: true });
    }
    navigation.goBack();
  };

  const handleAuto = () => {
    const targets = computeTargets(user);
    setFields({
      calories: String(targets.calories),
      protein: String(targets.protein),
      carbs: String(targets.carbs),
      fat: String(targets.fat),
    });
    setUser({ ...user, targets });
    if (authUser?.uid) {
      setDoc(doc(db, "users", authUser.uid), { targets }, { merge: true });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>

      <Text style={styles.title}>Edit nutrition goals</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.goalRow}>
            <View style={[styles.goalRing, { borderColor: item.color }]}>
              <View style={styles.goalInner}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>{item.label}</Text>
              <TextInput
                style={styles.goalInput}
                value={item.value}
                onChangeText={(value) => updateField(item.id, value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.micronutrientsRow}>
        <Text style={styles.micronutrientsText}>View micronutrients</Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.autoButton} onPress={handleAuto}>
          <Text style={styles.autoText}>Auto Generate Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 20,
  },
  list: {
    gap: 18,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 6,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  goalInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "600",
    marginBottom: 6,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  goalInput: {
    fontSize: 18,
    color: COLORS.text,
    paddingVertical: 0,
    fontFamily: "Nunito_700Bold",
  },
  micronutrientsRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  micronutrientsText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
    gap: 12,
  },
  autoButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: COLORS.card,
  },
  autoText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  saveButton: {
    width: "100%",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});


