import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";

const ORANGE = "#F5922A";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        try {
          const saved = await AsyncStorage.getItem("darkMode");
          if (saved !== null) setDarkMode(JSON.parse(saved));
        } catch (e) {
          console.log(e);
        }
      };
      loadTheme();
    }, []),
  );

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message);
    }
  };

  return (
    <View style={[s.container, darkMode && s.containerDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={s.header}>
        <View style={{ width: 44 }} />
        <Text style={[s.title, darkMode && s.titleDark]}>Sign In</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.welcomeSection}>
            <View style={s.iconCircle}>
              <Ionicons name="calculator" size={40} color="#fff" />
            </View>
            <Text style={[s.welcomeTitle, darkMode && s.textDark]}>
              Welcome Back
            </Text>
            <Text style={[s.welcomeSub, darkMode && s.textMutedDark]}>
              Please sign in to continue
            </Text>
          </View>

          <View style={s.form}>
            <View style={[s.inputGroup, darkMode && s.inputGroupDark]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={darkMode ? "#888" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Email Address"
                placeholderTextColor={darkMode ? "#666" : "#aaa"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[s.inputGroup, darkMode && s.inputGroupDark]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={darkMode ? "#888" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Password"
                placeholderTextColor={darkMode ? "#666" : "#aaa"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={s.forgotBtn}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.signInBtn}
              activeOpacity={0.8}
              onPress={handleSignIn}
            >
              <Text style={s.signInBtnText}>Sign In</Text>
            </TouchableOpacity>

            <View style={s.footer}>
              <Text style={[s.footerText, darkMode && s.textMutedDark]}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity>
                <Text style={s.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 70,
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  titleDark: {
    color: "#f0f0f0",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 16,
    color: "#666",
  },
  textDark: {
    color: "#fff",
  },
  textMutedDark: {
    color: "#888",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroupDark: {
    backgroundColor: "#1e1e1e",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  inputDark: {
    color: "#fff",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: "600",
  },
  signInBtn: {
    backgroundColor: ORANGE,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: "#666",
  },
  signUpText: {
    fontSize: 15,
    color: ORANGE,
    fontWeight: "700",
  },
});
