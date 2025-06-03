import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WelcomeScreen2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Image */}
      <View style={styles.imageContainer}>
        <Image
          //   source={require("../assets/insight-preview.png")} // Replace with actual image
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Gain Clear Insights Into Your Progress</Text>
        <Text style={styles.description}>
          See how your daily efforts stack up with detailed progress reports on
          calories, nutrition and habits.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Welcome3")}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen2;

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
    width: "80%",
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
