import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { UserContext } from "../context/UserContext";

import { Text, TextInput } from "../components/MetaText";
export default function AgeScreen({ navigation, route }) {
  const { user, setUser } = useContext(UserContext);
  const [age, setAge] = useState(user.age || ""); // store as string for TextInput
  const fromSettings = route?.params?.fromSettings;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How old are you?</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        keyboardType="numeric"
        value={age.toString()}
        onChangeText={setAge}
      />

      <TouchableOpacity
        style={[styles.button, !age && { backgroundColor: "#ccc" }]}
        onPress={() => {
          setUser({ ...user, age: parseInt(age) }); // save to context
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Height"); // go to next step
        }}
        disabled={!age}
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#67bd52",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});



