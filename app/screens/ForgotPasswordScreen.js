import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useAppAlert } from "../context/AlertContext";

import { Text, TextInput } from "../components/MetaText";
export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const { resetPassword, getFriendlyAuthError } = useContext(AuthContext);
  const { showAlert } = useAppAlert();

  const handleSendReset = async () => {
    if (!email) {
      showAlert("Missing email", "Enter your registered email address.");
      return;
    }
    try {
      await resetPassword(email.trim());
      showAlert(
        "Reset email sent",
        "Check your inbox and follow the link to reset your password.",
      );
      navigation.navigate("Login");
    } catch (error) {
      showAlert("Reset failed", getFriendlyAuthError(error));
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="arrow-back"
        size={24}
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.title}>Forgot Password? 🔑</Text>
      <Text style={styles.description}>
        Please enter your registered email address below. We'll send you a
        One-Time Password (OTP) to reset your password securely.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Registered Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSendReset}>
        <Text style={styles.buttonText}>Send reset email</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#A6CE39",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});


