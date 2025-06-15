# Dynamic Loading System for MCP Mini App Store

This document explains how the dynamic loading system works for loading and executing Expo mini-apps from Supabase storage.

## Overview

The dynamic loading system allows the main React Native app to:
1. Download Expo bundles (.hbc files) from Supabase storage
2. Cache bundles locally for faster loading
3. Execute mini-apps within a secure WebView environment
4. Handle communication between host app and mini-apps

## Architecture

### Core Components

1. **BundleLoader Service** (`lib/bundleLoader.ts`)
   - Downloads and caches .hbc bundles from Supabase
   - Lists files directly from Supabase storage
   - Manages platform-specific bundle selection (iOS/Android)
   - Handles manifest.json loading and parsing

2. **MiniAppViewer Component** (`components/MiniAppViewer.tsx`)
   - Renders mini-apps within a WebView
   - Provides host-to-mini-app communication bridge
   - Handles app lifecycle and error states

3. **Dynamic Route** (`app/mini-app/[id].tsx`)
   - Loads app data from Supabase
   - Lists deployment files directly from storage
   - Renders the MiniAppViewer with proper data

4. **Bundle Manager** (`components/BundleManager.tsx`)
   - UI for managing cached bundles
   - Cache statistics and cleanup utilities

## Supabase Storage Structure

### Storage Bucket: `apps`

Your deployment files should be stored in Supabase storage with this structure:

```
apps/
└── deployments/
    └── [deployment-uuid]/
        ├── _expo/
        │   └── static/
        │       └── js/
        │           ├── ios/
        │           │   └── index-[hash].hbc
        │           └── android/
        │               └── index-[hash].hbc
        └── manifest.json
```

### Example Structure

```
apps/deployments/a06a045f-faa1-4643-9797-94fa3118ee44/
├── _expo/static/js/ios/index-b8f5913aa2cb76306e3d514b3c12d70d.hbc
├── _expo/static/js/android/index-5c668f9002dc4069525d01ba262b95a0.hbc
└── manifest.json
```

### Database Schema

```sql
-- Mini Apps table (simplified - no separate deployments table needed)
CREATE TABLE mini_apps (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  bundle_url TEXT, -- Legacy field for backward compatibility
  version TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL,
  downloads INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  deployment_id UUID -- Points to deployment folder in storage
);
```

### Manifest.json Structure

```json
{
  "name": "Weather App",
  "description": "A simple weather application",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "react": "^18.0.0",
    "react-native": "^0.72.0",
    "expo": "^49.0.0"
  },
  "permissions": ["location", "internet"],
  "expo": {
    "name": "Weather App",
    "slug": "weather-app",
    "version": "1.0.0",
    "platforms": ["ios", "android"]
  }
}
```

## How It Works

### 1. File Discovery

When a user launches a mini-app:

1. App data is loaded from `mini_apps` table
2. System determines deployment ID (`deployment_id` field or falls back to `app.id`)
3. Bundle loader lists files from `apps/deployments/[deployment-id]/` in Supabase storage
4. Files are automatically discovered recursively through subdirectories

### 2. Platform Selection

The system automatically selects the appropriate bundle:
- iOS: Files in `_expo/static/js/ios/` directory
- Android: Files in `_expo/static/js/android/` directory

### 3. Bundle Caching

- Bundles are downloaded to device storage on first use
- Cached in `DocumentDirectory/bundles/[deployment-id]/`
- Subsequent launches load from cache for faster startup

## Usage

### 1. Launching a Mini App

```typescript
import { router } from 'expo-router';

// Navigate to mini app (uses app ID)
const handleAppPress = (app: MiniApp) => {
  router.push(`/mini-app/${app.id}` as any);
};
```

### 2. Testing Deployment Files

