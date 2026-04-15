import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoryItem = {
  id: string;
  type: "calculator" | "converter" | "graph";
  text: string;
  createdAt: string;
};

const HISTORY_KEY = "app_history";

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  try {
    const existing = await getHistory();

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item,
    };

    const updated = [newItem, ...existing].slice(0, 50);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore storage errors
  }
}
