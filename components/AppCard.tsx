import { MiniApp } from "@/lib/supabase";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface AppCardProps {
  app: MiniApp;
  onPress?: (app: MiniApp) => void;
}

export function AppCard({ app, onPress }: AppCardProps) {
  return (
    <TouchableOpacity
      className="my-2 mx-4"
      onPress={() => onPress?.(app)}
      activeOpacity={0.7}
    >
      <ThemedView className="flex-row p-4 rounded-xl shadow-lg shadow-black/10 elevation-3">
        <View className="mr-3">
          {app.icon_url ? (
            <Image
              source={{ uri: app.icon_url }}
              className="w-15 h-15 rounded-xl"
            />
          ) : (
            <View className="w-15 h-15 rounded-xl bg-gray-100 justify-center items-center">
              <IconSymbol name="app.fill" size={32} color="#666" />
            </View>
          )}
        </View>

        <View className="flex-1 justify-between">
          <ThemedText
            type="subtitle"
            className="text-base font-semibold mb-1"
            numberOfLines={1}
          >
            {app.name}
          </ThemedText>
          <ThemedText className="text-sm opacity-70 mb-2" numberOfLines={2}>
            {app.description}
          </ThemedText>

          <View className="flex-row items-center justify-between mb-1">
            <View className="bg-blue-50 px-2 py-1 rounded-md">
              <ThemedText className="text-xs text-blue-600 font-medium">
                {app.category}
              </ThemedText>
            </View>

            {app.rating && (
              <View className="flex-row items-center space-x-1">
                <IconSymbol name="star.fill" size={12} color="#FFD700" />
                <ThemedText className="text-xs font-medium">
                  {app.rating.toFixed(1)}
                </ThemedText>
              </View>
            )}
          </View>

          {app.downloads && (
            <ThemedText className="text-xs opacity-60">
              {app.downloads.toLocaleString()} downloads
            </ThemedText>
          )}
        </View>

        {app.is_featured && (
          <View className="absolute top-2 right-2 bg-secondary rounded-full w-6 h-6 justify-center items-center">
            <IconSymbol name="star.fill" size={16} color="#FFF" />
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}
