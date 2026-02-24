import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORS } from "../theme/colors";

import { Text, TextInput } from "../components/MetaText";
const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa"];

export default function LanguageScreen({ navigation }) {
  const [selected, setSelected] = useState("English");

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Language</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isActive = lang === selected;
            return (
              <Pressable
                key={lang}
                style={[styles.langItem, isActive && styles.langItemActive]}
                onPress={() => setSelected(lang)}
              >
                <Text
                  style={[styles.langText, isActive && styles.langTextActive]}
                >
                  {lang}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 12,
  },
  langItem: {
    backgroundColor: "#F7F7FB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  langItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  langTextActive: {
    color: "#FFFFFF",
  },
});


