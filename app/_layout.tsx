// This is the main layout file for the app
// It uses a Stack navigator to handle screen navigation
// headerShown: false hides the default header on all screens
import { Stack } from "expo-router";

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
