import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../components/MetaText";
import { useAppAlert } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";
import { AuthFlowContext } from "../context/AuthFlowContext";

const SignUpTermsScreen = ({ navigation }) => {
  const { email, password, agreeTerms, setAgreeTerms } =
    useContext(AuthFlowContext);
  const { signUp, getFriendlyAuthError } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAppAlert();

  useEffect(() => {
    if (!email || !password) {
      navigation.replace("SignUp");
    }
  }, [email, password, navigation]);

  const handleSignUp = async () => {
    if (!agreeTerms) {
      showAlert("Terms required", "Please accept the terms to continue.");
      return;
    }
    if (!email || !password) {
      showAlert("Missing fields", "Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: "SignUpVerify" }] });
    } catch (error) {
      showAlert("Sign up failed", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Follow the steps to get started.</Text>

      <View style={styles.stepRow}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, s <= 3 && styles.stepDotActive]}
          >
            <Text
              style={[styles.stepNumber, s <= 3 && styles.stepNumberActive]}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.stepTitle}>Step 3: Accept terms</Text>
      <TouchableOpacity
        onPress={() => setAgreeTerms(!agreeTerms)}
        style={styles.checkboxContainer}
      >
        <Ionicons
          name={agreeTerms ? "checkbox" : "square-outline"}
          size={24}
          color={agreeTerms ? "#67bd52" : "#888"}
        />
        <Text style={styles.checkboxLabel}>
          I agree to MetaCal{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Terms")}
          >
            Terms & Conditions
          </Text>
          .
        </Text>
      </TouchableOpacity>
      <View style={styles.stepActions}>
        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.ghostText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButtonWide}
          onPress={handleSignUp}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Creating account..." : "Create account"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SignUpTermsScreen;

const styles = StyleSheet.create({
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: { marginLeft: 8, fontSize: 13 },
  link: { color: "#67bd52", fontWeight: "600" },
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
});
