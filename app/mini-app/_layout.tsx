import { Stack } from "expo-router";
import React from "react";

export default function MiniAppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Disable back button
        headerBackButtonDisplayMode: "minimal",
      }}
    />
  );
}
