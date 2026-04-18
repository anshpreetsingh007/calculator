import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { signUpSchema, type SignUpFormData } from "../lib/authSchemas";
import { supabase } from "../lib/supabase";

const ORANGE = "#F5A623";

export default function SignUp() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

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

  const handleCreateAccount = async (data: SignUpFormData) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        let message = error.message;

        if (message.toLowerCase().includes("password")) {
          message = "Password must be at least 6 characters.";
        }

        Alert.alert("Sign Up Failed", message);
      } else {
        Alert.alert("Success", "Account created successfully.");
        router.replace("/home");
      }
    } catch (error) {
      Alert.alert("Network Error", "Please check your internet connection.");
    } finally {
      setLoading(false);
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
            <View>
              <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={darkMode ? "#aaa" : "#999"}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[s.input, darkMode && s.inputDark]}
                      placeholder="Full Name"
                      placeholderTextColor={darkMode ? "#888" : "#999"}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              {errors.fullName && (
                <Text style={s.errorText}>{errors.fullName.message}</Text>
              )}
            </View>

            <View>
              <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={darkMode ? "#aaa" : "#999"}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[s.input, darkMode && s.inputDark]}
                      placeholder="Email Address"
                      placeholderTextColor={darkMode ? "#888" : "#999"}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text style={s.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <View>
              <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={darkMode ? "#aaa" : "#999"}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[s.input, darkMode && s.inputDark]}
                      placeholder="Password"
                      placeholderTextColor={darkMode ? "#888" : "#999"}
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                    />
                  )}
                />
              </View>
              {errors.password && (
                <Text style={s.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <View>
              <View style={[s.inputBox, darkMode && s.inputBoxDark]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={darkMode ? "#aaa" : "#999"}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[s.input, darkMode && s.inputDark]}
                      placeholder="Confirm Password"
                      placeholderTextColor={darkMode ? "#888" : "#999"}
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                    />
                  )}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={s.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[s.createButton, loading && s.createButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSubmit(handleCreateAccount)}
              disabled={loading}
            >
              <Text style={s.createButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
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
  createButtonDisabled: {
    opacity: 0.7,
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
  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 6,
  },
});
