import { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";
const GenderScreen = ({ navigation }) => {
  const [gender, setGender] = useState(null);
  const { user, setUser } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your gender</Text>
      <View style={styles.options}>
        {["Male", "Female", "Other"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.option, gender === item && styles.selectedOption]}
            onPress={() => setGender(item)}
          >
            <Text style={styles.optionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.button, !gender && { backgroundColor: "#ccc" }]}
        onPress={() => {
          navigation.navigate("Height");
          setUser({ ...user, gender });
        }}
        disabled={!gender}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  selectedOption: { backgroundColor: "#80CF6C" },
  optionText: { fontSize: 16, fontWeight: "500", color: "#333" },
  button: {
    backgroundColor: "#80CF6C",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderRadius: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
