import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebase";
import {
  googleAuthRequestConfig,
  googlePromptOptions,
  isGoogleProxyReady,
} from "../config/googleAuth";
import { useAppAlert } from "../context/AlertContext";

import { Text } from "../components/MetaText";

WebBrowser.maybeCompleteAuthSession();
const AuthOptionsScreen = ({ navigation }) => {
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
    <View style={styles.container}>
      {/* App Logo or Icon */}
      <Image
        // source={require("../assets/nutrio-logo.png")} // Replace with your app logo..
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Welcome to MetaCal</Text>
      <Text style={styles.subtitle}>
        Track your meals, health, and calories with ease
      </Text>

      {/* Google Auth */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGooglePress}
        disabled={!request}
      >
        <View style={styles.googleIcon}>
          <Ionicons name="logo-google" size={18} color="#111827" />
        </View>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Or Divider */}
      <Text style={styles.orText}>or</Text>

      {/* Sign Up / Log In */}
      <View style={styles.authButtons}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AuthOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1E1E",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  orText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
  },
  authButtons: {
    width: "100%",
    gap: 12,
  },
  signUpButton: {
    backgroundColor: "#67bd52",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#D1D5DB",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  signUpText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loginText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 16,
  },
});
