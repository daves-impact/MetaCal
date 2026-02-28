import React, { createContext, useContext, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../theme/colors";
import { Text } from "../components/MetaText";

const AlertContext = createContext({ showAlert: () => {} });

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    actions: [],
  });

  const showAlert = (title, message, actions) => {
    const safeActions =
      actions && actions.length
        ? actions
        : [{ text: "OK", style: "default" }];
    setAlert({
      visible: true,
      title,
      message,
      actions: safeActions,
    });
  };

  const hide = () =>
    setAlert((prev) => ({
      ...prev,
      visible: false,
    }));

  const handlePress = (action) => {
    hide();
    action?.onPress?.();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        transparent
        visible={alert.visible}
        animationType="fade"
        onRequestClose={hide}
      >
        <Pressable style={styles.overlay} onPress={hide}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.message}>{alert.message}</Text>
            <View style={styles.actions}>
              {alert.actions.map((action, index) => {
                const isDestructive = action.style === "destructive";
                const isCancel = action.style === "cancel";
                return (
                  <TouchableOpacity
                    key={`${action.text}-${index}`}
                    style={[
                      styles.actionButton,
                      isCancel && styles.actionButtonGhost,
                    ]}
                    onPress={() => handlePress(action)}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        isCancel && styles.actionTextGhost,
                        isDestructive && styles.actionTextDestructive,
                      ]}
                    >
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAppAlert = () => useContext(AlertContext);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },
  actions: {
    marginTop: 18,
    gap: 10,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonGhost: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  actionTextGhost: {
    color: COLORS.text,
  },
  actionTextDestructive: {
    color: "#DC2626",
  },
});
