// Mobile Application Development Project
// Group: Calculator App Team
// Member: Diego Galvis
// Phase 1 - basic layout for calculator screen

import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f2f2",
      }}
    >
      <View style={{ width: 250, padding: 20, backgroundColor: "#ffffff", borderRadius: 10 }}>
        
        {/* Title */}
        <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 20 }}>
          Calculator
        </Text>

        {/* Display */}
        <View
          style={{
            backgroundColor: "#e6e6e6",
            padding: 15,
            borderRadius: 5,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 28, textAlign: "right" }}>0</Text>
        </View>

        {/* Button row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20 }}>1</Text>
          <Text style={{ fontSize: 20 }}>2</Text>
          <Text style={{ fontSize: 20 }}>3</Text>
          <Text style={{ fontSize: 20 }}>+</Text>
        </View>

      </View>
    </View>
  );
}