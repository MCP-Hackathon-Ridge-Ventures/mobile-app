import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export interface BundleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  entryPoint?: string;
  dependencies?: string[];
  permissions?: string[];
}

export interface BundleFile {
  originalPath: string;
  fileId: string;
  fileName: string;
  publicUrl: string;
  uploadPath: string;
  fileSize: number;
  fileType: string;
}

export interface AppDeployment {
  deploymentId: string;
  appId: string;
  metadata: BundleMetadata;
  files: BundleFile[];
}

class BundleLoaderService {
  private bundleCache = new Map<string, string>(); // deploymentId -> local bundle path
  private metadataCache = new Map<string, BundleMetadata>();

  /**
   * Get the platform-specific bundle file from deployment files
   */
  private getPlatformBundle(files: BundleFile[]): BundleFile | null {
    const platform = Platform.OS;

    // Look for platform-specific files in the _expo/static/js/ios or android directories
    const bundleFile = files.find(
      (file) =>
        file.originalPath.includes(`_expo/static/js/${platform}/`) &&
        (file.originalPath.endsWith(".hbc") ||
          file.originalPath.endsWith(".js"))
    );

    return bundleFile || null;
  }

  /**
   * Get manifest file from deployment files
   */
  private getManifestFile(files: BundleFile[]): BundleFile | null {
    // First, look for manifest.json specifically
    let manifestFile = files.find(
      (file) =>
        file.originalPath === "manifest.json" ||
        file.fileName === "manifest.json"
    );

    // If not found, look for any JSON file that might be the manifest
    if (!manifestFile) {
      manifestFile = files.find(
        (file) =>
          file.originalPath.endsWith(".json") &&
          file.fileType === "application/json"
      );
    }

    return manifestFile || null;
  }

