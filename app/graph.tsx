import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import { saveHistory } from "./utils/history";

const ORANGE = "#F5922A";
const GRAPH_W = 320;
const GRAPH_H = 320;
const RANGE = 10;
const STEPS = 200;

function parseEquation(input: string) {
  let expr = input.trim().toLowerCase();

  if (expr.startsWith("y=")) {
    expr = expr.slice(2);
  }

  expr = expr
    .replace(/\^/g, "**")
    .replace(/x²/g, "x**2")
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/abs/g, "Math.abs")
    .replace(/log/g, "Math.log")
    .replace(/pi/g, "Math.PI")
    .replace(/\be\b/g, "Math.E");

  if (/[^0-9x+\-*/().,\s*MathsincotaglqrtbpPIEabsnd]/.test(expr)) {
    return null;
  }

  try {
    const fn = new Function("x", `"use strict"; return (${expr});`) as (
      x: number,
    ) => number;
    const test = fn(1);
    if (typeof test !== "number") return null;
    return fn;
  } catch {
    return null;
  }
}

export default function GraphCalc() {
  const router = useRouter();
  const [equation, setEquation] = useState("y=x");
  const [points, setPoints] = useState<string>("");
  const [err, setErr] = useState("");
  const [plotted, setPlotted] = useState(false);

  const toScreenX = (x: number) => ((x + RANGE) / (2 * RANGE)) * GRAPH_W;
  const toScreenY = (y: number) => ((RANGE - y) / (2 * RANGE)) * GRAPH_H;

  const plot = async () => {
    setErr("");

    if (!equation.trim()) {
      setErr("Enter an equation");
      return;
    }

    const fn = parseEquation(equation);
    if (!fn) {
      setErr("Invalid equation — try something like y=x^2");
      return;
    }

    const pts: string[] = [];

    for (let i = 0; i <= STEPS; i++) {
      const x = -RANGE + (i / STEPS) * 2 * RANGE;
      try {
        const y = fn(x);
        if (isFinite(y) && Math.abs(y) <= RANGE * 2) {
          pts.push(`${toScreenX(x)},${toScreenY(y)}`);
        }
      } catch {
        // skip invalid points
      }
    }

    if (pts.length < 2) {
      setErr("Could not plot — check your equation");
      return;
    }

    setPoints(pts.join(" "));
    setPlotted(true);

    await saveHistory({
      type: "graph",
      text: `Plotted: ${equation}`,
    });
  };

  const insertFunc = (template: string) => {
    setEquation("y=" + template);
    setErr("");
  };

  const clearGraph = () => {
    setEquation("y=x");
    setPoints("");
    setErr("");
    setPlotted(false);
  };

  const gridLines = [];
  for (let i = -RANGE; i <= RANGE; i += 2) {
    gridLines.push(
      <Line
        key={`gv${i}`}
        x1={toScreenX(i)}
        y1={0}
        x2={toScreenX(i)}
        y2={GRAPH_H}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />,
      <Line
        key={`gh${i}`}
        x1={0}
        y1={toScreenY(i)}
        x2={GRAPH_W}
        y2={toScreenY(i)}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />,
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Graph Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.inputRow}>
        <TextInput
          style={s.eqInput}
          value={equation}
          onChangeText={(t) => {
            setEquation(t);
            setErr("");
          }}
          placeholder="y=x"
          placeholderTextColor="#bbb"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={s.plotBtn} onPress={plot} activeOpacity={0.7}>
          <Text style={s.plotBtnText}>Plot</Text>
        </TouchableOpacity>
      </View>

      {err ? (
        <View style={s.errRow}>
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={s.errText}>{err}</Text>
        </View>
      ) : null}

      <View style={s.graphWrap}>
        <Svg width={GRAPH_W} height={GRAPH_H}>
          {gridLines}

          <Line
            x1={toScreenX(0)}
            y1={0}
            x2={toScreenX(0)}
            y2={GRAPH_H}
            stroke="#999"
            strokeWidth={1}
          />
          <Line
            x1={0}
            y1={toScreenY(0)}
            x2={GRAPH_W}
            y2={toScreenY(0)}
            stroke="#999"
            strokeWidth={1}
          />

          <SvgText
            x={GRAPH_W - 8}
            y={toScreenY(0) - 6}
            fontSize={10}
            fill="#999"
            textAnchor="end"
          >
            x
          </SvgText>
          <SvgText x={toScreenX(0) + 6} y={14} fontSize={10} fill="#999">
            y
          </SvgText>

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

      {plotted ? (
        <Text style={s.currentEq}>Current equation: {equation}</Text>
      ) : null}

      <View style={s.funcRow}>
        <TouchableOpacity style={s.funcBtn} onPress={() => insertFunc("x^2")}>
          <Text style={s.funcText}>x²</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("sin(x)")}
        >
          <Text style={s.funcText}>sin(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("cos(x)")}
        >
          <Text style={s.funcText}>cos(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("log(x)")}
        >
          <Text style={s.funcText}>log(x)</Text>
        </TouchableOpacity>
      </View>

      <View style={s.funcRow}>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("tan(x)")}
        >
          <Text style={s.funcText}>tan(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("sqrt(x)")}
        >
          <Text style={s.funcText}>sqrt(x)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.funcBtn}
          onPress={() => insertFunc("abs(x)")}
        >
          <Text style={s.funcText}>abs(x)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={s.clearBtn}
        onPress={clearGraph}
        activeOpacity={0.8}
      >
        <Text style={s.clearBtnText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
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
  plotBtn: {
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 22,
    justifyContent: "center",
  },
  plotBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  errText: {
    color: "#FF3B30",
    fontSize: 13,
  },
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
  currentEq: {
    textAlign: "center",
    marginTop: 12,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  funcRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 20,
    flexWrap: "wrap",
  },
  funcBtn: {
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  funcText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
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
  clearBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
