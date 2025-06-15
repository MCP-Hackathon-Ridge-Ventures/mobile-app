import { bundleLoader } from "./bundleLoader";
import { TEST_DEPLOYMENT_ID } from "./mockData";

/**
 * Test utility to verify deployment file listing works
 */

export async function testDeploymentListing(
  deploymentId: string = TEST_DEPLOYMENT_ID
) {
  console.log(`🔍 Testing deployment file listing for: ${deploymentId}`);
  console.log("Expected structure:");
  console.log("- deployments/a06a045f-faa1-4643-9797-94fa3118ee44/");
  console.log("  - _expo/static/js/ios/");
  console.log("  - _expo/static/js/android/");
  console.log("  - manifest.json");
  console.log("");

  try {
    const files = await bundleLoader.listDeploymentFiles(deploymentId);

    console.log(`✅ Found ${files.length} files:`);
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.originalPath}`);
      console.log(`   Size: ${file.fileSize} bytes`);
      console.log(`   Type: ${file.fileType}`);
      console.log(`   URL: ${file.publicUrl}`);
      console.log("");
    });

    // Check for expected files
    const hasAndroidBundle = files.some((f) =>
      f.originalPath.includes("_expo/static/js/android/")
    );
    const hasIosBundle = files.some((f) =>
      f.originalPath.includes("_expo/static/js/ios/")
    );
    const hasManifest = files.some((f) => f.originalPath === "manifest.json");

    console.log("📋 File Check:");
    console.log(`Android bundle: ${hasAndroidBundle ? "✅" : "❌"}`);
    console.log(`iOS bundle: ${hasIosBundle ? "✅" : "❌"}`);
    console.log(`Manifest: ${hasManifest ? "✅" : "❌"}`);

    return {
      success: true,
      fileCount: files.length,
      hasAndroidBundle,
      hasIosBundle,
      hasManifest,
      files,
    };
  } catch (error) {
    console.error("❌ Error listing deployment files:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      fileCount: 0,
      hasAndroidBundle: false,
      hasIosBundle: false,
      hasManifest: false,
      files: [],
    };
  }
}

export async function testBundlePreparation(
  deploymentId: string = TEST_DEPLOYMENT_ID
) {
  console.log(`🔧 Testing bundle preparation for: ${deploymentId}`);

  try {
    const result = await bundleLoader.prepareApp(deploymentId);

    if (result) {
      console.log("✅ Bundle preparation successful!");
      console.log(`Bundle Path: ${result.bundlePath}`);
      console.log(`App Name: ${result.metadata.name}`);
      console.log(`Version: ${result.metadata.version}`);
      console.log(
        `Dependencies: ${result.metadata.dependencies?.join(", ") || "None"}`
      );

      return {
        success: true,
        bundlePath: result.bundlePath,
        metadata: result.metadata,
      };
    } else {
      console.log("❌ Bundle preparation failed");
      return {
        success: false,
        error: "Bundle preparation returned null",
      };
    }
  } catch (error) {
    console.error("❌ Error preparing bundle:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function runFullTest(deploymentId: string = TEST_DEPLOYMENT_ID) {
  console.log("🚀 Running full deployment test...\n");

  // Test file listing
  const listResult = await testDeploymentListing(deploymentId);
  console.log("\n---\n");

  // Test bundle preparation
  const prepResult = await testBundlePreparation(deploymentId);
  console.log("\n---\n");

  // Summary
  console.log("📊 Test Summary:");
  console.log(`File Listing: ${listResult.success ? "✅" : "❌"}`);
  console.log(`Bundle Preparation: ${prepResult.success ? "✅" : "❌"}`);

  if (listResult.success && prepResult.success) {
    console.log(
      "🎉 All tests passed! The deployment system is working correctly."
    );
  } else {
    console.log("⚠️  Some tests failed. Check the errors above.");
  }

  return {
    listResult,
    prepResult,
    allPassed: listResult.success && prepResult.success,
  };
}

// Export for easy testing in console
(global as any).testDeployment = {
  listFiles: testDeploymentListing,
  prepareBundle: testBundlePreparation,
  runFull: runFullTest,
};
