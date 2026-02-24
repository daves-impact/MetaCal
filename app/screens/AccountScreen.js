import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { UserContext } from "../context/UserContext";
import { COLORS } from "../theme/colors";
import { auth, db } from "../config/firebase";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useAppAlert } from "../context/AlertContext";

import { Text } from "../components/MetaText";
const SETTINGS_ITEMS = [
  {
    id: "macros",
    label: "Adjust macronutrients",
    icon: "swap-horizontal",
    color: COLORS.primary,
  },
  {
    id: "goal",
    label: "Goal & current weight",
    icon: "flag-outline",
    color: COLORS.weight,
  },
  {
    id: "notifications",
    label: "Notifications / Reminders",
    icon: "notifications-outline",
    color: COLORS.primary,
  },
  {
    id: "language",
    label: "Language",
    icon: "language-outline",
    color: COLORS.protein,
  },
];

export default function AccountScreen({ navigation }) {
  const [isDark, setIsDark] = useState(false);
  const { user } = useContext(UserContext);
  const { showAlert } = useAppAlert();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color="#9CA3AF" />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.profileName}>{user?.name || "Your Name"}</Text>
          <Text style={styles.profileSub}>
            {user?.age ? `${user.age} years old` : " "}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        {SETTINGS_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.settingRow}
            activeOpacity={0.8}
            onPress={() => {
              if (item.id === "macros") {
                navigation.navigate("AdjustMacros");
              }
              if (item.id === "goal") {
                navigation.navigate("PersonalDetails");
              }
              if (item.id === "notifications") {
                navigation.navigate("Notifications");
              }
              if (item.id === "language") {
                navigation.navigate("Language");
              }
            }}
          >
            <View style={styles.settingIcon}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
            {index !== SETTINGS_ITEMS.length - 1 ? (
              <View style={styles.settingDivider} />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.sectionCard, styles.appearanceCard]}>
        <View style={styles.appearanceRow}>
          <View>
            <Text style={styles.appearanceTitle}>Appearance</Text>
            <Text style={styles.appearanceSub}>Light and dark mode toggle</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.appearanceToggle,
              isDark && styles.appearanceToggleDark,
            ]}
            onPress={() => setIsDark((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sunny"
              size={14}
              color={isDark ? "#9CA3AF" : COLORS.primaryDark}
            />
            <Ionicons
              name="moon"
              size={14}
              color={isDark ? "#111827" : "#9CA3AF"}
            />
            <View
              style={[styles.toggleKnob, isDark && styles.toggleKnobDark]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          showAlert(
            "Delete account",
            "This will permanently delete your account and data. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    const uid = auth.currentUser?.uid;
                    if (uid) {
                      await deleteDoc(doc(db, "users", uid));
                    }
                    if (auth.currentUser) {
                      await deleteUser(auth.currentUser);
                    }
                  } catch (error) {
                    showAlert(
                      "Delete failed",
                      error?.message ||
                        "Please log in again and try deleting your account.",
                    );
                  }
                },
              },
            ],
          );
        }}
      >
        <Text style={styles.deleteText}>Delete account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  profileSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  appearanceCard: {
    marginBottom: 24,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  settingRow: {
    paddingVertical: 14,
  },
  settingIcon: {
    position: "absolute",
    left: 0,
    top: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
    marginLeft: 34,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginTop: 14,
  },
  appearanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  appearanceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  appearanceSub: {
    fontSize: 11,
    color: COLORS.muted,
  },
  appearanceToggle: {
    width: 64,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  appearanceToggleDark: {
    backgroundColor: "#E5E7EB",
  },
  toggleKnob: {
    position: "absolute",
    left: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobDark: {
    left: 39,
    backgroundColor: "#111827",
  },
  deleteButton: {
    marginTop: 0,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
