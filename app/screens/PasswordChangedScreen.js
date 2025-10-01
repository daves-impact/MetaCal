import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PasswordChangedScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Image
            // source={require("../assets/success-icon.png")} // Replace with actual image path
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          You've successfully changed your password.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordChangedScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#C4EFC0", // or #E1FBE2 for a lighter shade
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  icon: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  button: {
    backgroundColor: "#7AC74F",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
