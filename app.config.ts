import { ExpoConfig } from "expo/config";
import "ts-node/register";

const config: ExpoConfig = {
  name: "microapp",
  slug: "microapp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: "com.rochan.microapp",
    supportsTablet: true,
  },
  android: {
    package: "com.rochan.microapp",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "783b7a78-acfb-4f3b-9488-f8e804b08704",
    },
  },
  owner: "rochan",
};

export default config;
