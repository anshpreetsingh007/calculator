// Graph Calculator Screen - plots math equations on a graph
// Users type an equation like y=x^2 and press Plot to see the graph
// Supports functions like sin, cos, tan, sqrt, log, abs
// Saves each plotted equation to history

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import { saveHistory } from "../utils/history";

// Main orange color for the plotted line and buttons
const ORANGE = "#F5922A";

// Graph size in pixels
const GRAPH_W = 320;
const GRAPH_H = 320;

// The x and y axis range (-10 to 10)
const RANGE = 10;

// Number of points to calculate when drawing the line
const STEPS = 200;

// Parse the user's equation text into a JavaScript function
// Example: "y=x^2" becomes a function that takes x and returns x*x
function parseEquation(input: string) {
  let expr = input.trim().toLowerCase();

  // Remove "y=" prefix if present
  if (expr.startsWith("y=")) {
    expr = expr.slice(2);
  }

  // Replace math symbols with JavaScript equivalents
  expr = expr
    .replace(/\^/g, "**") // ^ becomes ** (power)
    .replace(/x²/g, "x**2") // x² becomes x**2
    .replace(/sin/g, "Math.sin") // sin becomes Math.sin
    .replace(/cos/g, "Math.cos") // cos becomes Math.cos
    .replace(/tan/g, "Math.tan") // tan becomes Math.tan
    .replace(/sqrt/g, "Math.sqrt") // sqrt becomes Math.sqrt
    .replace(/abs/g, "Math.abs") // abs becomes Math.abs
    .replace(/log/g, "Math.log") // log becomes Math.log
    .replace(/pi/g, "Math.PI") // pi becomes Math.PI
    .replace(/\be\b/g, "Math.E"); // e becomes Math.E

  // Check for any unsafe characters
  if (/[^0-9x+\-*/().,\s*MathsincotaglqrtbpPIEabsnd]/.test(expr)) {
    return null;
  }

  // Try to create a function from the expression
  try {
    const fn = new Function("x", `"use strict"; return (${expr});`) as (
      x: number,
    ) => number;
    // Test it with x=1 to make sure it works
    const test = fn(1);
    if (typeof test !== "number") return null;
    return fn;
  } catch {
    return null;
  }
}

