import Slider from "@react-native-community/slider";
import { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";

export default function CurrentWeightScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [weight, setWeight] = useState(user.currentWeight || 70);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your current weight?</Text>
      <Text style={styles.value}>{weight.toFixed(1)} kg</Text>

      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={30}
        maximumValue={200}
        step={0.5}
        value={weight}
        onValueChange={setWeight}
        minimumTrackTintColor="#7AC74F"
        maximumTrackTintColor="#ccc"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setUser({ ...user, currentWeight: weight });
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
  value: { fontSize: 32, fontWeight: "bold", marginBottom: 20, color: "#333" },
  button: {
    marginTop: 20,
    backgroundColor: "#7AC74F",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
