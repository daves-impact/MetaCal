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

import { Text, TextInput } from "../components/MetaText";
export default function TargetWeightScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const { authUser } = useContext(AuthContext);
  const [weight, setWeight] = useState(user.targetWeight || 65);
  const fromSettings = route?.params?.fromSettings;

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name="flag-outline" size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>What's your target weight?</Text>
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
          const nextUser = { ...user, targetWeight: weight };
          const targets = computeTargets(nextUser);
          setUser({ ...nextUser, targets });
          if (authUser?.uid) {
            setDoc(
              doc(db, "users", authUser.uid),
              { targetWeight: weight, targets },
              { merge: true },
            );
          }
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


