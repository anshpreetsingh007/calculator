// Home Screen - the main menu of the app
// Shows a list of menu items (Calculator, Converter, Graph, History)
// Has a dark mode toggle button (sun/moon icon) in the top right corner

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const ORANGE = "#F5922A";

const menuItems = [
  {
    label: "Calculator",
    icon: "calculator" as const,
    route: "/calculator" as const,
    color: ORANGE,
  },
  {
    label: "Converter",
    icon: "swap-horizontal" as const,
    route: "/converter" as const,
    color: "#666",
  },
  {
    label: "Graph Calculator",
    icon: "stats-chart" as const,
    route: "/graph" as const,
    color: "#666",
  },
  {
    label: "History",
    icon: "time" as const,
    route: "/history" as const,
    color: ORANGE,
  },
];

export default function Home() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const saved = await AsyncStorage.getItem("darkMode");
        if (saved !== null) setDarkMode(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading dark mode:", e);
      }
    };
    loadDarkMode();
  }, []);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    try {
      await AsyncStorage.setItem("darkMode", JSON.stringify(newValue));
    } catch (e) {
      console.log("Error saving dark mode:", e);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            Alert.alert("Logout Failed", error.message);
          } else {
            router.replace("/");
          }
        },
      },
    ]);
  };

  return (
    <View style={[s.container, darkMode && s.containerDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={s.header}>
        <Text style={[s.title, darkMode && s.titleDark]}>Home</Text>

        <View style={s.headerIcons}>
          <TouchableOpacity onPress={toggleDarkMode} style={s.iconButton}>
            <Ionicons
              name={darkMode ? "sunny" : "moon"}
              size={24}
              color={darkMode ? "#FFD93D" : "#333"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={s.iconButton}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={darkMode ? "#f0f0f0" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              s.card,
              darkMode && s.cardDark,
              item.color === ORANGE && s.cardHighlight,
            ]}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={
                item.color === ORANGE ? "#fff" : darkMode ? "#ccc" : "#555"
              }
              style={s.cardIcon}
            />

            <Text
              style={[
                s.cardLabel,
                darkMode && s.cardLabelDark,
                item.color === ORANGE && { color: "#fff" },
              ]}
            >
              {item.label}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                item.color === ORANGE ? "#fff" : darkMode ? "#888" : "#aaa"
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    flex: 1,
  },
  titleDark: {
    color: "#f0f0f0",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 14,
  },
  menu: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
  },
  cardHighlight: {
    backgroundColor: ORANGE,
  },
  cardIcon: {
    marginRight: 14,
  },
  cardLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  cardLabelDark: {
    color: "#e0e0e0",
  },
});
