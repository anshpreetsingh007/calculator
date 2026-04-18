// History Screen - shows a list of all past calculations, conversions, and graphs
// Users can view their history and clear all entries
// Data is loaded from AsyncStorage when the screen is focused

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { clearHistory, getHistory, HistoryItem } from "../utils/history";

// Main orange color
const ORANGE = "#F5922A";

export default function History() {
  const router = useRouter();

  // entries = list of history items to display
  // loading = true while data is being fetched
  const [entries, setEntries] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // darkMode = true when app theme is dark
  const [darkMode, setDarkMode] = useState(false);

  // Reload history every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadTheme();
    }, []),
  );

  // Fetch all history items from storage
  const loadHistory = async () => {
    const history = await getHistory();
    setEntries(history);
    setLoading(false);
  };

  // Load dark mode setting from AsyncStorage
  const loadTheme = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem("darkMode");
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.log("Error loading theme:", error);
    }
  };

  // Show a confirmation popup, then delete all history if user confirms
  const clearAll = () => {
    Alert.alert("Clear History", "Delete all history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          setEntries([]);
        },
      },
    ]);
  };

  // Get the right icon for each history type
  const getIcon = (type: HistoryItem["type"]) => {
    switch (type) {
      case "calculator":
        return "calculator-outline";
      case "converter":
        return "swap-horizontal-outline";
      case "graph":
        return "stats-chart-outline";
      default:
        return "time-outline";
    }
  };

  // Get a readable label for each history type
  const getTypeLabel = (type: HistoryItem["type"]) => {
    switch (type) {
      case "calculator":
        return "Calculator";
      case "converter":
        return "Converter";
      case "graph":
        return "Graph";
      default:
        return "History";
    }
  };

  return (
    <View style={[s.container, darkMode && s.darkContainer]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Top bar with back button, title, and trash icon */}
      <View style={s.topBar}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>

        <Text style={[s.screenTitle, darkMode && s.darkText]}>History</Text>

        {/* Trash icon to clear all history (only shown if there are entries) */}
        {entries.length > 0 ? (
          <TouchableOpacity onPress={clearAll}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* Show empty state or the list of history entries */}
      {loading ? null : entries.length === 0 ? (
        // Empty state - shown when there's no history
        <View style={s.empty}>
          <Ionicons
            name="time-outline"
            size={56}
            color={darkMode ? "#666" : "#ccc"}
          />
          <Text style={[s.emptyText, darkMode && s.darkEmptyText]}>
            No history yet
          </Text>
          <Text style={[s.emptySubtext, darkMode && s.darkEmptySubtext]}>
            Calculator, converter, and graph actions will appear here
          </Text>
        </View>
      ) : (
        // List of history entries
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={[s.entry, darkMode && s.darkEntry]}>
              {/* Icon circle showing the type (calculator/converter/graph) */}
              <View style={[s.iconWrap, darkMode && s.darkIconWrap]}>
                <Ionicons name={getIcon(item.type)} size={20} color={ORANGE} />
              </View>

              {/* History entry text content */}
              <View style={s.entryContent}>
                <Text style={s.entryType}>{getTypeLabel(item.type)}</Text>
                <Text style={[s.entryText, darkMode && s.darkText]}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          // Small space between each entry
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </View>
  );
}

// Styles for the history screen
const s = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },

  // Dark main container
  darkContainer: {
    backgroundColor: "#121212",
  },

  // Top navigation bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Screen title text
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  // General dark text
  darkText: {
    color: "#fff",
  },

  // List padding
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Each history entry card
  entry: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  // Dark entry card
  darkEntry: {
    backgroundColor: "#1e1e1e",
  },

  // Orange circle icon container
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF3E6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Dark icon container
  darkIconWrap: {
    backgroundColor: "#2a2a2a",
  },

  // Text content area (right side of the entry)
  entryContent: {
    flex: 1,
  },

  // Type label (e.g. "Calculator") in orange
  entryType: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: "700",
    marginBottom: 4,
  },

  // The actual history text (e.g. "5 + 3 = 8")
  entryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    lineHeight: 22,
  },

  // Separator between entries
  sep: {
    height: 10,
  },

  // Empty state container (centered)
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  // "No history yet" text
  emptyText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },

  // Dark empty title
  darkEmptyText: {
    color: "#ddd",
  },

  // Subtitle text under empty state
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 20,
  },

  // Dark empty subtitle
  darkEmptySubtext: {
    color: "#888",
  },
});
