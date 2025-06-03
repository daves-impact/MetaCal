import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AuthOptionsScreen = ({ navigation }) => {
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
      <TouchableOpacity style={styles.googleButton}>
        <Image
          //   source={require("../assets/google-icon.png")} // Add a small Google icon
          style={styles.googleIcon}
        />
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
    backgroundColor: "#F1FAF5",
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
    width: 20,
    height: 20,
    marginRight: 12,
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
    backgroundColor: "#80CF6C",
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
