import Slider from "@react-native-community/slider";
import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";
import { COLORS } from "../theme/colors";

import { Text, TextInput } from "../components/MetaText";
export default function StepGoalScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const [steps, setSteps] = useState(user.dailyStepGoal || 10000);
  const fromSettings = route?.params?.fromSettings;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your daily step goal?</Text>
      <View style={styles.valueBadge}>
        <Text style={styles.value}>{steps} steps</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={2000}
        maximumValue={20000}
        step={500}
        value={steps}
        onValueChange={setSteps}
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={COLORS.primarySoft}
        thumbTintColor={COLORS.primary}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setUser({ ...user, dailyStepGoal: steps });
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Goals");
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 20 },
  valueBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  slider: {
    width: "100%",
    height: 48,
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});


