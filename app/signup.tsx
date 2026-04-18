import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
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
import { supabase } from "../lib/supabase";

const ORANGE = "#F5A623";

export default function SignUp() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        try {
          const saved = await AsyncStorage.getItem("darkMode");
          if (saved !== null) {
            setDarkMode(JSON.parse(saved));
          }
        } catch (error) {
          console.log("Error loading dark mode:", error);
        }
      };

      loadTheme();
    }, []),
  );

  const handleCreateAccount = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else {
      Alert.alert("Success", "Account created successfully.");
      router.replace("/home");
    }
  };

  return (
    <View style={[s.container, darkMode && s.containerDark]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={darkMode ? "#fff" : "#222"}
              />
            </TouchableOpacity>

            <Text style={[s.headerTitle, darkMode && s.textDark]}>Sign Up</Text>

            <View style={{ width: 24 }} />
          </View>

          <View style={s.topSection}>
            <View style={s.iconCircle}>
              <Ionicons name="person" size={34} color="#fff" />
            </View>

            <Text style={[s.mainTitle, darkMode && s.textDark]}>
              Create Account
            </Text>

            <Text style={[s.subTitle, darkMode && s.subTitleDark]}>
              Fill in the details below to get started
            </Text>
          </View>

          <View style={s.form}>
            <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={darkMode ? "#aaa" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Full Name"
                placeholderTextColor={darkMode ? "#888" : "#999"}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={darkMode ? "#aaa" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Email Address"
                placeholderTextColor={darkMode ? "#888" : "#999"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={darkMode ? "#aaa" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Password"
                placeholderTextColor={darkMode ? "#888" : "#999"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={darkMode ? "#aaa" : "#999"}
                style={s.inputIcon}
              />
              <TextInput
                style={[s.input, darkMode && s.inputDark]}
                placeholder="Confirm Password"
                placeholderTextColor={darkMode ? "#888" : "#999"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={s.createButton}
              activeOpacity={0.8}
              onPress={handleCreateAccount}
            >
              <Text style={s.createButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={s.bottomRow}>
              <Text style={[s.bottomText, darkMode && s.subTitleDark]}>
                Already have an account?{" "}
              </Text>

              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={s.signInText}>Sign In</Text>
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
    backgroundColor: "#f3f3f3",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  topSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 34,
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: ORANGE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  subTitleDark: {
    color: "#aaa",
  },
  textDark: {
    color: "#fff",
  },
  form: {
    gap: 14,
  },
  inputBox: {
    height: 62,
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBoxDark: {
    backgroundColor: "#1f1f1f",
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
  createButton: {
    marginTop: 18,
    backgroundColor: ORANGE,
    height: 62,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  bottomText: {
    fontSize: 16,
    color: "#888",
  },
  signInText: {
    fontSize: 16,
    color: ORANGE,
    fontWeight: "700",
  },
});