  /**
   * Load and cache bundle metadata from manifest.json
   */
  async loadMetadata(
    deploymentId: string,
    files: BundleFile[]
  ): Promise<BundleMetadata | null> {
    // Check cache first
    if (this.metadataCache.has(deploymentId)) {
      return this.metadataCache.get(deploymentId)!;
    }

    const manifestFile = this.getManifestFile(files);
    if (!manifestFile) {
      console.warn(`No manifest.json found for deployment ${deploymentId}`);
      return null;
    }

    try {
      const response = await fetch(manifestFile.publicUrl);
      const manifest = await response.json();

      // Convert manifest to our metadata format
      const metadata: BundleMetadata = {
        id: deploymentId,
        name: manifest.name || "Unknown App",
        description: manifest.description || "",
        version: manifest.version || "1.0.0",
        entryPoint: manifest.main || "index.js",
        dependencies: manifest.dependencies
          ? Object.keys(manifest.dependencies)
          : [],
        permissions: manifest.permissions || [],
      };

      // Cache the metadata
      this.metadataCache.set(deploymentId, metadata);
      return metadata;
    } catch (error) {
      console.error(
        `Failed to load manifest for deployment ${deploymentId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Download and cache a bundle locally
   */
  async downloadBundle(
    deploymentId: string,
    files: BundleFile[]
  ): Promise<string | null> {
    // Check if already cached
    if (this.bundleCache.has(deploymentId)) {
      const cachedPath = this.bundleCache.get(deploymentId)!;
      const fileExists = await FileSystem.getInfoAsync(cachedPath);
      if (fileExists.exists) {
        return cachedPath;
      }
    }

    const bundleFile = this.getPlatformBundle(files);
    if (!bundleFile) {
      console.error(
        `No platform-specific bundle found for ${Platform.OS} in deployment ${deploymentId}`
      );
      return null;
    }

    try {
      // Create bundle directory
      const bundleDir = `${FileSystem.documentDirectory}bundles/${deploymentId}`;
      await FileSystem.makeDirectoryAsync(bundleDir, { intermediates: true });

      // Use the original filename or create appropriate extension
      const fileExtension = bundleFile.originalPath.endsWith(".hbc")
        ? ".hbc"
        : ".js";
      const localPath = `${bundleDir}/index${fileExtension}`;

      // Download the bundle
      console.log(`Downloading bundle from: ${bundleFile.publicUrl}`);
      const downloadResult = await FileSystem.downloadAsync(
        bundleFile.publicUrl,
        localPath
      );

      if (downloadResult.status !== 200) {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`
        );
      }

      // Cache the bundle path
      this.bundleCache.set(deploymentId, localPath);
      return localPath;
    } catch (error) {
      console.error(
        `Failed to download bundle for deployment ${deploymentId}:`,
        error
      );
      return null;
    }
  }

  /**
   * List files in a deployment from Supabase storage
   */
  async listDeploymentFiles(deploymentId: string): Promise<BundleFile[]> {
    try {
      const deploymentPath = `deployments/${deploymentId}`.trim();
      console.log("deploymentPath", deploymentPath, "$$$$");

      const { data: files, error } = await supabase.storage
        .from("apps")
        .list(deploymentPath, {
          limit: 100,
          offset: 0,
        });

      console.log("files", files);

      if (error) {
        console.error("Failed to list deployment files:", error);
        return [];
      }

      if (!files) {
        return [];
      }

      // Convert storage file list to BundleFile format
      const bundleFiles: BundleFile[] = [];

      for (const file of files) {
        // Skip directories for now - we'll handle them in the recursive call
        if (!file.name.includes(".")) {
          continue;
        }

        // Get public URL for each file
        const { data: urlData } = supabase.storage
          .from("apps")
          .getPublicUrl(`${deploymentPath}/${file.name}`);

        bundleFiles.push({
          originalPath: file.name,
          fileId: file.id || `${deploymentId}-${file.name}`,
          fileName: file.name,
          publicUrl: urlData.publicUrl,
          uploadPath: `${deploymentPath}/${file.name}`,
          fileSize: file.metadata?.size || 0,
          fileType: file.metadata?.mimetype || "application/octet-stream",
        });
      }

      // Recursively list files in subdirectories (_expo/static/js/ios, android, etc.)
      const subdirs = files.filter((file) => !file.name.includes("."));
      for (const subdir of subdirs) {
        const subFiles = await this.listSubdirectoryFiles(
          deploymentId,
          `${deploymentPath}/${subdir.name}`
        );
        bundleFiles.push(...subFiles);
      }

      console.log(`Found ${bundleFiles.length} total files:`);
      bundleFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.originalPath} (${file.fileType})`);
      });

      return bundleFiles;
    } catch (error) {
      console.error(
        `Failed to list files for deployment ${deploymentId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Recursively list files in subdirectories
   */
  private async listSubdirectoryFiles(
    deploymentId: string,
    path: string
  ): Promise<BundleFile[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from("apps")
        .list(path, { limit: 100 });

      if (error || !files) {
        return [];
      }

      const bundleFiles: BundleFile[] = [];

      for (const file of files) {
        const fullPath = `${path}/${file.name}`;

        if (file.name.includes(".")) {
          // It's a file
          const { data: urlData } = supabase.storage
            .from("apps")
            .getPublicUrl(fullPath);

          bundleFiles.push({
            originalPath: fullPath.replace(`deployments/${deploymentId}/`, ""),
            fileId: file.id || `${deploymentId}-${file.name}`,
            fileName: file.name,
            publicUrl: urlData.publicUrl,
            uploadPath: fullPath,
            fileSize: file.metadata?.size || 0,
            fileType: file.metadata?.mimetype || "application/octet-stream",
          });
        } else {
          // It's a directory, recurse
          const subFiles = await this.listSubdirectoryFiles(
            deploymentId,
            fullPath
          );
          bundleFiles.push(...subFiles);
        }
      }

      return bundleFiles;
    } catch (error) {
      console.error(`Failed to list subdirectory ${path}:`, error);
      return [];
    }
  }

  /**
   * Load a complete app deployment with file listing
   */
  async loadAppDeployment(deploymentId: string): Promise<AppDeployment | null> {
    try {
      // List files from Supabase storage
      const files = await this.listDeploymentFiles(deploymentId);

      if (files.length === 0) {
        console.warn(`No files found for deployment ${deploymentId}`);
        return null;
      }

      const metadata = await this.loadMetadata(deploymentId, files);

      if (!metadata) {
        console.warn(`No manifest found for deployment ${deploymentId}`);
        return null;
      }

      return {
        deploymentId,
        appId: metadata.id,
        metadata,
        files,
      };
    } catch (error) {
      console.error(`Failed to load app deployment ${deploymentId}:`, error);
      return null;
    }
  }

  /**
   * Prepare an app for execution (download bundle and metadata)
   */
  async prepareApp(
    deploymentId: string,
    files?: BundleFile[]
  ): Promise<{
    bundlePath: string;
    metadata: BundleMetadata;
  } | null> {
    try {
      // If files not provided, list them from storage
      const deploymentFiles =
        files || (await this.listDeploymentFiles(deploymentId));

      if (deploymentFiles.length === 0) {
        console.error(`No files found for deployment ${deploymentId}`);
        return null;
      }

      const [bundlePath, metadata] = await Promise.all([
        this.downloadBundle(deploymentId, deploymentFiles),
        this.loadMetadata(deploymentId, deploymentFiles),
      ]);

      if (!bundlePath || !metadata) {
        return null;
      }

      return { bundlePath, metadata };
    } catch (error) {
      console.error(`Failed to prepare app ${deploymentId}:`, error);
      return null;
    }
  }

  /**
   * Clear bundle cache
   */
  async clearCache(): Promise<void> {
    try {
      const bundleDir = `${FileSystem.documentDirectory}bundles`;
      const dirInfo = await FileSystem.getInfoAsync(bundleDir);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(bundleDir, { idempotent: true });
      }

      this.bundleCache.clear();
      this.metadataCache.clear();
    } catch (error) {
      console.error("Failed to clear bundle cache:", error);
    }
  }

  /**
   * Get cached bundle info
   */
  getCachedBundles(): string[] {
    return Array.from(this.bundleCache.keys());
  }

  /**
   * Get file content from deployment
   */
  async getFileContent(
    deploymentId: string,
    filePath: string
  ): Promise<string | null> {
    try {
      // First, list all files to find the matching file
      const files = await this.listDeploymentFiles(deploymentId);
      const targetFile = files.find(
        (file) =>
          file.originalPath === filePath ||
          file.fileName === filePath ||
          file.originalPath.endsWith(filePath)
      );

      if (!targetFile) {
        console.error(
          `File not found: ${filePath} in deployment ${deploymentId}`
        );
        return null;
      }

      // Fetch the content from the public URL
      const response = await fetch(targetFile.publicUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Failed to get file content for ${filePath}:`, error);
      return null;
    }
  }
}

export const bundleLoader = new BundleLoaderService();
