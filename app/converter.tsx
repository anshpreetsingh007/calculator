import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ORANGE = '#F5922A';

const CONVERSIONS: Record<string, Record<string, number>> = {
  cm: { cm: 1, m: 0.01, km: 0.00001, in: 0.393701, ft: 0.0328084, mi: 0.0000062137 },
  m: { cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, mi: 0.000621371 },
  km: { cm: 100000, m: 1000, km: 1, in: 39370.1, ft: 3280.84, mi: 0.621371 },
  in: { cm: 2.54, m: 0.0254, km: 0.0000254, in: 1, ft: 0.0833333, mi: 0.0000157828 },
  ft: { cm: 30.48, m: 0.3048, km: 0.0003048, in: 12, ft: 1, mi: 0.000189394 },
  mi: { cm: 160934, m: 1609.34, km: 1.60934, in: 63360, ft: 5280, mi: 1 },
  kg: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274 },
  g: { kg: 0.001, g: 1, lb: 0.00220462, oz: 0.035274 },
  lb: { kg: 0.453592, g: 453.592, lb: 1, oz: 16 },
  oz: { kg: 0.0283495, g: 28.3495, lb: 0.0625, oz: 1 },
};

const CATEGORIES: Record<string, string[]> = {
  Length: ['cm', 'm', 'km', 'in', 'ft', 'mi'],
  Weight: ['kg', 'g', 'lb', 'oz'],
};

export default function Converter() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [fromUnit, setFromUnit] = useState('cm');
  const [toUnit, setToUnit] = useState('m');
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const getCategory = (unit: string) => {
    for (const [cat, units] of Object.entries(CATEGORIES)) {
      if (units.includes(unit)) return cat;
    }
    return null;
  };

  const compatibleUnits = () => {
    const cat = getCategory(fromUnit);
    return cat ? CATEGORIES[cat] : [];
  };

  const convert = () => {
    setErr('');
    setResult(null);

    if (!input.trim()) {
      setErr('Please enter a value');
      return;
    }

    const n = parseFloat(input);
    if (isNaN(n)) {
      setErr('Enter a valid number');
      return;
    }

    if (getCategory(fromUnit) !== getCategory(toUnit)) {
      setErr(`Can't convert ${fromUnit} to ${toUnit}`);
      return;
    }

    const factor = CONVERSIONS[fromUnit]?.[toUnit];
    if (!factor && factor !== 0) {
      setErr('Conversion not supported');
      return;
    }

    const converted = n * factor;
    setResult(parseFloat(converted.toFixed(6)).toString());
  };

  const UnitPicker = ({ units, selected, onSelect, onClose }: {
    units: string[]; selected: string; onSelect: (u: string) => void; onClose: () => void;
  }) => (
    <View style={s.pickerOverlay}>
      <View style={s.pickerCard}>
        {units.map(u => (
          <TouchableOpacity
            key={u}
            style={[s.pickerItem, u === selected && s.pickerSelected]}
            onPress={() => { onSelect(u); onClose(); }}
          >
            <Text style={[s.pickerText, u === selected && { color: ORANGE, fontWeight: '700' }]}>{u}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Converter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <View style={s.card}>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
              value={input}
              onChangeText={(t) => { setInput(t); setErr(''); }}
            />
            <TouchableOpacity style={s.unitBtn} onPress={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}>
              <Text style={s.unitLabel}>{fromUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {showFromPicker && (
            <UnitPicker
              units={Object.keys(CONVERSIONS)}
              selected={fromUnit}
              onSelect={(u) => {
                setFromUnit(u);
                const cat = getCategory(u);
                if (cat && !CATEGORIES[cat].includes(toUnit)) {
                  setToUnit(CATEGORIES[cat][1] || CATEGORIES[cat][0]);
                }
              }}
              onClose={() => setShowFromPicker(false)}
            />
          )}

          <View style={s.arrowWrap}>
            <Ionicons name="arrow-down" size={28} color="#999" />
          </View>

          <View style={s.inputRow}>
            <View style={[s.input, s.outputField]}>
              <Text style={[s.outputText, !result && { color: '#bbb' }]}>
                {result ?? '0'}
              </Text>
            </View>
            <TouchableOpacity style={s.unitBtn} onPress={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}>
              <Text style={s.unitLabel}>{toUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {showToPicker && (
            <UnitPicker
              units={compatibleUnits()}
              selected={toUnit}
              onSelect={setToUnit}
              onClose={() => setShowToPicker(false)}
            />
          )}
        </View>

        {err ? (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF3B30" />
            <Text style={s.errorText}>{err}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={s.convertBtn} onPress={convert} activeOpacity={0.8}>
          <Text style={s.convertText}>Convert</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 22,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  outputField: {
    borderBottomColor: '#e0e0e0',
  },
  outputText: {
    fontSize: 22,
    color: '#333',
  },
  unitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  unitLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  arrowWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  convertBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  convertText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerOverlay: {
    marginVertical: 8,
  },
  pickerCard: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  pickerSelected: {
    backgroundColor: '#FFF3E6',
  },
  pickerText: {
    fontSize: 16,
    color: '#444',
  },
});
