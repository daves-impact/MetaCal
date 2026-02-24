import { useContext } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { AuthFlowContext } from "../context/AuthFlowContext";
import { Text } from "../components/MetaText";

const SignUpVerifyScreen = ({ navigation }) => {
  const { signOut } = useContext(AuthContext);
  const { resetFlow } = useContext(AuthFlowContext);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Follow the steps to get started.</Text>

      <Text style={styles.stepTitle}>Step 3: Account created</Text>
      <Text style={styles.stepBody}>
        Your account is ready. Please log in to continue your setup.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={async () => {
          resetFlow();
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Text style={styles.primaryButtonText}>Go to login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignUpVerifyScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
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
});
