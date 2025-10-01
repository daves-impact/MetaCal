import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PersonalizationScreen({ navigation }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigation.replace("CaloriePlan");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personalizing your Nutrio experience…</Text>

      <View style={styles.circle}>
        <Text style={styles.progress}>{progress}%</Text>
      </View>

      <Text style={styles.subtext}>
        Hang tight! We're crafting a personalized plan just for you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#8BC34A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  progress: { fontSize: 22, fontWeight: "700" },
  subtext: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 10 },
});
