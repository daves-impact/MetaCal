import { useContext } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { AuthFlowContext } from "../context/AuthFlowContext";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Text } from "../components/MetaText";

const LoginVerifiedScreen = ({ navigation }) => {
  const { resetFlow } = useContext(AuthFlowContext);
  const { signIn } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in in just a few steps.</Text>

      <Text style={styles.stepTitle}>Step 4: Verified</Text>
      <Text style={styles.stepBody}>
        Your email is verified. Let’s finish your profile setup.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={async () => {
          try {
            await auth.currentUser?.reload?.();
          } catch {
            // ignore
          }
          const verified = auth.currentUser?.emailVerified;
          if (!verified) {
            navigation.replace("LoginVerify");
            return;
          }
          let isComplete = Boolean(user?.profileComplete);
          if (auth.currentUser?.uid && !isComplete) {
            const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (snap.exists()) {
              isComplete = Boolean(snap.data()?.profileComplete);
            }
          }
          if (isComplete) {
            await SecureStore.deleteItemAsync("metacal_onboarding_gate");
            resetFlow();
            navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
            return;
          }
          await SecureStore.setItemAsync("metacal_onboarding_gate", "done");
          resetFlow();
          navigation.reset({ index: 0, routes: [{ name: "Name" }] });
        }}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginVerifiedScreen;

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
