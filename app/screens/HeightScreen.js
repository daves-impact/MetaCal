import Slider from "@react-native-community/slider";
import { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";

export default function HeightScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [height, setHeight] = useState(user.height || 170);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How tall are you?</Text>
      <Text style={styles.value}>{height.toFixed(1)} cm</Text>

      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={140}
        maximumValue={210}
        step={0.5}
        value={height}
        onValueChange={setHeight}
        minimumTrackTintColor="#7AC74F"
        maximumTrackTintColor="#ccc"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setUser({ ...user, height });
          navigation.navigate("Current");
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
