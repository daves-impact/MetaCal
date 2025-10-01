import React from "react";

import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WelcomeScreen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Image */}
      <View style={styles.imageContainer}>
        <Image
          //   source={require("../assets/nutrio-preview.png")} // Replace with your actual image
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          MetaCal - Personalized Tracking Made Easy
        </Text>
        <Text style={styles.description}>
          Log your meals, track metrics, weight, BMI, and monitor hydration with
          tailored insights just for you.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AuthOptions")}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Welcome2")}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen1;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FAF5",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: width * 0.7,
    height: "100%",
  },
  textContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1E1E1E",
    fontFamily: "Poppins",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#80CF6C",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 24,
    paddingVertical: 15,
    width: "40%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    color: "#1F2937",
    fontWeight: "500",
  },
  continueText: {
    color: "#fff",
    fontWeight: "600",
  },
});