export default function GraphCalc() {
  const router = useRouter();

  // equation = the text the user types (e.g. "y=x^2")
  // points = the SVG points string for drawing the line
  // err = any error message
  // plotted = whether a graph has been plotted
  const [equation, setEquation] = useState("y=x");
  const [points, setPoints] = useState<string>("");
  const [err, setErr] = useState("");
  const [plotted, setPlotted] = useState(false);
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

  // Convert a math x value to screen x position (pixels)
  const toScreenX = (x: number) => ((x + RANGE) / (2 * RANGE)) * GRAPH_W;

  // Convert a math y value to screen y position (pixels)
  // Note: y is flipped because screen y goes down, but math y goes up
  const toScreenY = (y: number) => ((RANGE - y) / (2 * RANGE)) * GRAPH_H;

  // Plot the equation on the graph
  const plot = async () => {
    setErr("");

    // Make sure user entered something
    if (!equation.trim()) {
      setErr("Enter an equation");
      return;
    }

    // Try to parse the equation into a function
    const fn = parseEquation(equation);
    if (!fn) {
      setErr("Invalid equation — try something like y=x^2");
      return;
    }

    // Calculate points along the curve
    const pts: string[] = [];

    for (let i = 0; i <= STEPS; i++) {
      // Go from -RANGE to +RANGE
      const x = -RANGE + (i / STEPS) * 2 * RANGE;
      try {
        const y = fn(x);
        // Only add points that are within the visible area
        if (isFinite(y) && Math.abs(y) <= RANGE * 2) {
          pts.push(`${toScreenX(x)},${toScreenY(y)}`);
        }
      } catch {
        // Skip points where the function fails (e.g. division by zero)
      }
    }

    // Need at least 2 points to draw a line
    if (pts.length < 2) {
      setErr("Could not plot — check your equation");
      return;
    }

    // Join all points into a string for the SVG polyline
    setPoints(pts.join(" "));
    setPlotted(true);

    // Save to history
    await saveHistory({
      type: "graph",
      text: `Plotted: ${equation}`,
    });
  };

  // Insert a function template into the equation input
  const insertFunc = (template: string) => {
    setEquation("y=" + template);
    setErr("");
  };

  // Clear the graph and reset everything
  const clearGraph = () => {
    setEquation("y=x");
    setPoints("");
    setErr("");
    setPlotted(false);
  };

  // Build the grid lines for the graph background
  const gridLines = [];
  for (let i = -RANGE; i <= RANGE; i += 2) {
    // Vertical grid line
    gridLines.push(
      <Line
        key={`gv${i}`}
        x1={toScreenX(i)}
        y1={0}
        x2={toScreenX(i)}
        y2={GRAPH_H}
        stroke={darkMode ? "#3a3a3a" : "#e0e0e0"}
        strokeWidth={0.5}
      />,
      // Horizontal grid line
      <Line
        key={`gh${i}`}
        x1={0}
        y1={toScreenY(i)}
        x2={GRAPH_W}
        y2={toScreenY(i)}
        stroke={darkMode ? "#3a3a3a" : "#e0e0e0"}
        strokeWidth={0.5}
      />,
    );
  }

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
        <Text style={[s.screenTitle, darkMode && s.darkText]}>
          Graph Calculator
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Equation input field and Plot button */}
      <View style={s.inputRow}>
        <TextInput
          style={[s.eqInput, darkMode && s.darkEqInput]}
          value={equation}
          onChangeText={(t) => {
            setEquation(t);
            setErr("");
          }}
          placeholder="y=x"
          placeholderTextColor={darkMode ? "#888" : "#bbb"}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={s.plotBtn} onPress={plot} activeOpacity={0.7}>
          <Text style={s.plotBtnText}>Plot</Text>
        </TouchableOpacity>
      </View>

      {/* Error message (if any) */}
      {err ? (
        <View style={s.errRow}>
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={s.errText}>{err}</Text>
        </View>
      ) : null}

      {/* The graph area with SVG */}
      <View style={[s.graphWrap, darkMode && s.darkGraphWrap]}>
        <Svg width={GRAPH_W} height={GRAPH_H}>
          {/* Background grid lines */}
          {gridLines}

          {/* Y-axis (vertical center line) */}
          <Line
            x1={toScreenX(0)}
            y1={0}
            x2={toScreenX(0)}
            y2={GRAPH_H}
            stroke={darkMode ? "#bbb" : "#999"}
            strokeWidth={1}
          />
          {/* X-axis (horizontal center line) */}
          <Line
            x1={0}
            y1={toScreenY(0)}
            x2={GRAPH_W}
            y2={toScreenY(0)}
            stroke={darkMode ? "#bbb" : "#999"}
            strokeWidth={1}
          />

          {/* "x" label at the right end of x-axis */}
          <SvgText
            x={GRAPH_W - 8}
            y={toScreenY(0) - 6}
            fontSize={10}
            fill={darkMode ? "#bbb" : "#999"}
            textAnchor="end"
          >
            x
          </SvgText>
          {/* "y" label at the top of y-axis */}
          <SvgText
            x={toScreenX(0) + 6}
            y={14}
            fontSize={10}
            fill={darkMode ? "#bbb" : "#999"}
          >
            y
          </SvgText>

          {/* The plotted equation line (orange) */}
          {plotted && points ? (
            <Polyline
              points={points}
              fill="none"
              stroke={ORANGE}
              strokeWidth={2.5}
            />
          ) : null}
        </Svg>
      </View>

      {/* Show the current equation below the graph */}
      {plotted ? (
        <Text style={[s.currentEq, darkMode && s.darkSubText]}>
          Current equation: {equation}
        </Text>
      ) : null}

      {/* Quick function buttons - first row */}
      <View style={s.funcRow}>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("x^2")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>x²</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("sin(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>sin(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("cos(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>cos(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("log(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>log(x)</Text>
        </TouchableOpacity>
      </View>

      {/* Quick function buttons - second row */}
      <View style={s.funcRow}>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("tan(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>tan(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("sqrt(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>sqrt(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.funcBtn, darkMode && s.darkFuncBtn]}
          onPress={() => insertFunc("abs(x)")}
        >
          <Text style={[s.funcText, darkMode && s.darkText]}>abs(x)</Text>
        </TouchableOpacity>
      </View>

      {/* Clear button to reset the graph */}
      <TouchableOpacity
        style={[s.clearBtn, darkMode && s.darkClearBtn]}
        onPress={clearGraph}
        activeOpacity={0.8}
      >
        <Text style={[s.clearBtnText, darkMode && s.darkText]}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the graph calculator screen
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
    marginBottom: 16,
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
  darkSubText: {
    color: "#bbb",
  },
  // Row with equation input and plot button
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  // Equation text input field
  eqInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkEqInput: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderColor: "#333",
  },
  // Orange plot button
  plotBtn: {
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  // Plot button text
  plotBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Error message row
  errRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  // Error text (red)
  errText: {
    color: "#FF3B30",
    fontSize: 13,
  },
  // White card that wraps the SVG graph
  graphWrap: {
    marginHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
    alignItems: "center",
  },
  darkGraphWrap: {
    backgroundColor: "#1e1e1e",
  },
  // Text showing the current equation below the graph
  currentEq: {
    textAlign: "center",
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  // Row of quick function buttons
  funcRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 20,
    flexWrap: "wrap",
  },
  // Individual function button (e.g. "sin(x)")
  funcBtn: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  darkFuncBtn: {
    backgroundColor: "#2a2a2a",
  },
  // Function button text
  funcText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  // Clear button at the bottom
  clearBtn: {
    marginTop: 20,
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  darkClearBtn: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  // Clear button text
  clearBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
