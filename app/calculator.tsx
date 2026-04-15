import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { saveHistory } from "./utils/history";

const ORANGE = "#F5922A";

type Op = "+" | "-" | "×" | "/" | null;

export default function Calculator() {
  const router = useRouter();
  const [cur, setCur] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState<Op>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");

  const saveToHistoryEntry = useCallback(async (entry: string) => {
    await saveHistory({
      type: "calculator",
      text: entry,
    });
  }, []);

  const formatNum = (n: string) => {
    if (n.includes("Error") || n.includes("Infinity")) return n;
    const parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleNum = (digit: string) => {
    setError("");

    if (justEvaluated) {
      setCur(digit);
      setPrev("");
      setOp(null);
      setExpression("");
      setJustEvaluated(false);
      return;
    }

    if (digit === "." && cur.includes(".")) return;

    if (cur === "0" && digit !== ".") {
      setCur(digit);
    } else {
      if (cur.replace(".", "").replace("-", "").length >= 12) return;
      setCur(cur + digit);
    }
  };

  const compute = (a: number, b: number, operator: Op): number | null => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "/":
        if (b === 0) return null;
        return Math.round((a / b) * 1e10) / 1e10;
      default:
        return b;
    }
  };

  const handleOp = (nextOp: Op) => {
    setError("");
    setJustEvaluated(false);

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
      setPrev(cur);
      setCur("");
      setOp(nextOp);
      setExpression(`${formatNum(cur)} ${nextOp}`);
    }
  };

  const handleEquals = async () => {
    setError("");

    if (!op || !prev) return;

    const a = parseFloat(prev);
    const b = parseFloat(cur || prev);

    if (isNaN(a) || isNaN(b)) {
      setError("Invalid input");
      return;
    }

    const result = compute(a, b, op);

    if (result === null) {
      setError("Cannot divide by zero");
      setCur("0");
      setPrev("");
      setOp(null);
      setExpression("");
      return;
    }

    if (!isFinite(result)) {
      setError("Result too large");
      setCur("0");
      setPrev("");
      setOp(null);
      setExpression("");
      return;
    }

    const resultStr = parseFloat(result.toFixed(10)).toString();
    const fullExpr = `${formatNum(prev)} ${op} ${formatNum(cur || prev)} = ${formatNum(resultStr)}`;

    setExpression(fullExpr);
    setCur(resultStr);
    setPrev("");
    setOp(null);
    setJustEvaluated(true);

    await saveToHistoryEntry(`${prev} ${op} ${cur || prev} = ${resultStr}`);
  };

  const handleClear = () => {
    setCur("0");
    setPrev("");
    setOp(null);
    setExpression("");
    setError("");
    setJustEvaluated(false);
  };

  const handleToggleSign = () => {
    if (cur === "0") return;
    setCur(cur.startsWith("-") ? cur.slice(1) : "-" + cur);
  };

  const handlePercent = () => {
    const n = parseFloat(cur);

    if (isNaN(n)) {
      setError("Invalid input");
      return;
    }

    setCur(String(n / 100));
  };

  const displayValue = error || formatNum(cur || "0");

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
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.display}>
        {expression ? (
          <Text style={s.expr} numberOfLines={1}>
            {expression}
          </Text>
        ) : null}

        <Text
          style={[s.result, error && { color: "#FF3B30", fontSize: 20 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayValue}
        </Text>
      </View>

      <View style={s.grid}>
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

        <View style={s.row}>
          <CalcButton
            label="1"
            onPress={() => handleNum("1")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="2"
            onPress={() => handleNum("2")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="3"
            onPress={() => handleNum("3")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="-"
            onPress={() => handleOp("-")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        <View style={s.row}>
          <CalcButton
            label="4"
            onPress={() => handleNum("4")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="5"
            onPress={() => handleNum("5")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="6"
            onPress={() => handleNum("6")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="x"
            onPress={() => handleOp("×")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        <View style={s.row}>
          <CalcButton
            label="7"
            onPress={() => handleNum("7")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="8"
            onPress={() => handleNum("8")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="9"
            onPress={() => handleNum("9")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="/"
            onPress={() => handleOp("/")}
            style={s.orangeBtn}
            textStyle={s.orangeText}
          />
        </View>

        <View style={s.row}>
          <CalcButton
            label="0"
            onPress={() => handleNum("0")}
            style={s.numBtn}
            textStyle={s.numText}
          />
          <CalcButton
            label="."
            onPress={() => handleNum(".")}
            style={s.numBtn}
            textStyle={s.numText}
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
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
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
  expr: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
  },
  result: {
    color: "#222",
    fontSize: 38,
    fontWeight: "300",
  },
  grid: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "flex-end",
    paddingBottom: 30,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 22,
    fontWeight: "500",
  },
  numBtn: {
    backgroundColor: "#e0e0e0",
  },
  numText: {
    color: "#333",
  },
  orangeBtn: {
    backgroundColor: ORANGE,
  },
  orangeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
