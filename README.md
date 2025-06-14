# MCP Mini App Store 📱

A React Native mobile app for the MCP Mini App Store - where users can discover and install AI-generated mini applications. Built with **NativeWind** for utility-first styling.

## Features

- **App Store Interface**: Browse and discover mini apps with ratings, downloads, and categories
- **Featured Apps**: Highlighted apps with special promotions
- **Supabase Integration**: Connect to your Supabase database to load real app data
- **Modern UI**: Clean, accessible interface with dark/light mode support
- **NativeWind Styling**: Utility-first CSS with Tailwind classes
- **Pull to Refresh**: Keep your app list up to date
- **Search & Filter**: Find apps by category and features

## Tech Stack

- **Expo Router**: File-based routing system
- **React Native**: Cross-platform mobile development
- **NativeWind**: Tailwind CSS for React Native
- **Supabase**: Backend-as-a-Service for data management
- **TypeScript**: Type-safe development
- **SF Symbols**: Native iOS icons

## Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Supabase (Optional)**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   If you don't configure Supabase, the app will use mock data.

3. **Set up Supabase Database (Optional)**

   Create a table called `mini_apps` with the following schema:

   ```sql
   CREATE TABLE mini_apps (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     icon_url TEXT,
     bundle_url TEXT,
     version TEXT NOT NULL,
     category TEXT NOT NULL,
     rating DECIMAL(2,1),
     downloads INTEGER DEFAULT 0,
     is_featured BOOLEAN DEFAULT false,
     tags TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Start the development server**

   ```bash
   npx expo start
   ```

   In the output, you'll find options to open the app in:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go)

## NativeWind Integration

This project uses **NativeWind** to bring Tailwind CSS utility classes to React Native. The setup includes:

### Configuration Files
- `tailwind.config.js` - Tailwind configuration with custom colors
- `metro.config.js` - Metro bundler configuration for NativeWind
- `global.css` - Global Tailwind styles
- `nativewind-env.d.ts` - TypeScript declarations

### Custom Tailwind Colors
```javascript
{
  primary: '#007AFF',    // iOS blue
  secondary: '#FF6B35',  // Orange accent
  accent: '#FFD700',     // Gold accent
}
```

### Usage Examples
```tsx
// Instead of StyleSheet
<View style={styles.container} />

// Use Tailwind classes
<View className="flex-1 bg-white p-4 rounded-xl shadow-lg" />

// Responsive and conditional styling
<Text className="text-lg font-bold text-primary dark:text-white" />
```

### Converted Components
- `AppCard.tsx` - Fully converted to NativeWind classes
- `app/(tabs)/index.tsx` - Header and layout sections converted
- `NativeWindTest.tsx` - Demonstration component with various Tailwind features

## Project Structure

```
├── app/
│   └── (tabs)/
│       ├── index.tsx          # Main app store screen (with NativeWind)
│       ├── chat.tsx           # Chat/demo screen with NativeWind test
│       └── explore.tsx        # Explore/search screen
├── components/
│   ├── AppCard.tsx           # App card component (NativeWind)
│   ├── NativeWindTest.tsx    # NativeWind demo component
│   ├── ThemedText.tsx        # Themed text component
│   └── ThemedView.tsx        # Themed view component
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── metro.config.js           # Metro bundler configuration
├── global.css               # Global Tailwind styles
└── nativewind-env.d.ts      # NativeWind TypeScript declarations
```

## Mock Data

The app includes mock data for development and demo purposes. When Supabase is not configured or fails to connect, it automatically falls back to mock data including:

- Weather Pro (Featured)
- Task Master
- Color Palette (Featured)
- Quick Calculator
- Meditation Timer (Featured)

## Development

### Adding New Styles
With NativeWind, you can use any Tailwind class directly:

```tsx
// Layout
<View className="flex-row justify-between items-center" />

// Colors & Backgrounds
<View className="bg-blue-500 text-white" />

// Spacing & Sizing
<View className="p-4 m-2 w-full h-64" />

// Borders & Shadows
<View className="rounded-lg border border-gray-200 shadow-md" />

// Custom colors from config
<Text className="text-primary bg-secondary" />
```

### Best Practices
- Use semantic color names (primary, secondary, accent)
- Keep responsive design in mind
- Combine with existing themed components
- Test on both light and dark modes

## Future Features

- Dynamic app loading and installation
- User authentication and profiles
- App ratings and reviews
- Push notifications for new apps
- Offline app caching
- In-app purchases
- More NativeWind component examples

## Contributing

This project is part of the MCP Mini App Store ecosystem. Contributions are welcome!

## License

MIT License - see LICENSE file for details.
