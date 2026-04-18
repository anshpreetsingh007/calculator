// This is the main layout file for the app
// It uses a Stack navigator to handle screen navigation
// headerShown: false hides the default header on all screens

import { Session } from "@supabase/supabase-js";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";

const protectedRoutes = [
  "/home",
  "/calculator",
  "/converter",
  "/graph",
  "/history",
];

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(session);
        setLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isAuthScreen = pathname === "/" || pathname === "/signup";

    if (!session && isProtectedRoute) {
      router.replace("/");
    }

    if (session && isAuthScreen) {
      router.replace("/home");
    }
  }, [session, loading, pathname, router]);

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#F5922A" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const s = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
