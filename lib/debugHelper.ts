import { bundleLoader } from "./bundleLoader";

/**
 * Debug helper for troubleshooting deployment issues
 */

export async function debugDeployment(deploymentId: string) {
  console.log(`🔍 Debugging deployment: ${deploymentId}`);
  console.log("---");

  try {
    // Step 1: List files
    console.log("Step 1: Listing deployment files...");
    const files = await bundleLoader.listDeploymentFiles(deploymentId);

    console.log(`Found ${files.length} files:`);
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.originalPath}`);
      console.log(`   - File ID: ${file.fileId}`);
      console.log(`   - File Name: ${file.fileName}`);
      console.log(`   - File Type: ${file.fileType}`);
      console.log(`   - File Size: ${file.fileSize} bytes`);
      console.log(`   - Public URL: ${file.publicUrl}`);
      console.log("");
    });

    // Step 2: Check for manifest
    console.log("Step 2: Looking for manifest...");
    const manifestFile = files.find(
      (file) =>
        file.originalPath === "manifest.json" ||
        file.fileName === "manifest.json" ||
        file.originalPath.endsWith(".json")
    );

    if (manifestFile) {
      console.log(`✅ Found manifest: ${manifestFile.originalPath}`);
      console.log(`   URL: ${manifestFile.publicUrl}`);

      try {
        const response = await fetch(manifestFile.publicUrl);
        const manifest = await response.json();
        console.log(
          "   Content preview:",
          JSON.stringify(manifest, null, 2).substring(0, 500)
        );
      } catch (error) {
        console.log(`   ❌ Failed to fetch manifest: ${error}`);
      }
    } else {
      console.log("❌ No manifest file found");
    }

    // Step 3: Check for platform bundles
    console.log("Step 3: Looking for platform bundles...");
    const androidBundle = files.find(
      (file) =>
        file.originalPath.includes("_expo/static/js/android/") &&
        (file.originalPath.endsWith(".hbc") ||
          file.originalPath.endsWith(".js"))
    );

    const iosBundle = files.find(
      (file) =>
        file.originalPath.includes("_expo/static/js/ios/") &&
        (file.originalPath.endsWith(".hbc") ||
          file.originalPath.endsWith(".js"))
    );

    console.log(
      `Android bundle: ${androidBundle ? "✅ " + androidBundle.originalPath : "❌ Not found"}`
    );
    console.log(
      `iOS bundle: ${iosBundle ? "✅ " + iosBundle.originalPath : "❌ Not found"}`
    );

    // Step 4: Test bundle preparation
    console.log("---");
    console.log("Step 4: Testing bundle preparation...");

    try {
      const result = await bundleLoader.prepareApp(deploymentId, files);

      if (result) {
        console.log("✅ Bundle preparation successful!");
        console.log(`   Bundle Path: ${result.bundlePath}`);
        console.log(`   App Name: ${result.metadata.name}`);
        console.log(`   Version: ${result.metadata.version}`);
        console.log(
          `   Dependencies: ${result.metadata.dependencies?.join(", ") || "None"}`
        );
      } else {
        console.log("❌ Bundle preparation failed - returned null");
      }
    } catch (error) {
      console.log(`❌ Bundle preparation error: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Debug failed: ${error}`);
  }
}

// Helper to test the specific deployment from the logs
export const TEST_DEPLOYMENT = "7500aec0-722c-49a7-ab09-29c070b54a48";

// Export for console use
(global as any).debugDeployment = debugDeployment;
