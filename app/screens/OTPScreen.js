import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OTPScreen({ navigation }) {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (index, value) => {
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 3) {
      refs[index + 1]?.focus();
    }
  };

  const refs = [];

  const handleVerify = () => {
    navigation.navigate("ResetPassword");
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="arrow-back"
        size={24}
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.title}>Enter OTP Code 🔐</Text>
      <Text style={styles.description}>
        We've sent a 4-digit OTP code to your email address. Please enter it
        below to verify and continue with password reset.
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            ref={(ref) => (refs[idx] = ref)}
            onChangeText={(val) => handleChange(idx, val)}
            value={digit}
          />
        ))}
      </View>

      <Text style={styles.timer}>You can resend the code in 56 seconds</Text>
      <TouchableOpacity>
        <Text style={styles.resend}>Resend code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Continue</Text>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    borderBottomWidth: 2,
    borderColor: "#000",
    width: 55,
    fontSize: 24,
    textAlign: "center",
    marginHorizontal: 4,
  },
  timer: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginBottom: 5,
  },
  resend: {
    textAlign: "center",
    color: "#A6CE39",
    fontWeight: "600",
    marginBottom: 30,
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
