import { Platform } from "react-native";
import Constants from "expo-constants";

const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || "4000";

const inferExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0];
};

const inferredHost = inferExpoHost();
const localFallback =
  Platform.OS === "android"
    ? `http://10.0.2.2:${API_PORT}`
    : `http://localhost:${API_PORT}`;

// Priority:
// 1) EXPO_PUBLIC_API_BASE_URL (for prod/staging)
// 2) Expo host IP auto-detected from Metro (no manual LAN IP edits)
// 3) Emulator/simulator fallback
export const API_BASE_URL =
  fromEnv || (inferredHost ? `http://${inferredHost}:${API_PORT}` : localFallback);
