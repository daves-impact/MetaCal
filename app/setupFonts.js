import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";

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

const stripFontWeight = (style) => {
  if (!style) return style;
  const flat = StyleSheet.flatten(style);
  if (!flat?.fontWeight) return style;
  const { fontWeight, ...rest } = flat;
  return rest;
};

const patchTextRender = () => {
  const TextRender = Text.render;
  if (TextRender._metaCalPatched) return;

  const render = function (...args) {
    const origin = TextRender.apply(this, args);
    const style = origin.props?.style;
    return React.cloneElement(origin, {
      style: [
        { fontFamily: resolveFontFamily(style) },
        stripFontWeight(style),
      ],
    });
  };
  render._metaCalPatched = true;
  Text.render = render;
};

const patchTextInput = () => {
  if (TextInput.defaultProps?.style?._metaCalFont) return;
  const baseStyle = { fontFamily: "Nunito_400Regular", _metaCalFont: true };
  TextInput.defaultProps = TextInput.defaultProps || {};
  const existing = TextInput.defaultProps.style;
  TextInput.defaultProps.style = existing
    ? [baseStyle, stripFontWeight(existing)]
    : baseStyle;
};

patchTextRender();
patchTextInput();
