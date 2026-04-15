import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORANGE = '#F5922A';

export default function History() {
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem('calc_history');
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  };

  const clearAll = () => {
    Alert.alert('Clear History', 'Delete all history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('calc_history');
          setEntries([]);
        },
      },
    ]);
  };

  const formatEntry = (raw: string) => {
    return raw.replace(/\*/g, '×');
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
          <Text style={s.emptyText}>No calculations yet</Text>
          <Text style={s.emptySubtext}>Your calculations will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.entry}>
              <Text style={s.entryText}>{formatEntry(item)}</Text>
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
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  entry: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  entryText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  sep: {
    height: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});
