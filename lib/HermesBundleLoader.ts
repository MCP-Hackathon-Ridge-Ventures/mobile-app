/**
 * @deprecated This file is kept for backward compatibility only.
 * The mini-app system now uses WebView-based implementation.
 *
 * All mini-apps are now single HTML files loaded in WebView.
 * See components/MiniAppViewer.tsx for the current implementation.
 */

import React from "react";

export interface BundleLoadOptions {
  /**
   * @deprecated Not used in WebView implementation
   */
  isolationLevel?: "none" | "namespace" | "context";
  /**
   * @deprecated Not used in WebView implementation
   */
  cache?: boolean;
  /**
   * @deprecated Not used in WebView implementation
   */
  timeout?: number;
  /**
   * @deprecated Not used in WebView implementation
   */
  moduleResolver?: (moduleName: string) => any;
}

export interface LoadedBundleInfo {
  bundlePath: string;
  loadedAt: number;
  isolationLevel: string;
  memoryUsage?: number;
  componentName?: string;
}

export interface MiniAppHostAPI {
  /**
   * Close the mini-app
   */
  close: () => void;

  /**
   * Make API request through host app
   */
  apiRequest: (endpoint: string, options: any) => Promise<any>;

  /**
   * Navigate within the host app
   */
  navigate: (route: string, params?: any) => void;

  /**
   * Get host app information
   */
  getHostInfo: () => {
    version: string;
    platform: string;
    permissions: string[];
  };

  /**
   * Store/retrieve data in host app
   */
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
}

/**
 * @deprecated Legacy service - mini-apps now use WebView implementation
 * This class is kept for backward compatibility only.
 *
 * New implementation: All mini-apps are HTML files loaded in WebView.
 * See components/MiniAppViewer.tsx for the current implementation.
 */
class LegacyHermesBundleLoaderService {
  private bundleComponents = new Map<string, React.ComponentType<any>>();

  constructor() {
    console.warn(
      "⚠️ HermesBundleLoader is deprecated. Mini-apps now use WebView implementation."
    );
  }

  /**
   * @deprecated Use WebView implementation instead
   * Returns a placeholder component that explains the migration
   */
  async loadReactNativeBundle(
    bundlePath: string,
    options: BundleLoadOptions = {}
  ): Promise<React.ComponentType<any>> {
    console.warn(
      `⚠️ loadReactNativeBundle is deprecated. Bundle: ${bundlePath} should be migrated to HTML format.`
    );

    // Check if we already have a placeholder
    if (this.bundleComponents.has(bundlePath)) {
      return this.bundleComponents.get(bundlePath)!;
    }

    // Create a placeholder component that explains the migration
    const MigrationNoticeComponent = React.forwardRef<any, any>(
      (props, ref) => {
        const { hostAPI } = props;

        return React.createElement(
          "View",
          {
            style: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
              backgroundColor: "#f8f9fa",
            },
          },
          [
            React.createElement(
              "Text",
              {
                key: "icon",
                style: { fontSize: 48, marginBottom: 16 },
              },
              "🔄"
            ),
            React.createElement(
              "Text",
              {
                key: "title",
                style: {
                  fontSize: 24,
                  fontWeight: "bold",
                  marginBottom: 16,
                  textAlign: "center",
                  color: "#333",
                },
              },
              "App Update Required"
            ),
            React.createElement(
              "Text",
              {
                key: "message",
                style: {
                  fontSize: 16,
                  color: "#666",
                  textAlign: "center",
                  marginBottom: 24,
                  lineHeight: 24,
                },
              },
              "This app needs to be updated to work with the current system."
            ),
            React.createElement(
              "Text",
              {
                key: "path",
                style: {
                  fontSize: 12,
                  color: "#999",
                  textAlign: "center",
                  marginBottom: 24,
                },
              },
              `Legacy bundle: ${bundlePath.split("/").pop()}`
            ),
            React.createElement(
              "Pressable",
              {
                key: "close-button",
                onPress: hostAPI?.close,
                style: {
                  backgroundColor: "#007AFF",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                },
              },
              React.createElement(
                "Text",
                {
                  style: { color: "white", fontWeight: "500" },
                },
                "Close"
              )
            ),
          ]
        );
      }
    );

    MigrationNoticeComponent.displayName = `LegacyMiniApp(${bundlePath})`;

    // Cache the component
    this.bundleComponents.set(bundlePath, MigrationNoticeComponent);
    return MigrationNoticeComponent;
  }

  /**
   * @deprecated Not applicable to WebView implementation
   */
  async unloadBundle(bundlePath: string): Promise<void> {
    console.warn("⚠️ unloadBundle is deprecated in WebView implementation");
    this.bundleComponents.delete(bundlePath);
  }

  /**
   * @deprecated Not applicable to WebView implementation
   */
  async getLoadedBundles(): Promise<LoadedBundleInfo[]> {
    console.warn("⚠️ getLoadedBundles is deprecated in WebView implementation");
    return Array.from(this.bundleComponents.keys()).map((bundlePath) => ({
      bundlePath,
      loadedAt: Date.now(),
      isolationLevel: "deprecated",
      componentName: "LegacyMiniApp",
    }));
  }

  /**
   * @deprecated Native modules not used in WebView implementation
   */
  isNativeModuleAvailable(): boolean {
    return false; // Always false since we don't use native modules anymore
  }

  /**
   * @deprecated Not applicable to WebView implementation
   */
  async clearAllBundles(): Promise<void> {
    console.warn("⚠️ clearAllBundles is deprecated in WebView implementation");
    this.bundleComponents.clear();
  }
}

/**
 * @deprecated Legacy service instance
 * Use WebView-based MiniAppViewer component instead
 */
const legacyHermesBundleLoader = new LegacyHermesBundleLoaderService();
export default legacyHermesBundleLoader;
