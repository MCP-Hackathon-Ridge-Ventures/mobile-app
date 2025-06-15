import { BundleFile } from "@/lib/bundleLoader";
import { BridgedWebView } from "@/lib/miniAppBridge";
import StaticServer from "@dr.pogodin/react-native-static-server";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface MiniAppViewerProps {
  deploymentId: string;
  files: BundleFile[];
  appName: string;
  onClose?: () => void;
  // Optional: for testing with local HTML
  testHtmlContent?: string;
}

export function MiniAppViewer({
  deploymentId,
  files,
  appName,
  onClose,
  testHtmlContent,
}: MiniAppViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const serverRef = useRef<any>(null);
  const [localDir, setLocalDir] = useState<string | null>(null);

  useEffect(() => {
    setupMiniApp();

    // Cleanup server on unmount
    return () => {
      stopServer();
    };
  }, [deploymentId, files, testHtmlContent]);

  const setupMiniApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a unique directory for this mini-app
      const appDir = `${FileSystem.documentDirectory}mini-apps/${deploymentId}`;
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      setLocalDir(appDir);

      if (testHtmlContent) {
        // Write test HTML content to file
        const testHtmlPath = `${appDir}/index.html`;
        await FileSystem.writeAsStringAsync(testHtmlPath, testHtmlContent);
        console.log("Test HTML written to:", testHtmlPath);
      } else {
        // Download all deployment files
        await downloadDeploymentFiles(appDir);
      }

      // Start the static server
      await startServer(appDir);
    } catch (err) {
      console.error("Error setting up mini-app:", err);
      setError("Unable to load this app right now");
      setLoading(false);
    }
  };

  const downloadDeploymentFiles = async (appDir: string) => {
    try {
      console.log(
        `Downloading ${files.length} files for deployment ${deploymentId}`
      );

      // Download all files in parallel
      const downloadPromises = files.map(async (file) => {
        try {
          const localPath = `${appDir}/${file.originalPath}`;

          // Create directory if needed
          const dir = localPath.substring(0, localPath.lastIndexOf("/"));
          if (dir !== appDir) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
          }

          // Download the file
          console.log(
            `Downloading: ${file.originalPath} from ${file.publicUrl}`
          );
          const downloadResult = await FileSystem.downloadAsync(
            file.publicUrl,
            localPath
          );

          if (downloadResult.status !== 200) {
            throw new Error(`Download failed: ${downloadResult.status}`);
          }

          console.log(`Downloaded: ${file.originalPath}`);
          return true;
        } catch (error) {
          console.error(`Failed to download ${file.originalPath}:`, error);
          return false;
        }
      });

      const results = await Promise.all(downloadPromises);
      const successCount = results.filter((r) => r).length;
      console.log(
        `Downloaded ${successCount}/${files.length} files successfully`
      );

      if (successCount === 0) {
        throw new Error("Failed to download any files");
      }
    } catch (error) {
      console.error("Error downloading deployment files:", error);
      throw error;
    }
  };

  const startServer = async (appDir: string) => {
    try {
      // Stop any existing server
      await stopServer();

      // Find a random available port between 3000-9000
      const port = Math.floor(Math.random() * 6000) + 3000;

      console.log(`Starting server for directory: ${appDir} on port ${port}`);

      const server = new StaticServer({
        fileDir: appDir.replace("file://", ""),
        port: port,
        nonLocal: true,
      });

      const url = await server.start();
      console.log("Server started at:", url);

      serverRef.current = server;
      setServerUrl(url);
      setLoading(false);
    } catch (error) {
      console.error("Failed to start server:", error);
      throw new Error("Unable to start this app");
    }
  };

  const stopServer = async () => {
    if (serverRef.current) {
      try {
        await serverRef.current.stop();
        console.log("Server stopped");
      } catch (error) {
        console.warn("Error stopping server:", error);
      }
      serverRef.current = null;
    }
    setServerUrl(null);
  };

  const handleClose = () => {
    stopServer();
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose} className="p-2">
            <IconSymbol name="xmark" size={20} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="subtitle" className="flex-1 text-center">
            Loading {appName}
          </ThemedText>
          <View className="w-8" />
        </View>

        {/* Loading Content */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText className="mt-4 text-gray-600">
            Preparing {appName}...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose} className="p-2">
            <IconSymbol name="xmark" size={20} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="subtitle" className="flex-1 text-center">
            {appName}
          </ThemedText>
          <View className="w-8" />
        </View>

        {/* Error Content */}
        <View className="flex-1 justify-center items-center p-6">
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color="#FF3B30"
          />
          <ThemedText type="subtitle" className="mt-4 mb-2 text-center">
            Failed to Load Mini-App
          </ThemedText>
          <ThemedText className="text-gray-600 text-center mb-6">
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={setupMiniApp}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <ThemedText className="text-white font-medium">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!serverUrl) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="w-8" />
        <ThemedText type="subtitle" className="flex-1 text-center">
          {appName}
        </ThemedText>
        <TouchableOpacity onPress={handleClose} className="p-2">
          <IconSymbol name="xmark" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* WebView with Bridge */}
      <View className="flex-1">
        <BridgedWebView
          source={{ uri: serverUrl }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          allowsFullscreenVideo={true}
          originWhitelist={["*"]}
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText className="mt-4 text-gray-600">
                Loading {appName}...
              </ThemedText>
            </View>
          )}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error:", nativeEvent);
            setError("Something went wrong loading this app");
          }}
          onLoadStart={(syntheticEvent: any) => {
            console.log("WebView load start:", syntheticEvent.nativeEvent.url);
          }}
          onLoadEnd={(syntheticEvent: any) => {
            console.log(
              "WebView loaded successfully:",
              syntheticEvent.nativeEvent.url
            );
          }}
          onHttpError={(syntheticEvent: any) => {
            console.error("WebView HTTP error:", syntheticEvent.nativeEvent);
          }}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}
