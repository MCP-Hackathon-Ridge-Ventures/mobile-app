import React from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";

export function NativeWindTest() {
  return (
    <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 m-4 rounded-2xl shadow-xl">
      <ThemedText className="text-white text-xl font-bold mb-2">
        🎉 NativeWind is Working!
      </ThemedText>
      <ThemedText className="text-white/80 text-sm mb-4">
        This component uses Tailwind CSS classes via NativeWind
      </ThemedText>

      <View className="flex-row justify-between items-center">
        <View className="bg-white/20 px-3 py-2 rounded-lg">
          <ThemedText className="text-white text-xs font-medium">
            Flexbox ✓
          </ThemedText>
        </View>
        <View className="bg-white/20 px-3 py-2 rounded-lg">
          <ThemedText className="text-white text-xs font-medium">
            Colors ✓
          </ThemedText>
        </View>
        <View className="bg-white/20 px-3 py-2 rounded-lg">
          <ThemedText className="text-white text-xs font-medium">
            Spacing ✓
          </ThemedText>
        </View>
      </View>

      <View className="mt-4 space-y-2">
        <View className="h-2 bg-white/30 rounded-full">
          <View className="h-full bg-white rounded-full w-3/4" />
        </View>
        <ThemedText className="text-white/60 text-xs">
          Custom colors from tailwind.config.js:
          <ThemedText className="text-primary font-semibold">
            {" "}
            primary{" "}
          </ThemedText>
          <ThemedText className="text-secondary font-semibold">
            {" "}
            secondary{" "}
          </ThemedText>
          <ThemedText className="text-accent font-semibold"> accent</ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}
