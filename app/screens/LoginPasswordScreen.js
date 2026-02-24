import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "../components/MetaText";
import { auth, db } from "../config/firebase";
import { useAppAlert } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";
import { AuthFlowContext } from "../context/AuthFlowContext";

const LoginPasswordScreen = ({ navigation }) => {
  const { email, password, setPassword } = useContext(AuthFlowContext);
  const { signIn, sendVerificationEmail, getFriendlyAuthError } =
    useContext(AuthContext);
  const { showAlert } = useAppAlert();
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const VERIFICATION_TS_KEY = "metacal_verification_sent_at";

  useEffect(() => {
    if (!email) {
      navigation.replace("Login");
    }
  }, [email, navigation]);

  const handleContinue = async () => {
    if (!email || !password) {
      showAlert("Missing fields", "Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);
      await user?.reload?.();
      const verified = auth.currentUser?.emailVerified ?? user?.emailVerified;
      if (!verified) {
        const existingTs = await SecureStore.getItemAsync(VERIFICATION_TS_KEY);
        const now = Date.now();
        const recentlySent = existingTs && now - Number(existingTs) < 30 * 1000;
        if (!recentlySent) {
          await sendVerificationEmail();
          await SecureStore.setItemAsync(VERIFICATION_TS_KEY, String(now));
        }
        navigation.navigate("LoginVerify");
        return;
      }
      const uid = auth.currentUser?.uid;
      let isComplete = false;
      if (uid) {
        const snap = await getDoc(doc(db, "users", uid));
        isComplete = Boolean(snap.exists() && snap.data()?.profileComplete);
      }
      if (isComplete) {
        await SecureStore.deleteItemAsync("metacal_onboarding_gate");
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        return;
      }
      await SecureStore.setItemAsync("metacal_onboarding_gate", "done");
      navigation.reset({ index: 0, routes: [{ name: "Name" }] });
    } catch (error) {
      showAlert("Login failed", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

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
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in in just a few steps.</Text>

      <View style={styles.stepRow}>
        {[1, 2].map((s) => (
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

      <Text style={styles.stepTitle}>Step 2: Enter your password</Text>
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
      <View style={styles.checkboxRow}>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stepActions}>
        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.ghostText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButtonWide}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Signing in..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginPasswordScreen;

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
  link: { color: "#67bd52", fontWeight: "600" },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonWide: {
    backgroundColor: "#67bd52",
    height: 48,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
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
