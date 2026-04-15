import { Ionicons } from "@expo/vector-icons";
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
import { clearHistory, getHistory, HistoryItem } from "./utils/history";

const ORANGE = "#F5922A";

export default function History() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const loadHistory = async () => {
    const history = await getHistory();
    setEntries(history);
    setLoading(false);
  };

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
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={s.screenTitle}>History</Text>

        {entries.length > 0 ? (
          <TouchableOpacity onPress={clearAll}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {loading ? null : entries.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="time-outline" size={56} color="#ccc" />
          <Text style={s.emptyText}>No history yet</Text>
          <Text style={s.emptySubtext}>
            Calculator, converter, and graph actions will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.entry}>
              <View style={s.iconWrap}>
                <Ionicons name={getIcon(item.type)} size={20} color={ORANGE} />
              </View>

              <View style={s.entryContent}>
                <Text style={s.entryType}>{getTypeLabel(item.type)}</Text>
                <Text style={s.entryText}>{item.text}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  entry: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF3E6",
    justifyContent: "center",
    alignItems: "center",
  },
  entryContent: {
    flex: 1,
  },
  entryType: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: "700",
    marginBottom: 4,
  },
  entryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    lineHeight: 22,
  },
  sep: {
    height: 10,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 20,
  },
});
