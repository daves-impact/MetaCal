import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "../components/MetaText";

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>MetaCal Terms & Conditions</Text>
        <Text style={styles.sectionTitle}>1. Academic MVP Disclaimer</Text>
        <Text style={styles.paragraph}>
          MetaCal is a final‑year university project and a minimum viable product
          (MVP). The app is provided for demonstration and educational purposes
          only. Features may be incomplete, experimental, or subject to change.
        </Text>

        <Text style={styles.sectionTitle}>2. Not Medical Advice</Text>
        <Text style={styles.paragraph}>
          MetaCal does not provide medical advice, diagnosis, or treatment. All
          nutrition, calorie, and health information is for general informational
          purposes only. You should consult a qualified healthcare professional
          before making dietary or health decisions.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Accuracy</Text>
        <Text style={styles.paragraph}>
          While we aim for useful estimates, calorie and macro calculations may
          be inaccurate. Inputs are user‑provided and may contain errors. Do not
          rely on MetaCal for critical decisions.
        </Text>

        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for the accuracy of any data you enter and for how
          you use the information presented. You agree not to misuse the app or
          attempt to access data that does not belong to you.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy & Data</Text>
        <Text style={styles.paragraph}>
          Data collected during this MVP phase may be stored for the purpose of
          academic evaluation and app functionality. We will not intentionally
          sell personal data. However, because this is an MVP, we cannot guarantee
          enterprise‑grade security.
        </Text>

        <Text style={styles.sectionTitle}>6. Availability</Text>
        <Text style={styles.paragraph}>
          The app may be unavailable, removed, or reset at any time during the
          project timeline. We do not guarantee uptime, data retention, or feature
          completeness.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          These terms may be updated as the project evolves. Continued use of the
          app indicates acceptance of the latest version.
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
    color: "#111827",
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4B5563",
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#67bd52",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
