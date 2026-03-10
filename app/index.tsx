// Mobile Application Development Project
// Group: Calculator App Team
// Member: Diego Galvis
// Phase 1 - starting basic layout for calculator screen

import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* basic calculator layout for the main screen */}
      <View>
        <Text style={{ fontSize: 32, marginBottom: 20 }}>Calculator</Text>

        {/* display area */}
        <Text style={{ fontSize: 28, marginBottom: 20 }}>0</Text>

        {/* first row of buttons (just visual for now) */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Text>1</Text>
          <Text>2</Text>
          <Text>3</Text>
          <Text>+</Text>
        </View>
      </View>
    </View>
  );
}