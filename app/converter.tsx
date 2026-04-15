// Converter Screen - converts between different units (length and weight)
// Users pick a "from" unit and a "to" unit, enter a value, and hit Convert
// Saves each conversion to history

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveHistory } from "./utils/history";

// Main orange color
const ORANGE = "#F5922A";

// Conversion factors between different units
// Each unit maps to other units with a multiplication factor
// Example: 1 cm = 0.01 m, so cm -> m factor is 0.01
const CONVERSIONS: Record<string, Record<string, number>> = {
  cm: {
    cm: 1,
    m: 0.01,
    km: 0.00001,
    in: 0.393701,
    ft: 0.0328084,
    mi: 0.0000062137,
  },
  m: { cm: 100, m: 1, km: 0.001, in: 39.3701, ft: 3.28084, mi: 0.000621371 },
  km: { cm: 100000, m: 1000, km: 1, in: 39370.1, ft: 3280.84, mi: 0.621371 },
  in: {
    cm: 2.54,
    m: 0.0254,
    km: 0.0000254,
    in: 1,
    ft: 0.0833333,
    mi: 0.0000157828,
  },
  ft: { cm: 30.48, m: 0.3048, km: 0.0003048, in: 12, ft: 1, mi: 0.000189394 },
  mi: { cm: 160934, m: 1609.34, km: 1.60934, in: 63360, ft: 5280, mi: 1 },
  kg: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274 },
  g: { kg: 0.001, g: 1, lb: 0.00220462, oz: 0.035274 },
  lb: { kg: 0.453592, g: 453.592, lb: 1, oz: 16 },
  oz: { kg: 0.0283495, g: 28.3495, lb: 0.0625, oz: 1 },
};

// Group units into categories so we only show compatible conversions
const CATEGORIES: Record<string, string[]> = {
  Length: ["cm", "m", "km", "in", "ft", "mi"],
  Weight: ["kg", "g", "lb", "oz"],
};

