import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Join Nutrio Today ✨</Text>
      <Text style={styles.subtitle}>
        Create a Nutrio account to track your meals, stay active, and achieve
        your health goals.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setAgreeTerms(!agreeTerms)}
        style={styles.checkboxContainer}
      >
        <Ionicons
          name={agreeTerms ? "checkbox" : "square-outline"}
          size={24}
          color={agreeTerms ? "#80CF6C" : "#888"}
        />
        <Text style={styles.checkboxLabel}>
          I agree to Nutrio <Text style={styles.link}>Terms & Conditions</Text>.
        </Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        Already have an account? <Text style={styles.link}>Sign in</Text>
      </Text>

      <Text style={styles.altText}>or continue with</Text>

      <View style={styles.socialRow}>
        {["google", "apple", "facebook", "x"].map((item) => (
          <TouchableOpacity key={item} style={styles.socialButton}>
            <Ionicons name={`logo-${item}`} size={20} color="#000" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Name")}
      >
        <Text style={styles.primaryButtonText}>Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputPassword: { flex: 1, height: 50 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: { marginLeft: 8, fontSize: 13 },
  link: { color: "#80CF6C", fontWeight: "600" },
  switchText: { fontSize: 13, color: "#666", marginBottom: 16 },
  altText: { textAlign: "center", color: "#aaa", marginBottom: 12 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#80CF6C",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
