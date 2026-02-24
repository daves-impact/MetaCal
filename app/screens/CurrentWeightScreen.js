import { Slider } from "@miblanchard/react-native-slider";
import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { COLORS } from "../theme/colors";
import { computeTargets } from "../targets";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { computeBmi } from "../utils/health";

import { Text, TextInput } from "../components/MetaText";
export default function CurrentWeightScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const [weight, setWeight] = useState(user.currentWeight || 70);
  const fromSettings = route?.params?.fromSettings;

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name="scale-outline" size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>What's your current weight?</Text>
      <View style={styles.valueBadge}>
        <Text style={styles.value}>{weight.toFixed(1)} kg</Text>
      </View>

      <Slider
        value={[weight]}
        onValueChange={(value) => setWeight(value[0])}
        minimumValue={30}
        maximumValue={200}
        step={0.5}
        containerStyle={styles.sliderContainer}
        trackStyle={styles.track}
        minimumTrackStyle={styles.trackActive}
        maximumTrackStyle={styles.trackInactive}
        thumbStyle={styles.thumb}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          const nextUser = { ...user, currentWeight: weight };
          const targets = computeTargets(nextUser);
          const todayKey = formatDateKey(new Date());
          const history = Array.isArray(user.weightHistory)
            ? [...user.weightHistory]
            : [];
          const existingIndex = history.findIndex(
            (entry) => entry?.dateKey === todayKey,
          );
          const entry = { dateKey: todayKey, weight };
          if (existingIndex >= 0) {
            history[existingIndex] = entry;
          } else {
            history.push(entry);
          }
          const bmi = computeBmi(weight, nextUser.height);
          setUser({ ...nextUser, targets, weightHistory: history, bmi });
          if (authUser?.uid) {
            setDoc(
              doc(db, "users", authUser.uid),
              {
                currentWeight: weight,
                targets,
                weightHistory: history,
                bmi,
              },
              { merge: true },
            );
          }
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Target");
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
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  sliderContainer: {
    width: "100%",
  },
  track: {
    height: 10,
    borderRadius: 999,
  },
  trackActive: {
    backgroundColor: COLORS.primary,
  },
  trackInactive: {
    backgroundColor: COLORS.primarySoft,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: "#fff",
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


