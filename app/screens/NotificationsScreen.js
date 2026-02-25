import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useContext, useMemo, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Constants from "expo-constants";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import { db } from "../config/firebase";
import { COLORS } from "../theme/colors";
import { useAppAlert } from "../context/AlertContext";
import { Text } from "../components/MetaText";

const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const FREQUENCY_OPTIONS = [
  { id: 1, label: "Once daily" },
  { id: 2, label: "Twice daily" },
  { id: 3, label: "Thrice daily" },
];

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatTimeValue = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const buildDefaultTimes = () => {
  const morning = new Date();
  morning.setHours(8, 0, 0, 0);
  const afternoon = new Date();
  afternoon.setHours(13, 0, 0, 0);
  const evening = new Date();
  evening.setHours(19, 0, 0, 0);
  return [morning, afternoon, evening];
};

const ensureThreeTimes = (sourceTimes) => {
  const defaults = buildDefaultTimes();
  const normalized = Array.isArray(sourceTimes) ? [...sourceTimes] : [];
  while (normalized.length < 3) {
    normalized.push(defaults[normalized.length]);
  }
  return normalized.slice(0, 3);
};

export default function NotificationsScreen({ navigation }) {
  const { authUser } = useContext(AuthContext);
  const { user, setUser } = useContext(UserContext);
  const { showAlert } = useAppAlert();

  const stored = user?.notificationSettings;
  const initialFrequency = stored?.frequency ?? 1;
  const initialTimes = useMemo(() => {
    const baseTimes = stored?.times?.map((t) => {
      const [h, m] = t.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    });
    return ensureThreeTimes(baseTimes);
  }, [stored]);

  const [enabled, setEnabled] = useState(stored?.enabled ?? false);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [times, setTimes] = useState(initialTimes);
  const [pickerIndex, setPickerIndex] = useState(null);

  const visibleTimes = times.slice(0, frequency);

  const scheduleNotifications = async () => {
    try {
      if (isExpoGo) {
        return { ok: false, reason: "expo-go" };
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!enabled) return { ok: true };

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        setEnabled(false);
        return { ok: false, reason: "permission" };
      }

      await Promise.all(
        visibleTimes.map((time) =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: "MetaCal reminder",
              body: "Time to log your meals and stay on track.",
              sound: true,
            },
            trigger: {
              hour: time.getHours(),
              minute: time.getMinutes(),
              repeats: true,
            },
          }),
        ),
      );

      return { ok: true };
    } catch {
      return { ok: false, reason: "schedule" };
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        enabled,
        frequency,
        times: visibleTimes.map(formatTimeValue),
        updatedAt: Date.now(),
      };
      setUser((prev) => ({ ...prev, notificationSettings: payload }));
      if (authUser?.uid) {
        await setDoc(
          doc(db, "users", authUser.uid),
          { notificationSettings: payload },
          { merge: true },
        );
      }
      const result = await scheduleNotifications();
      if (!result.ok && enabled) {
        if (result.reason === "expo-go") {
          showAlert(
            "Saved",
            "Preferences saved. Reminder notifications need a development build or APK (not Expo Go).",
          );
          return;
        }
        if (result.reason === "permission") {
          showAlert(
            "Saved",
            "Preferences saved. Enable notifications in device settings to receive reminders.",
          );
          return;
        }
        showAlert(
          "Saved",
          "Preferences saved, but reminders could not be scheduled on this device.",
        );
        return;
      }
      showAlert(
        "Saved",
        "Your notifications/reminders preferences are updated.",
      );
    } catch (error) {
      showAlert("Save failed", error?.message || "Please try again.");
    }
  };

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    if (!next && !isExpoGo) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications / Reminders</Text>
      </View>
      <Text style={styles.subtitle}>
        Pick how often you want reminders to log meals.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>Enable reminders</Text>
          <TouchableOpacity
            style={[styles.toggle, enabled && styles.toggleOn]}
            onPress={handleToggle}
          >
            <View
              style={[styles.toggleKnob, enabled && styles.toggleKnobOn]}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequency</Text>
        <View style={styles.optionRow}>
          {FREQUENCY_OPTIONS.map((option) => {
            const active = option.id === frequency;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionChip, active && styles.optionChipActive]}
                onPress={() => setFrequency(option.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    active && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Times</Text>
        {visibleTimes.map((time, index) => (
          <TouchableOpacity
            key={`time-${index}`}
            style={styles.timeRow}
            onPress={() => setPickerIndex(index)}
          >
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.timeLabel}>Reminder {index + 1}</Text>
            <Text style={styles.timeValue}>{formatTime(time)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save preferences</Text>
      </TouchableOpacity>

      {pickerIndex != null && visibleTimes[pickerIndex] && (
        <DateTimePicker
          value={visibleTimes[pickerIndex]}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== "ios") {
              setPickerIndex(null);
            }
            if (selectedDate) {
              const nextTimes = [...times];
              nextTimes[pickerIndex] = selectedDate;
              setTimes(nextTimes);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
  },
  card: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    padding: 3,
  },
  toggleOn: {
    backgroundColor: COLORS.primarySoft,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobOn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  timeLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
