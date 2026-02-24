import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { Text, TextInput } from "../components/MetaText";
const GenderScreen = ({ navigation, route }) => {
  const [gender, setGender] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const fromSettings = route?.params?.fromSettings;

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Ionicons name="male-female-outline" size={28} color="#67bd52" />
      </View>
      <Text style={styles.title}>Select your gender</Text>
      <View style={styles.options}>
        {[
          { label: "Male", icon: "male-outline" },
          { label: "Female", icon: "female-outline" },
          { label: "Other", icon: "transgender-outline" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.option,
              gender === item.label && styles.selectedOption,
            ]}
            onPress={() => setGender(item.label)}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={gender === item.label ? "#fff" : "#67bd52"}
            />
            <Text
              style={[
                styles.optionText,
                gender === item.label && styles.optionTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.button, !gender && { backgroundColor: "#ccc" }]}
        onPress={() => {
          setUser({ ...user, gender });
          if (fromSettings) {
            navigation.goBack();
            return;
          }
          navigation.navigate("Height");
        }}
        disabled={!gender}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E9F7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  selectedOption: { backgroundColor: "#67bd52" },
  optionText: { fontSize: 16, fontWeight: "500", color: "#333" },
  optionTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#67bd52",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderRadius: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});



