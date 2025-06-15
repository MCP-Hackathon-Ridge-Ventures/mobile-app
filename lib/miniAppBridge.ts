import AsyncStorage from "@react-native-async-storage/async-storage";
import { bridge, createWebView } from "@webview-bridge/react-native";

// Prefix for mini-app localStorage keys to avoid conflicts
const STORAGE_PREFIX = "@miniapp_localStorage:";

// Create bridge with localStorage methods using AsyncStorage
export const miniAppBridge = bridge({
  // localStorage operations
  async getLocalStorageItem(key: string) {
    console.log(`📦 Bridge localStorage.getItem('${key}')`);
    try {
      const value = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return value;
    } catch (error) {
      console.error(`Failed to get localStorage item '${key}':`, error);
      return null;
    }
  },

  async setLocalStorageItem(key: string, value: string) {
    console.log(`📦 Bridge localStorage.setItem('${key}', '${value}')`);
    try {
      await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage item '${key}':`, error);
      return false;
    }
  },

  async removeLocalStorageItem(key: string) {
    console.log(`📦 Bridge localStorage.removeItem('${key}')`);
    try {
      await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove localStorage item '${key}':`, error);
      return false;
    }
  },

  async clearLocalStorage() {
    console.log("📦 Bridge localStorage.clear()");
    try {
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      // Filter keys that belong to mini-app localStorage
      const miniAppKeys = allKeys.filter((key) =>
        key.startsWith(STORAGE_PREFIX)
      );
      // Remove all mini-app localStorage keys
      if (miniAppKeys.length > 0) {
        await AsyncStorage.multiRemove(miniAppKeys);
      }
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  },

  // App control methods
  async closeApp() {
    console.log("🚀 Mini-app requesting close via bridge");
    return "close_requested";
  },

  async logMessage(message: string) {
    console.log("🚀 Mini-app log:", message);
    return true;
  },

  async getHostInfo() {
    return {
      version: "1.0.0",
      platform: "mobile",
      isWebView: true,
      hasLocalServer: true,
      hasBridge: true,
    };
  },
});

// Export the bridge type to be used in the web application
export type MiniAppBridge = typeof miniAppBridge;

// Create the WebView component with bridge
export const { WebView: BridgedWebView } = createWebView({
  bridge: miniAppBridge,
  debug: true, // Enable console.log visibility in the native WebView
});
