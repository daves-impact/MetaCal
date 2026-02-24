import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { AuthFlowContext } from "../context/AuthFlowContext";
import { auth } from "../config/firebase";
import {
  googleAuthRequestConfig,
  googlePromptOptions,
  isGoogleProxyReady,
} from "../config/googleAuth";
import { useAppAlert } from "../context/AlertContext";
import { Text, TextInput } from "../components/MetaText";

WebBrowser.maybeCompleteAuthSession();

const LoginEmailScreen = ({ navigation }) => {
  const { email, setEmail, resetFlow } = useContext(AuthFlowContext);
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
            style={[styles.stepDot, s <= 1 && styles.stepDotActive]}
          >
            <Text style={[styles.stepNumber, s <= 1 && styles.stepNumberActive]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

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
        onPress={() => navigation.navigate("LoginPassword")}
        disabled={!email}
      >
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
      <Text style={styles.switchText}>
        Don’t have an account?{" "}
        <TouchableOpacity
          onPress={() => {
            resetFlow();
            navigation.navigate("SignUp");
          }}
        >
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginEmailScreen;

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
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#67bd52", fontWeight: "600" },
  switchText: { fontSize: 13, color: "#666", marginTop: 24 },
});
