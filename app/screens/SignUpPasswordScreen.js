import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "../components/MetaText";
import { AuthFlowContext } from "../context/AuthFlowContext";

const SignUpPasswordScreen = ({ navigation }) => {
  const { email, password, setPassword } = useContext(AuthFlowContext);
  const [hidePassword, setHidePassword] = useState(true);

  useEffect(() => {
    if (!email) {
      navigation.replace("SignUp");
    }
  }, [email, navigation]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );
  const passwordOk = Object.values(passwordChecks).every(Boolean);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Follow the steps to get started.</Text>

        <View style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.stepDot, s <= 2 && styles.stepDotActive]}
            >
              <Text
                style={[styles.stepNumber, s <= 2 && styles.stepNumberActive]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.stepTitle}>Step 2: Create a password</Text>
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
        <View style={styles.criteriaList}>
          <Text style={[styles.criteria, passwordChecks.length && styles.ok]}>
            • At least 8 characters
          </Text>
          <Text style={[styles.criteria, passwordChecks.upper && styles.ok]}>
            • One uppercase letter
          </Text>
          <Text style={[styles.criteria, passwordChecks.lower && styles.ok]}>
            • One lowercase letter
          </Text>
          <Text style={[styles.criteria, passwordChecks.number && styles.ok]}>
            • One number
          </Text>
          <Text style={[styles.criteria, passwordChecks.special && styles.ok]}>
            • One special character
          </Text>
        </View>
        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.ghostText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButtonWide,
              !passwordOk && styles.buttonDisabled,
            ]}
            onPress={() => navigation.navigate("SignUpTerms")}
            disabled={!passwordOk}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpPasswordScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  stepRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    alignSelf: "center",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#67bd52",
  },
  stepNumber: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  stepNumberActive: {
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
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
  criteriaList: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  criteria: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  ok: {
    color: "#22C55E",
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#C7E9BF",
  },
  primaryButtonWide: {
    backgroundColor: "#67bd52",
    height: 48,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    flex: 7,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  stepActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    justifyContent: "space-between",
  },
  ghostButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    flex: 3,
  },
  ghostText: {
    color: "#111827",
    fontWeight: "600",
  },
});
