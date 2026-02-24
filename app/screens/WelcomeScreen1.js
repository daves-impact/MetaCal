import React from "react";

import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "../components/MetaText";
// Assets folder is at project root, so use ../../assets from app/screens
const WELCOME_IMAGE = require("../../assets/welcome1.png");

const WelcomeScreen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageFrame}>
          {WELCOME_IMAGE ? (
            <Image
              source={WELCOME_IMAGE}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                Add welcome image 1
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Track Smarter, Live Better</Text>
        <Text style={styles.description}>
          Log your meals, monitor calories and macros, and stay on top of your
          health - all in one place.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imageFrame: {
    width: "82%",
    maxWidth: 360,
    aspectRatio: 0.9,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  imagePlaceholderText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },
  textContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 12,
    color: "#1E1E1E",
    fontFamily: "Nunito_700Bold",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Nunito_400Regular",
  },
  buttonContainer: {
    width: "80%",
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#67bd52",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontFamily: "Nunito_600SemiBold",
  },
});
