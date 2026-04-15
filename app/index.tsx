import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#F5922A';

const menuItems = [
  { label: 'Calculator', icon: 'calculator' as const, route: '/calculator' as const, color: ORANGE },
  { label: 'Converter', icon: 'swap-horizontal' as const, route: '/converter' as const, color: '#666' },
  { label: 'Graph Calculator', icon: 'stats-chart' as const, route: '/graph' as const, color: '#666' },
  { label: 'History', icon: 'time' as const, route: '/history' as const, color: ORANGE },
];

export default function Home() {
  const router = useRouter();

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={28} color="#999" />
        </View>
        <Text style={s.title}>Home</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={s.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              s.card,
              item.color === ORANGE && s.cardHighlight,
            ]}
            activeOpacity={0.7}
            onPress={() => router.push(item.route)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={item.color === ORANGE ? '#fff' : '#555'}
              style={s.cardIcon}
            />
            <Text style={[
              s.cardLabel,
              item.color === ORANGE && { color: '#fff' },
            ]}>
              {item.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={item.color === ORANGE ? '#fff' : '#aaa'}
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
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  menu: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
    color: '#333',
  },
});