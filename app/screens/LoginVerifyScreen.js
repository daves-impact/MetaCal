import * as SecureStore from "expo-secure-store";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { Text } from "../components/MetaText";
import { auth, db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import { AuthFlowContext } from "../context/AuthFlowContext";
import { useAppAlert } from "../context/AlertContext";

const LoginVerifyScreen = ({ navigation }) => {
  const { email, password } = useContext(AuthFlowContext);
  const { signIn, sendVerificationEmail, getFriendlyAuthError } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationSentAt, setVerificationSentAt] = useState(null);
  const VERIFICATION_TS_KEY = "metacal_verification_sent_at";
  const { showAlert } = useAppAlert();

  useEffect(() => {
    if (!email || !password) {
      navigation.replace("Login");
    }
  }, [email, password, navigation]);

  useEffect(() => {
    SecureStore.getItemAsync(VERIFICATION_TS_KEY).then((value) => {
      if (value) setVerificationSentAt(Number(value));
    });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (loading || cooldown > 0) return;
    if (!email || !password) {
      showAlert("Missing fields", "Enter your email and password first.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      await sendVerificationEmail();
      const ts = Date.now();
      setVerificationSentAt(ts);
      await SecureStore.setItemAsync(VERIFICATION_TS_KEY, String(ts));
      showAlert("Verification sent", "We sent a new link to your email.");
      setCooldown(30);
    } catch (error) {
      showAlert("Resend failed", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!email || !password) {
      showAlert("Missing fields", "Enter your email and password first.");
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);
      await user?.reload?.();
      const verified = auth.currentUser?.emailVerified ?? user?.emailVerified;
      const waitMs = 5 * 60 * 1000;
      if (verified) {
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
        return;
      }
      if (!verificationSentAt) {
        showAlert(
          "Verification required",
          "Please request a verification email to continue.",
        );
        return;
      }
      if (Date.now() - verificationSentAt > waitMs) {
        showAlert(
          "Verification expired",
          "Please request a new verification email to continue.",
        );
        return;
      }
      if (!verified) {
        showAlert(
          "Not verified yet",
          "Please verify your email, then try again.",
        );
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
      showAlert("Check failed", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in in just a few steps.</Text>

      <Text style={styles.stepTitle}>Step 3: Verify your email</Text>
      <Text style={styles.stepBody}>
        We sent a verification link to your email. Please verify to continue.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleResendVerification}
        disabled={loading || cooldown > 0}
      >
        <Text style={styles.primaryButtonText}>
          {loading
            ? "Sending..."
            : cooldown > 0
              ? `Send in ${cooldown}s`
              : "Send verification email"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.ghostButtonSmall}
        onPress={handleCheckVerified}
      >
        <Text style={styles.ghostText}>I have verified, continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginVerifyScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  stepBody: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#67bd52",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  ghostButtonSmall: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
  },
  ghostText: {
    color: "#111827",
    fontWeight: "600",
  },
});
