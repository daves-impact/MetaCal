import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithCredential,
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "../components/MetaText";
import {
  auth,
} from "../config/firebase";
import {
  googleAuthRequestConfig,
  googlePromptOptions,
  isGoogleProxyReady,
} from "../config/googleAuth";
import { AuthContext } from "../context/AuthContext";
import { useAppAlert } from "../context/AlertContext";

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    ok: false,
    message: "Enter your email to continue.",
  });
  const [checkingEmail, setCheckingEmail] = useState(false);
  const {
    signUp,
    signOut,
    sendVerificationEmail,
    getFriendlyAuthError,
  } = useContext(AuthContext);
  const { showAlert } = useAppAlert();
  const VERIFICATION_TS_KEY = "metacal_verification_sent_at";
  const AUTH_FLOW_KEY = "metacal_auth_flow";
  const SIGNUP_STEP_KEY = "metacal_signup_step";

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
    const restoreStep = async () => {
      const flow = await SecureStore.getItemAsync(AUTH_FLOW_KEY);
      const stepValue = await SecureStore.getItemAsync(SIGNUP_STEP_KEY);

      if (flow === "signup" && stepValue) {
        const parsed = Number(stepValue);
        if (!Number.isNaN(parsed)) {
          setStep(parsed);
        }
      }
    };
    restoreStep();
  }, []);

  // Watch storage for step changes and keep local step in sync
  useEffect(() => {
    const watchStorage = async () => {
      const stepValue = await SecureStore.getItemAsync(SIGNUP_STEP_KEY);
      if (stepValue === "4") {
        setStep(4);
      }
    };
    const interval = setInterval(watchStorage, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailStatus({ ok: false, message: "Enter your email to continue." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailStatus({ ok: false, message: "Email format looks invalid." });
      return;
    }

    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, trimmed);
        if (methods.length > 0) {
          setEmailStatus({
            ok: false,
            message: "This email is already registered.",
          });
        } else {
          setEmailStatus({ ok: true, message: "Email is available." });
        }
      } catch {
        setEmailStatus({
          ok: false,
          message: "Unable to verify email right now.",
        });
      } finally {
        setCheckingEmail(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passwordOk = Object.values(passwordChecks).every(Boolean);

  const goNext = () => setStep((prev) => Math.min(4, prev + 1));
  const goBack = () => setStep((prev) => Math.max(1, prev - 1));

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
      // Mark signup flow in progress
      await SecureStore.setItemAsync(AUTH_FLOW_KEY, "signup");

      // Create the user account
      await signUp(email.trim(), password);

      // Wait for auth.currentUser to be available
      let attempts = 0;
      while (!auth.currentUser && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      if (!auth.currentUser) {
        throw new Error("User not available for email verification");
      }

      // Send verification email
      await sendVerificationEmail();

      // Mark verification sent and advance to step 4
      await SecureStore.setItemAsync(VERIFICATION_TS_KEY, String(Date.now()));
      await SecureStore.setItemAsync(SIGNUP_STEP_KEY, "4");

      // Set step immediately
      setStep(4);
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
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, step >= s && styles.stepDotActive]}
          >
            <Text
              style={[styles.stepNumber, step >= s && styles.stepNumberActive]}
            >
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
            autoCorrect={false}
          />
          <Text
            style={[
              styles.statusText,
              emailStatus.ok ? styles.statusOk : styles.statusBad,
            ]}
          >
            {checkingEmail ? "Checking email..." : emailStatus.message}
          </Text>
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
            style={[
              styles.primaryButton,
              (!emailStatus.ok || checkingEmail) && styles.buttonDisabled,
            ]}
            onPress={goNext}
            disabled={!emailStatus.ok || checkingEmail}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
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
            <Text
              style={[styles.criteria, passwordChecks.special && styles.ok]}
            >
              • One special character
            </Text>
          </View>
          <View style={styles.stepActions}>
            <TouchableOpacity style={styles.ghostButton} onPress={goBack}>
              <Text style={styles.ghostText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButtonWide,
                !passwordOk && styles.buttonDisabled,
              ]}
              onPress={goNext}
              disabled={!passwordOk}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
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
            <TouchableOpacity style={styles.ghostButton} onPress={goBack}>
              <Text style={styles.ghostText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButtonWide,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Creating account..." : "Create account"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.stepTitle}>Step 4: Verify your email</Text>
          <Text style={styles.stepBody}>
            We sent a verification link to your email. Please verify, then log
            in.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              await SecureStore.deleteItemAsync(AUTH_FLOW_KEY);
              await SecureStore.deleteItemAsync(SIGNUP_STEP_KEY);
              await signOut();
              navigation.navigate("Login");
            }}
          >
            <Text style={styles.primaryButtonText}>Go to login</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.switchText}>
        Already have an account?{" "}
        <TouchableOpacity
          onPress={async () => {
            await SecureStore.deleteItemAsync(AUTH_FLOW_KEY);
            await SecureStore.deleteItemAsync(SIGNUP_STEP_KEY);
            navigation.navigate("Login");
          }}
        >
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
      </Text>
    </ScrollView>
  );
};

export default SignUpScreen;

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
  statusText: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  statusOk: { color: "#22C55E" },
  statusBad: { color: "#EF4444" },
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
  inputPassword: { flex: 1, height: 50 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: { marginLeft: 8, fontSize: 13 },
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
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
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
  ghostText: {
    color: "#111827",
    fontWeight: "600",
  },
});
