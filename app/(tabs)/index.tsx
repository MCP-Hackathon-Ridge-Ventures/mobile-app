import { AppCard } from "@/components/AppCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MiniApp, supabase } from "@/lib/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

export default function HomeScreen() {
  const [apps, setApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredApps, setFeaturedApps] = useState<MiniApp[]>([]);

  // Load apps from Supabase
  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from("mini_apps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading apps:", error);
      } else if (data) {
        setApps(data);
        setFeaturedApps(data.filter((app) => app.is_featured));
      }
    } catch (error) {
      console.error("Error connecting to Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApps();
    setRefreshing(false);
  };

  const handleAppPress = (app: MiniApp) => {
    // Navigate to the mini-app screen
    router.push(`/mini-app/${app.id}` as any);
  };

  const renderHeader = () => (
    <ThemedView className="p-5 pt-16">
      <View className="flex-row items-center gap-3 mb-2">
        <IconSymbol name="app.fill" size={32} color="#007AFF" />
        <ThemedText type="title" className="text-3xl font-bold">
          Micro Apps
        </ThemedText>
      </View>
      <ThemedText className="text-base opacity-70 mb-6">
        Discover and Build Amazing Apps
      </ThemedText>

      {featuredApps.length > 0 && (
        <View className="mb-6">
          <ThemedText type="subtitle" className="text-xl font-semibold mb-3">
            Featured Apps
          </ThemedText>
          <FlatList
            horizontal
            data={featuredApps}
            keyExtractor={(item) => `featured-${item.id}`}
            renderItem={({ item }) => (
              <View className="w-72 mr-3">
                <AppCard app={item} onPress={handleAppPress} />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          />
        </View>
      )}

      <ThemedText type="subtitle" className="text-xl font-semibold mb-3">
        All Apps
      </ThemedText>
    </ThemedView>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-10">
      <IconSymbol name="plus.app" size={64} color="#999" />
      <ThemedText className="text-lg font-semibold mt-4 mb-2">
        No apps available
      </ThemedText>
      <ThemedText className="text-sm opacity-60 text-center">
        Check back later for new mini apps!
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView className="flex-1">
        <View className="flex-1 justify-center items-center gap-4">
          <IconSymbol name="arrow.clockwise" size={32} color="#007AFF" />
          <ThemedText className="text-base opacity-70">
            Loading apps...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard app={item} onPress={handleAppPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={apps.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </ThemedView>
  );
}
