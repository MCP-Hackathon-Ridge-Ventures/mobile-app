import { bundleLoader } from "@/lib/bundleLoader";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

export function BundleManager() {
  const [cachedBundles, setCachedBundles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCachedBundles();
  }, []);

  const loadCachedBundles = () => {
    const cached = bundleLoader.getCachedBundles();
    setCachedBundles(cached);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Storage",
      "This will remove all downloaded apps. You will need to download them again to use the apps.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await bundleLoader.clearCache();
              loadCachedBundles();
              Alert.alert("Success", "App storage cleared successfully");
            } catch (error) {
              console.error("Failed to clear cache:", error);
              Alert.alert("Error", "Unable to clear storage");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatBundleId = (bundleId: string): string => {
    // Format bundle ID for display
    if (bundleId.startsWith("legacy-")) {
      return `Legacy: ${bundleId.slice(7)}`;
    }
    return bundleId.length > 20 ? `${bundleId.slice(0, 20)}...` : bundleId;
  };

  return (
    <ThemedView className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <ThemedText type="title" className="text-2xl font-bold">
            Storage Manager
          </ThemedText>
          <ThemedText className="text-gray-600 mt-1">
            Manage downloaded apps
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={loadCachedBundles}
          className="p-2 bg-blue-50 rounded-lg"
        >
          <IconSymbol name="arrow.clockwise" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Storage Stats */}
        <View className="mb-6 p-4 bg-gray-50 rounded-xl">
          <ThemedText type="subtitle" className="font-semibold mb-2">
            Storage Statistics
          </ThemedText>
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-gray-600">Downloaded Apps</ThemedText>
            <ThemedText className="font-medium">
              {cachedBundles.length}
            </ThemedText>
          </View>
        </View>

        {/* Downloaded Apps List */}
        <View className="mb-6">
          <ThemedText type="subtitle" className="font-semibold mb-3">
            Downloaded Apps
          </ThemedText>

          {cachedBundles.length === 0 ? (
            <View className="p-6 bg-gray-50 rounded-xl items-center">
              <IconSymbol name="tray" size={32} color="#999" />
              <ThemedText className="text-gray-600 mt-2 text-center">
                No apps downloaded yet
              </ThemedText>
              <ThemedText className="text-gray-500 text-sm mt-1 text-center">
                Launch some apps to see them here
              </ThemedText>
            </View>
          ) : (
            <View className="space-y-2">
              {cachedBundles.map((bundleId, index) => (
                <View
                  key={bundleId}
                  className="flex-row items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <View className="flex-1">
                    <ThemedText className="font-medium">
                      {formatBundleId(bundleId)}
                    </ThemedText>
                    <ThemedText className="text-xs text-gray-500 mt-1">
                      App #{index + 1}
                    </ThemedText>
                  </View>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#34C759"
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleClearCache}
            disabled={loading || cachedBundles.length === 0}
            className={`p-4 rounded-xl flex-row items-center justify-center ${
              loading || cachedBundles.length === 0
                ? "bg-gray-100"
                : "bg-red-50"
            }`}
          >
            <IconSymbol
              name="trash"
              size={16}
              color={loading || cachedBundles.length === 0 ? "#999" : "#FF3B30"}
            />
            <ThemedText
              className={`ml-2 font-medium ${
                loading || cachedBundles.length === 0
                  ? "text-gray-500"
                  : "text-red-600"
              }`}
            >
              {loading ? "Clearing..." : "Clear Downloaded Apps"}
            </ThemedText>
          </TouchableOpacity>

          <View className="p-4 bg-blue-50 rounded-xl">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle" size={16} color="#007AFF" />
              <View className="flex-1 ml-2">
                <ThemedText className="text-blue-800 text-sm font-medium">
                  About App Storage
                </ThemedText>
                <ThemedText className="text-blue-700 text-xs mt-1 leading-relaxed">
                  Apps are stored locally for faster loading. Clearing storage
                  will require re-downloading apps when you launch them.
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