export default function Converter() {
  const router = useRouter();

  // input = the number the user types in
  // fromUnit = the unit to convert from (e.g. "cm")
  // toUnit = the unit to convert to (e.g. "m")
  // result = the converted value
  // err = any error message
  // showFromPicker / showToPicker = whether the unit picker dropdown is open
  const [input, setInput] = useState("");
  const [fromUnit, setFromUnit] = useState("cm");
  const [toUnit, setToUnit] = useState("m");
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Find which category a unit belongs to (Length or Weight)
  const getCategory = (unit: string) => {
    for (const [cat, units] of Object.entries(CATEGORIES)) {
      if (units.includes(unit)) return cat;
    }
    return null;
  };

  // Get list of units that are compatible with the current "from" unit
  const compatibleUnits = () => {
    const cat = getCategory(fromUnit);
    return cat ? CATEGORIES[cat] : [];
  };

  // Do the conversion when the Convert button is pressed
  const convert = async () => {
    setErr("");
    setResult(null);
    setShowFromPicker(false);
    setShowToPicker(false);

    // Check if user entered a value
    if (!input.trim()) {
      setErr("Please enter a value");
      return;
    }

    // Check if the value is a valid number
    const n = parseFloat(input);
    if (isNaN(n)) {
      setErr("Enter a valid number");
      return;
    }

    // Make sure both units are in the same category (e.g. can't convert kg to cm)
    if (getCategory(fromUnit) !== getCategory(toUnit)) {
      setErr(`Can't convert ${fromUnit} to ${toUnit}`);
      return;
    }

    // Look up the conversion factor and calculate
    const factor = CONVERSIONS[fromUnit]?.[toUnit];
    if (!factor && factor !== 0) {
      setErr("Conversion not supported");
      return;
    }

    const converted = n * factor;
    const finalResult = parseFloat(converted.toFixed(6)).toString();
    setResult(finalResult);

    // Save the conversion to history
    await saveHistory({
      type: "converter",
      text: `${n} ${fromUnit} = ${finalResult} ${toUnit}`,
    });
  };

  // Swap the "from" and "to" units
  const swapUnits = () => {
    const oldFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(oldFrom);
    setResult(null);
    setErr("");
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  // Clear all fields and start fresh
  const clearFields = () => {
    setInput("");
    setResult(null);
    setErr("");
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  // Dropdown picker component for selecting a unit
  const UnitPicker = ({
    units,
    selected,
    onSelect,
    onClose,
  }: {
    units: string[];
    selected: string;
    onSelect: (u: string) => void;
    onClose: () => void;
  }) => (
    <View style={s.pickerOverlay}>
      <View style={s.pickerCard}>
        {/* Show each unit as a tappable row */}
        {units.map((u) => (
          <TouchableOpacity
            key={u}
            style={[s.pickerItem, u === selected && s.pickerSelected]}
            onPress={() => {
              onSelect(u);
              onClose();
            }}
          >
            <Text
              style={[
                s.pickerText,
                u === selected && { color: ORANGE, fontWeight: "700" },
              ]}
            >
              {u}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar with back button and title */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Converter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <View style={s.card}>
          {/* Show the current category (Length or Weight) */}
          <Text style={s.categoryText}>Category: {getCategory(fromUnit)}</Text>

          {/* Input field and "from" unit selector */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="0"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
              value={input}
              onChangeText={(t) => {
                setInput(t);
                setErr("");
                setResult(null);
              }}
            />
            {/* Button to open the "from" unit picker */}
            <TouchableOpacity
              style={s.unitBtn}
              onPress={() => {
                setShowFromPicker(!showFromPicker);
                setShowToPicker(false);
              }}
            >
              <Text style={s.unitLabel}>{fromUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* "From" unit picker dropdown (shown when tapped) */}
          {showFromPicker && (
            <UnitPicker
              units={Object.keys(CONVERSIONS)}
              selected={fromUnit}
              onSelect={(u) => {
                setFromUnit(u);
                setResult(null);
                setErr("");
                // If the new unit is in a different category, auto-select a compatible "to" unit
                const cat = getCategory(u);
                if (cat && !CATEGORIES[cat].includes(toUnit)) {
                  setToUnit(CATEGORIES[cat][1] || CATEGORIES[cat][0]);
                }
              }}
              onClose={() => setShowFromPicker(false)}
            />
          )}

          {/* Arrow pointing down between the two unit rows */}
          <View style={s.arrowWrap}>
            <Ionicons name="arrow-down" size={28} color="#999" />
          </View>

          {/* Swap button to switch from and to units */}
          <TouchableOpacity
            style={s.swapBtn}
            onPress={swapUnits}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-vertical" size={18} color={ORANGE} />
            <Text style={s.swapText}>Swap units</Text>
          </TouchableOpacity>

          {/* Output field and "to" unit selector */}
          <View style={s.inputRow}>
            <View style={[s.input, s.outputField]}>
              <Text style={[s.outputText, !result && { color: "#bbb" }]}>
                {result ?? "0"}
              </Text>
            </View>
            {/* Button to open the "to" unit picker */}
            <TouchableOpacity
              style={s.unitBtn}
              onPress={() => {
                setShowToPicker(!showToPicker);
                setShowFromPicker(false);
              }}
            >
              <Text style={s.unitLabel}>{toUnit}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* "To" unit picker dropdown (only shows compatible units) */}
          {showToPicker && (
            <UnitPicker
              units={compatibleUnits()}
              selected={toUnit}
              onSelect={(u) => {
                setToUnit(u);
                setResult(null);
                setErr("");
              }}
              onClose={() => setShowToPicker(false)}
            />
          )}
        </View>

        {/* Error message (shown in red if there's an error) */}
        {err ? (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF3B30" />
            <Text style={s.errorText}>{err}</Text>
          </View>
        ) : null}

        {/* Convert button */}
        <TouchableOpacity
          style={s.convertBtn}
          onPress={convert}
          activeOpacity={0.8}
        >
          <Text style={s.convertText}>Convert</Text>
        </TouchableOpacity>

        {/* Clear button */}
        <TouchableOpacity
          style={s.clearBtn}
          onPress={clearFields}
          activeOpacity={0.8}
        >
          <Text style={s.clearText}>Clear</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Styles for the converter screen
const s = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },
  // Top navigation bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  // Screen title text
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  // Scrollable content area padding
  body: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // White card that holds the conversion fields
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Category label (e.g. "Category: Length")
  categoryText: {
    fontSize: 14,
    color: ORANGE,
    fontWeight: "700",
    marginBottom: 18,
  },
  // Row with input field and unit selector
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // Text input field for the number
  input: {
    flex: 1,
    fontSize: 22,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 10,
  },
  // Output field (non-editable)
  outputField: {
    borderBottomColor: "#e0e0e0",
  },
  // Output text style
  outputText: {
    fontSize: 22,
    color: "#333",
  },
  // Unit selector button (e.g. shows "cm" with dropdown arrow)
  unitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  // Unit label text inside the selector button
  unitLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  // Arrow between from and to fields
  arrowWrap: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  // Swap units button
  swapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  // Swap button text
  swapText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: "600",
  },
  // Orange convert button
  convertBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },
  // Convert button text
  convertText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  // White clear button with border
  clearBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  // Clear button text
  clearText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  // Error message container
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  // Error message text (red)
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  // Unit picker dropdown container
  pickerOverlay: {
    marginVertical: 8,
  },
  // Unit picker card background
  pickerCard: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    overflow: "hidden",
  },
  // Each item in the unit picker list
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  // Highlighted (selected) picker item
  pickerSelected: {
    backgroundColor: "#FFF3E6",
  },
  // Picker item text
  pickerText: {
    fontSize: 16,
    color: "#444",
  },
});
