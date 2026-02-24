import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";
import { COLORS } from "../theme/colors";

import { Text } from "../components/MetaText";
const DETAILS = [
  { id: "currentWeight", label: "Current Weight", target: "Current" },
  { id: "height", label: "Height", target: "Height" },
  { id: "gender", label: "Gender", target: "Gender" },
  { id: "goal", label: "Goal", target: "Goals" },
  { id: "activity", label: "Activity level", target: "ActivityLevel" },
];

export default function PersonalDetailsScreen({ navigation }) {
  const { user } = useContext(UserContext);

  const formatWeight = (value) =>
    value ? `${Number(value).toFixed(1)} kg` : "0 kg";
  const formatHeight = (value) => (value ? `${value} cm` : "0 ft 0 in");
  const goalLabel = (value) => {
    if (value === "lose") return "Lose weight";
    if (value === "gain") return "Gain muscle";
    if (value === "maintain") return "Maintain weight";
    return " ";
  };
  const activityLabel = (value) => value?.label || " ";
  const detailValue = (id) => {
    switch (id) {
      case "currentWeight":
        return formatWeight(user.currentWeight);
      case "height":
        return formatHeight(user.height);
      case "gender":
        return user.gender || " ";
      case "goal":
        return goalLabel(user.goal);
      case "activity":
        return activityLabel(user.activityLevel);
      default:
        return " ";
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.goalCard}>
        <View>
          <Text style={styles.goalLabel}>Goal Weight</Text>
          <Text style={styles.goalValue}>
            {formatWeight(user.targetWeight)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.goalButton}
          onPress={() => navigation.navigate("Target", { fromSettings: true })}
        >
          <Text style={styles.goalButtonText}>Change Goal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsCard}>
        {DETAILS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.detailRow}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(item.target, { fromSettings: true })
            }
          >
            <View style={styles.detailRowTop}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <View style={styles.detailRowRight}>
                <Text style={styles.detailValue}>{detailValue(item.id)}</Text>
                <Ionicons name="pencil" size={16} color="#9CA3AF" />
              </View>
            </View>
            {index !== DETAILS.length - 1 ? (
              <View style={styles.detailDivider} />
            ) : null}
          </TouchableOpacity>
        ))}
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSpacer: {
    width: 36,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  goalLabel: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: "600",
  },
  goalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 6,
  },
  goalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  goalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    paddingVertical: 14,
  },
  detailRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.muted,
    marginRight: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginTop: 14,
  },
});


