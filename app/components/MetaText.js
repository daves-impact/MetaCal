import React from "react";
import { StyleSheet, Text as RNText, TextInput as RNTextInput } from "react-native";

const resolveFontFamily = (style) => {
  const flat = StyleSheet.flatten(style) || {};
  if (flat.fontFamily) {
    return flat.fontFamily;
  }

  const weight = String(flat.fontWeight || "").toLowerCase();
  if (weight === "800") return "Nunito_800ExtraBold";
  if (weight === "700" || weight === "bold") return "Nunito_700Bold";
  if (weight === "600" || weight === "500") return "Nunito_600SemiBold";
  return "Nunito_400Regular";
};

export const Text = ({ style, ...props }) => (
  <RNText
    {...props}
    style={[{ fontFamily: resolveFontFamily(style) }, style]}
  />
);

export const TextInput = ({ style, ...props }) => (
  <RNTextInput
    {...props}
    style={[{ fontFamily: resolveFontFamily(style) }, style]}
  />
);

