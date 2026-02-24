import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";

import { Text, TextInput } from "../components/MetaText";
const NameScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const { setUser } = useContext(UserContext);
  const { updateUserProfile } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name="person-circle-outline" size={32} color="#67bd52" />
      </View>
      <Text style={styles.title}>What&apos;s your name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        style={[styles.button, !name && { backgroundColor: "#ccc" }]}
        onPress={async () => {
          const trimmed = name.trim();
          setUser((prev) => ({ ...prev, name: trimmed }));
          try {
            await updateUserProfile({ displayName: trimmed });
          } catch {
            // Allow flow to continue even if profile update fails.
          }
          navigation.navigate("Gender");
        }}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NameScreen;

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
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E9F7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#67bd52",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
