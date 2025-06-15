import { BundleFile, bundleLoader } from "./bundleLoader";
import { mockDeploymentFiles } from "./mockData";
import { MiniApp, supabase } from "./supabase";

/**
 * Test utilities for the dynamic loading system
 */

export interface SystemHealthCheck {
  supabaseConnection: boolean;
  bundleLoaderReady: boolean;
  cacheAccessible: boolean;
  errors: string[];
}

/**
 * Run a comprehensive system health check
 */
export async function checkSystemHealth(): Promise<SystemHealthCheck> {
  const result: SystemHealthCheck = {
    supabaseConnection: false,
    bundleLoaderReady: false,
    cacheAccessible: false,
    errors: [],
  };

  try {
    // Test Supabase connection
    const { error: supabaseError } = await supabase
      .from("mini_apps")
      .select("count")
      .limit(1);

    if (supabaseError) {
      result.errors.push(
        `Supabase connection failed: ${supabaseError.message}`
      );
    } else {
      result.supabaseConnection = true;
    }
  } catch (error) {
    result.errors.push(`Supabase test failed: ${error}`);
  }

  try {
    // Test bundle loader
    const cachedBundles = bundleLoader.getCachedBundles();
    result.bundleLoaderReady = true;
    result.cacheAccessible = Array.isArray(cachedBundles);
  } catch (error) {
    result.errors.push(`Bundle loader test failed: ${error}`);
  }

  return result;
}

/**
 * Create a test mini app in the database (for development)
 */
export async function createTestApp(
  name: string = "Test Mini App"
): Promise<MiniApp | null> {
  try {
    const testApp = {
      name,
      description: `A test mini app created for development - ${new Date().toISOString()}`,
      version: "1.0.0",
      category: "Testing",
      is_featured: false,
      icon_url: null,
      bundle_url: null,
      rating: null,
      downloads: 0,
      tags: ["test", "development"],
    };

    const { data, error } = await supabase
      .from("mini_apps")
      .insert([testApp])
      .select()
      .single();

    if (error) {
      console.error("Failed to create test app:", error);
      return null;
    }

    console.log("Test app created:", data);
    return data;
  } catch (error) {
    console.error("Error creating test app:", error);
    return null;
  }
}

/**
 * Create a test deployment for an app
 */
export async function createTestDeployment(appId: string): Promise<boolean> {
  try {
    const deployment = {
      app_id: appId,
      files: mockDeploymentFiles,
      version: "1.0.0",
    };

    const { error: deploymentError } = await supabase
      .from("app_deployments")
      .insert([deployment]);

    if (deploymentError) {
      console.error("Failed to create test deployment:", deploymentError);
      return false;
    }

    // Update the mini app to reference this deployment
    const { error: updateError } = await supabase
      .from("mini_apps")
      .update({ deployment_id: "mock-deployment-id" })
      .eq("id", appId);

    if (updateError) {
      console.error("Failed to update app with deployment ID:", updateError);
      return false;
    }

    console.log("Test deployment created for app:", appId);
    return true;
  } catch (error) {
    console.error("Error creating test deployment:", error);
    return false;
  }
}

/**
 * Test bundle loading without actually downloading
 */
export async function testBundleLoading(
  deploymentId: string,
  files: BundleFile[]
): Promise<{
  success: boolean;
  bundleFound: boolean;
  metadataFound: boolean;
  error?: string;
}> {
  try {
    // Test platform bundle detection
    const platform = "android"; // or 'ios'
    const bundleFile = files.find(
      (file) =>
        file.originalPath.includes(`${platform}/index`) &&
        file.originalPath.endsWith(".hbc")
    );

    // Test metadata file detection
    const metadataFile = files.find(
      (file) =>
        file.originalPath === "metadata.json" || file.fileName.endsWith(".json")
    );

    return {
      success: true,
      bundleFound: !!bundleFile,
      metadataFound: !!metadataFile,
    };
  } catch (error) {
    return {
      success: false,
      bundleFound: false,
      metadataFound: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  try {
    // Delete test apps (be careful with this in production!)
    const { error } = await supabase
      .from("mini_apps")
      .delete()
      .like("name", "%Test Mini App%");

    if (error) {
      console.error("Failed to cleanup test apps:", error);
    } else {
      console.log("Test data cleaned up");
    }

    // Clear bundle cache
    await bundleLoader.clearCache();
    console.log("Bundle cache cleared");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

/**
 * Generate a test report
 */
export async function generateTestReport(): Promise<string> {
  const health = await checkSystemHealth();
  const timestamp = new Date().toISOString();

  let report = `# Dynamic Loading System Test Report\n`;
  report += `Generated: ${timestamp}\n\n`;

  report += `## System Health\n`;
  report += `- Supabase Connection: ${health.supabaseConnection ? "✅" : "❌"}\n`;
  report += `- Bundle Loader Ready: ${health.bundleLoaderReady ? "✅" : "❌"}\n`;
  report += `- Cache Accessible: ${health.cacheAccessible ? "✅" : "❌"}\n\n`;

  if (health.errors.length > 0) {
    report += `## Errors\n`;
    health.errors.forEach((error) => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }

  report += `## Cache Status\n`;
  try {
    const cachedBundles = bundleLoader.getCachedBundles();
    report += `- Cached Bundles: ${cachedBundles.length}\n`;
    if (cachedBundles.length > 0) {
      cachedBundles.forEach((bundleId) => {
        report += `  - ${bundleId}\n`;
      });
    }
  } catch (error) {
    report += `- Cache Status: Error - ${error}\n`;
  }

  report += `\n## Test Bundle Loading\n`;
  const bundleTest = await testBundleLoading(
    "test-deployment",
    mockDeploymentFiles
  );
  report += `- Bundle Detection: ${bundleTest.bundleFound ? "✅" : "❌"}\n`;
  report += `- Metadata Detection: ${bundleTest.metadataFound ? "✅" : "❌"}\n`;

  if (bundleTest.error) {
    report += `- Error: ${bundleTest.error}\n`;
  }

  return report;
}

/**
 * Development helper: Create complete test setup
 */
export async function setupTestEnvironment(): Promise<{
  success: boolean;
  appId?: string;
  error?: string;
}> {
  try {
    console.log("Setting up test environment...");

    // Create test app
    const testApp = await createTestApp();
    if (!testApp) {
      return { success: false, error: "Failed to create test app" };
    }

    // Create test deployment
    const deploymentCreated = await createTestDeployment(testApp.id);
    if (!deploymentCreated) {
      return { success: false, error: "Failed to create test deployment" };
    }

    console.log("Test environment setup complete!");
    return { success: true, appId: testApp.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
