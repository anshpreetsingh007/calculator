import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ORANGE = "#F5922A";

export default function SettingsScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem("username");
      const savedEmail = await AsyncStorage.getItem("email");
      const savedDarkMode = await AsyncStorage.getItem("darkMode");
      const savedNotifications = await AsyncStorage.getItem("notifications");

      if (savedUsername) setUsername(savedUsername);
      if (savedEmail) setEmail(savedEmail);
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (error) {
      console.log("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("darkMode", JSON.stringify(darkMode));
      await AsyncStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
      );

      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      console.log("Error saving settings:", error);
      Alert.alert("Error", "Could not save settings");
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#222"}
          />
        </TouchableOpacity>

        <Text style={[styles.title, darkMode && styles.darkText]}>
          Settings
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Username
          </Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Enter your username"
            placeholderTextColor={darkMode ? "#aaa" : "#999"}
            value={username}
            onChangeText={setUsername}
          />

          <Text style={[styles.label, darkMode && styles.darkText]}>Email</Text>
          <TextInput
            style={[styles.input, darkMode && styles.darkInput]}
            placeholder="Enter your email"
            placeholderTextColor={darkMode ? "#aaa" : "#999"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.card, darkMode && styles.darkCard]}>
          <View style={styles.row}>
            <Text style={[styles.rowText, darkMode && styles.darkText]}>
              Dark Mode
            </Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowText, darkMode && styles.darkText]}>
              Notifications
            </Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  darkText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#1e1e1e",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    marginBottom: 14,
  },
  darkInput: {
    backgroundColor: "#2b2b2b",
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
