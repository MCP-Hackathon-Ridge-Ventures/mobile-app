import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme, useInitialAndroidBarSync } from "@/lib/useColorScheme";
import { NAV_THEME } from "@/theme";

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />

      <ThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="mini-app" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </>
  );
}
