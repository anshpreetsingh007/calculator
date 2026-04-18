// History utility functions
// Handles saving, loading, and clearing calculation history
// Uses AsyncStorage to store data on the device

import AsyncStorage from "@react-native-async-storage/async-storage";

// Shape of each history entry
export type HistoryItem = {
  id: string;                                    // Unique ID (timestamp)
  type: "calculator" | "converter" | "graph";    // Which feature created this entry
  text: string;                                  // The text to display (e.g. "5 + 3 = 8")
  createdAt: string;                             // When this entry was created
};

// The key used to store history in AsyncStorage
const HISTORY_KEY = "app_history";

// Get all history items from storage
// Returns an empty array if there's no history or if something goes wrong
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save a new history item to storage
// Adds the new item to the top of the list and keeps only the last 50 entries
export async function saveHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  try {
    // Get the existing history
    const existing = await getHistory();

    // Create a new entry with a unique ID and timestamp
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item,
    };

    // Add new item to the front, keep max 50 entries
    const updated = [newItem, ...existing].slice(0, 50);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors silently
  }
}

// Delete all history from storage
export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore storage errors silently
  }
}
