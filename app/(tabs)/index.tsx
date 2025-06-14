import { AppCard } from "@/components/AppCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MiniApp, supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, View } from "react-native";

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
        // For now, use mock data if Supabase isn't configured
        setApps(getMockApps());
        setFeaturedApps(getMockApps().filter((app) => app.is_featured));
      } else if (data) {
        setApps(data);
        setFeaturedApps(data.filter((app) => app.is_featured));
      }
    } catch (error) {
      console.error("Error connecting to Supabase:", error);
      // Use mock data as fallback
      setApps(getMockApps());
      setFeaturedApps(getMockApps().filter((app) => app.is_featured));
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development/demo purposes
  const getMockApps = (): MiniApp[] => [
    {
      id: "1",
      name: "Weather Pro",
      description:
        "Beautiful weather app with 7-day forecast and location tracking",
      category: "Utilities",
      version: "1.0.0",
      rating: 4.8,
      downloads: 15420,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["weather", "forecast", "location"],
    },
    {
      id: "2",
      name: "Task Master",
      description: "Simple and elegant todo list with reminders and categories",
      category: "Productivity",
      version: "2.1.0",
      rating: 4.6,
      downloads: 8930,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["todo", "tasks", "productivity"],
    },
    {
      id: "3",
      name: "Color Palette",
      description: "Generate beautiful color palettes for your design projects",
      category: "Design",
      version: "1.2.0",
      rating: 4.5,
      downloads: 3210,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["design", "colors", "palette"],
    },
    {
      id: "4",
      name: "Quick Calculator",
      description: "Fast and intuitive calculator with scientific functions",
      category: "Utilities",
      version: "1.0.5",
      rating: 4.3,
      downloads: 12680,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["calculator", "math", "utilities"],
    },
    {
      id: "5",
      name: "Meditation Timer",
      description:
        "Peaceful meditation timer with nature sounds and guided sessions",
      category: "Health",
      version: "1.1.0",
      rating: 4.9,
      downloads: 6754,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ["meditation", "mindfulness", "wellness"],
    },
  ];

  useEffect(() => {
    loadApps();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApps();
    setRefreshing(false);
  };

  const handleAppPress = (app: MiniApp) => {
    Alert.alert(
      app.name,
      `${app.description}\n\nVersion: ${app.version}\nCategory: ${app.category}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Install",
          onPress: () => console.log("Installing app:", app.name),
        },
      ]
    );
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
