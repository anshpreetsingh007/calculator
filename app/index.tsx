// Home Screen - the main menu of the app
// Shows a list of menu items (Calculator, Converter, Graph, History)
// Has a dark mode toggle button (sun/moon icon) in the top right corner

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Main orange color used across the app
const ORANGE = "#F5922A";

// List of menu items shown on the home screen
// Each item has a label, icon, route (page to go to), and color
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

  // Track if dark mode is on or off
  const [darkMode, setDarkMode] = useState(false);

  // When the app loads, check if user previously turned on dark mode
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

  // Toggle dark mode on/off and save the choice to storage
  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    try {
      await AsyncStorage.setItem("darkMode", JSON.stringify(newValue));
    } catch (e) {
      console.log("Error saving dark mode:", e);
    }
  };

  return (
    <View style={[s.container, darkMode && s.containerDark]}>
      {/* Change status bar text color based on dark mode */}
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Header with title and dark mode toggle */}
      <View style={s.header}>

        {/* Page title */}
        <Text style={[s.title, darkMode && s.titleDark]}>Home</Text>

        {/* Dark mode toggle - shows sun in dark mode, moon in light mode */}
        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons
            name={darkMode ? "sunny" : "moon"}
            size={24}
            color={darkMode ? "#FFD93D" : "#333"}
          />
        </TouchableOpacity>
      </View>

      {/* Menu cards - loop through each menu item and display it */}
      <View style={s.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              s.card,
              darkMode && s.cardDark,
              item.color === ORANGE && s.cardHighlight, // Orange cards get highlighted
            ]}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)} // Navigate to the page
          >
            {/* Menu item icon */}
            <Ionicons
              name={item.icon}
              size={22}
              color={
                item.color === ORANGE
                  ? "#fff"
                  : darkMode
                  ? "#ccc"
                  : "#555"
              }
              style={s.cardIcon}
            />

            {/* Menu item label */}
            <Text
              style={[
                s.cardLabel,
                darkMode && s.cardLabelDark,
                item.color === ORANGE && { color: "#fff" },
              ]}
            >
              {item.label}
            </Text>

            {/* Arrow icon on the right side */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={item.color === ORANGE ? "#fff" : darkMode ? "#888" : "#aaa"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Styles for the home screen
const s = StyleSheet.create({
  // Main container - light background
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  // Dark mode background
  containerDark: {
    backgroundColor: "#121212",
  },
  // Header row layout
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
  },
  // Page title text
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    flex: 1,
  },
  // Dark mode title color
  titleDark: {
    color: "#f0f0f0",
  },
  // Menu list spacing
  menu: {
    gap: 14,
  },
  // Each menu card style
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
  // Dark mode card background
  cardDark: {
    backgroundColor: "#1e1e1e",
  },
  // Orange highlighted card
  cardHighlight: {
    backgroundColor: ORANGE,
  },
  // Space between icon and label
  cardIcon: {
    marginRight: 14,
  },
  // Menu item text
  cardLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  // Dark mode text color
  cardLabelDark: {
    color: "#e0e0e0",
  },
});
