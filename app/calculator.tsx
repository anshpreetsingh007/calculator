// Calculator Screen - a basic calculator with +, -, ×, / operations
// Shows a display area on top and a button grid at the bottom
// Saves each calculation to history

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { saveHistory } from "../utils/history";

// Main orange color used for operator buttons
const ORANGE = "#F5922A";

// Type for the math operations we support
type Op = "+" | "-" | "×" | "/" | null;

export default function Calculator() {
  const router = useRouter();

  // cur = current number being typed
  // prev = the first number (before an operator is pressed)
  // op = the chosen operator (+, -, ×, /)
  // justEvaluated = true after pressing "=" so we know to reset on next input
  // expression = the full expression shown above the result (e.g. "5 + 3 = 8")
  // error = any error message to display
  const [cur, setCur] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState<Op>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
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

      loadTheme();
    }, []),
  );

  // Save a calculation result to history storage
  const saveToHistoryEntry = useCallback(async (entry: string) => {
    await saveHistory({
      type: "calculator",
      text: entry,
    });
  }, []);

  // Format a number with commas (e.g. 1000 -> 1,000)
  const formatNum = (n: string) => {
    if (n.includes("Error") || n.includes("Infinity")) return n;
    const parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Handle when a number button (0-9 or ".") is pressed
  const handleNum = (digit: string) => {
    setError("");

    // If we just got a result, start fresh with the new digit
    if (justEvaluated) {
      setCur(digit);
      setPrev("");
      setOp(null);
      setExpression("");
      setJustEvaluated(false);
      return;
    }

    // Don't allow two decimal points
    if (digit === "." && cur.includes(".")) return;

    // Replace leading zero, or append the digit
    if (cur === "0" && digit !== ".") {
      setCur(digit);
    } else {
      // Limit to 12 digits max
      if (cur.replace(".", "").replace("-", "").length >= 12) return;
      setCur(cur + digit);
    }
  };

  // Do the actual math between two numbers
  const compute = (a: number, b: number, operator: Op): number | null => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "/":
        if (b === 0) return null; // Can't divide by zero
        return Math.round((a / b) * 1e10) / 1e10; // Round to avoid floating point issues
      default:
        return b;
    }
  };

  // Handle when an operator button (+, -, ×, /) is pressed
  const handleOp = (nextOp: Op) => {
    setError("");
    setJustEvaluated(false);

    // If we already have a previous number and operator, calculate first
    if (prev && op && cur) {
      const result = compute(parseFloat(prev), parseFloat(cur), op);

      if (result === null) {
        setError("Cannot divide by zero");
        return;
      }

      const resultStr = String(result);
      setPrev(resultStr);
      setCur("");
      setOp(nextOp);
      setExpression(`${formatNum(resultStr)} ${nextOp}`);
    } else {
      // First operator press - save current number and wait for next
      setPrev(cur);
      setCur("");
      setOp(nextOp);
      setExpression(`${formatNum(cur)} ${nextOp}`);
    }
  };

  // Handle when the "=" button is pressed
  const handleEquals = async () => {
    setError("");

    // Need an operator and a first number to calculate
    if (!op || !prev) return;

    const a = parseFloat(prev);
    const b = parseFloat(cur || prev);

    // Make sure both numbers are valid
    if (isNaN(a) || isNaN(b)) {
      setError("Invalid input");
      return;
    }

    const result = compute(a, b, op);

    // Handle divide by zero
    if (result === null) {
      setError("Cannot divide by zero");
      setCur("0");
      setPrev("");
      setOp(null);
      setExpression("");
      return;
    }

    // Handle very large results
    if (!isFinite(result)) {
      setError("Result too large");
      setCur("0");
      setPrev("");
      setOp(null);
      setExpression("");
      return;
    }

    // Show the result and save to history
    const resultStr = parseFloat(result.toFixed(10)).toString();
    const fullExpr = `${formatNum(prev)} ${op} ${formatNum(
      cur || prev,
    )} = ${formatNum(resultStr)}`;

    setExpression(fullExpr);
    setCur(resultStr);
    setPrev("");
    setOp(null);
    setJustEvaluated(true);

    // Save this calculation to history
    await saveToHistoryEntry(`${prev} ${op} ${cur || prev} = ${resultStr}`);
  };

  // Clear everything and reset calculator
  const handleClear = () => {
    setCur("0");
    setPrev("");
    setOp(null);
    setExpression("");
    setError("");
    setJustEvaluated(false);
  };

  // Switch between positive and negative number
  const handleToggleSign = () => {
    if (cur === "0") return;
    setCur(cur.startsWith("-") ? cur.slice(1) : "-" + cur);
  };

  // Convert current number to percentage (divide by 100)
  const handlePercent = () => {
    const n = parseFloat(cur);

    if (isNaN(n)) {
      setError("Invalid input");
      return;
    }

    setCur(String(n / 100));
  };

  // What to show on the display - either an error or the formatted number
  const displayValue = error || formatNum(cur || "0");

  // Reusable button component for the calculator grid
  const CalcButton = ({
    label,
    onPress,
    style,
    textStyle,
  }: {
    label: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
  }) => (
    <TouchableOpacity
      style={[s.btn, style]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={[s.btnText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, darkMode && s.darkContainer]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Top bar with back button and title */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[s.screenTitle, darkMode && s.darkText]}>Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Display area showing the expression and result */}
      <View style={[s.display, darkMode && s.darkDisplay]}>
        {expression ? (
          <Text style={[s.expr, darkMode && s.darkExpr]} numberOfLines={1}>
            {expression}
          </Text>
        ) : null}

        <Text
          style={[
            s.result,
            darkMode && s.darkText,
            error && { color: "#FF3B30", fontSize: 20 },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayValue}
        </Text>
      </View>

      {/* Button grid with all calculator buttons */}
      <View style={s.grid}>
        {/* Row 1: AC, ±, %, + */}
        <View style={s.row}>
          <CalcButton
            label="AC"
            onPress={handleClear}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
          <CalcButton
            label="±"
            onPress={handleToggleSign}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
          <CalcButton
            label="%"
            onPress={handlePercent}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
          <CalcButton
            label="+"
            onPress={() => handleOp("+")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        {/* Row 2: 1, 2, 3, - */}
        <View style={s.row}>
          <CalcButton
            label="1"
            onPress={() => handleNum("1")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="2"
            onPress={() => handleNum("2")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="3"
            onPress={() => handleNum("3")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="-"
            onPress={() => handleOp("-")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        {/* Row 3: 4, 5, 6, × */}
        <View style={s.row}>
          <CalcButton
            label="4"
            onPress={() => handleNum("4")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="5"
            onPress={() => handleNum("5")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="6"
            onPress={() => handleNum("6")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="x"
            onPress={() => handleOp("×")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        {/* Row 4: 7, 8, 9, / */}
        <View style={s.row}>
          <CalcButton
            label="7"
            onPress={() => handleNum("7")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="8"
            onPress={() => handleNum("8")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="9"
            onPress={() => handleNum("9")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="/"
            onPress={() => handleOp("/")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        {/* Row 5: 0, ., = */}
        <View style={s.row}>
          <CalcButton
            label="0"
            onPress={() => handleNum("0")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="."
            onPress={() => handleNum(".")}
            style={[s.numBtn, darkMode && s.darkNumBtn]}
            textStyle={[s.numText, darkMode && s.darkText]}
          />
          <CalcButton
            label="="
            onPress={handleEquals}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>
      </View>
    </View>
  );
}

// Styles for the calculator screen
const s = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },
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
  darkText: {
    color: "#fff",
  },
  // Calculator display area (white box)
  display: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    minHeight: 110,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  darkDisplay: {
    backgroundColor: "#1e1e1e",
  },
  // Expression text above the result (smaller, gray)
  expr: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
  },
  darkExpr: {
    color: "#bbb",
  },
  // Main result text (large number)
  result: {
    color: "#222",
    fontSize: 38,
    fontWeight: "300",
  },
  // Grid that holds all button rows
  grid: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "flex-end",
    paddingBottom: 30,
    gap: 10,
  },
  // Each row of buttons
  row: {
    flexDirection: "row",
    gap: 10,
  },
  // Base button style (circle shape)
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  // Button text style
  btnText: {
    fontSize: 22,
    fontWeight: "500",
  },
  // Number button background (gray)
  numBtn: {
    backgroundColor: "#e0e0e0",
  },
  darkNumBtn: {
    backgroundColor: "#2a2a2a",
  },
  // Number button text color
  numText: {
    color: "#333",
  },
  // Operator button background (orange)
  orangeBtn: {
    backgroundColor: ORANGE,
  },
  // Operator button text (white)
  orangeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
