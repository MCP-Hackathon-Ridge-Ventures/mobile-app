// Type declarations for the Mini App Bridge
// Import this in your web applications for type safety

export type MiniAppBridge = {
  // localStorage operations
  getLocalStorageItem(key: string): Promise<string | null>;
  setLocalStorageItem(key: string, value: string): Promise<boolean>;
  removeLocalStorageItem(key: string): Promise<boolean>;
  clearLocalStorage(): Promise<boolean>;

  // App control methods
  closeApp(): Promise<string>;
  logMessage(message: string): Promise<boolean>;
  getHostInfo(): Promise<{
    version: string;
    platform: string;
    isWebView: boolean;
    hasLocalServer: boolean;
    hasBridge: boolean;
  }>;
};

// Re-export for convenience
export { MiniAppBridge as AppBridge };
