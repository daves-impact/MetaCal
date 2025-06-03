import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WelcomeScreen3 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Image */}
      <View style={styles.imageContainer}>
        <Image
          //   source={require("../assets/articles-preview.png")} // Replace with your actual image
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Title & Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Empower Your Health with Expert Advice</Text>
        <Text style={styles.description}>
          Access a world of knowledge, nutrition and wellness tailored to your
          needs. Written by trusted professionals.
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AuthOptions")}
        style={styles.getStartedButton}
      >
        <Text style={styles.getStartedText}>Let’s Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen3;

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
  getStartedButton: {
    backgroundColor: "#80CF6C",
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 24,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
