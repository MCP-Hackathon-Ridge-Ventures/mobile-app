import { BundleFile } from "./bundleLoader";

// Mock deployment data matching your Supabase storage structure
// Bucket: apps
// Path: deployments/a06a045f-faa1-4643-9797-94fa3118ee44/
export const mockDeploymentFiles: BundleFile[] = [
  {
    originalPath:
      "_expo/static/js/android/index-5c668f9002dc4069525d01ba262b95a0.hbc",
    fileId: "3e4774d5-934a-43b2-bc1d-cbf0dc565b13",
    fileName: "index-5c668f9002dc4069525d01ba262b95a0.hbc",
    publicUrl:
      "https://ggaiooipedyygqexifzb.supabase.co/storage/v1/object/public/apps/deployments/a06a045f-faa1-4643-9797-94fa3118ee44/_expo/static/js/android/index-5c668f9002dc4069525d01ba262b95a0.hbc",
    uploadPath:
      "deployments/a06a045f-faa1-4643-9797-94fa3118ee44/_expo/static/js/android/index-5c668f9002dc4069525d01ba262b95a0.hbc",
    fileSize: 1764754,
    fileType: "application/octet-stream",
  },
  {
    originalPath:
      "_expo/static/js/ios/index-b8f5913aa2cb76306e3d514b3c12d70d.hbc",
    fileId: "692fcb80-d8b2-4762-a38a-c2a19ad22c20",
    fileName: "index-b8f5913aa2cb76306e3d514b3c12d70d.hbc",
    publicUrl:
      "https://ggaiooipedyygqexifzb.supabase.co/storage/v1/object/public/apps/deployments/a06a045f-faa1-4643-9797-94fa3118ee44/_expo/static/js/ios/index-b8f5913aa2cb76306e3d514b3c12d70d.hbc",
    uploadPath:
      "deployments/a06a045f-faa1-4643-9797-94fa3118ee44/_expo/static/js/ios/index-b8f5913aa2cb76306e3d514b3c12d70d.hbc",
    fileSize: 1750463,
    fileType: "application/octet-stream",
  },
  {
    originalPath: "manifest.json",
    fileId: "4efe0a13-a839-4b1c-bc85-a71757a9904e",
    fileName: "manifest.json",
    publicUrl:
      "https://ggaiooipedyygqexifzb.supabase.co/storage/v1/object/public/apps/deployments/a06a045f-faa1-4643-9797-94fa3118ee44/manifest.json",
    uploadPath:
      "deployments/a06a045f-faa1-4643-9797-94fa3118ee44/manifest.json",
    fileSize: 244,
    fileType: "application/json",
  },
];

// Mock manifest.json content that would be fetched from Supabase
export const mockManifest = {
  name: "Sample Weather App",
  description: "A simple weather application built with React Native",
  version: "1.0.0",
  main: "index.js",
  dependencies: {
    react: "^18.0.0",
    "react-native": "^0.72.0",
    expo: "^49.0.0",
  },
  permissions: ["location", "internet"],
  expo: {
    name: "Sample Weather App",
    slug: "sample-weather-app",
    version: "1.0.0",
    platforms: ["ios", "android"],
  },
};

// Helper function to create mock deployment data for testing
export function createMockDeployment(deploymentId: string, appName: string) {
  // Update the mock files to use the provided deployment ID
  const files = mockDeploymentFiles.map((file) => ({
    ...file,
    publicUrl: file.publicUrl.replace(
      "a06a045f-faa1-4643-9797-94fa3118ee44",
      deploymentId
    ),
    uploadPath: file.uploadPath.replace(
      "a06a045f-faa1-4643-9797-94fa3118ee44",
      deploymentId
    ),
    fileId: `${deploymentId}-${file.fileName}`,
  }));

  return {
    deploymentId,
    appId: deploymentId,
    metadata: {
      id: deploymentId,
      name: appName,
      description: mockManifest.description,
      version: mockManifest.version,
      entryPoint: mockManifest.main,
      dependencies: Object.keys(mockManifest.dependencies),
      permissions: mockManifest.permissions,
    },
    files,
  };
}

// Test deployment ID for consistent testing
export const TEST_DEPLOYMENT_ID = "a06a045f-faa1-4643-9797-94fa3118ee44";
