import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../config/firebase";
import {
  googleAuthRequestConfig,
  googlePromptOptions,
  isGoogleProxyReady,
} from "../config/googleAuth";
import { useAppAlert } from "../context/AlertContext";
import { Text, TextInput } from "../components/MetaText";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationSentAt, setVerificationSentAt] = useState(null);
  const VERIFICATION_TS_KEY = "metacal_verification_sent_at";
  const { signIn, sendVerificationEmail, getFriendlyAuthError } =
    useContext(AuthContext);
  const { showAlert } = useAppAlert();

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleAuthRequestConfig,
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (!authentication?.idToken) return;
      const credential = GoogleAuthProvider.credential(authentication.idToken);
      signInWithCredential(auth, credential).catch(() => {
        showAlert("Google sign-in failed", "Please try again.");
      });
    }
  }, [response, showAlert]);

  const handleGooglePress = () => {
    if (!isGoogleProxyReady) {
      showAlert(
        "Google sign-in setup needed",
        "Add your Expo owner in app.json, then add https://auth.expo.io/@<owner>/<slug> to Google OAuth redirect URIs.",
      );
      return;
    }
    promptAsync(googlePromptOptions);
  };

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

  const goNext = () => setStep((prev) => Math.min(4, prev + 1));
  const goBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleSignIn = async (
    resendOnUnverified = true,
    enforceDelay = false,
    quietOnUnverified = false,
    suppressAlerts = false,
  ) => {
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
        if (resendOnUnverified) {
          await sendVerificationEmail();
          const ts = Date.now();
          setVerificationSentAt(ts);
          await SecureStore.setItemAsync(VERIFICATION_TS_KEY, String(ts));
        }
        if (!quietOnUnverified && !suppressAlerts) {
          showAlert(
            "Verify your email",
            resendOnUnverified
              ? "We sent a verification link to your email."
              : "Please verify your email, then try again.",
          );
        }
        setStep(3);
        return;
      }
      if (enforceDelay) {
        const waitMs = 5 * 60 * 1000;
        if (!verificationSentAt) {
          if (!suppressAlerts) {
            showAlert(
              "Verification required",
              "Please request a new verification email to continue.",
            );
          }
          setStep(3);
          return;
        }
        const elapsed = Date.now() - verificationSentAt;
        if (elapsed > waitMs) {
          if (!suppressAlerts) {
            showAlert(
              "Verification expired",
              "Please request a new verification email to continue.",
            );
          }
          setStep(3);
          return;
        }
      }
      setStep(4);
    } catch (error) {
      showAlert("Login failed", getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

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
      if (verificationSentAt && Date.now() - verificationSentAt < 30 * 1000) {
        showAlert(
          "Please wait",
          "Give it a few seconds after the email is sent, then try again.",
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
      const waitMs = 5 * 60 * 1000;
      if (!verificationSentAt || Date.now() - verificationSentAt > waitMs) {
        showAlert(
          "Verification expired",
          "Please request a new verification email to continue.",
        );
        setStep(3);
        return;
      }
      setStep(4);
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

      <View style={styles.stepRow}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, step >= s && styles.stepDotActive]}
          >
            <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      {step === 1 && (
        <>
          <Text style={styles.stepTitle}>Step 1: Enter your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <Text style={styles.altText}>or continue with</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGooglePress}
              disabled={!request}
            >
              <Ionicons name="logo-google" size={18} color="#111827" />
              <Text style={styles.socialText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, !email && styles.buttonDisabled]}
            onPress={goNext}
            disabled={!email}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
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
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stepActions}>
            <TouchableOpacity style={styles.ghostButton} onPress={goBack}>
              <Text style={styles.ghostText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButtonWide}
              onPress={() => handleSignIn(true, true, true, true)}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Signing in..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
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
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.stepTitle}>Step 4: Verified</Text>
          <Text style={styles.stepBody}>
            Your email is verified. Let’s finish your profile setup.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              await SecureStore.setItemAsync("metacal_onboarding_gate", "done");
              navigation.navigate("Name");
            }}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.switchText}>
        Don’t have an account?{" "}
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </Text>
    </ScrollView>
  );
};

export default LoginScreen;

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
  stepBody: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
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
  switchText: { fontSize: 13, color: "#666", marginTop: 24 },
  altText: { textAlign: "center", color: "#aaa", marginBottom: 12 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  socialText: {
    fontWeight: "600",
    color: "#111827",
  },
  buttonDisabled: {
    backgroundColor: "#C7E9BF",
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
  primaryButtonWide: {
    backgroundColor: "#67bd52",
    height: 48,
    borderRadius: 30,
    alignItems: "center",
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
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});
