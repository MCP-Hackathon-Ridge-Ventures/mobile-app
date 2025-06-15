import { MiniAppViewer } from "@/components/MiniAppViewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BundleFile, bundleLoader } from "@/lib/bundleLoader";
import { MiniApp, supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function MiniAppScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<MiniApp | null>(null);
  const [deploymentFiles, setDeploymentFiles] = useState<BundleFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAppData();
    }
  }, [id]);

  const loadAppData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load app data
      const { data: appData, error: appError } = await supabase
        .from("mini_apps")
        .select("*")
        .eq("id", id)
        .single();

      if (appError) {
        throw new Error(`Failed to load app: ${appError.message}`);
      }

      if (!appData) {
        throw new Error("App not found");
      }

      setApp(appData);

      // Determine deployment ID - use deployment_id if available, otherwise use app ID
      const deploymentId = appData.deployment_id || appData.id;

      console.log(`Loading deployment files for: ${deploymentId}`);

      // Load deployment files directly from Supabase storage
      try {
        const files = await bundleLoader.listDeploymentFiles(deploymentId);

        if (files.length === 0) {
          console.warn(`No files found for deployment ${deploymentId}`);

          // If no files found and we used app ID, try with different deployment ID formats
          if (!appData.deployment_id) {
            console.log(
              "No deployment_id set, files might be stored under different structure"
            );

            // Create mock deployment files as fallback for legacy apps
            if (appData.bundle_url) {
              const mockFiles: BundleFile[] = [
                {
                  originalPath: "bundle.js",
                  fileId: "mock-bundle",
                  fileName: "bundle.js",
                  publicUrl: appData.bundle_url,
                  uploadPath: "legacy/bundle.js",
                  fileSize: 0,
                  fileType: "application/javascript",
                },
              ];
              setDeploymentFiles(mockFiles);
              return;
            }
          }

          throw new Error("No deployment files found for this app");
        }

        console.log(
          `Found ${files.length} files for deployment ${deploymentId}`
        );
        setDeploymentFiles(files);
      } catch (fileError) {
        console.error("Failed to load deployment files:", fileError);
        throw new Error("Unable to load this app right now");
      }
    } catch (err) {
      console.error("Error loading app data:", err);
      setError(err instanceof Error ? err.message : "Failed to load app");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText className="mt-4 text-gray-600">Loading app...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-6">
        <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
        <ThemedText type="subtitle" className="mt-4 mb-2 text-center">
          Failed to Load App
        </ThemedText>
        <ThemedText className="text-gray-600 text-center mb-6">
          {error}
        </ThemedText>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={loadAppData}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <ThemedText className="text-white font-medium">
              Try Again
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-500 px-6 py-3 rounded-lg"
          >
            <ThemedText className="text-white font-medium">Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!app) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-6">
        <IconSymbol name="questionmark.circle" size={48} color="#666" />
        <ThemedText type="subtitle" className="mt-4 mb-2 text-center">
          App Not Found
        </ThemedText>
        <ThemedText className="text-gray-600 text-center mb-6">
          The requested app could not be found.
        </ThemedText>
        <TouchableOpacity
          onPress={handleClose}
          className="bg-gray-500 px-6 py-3 rounded-lg"
        >
          <ThemedText className="text-white font-medium">Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const deploymentId = app.deployment_id || app.id;

  return (
    <MiniAppViewer
      deploymentId={deploymentId}
      files={deploymentFiles}
      appName={app.name}
      onClose={handleClose}
    />
  );
}
