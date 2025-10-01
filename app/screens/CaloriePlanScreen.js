import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CaloriePlanScreen({ onFinish }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your personalized calorie plan is ready!</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.calories}>2560</Text>
        <Text style={styles.kcal}>kcal</Text>
      </View>

      <View style={styles.macros}>
        <Text style={styles.macro}>Carbs - 45%</Text>
        <Text style={styles.macro}>Protein - 20%</Text>
        <Text style={styles.macro}>Fat - 35%</Text>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={onFinish}>
        <Text style={styles.btnText}>Start Your Plan Now</Text>
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
    borderColor: "#8BC34A",
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
    backgroundColor: "#8BC34A",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },
});
