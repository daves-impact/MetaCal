import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { Text } from "../components/MetaText";
export default function PersonalizationScreen({ navigation }) {
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(100, current + 2);
      setProgress(current);
      progressAnim.setValue(current);
      if (current >= 100) {
        clearInterval(timer);
        navigation.replace("CaloriePlan");
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personalizing your Nutrio experience...</Text>

      <View style={styles.circleWrap}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E9F7ED"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#67bd52"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.centerContent}>
          <Ionicons name="leaf-outline" size={26} color="#67bd52" />
          <Text style={styles.progress}>{progress}%</Text>
        </View>
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
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  circleWrap: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  progress: { fontSize: 28, fontWeight: "700" },
  subtext: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 10 },
});