```typescript
import { testDeployment } from '@/lib/deploymentTest';

// Test file listing for specific deployment
await testDeployment.listFiles('a06a045f-faa1-4643-9797-94fa3118ee44');

// Test full bundle preparation
await testDeployment.runFull('a06a045f-faa1-4643-9797-94fa3118ee44');
```

### 3. Bundle Management

```typescript
import { bundleLoader } from '@/lib/bundleLoader';

// List files for a deployment
const files = await bundleLoader.listDeploymentFiles(deploymentId);

// Prepare app for execution
const result = await bundleLoader.prepareApp(deploymentId);

// Clear all cached bundles
await bundleLoader.clearCache();
```

## Current Limitations

### 1. Hermes Bytecode Execution

The current implementation shows a placeholder instead of actually executing .hbc files because:
- WebView cannot directly execute Hermes bytecode
- Converting .hbc back to JavaScript is complex
- Requires either:
  - A Hermes runtime in WebView (complex)
  - Pre-built JavaScript bundles instead of .hbc
  - Custom native module for bytecode execution

### 2. File Discovery

- Recursively lists all files in deployment directory
- May be slower for large deployments
- Could be optimized with known file structure

### 3. Security

- No bundle signature verification yet
- WebView sandbox provides basic isolation
- API requests need proper validation

## Testing

### Using the Test Utilities

```typescript
// In your app console or test file
import { runFullTest } from '@/lib/deploymentTest';

// Test with your deployment ID
const result = await runFullTest('your-deployment-uuid');
console.log('Test passed:', result.allPassed);
```

### Manual Testing Steps

1. Create a mini app in Supabase `mini_apps` table
2. Upload deployment files to `apps/deployments/[uuid]/` in Supabase storage
3. Set `deployment_id` field in mini app record (or use app ID)
4. Launch app from home screen
5. Verify file listing and bundle download in console logs

### Expected Console Output

```
🔍 Testing deployment file listing for: a06a045f-faa1-4643-9797-94fa3118ee44
✅ Found 3 files:
1. _expo/static/js/android/index-5c668f9002dc4069525d01ba262b95a0.hbc
2. _expo/static/js/ios/index-b8f5913aa2cb76306e3d514b3c12d70d.hbc  
3. manifest.json

📋 File Check:
Android bundle: ✅
iOS bundle: ✅
Manifest: ✅
```

## Setup Instructions

1. **Configure Supabase Storage**
   ```bash
   # Ensure 'apps' bucket exists with public read access
   # Upload deployment files in correct structure
   ```

2. **Database Setup**
   ```sql
   -- Add deployment_id column if not exists
   ALTER TABLE mini_apps ADD COLUMN deployment_id UUID;
   ```

3. **Test System**
   ```typescript
   // Run test to verify everything works
   import { runFullTest } from '@/lib/deploymentTest';
   await runFullTest('your-deployment-id');
   ```

## Future Improvements

### Phase 1: Bundle Execution
- Generate JavaScript bundles instead of .hbc for WebView compatibility
- Implement proper React Native component loading

### Phase 2: Performance
- Implement bundle diffing for incremental updates
- Add compression for faster downloads
- Optimize recursive file listing

### Phase 3: Security
- Bundle signature verification
- Advanced sandboxing
- Permission system for native API access

### Phase 4: Developer Experience
- Hot reloading for development
- Better error reporting
- Bundle analysis tools

## Troubleshooting

### No Files Found
- Verify deployment files exist in Supabase storage
- Check bucket permissions (should allow public read)
- Ensure correct path structure: `deployments/[uuid]/`

### Bundle Download Fails
- Check Supabase storage URLs are accessible
- Verify internet connectivity
- Check file permissions in storage

### WebView Errors
- Check console logs for JavaScript errors
- Verify manifest.json is valid JSON
- Ensure proper WebView configuration

## Contributing

When adding new features:
1. Update bundle loader interfaces
2. Add corresponding UI components
3. Update documentation and tests
4. Consider security implications
5. Test with real deployment files 