import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://your-project-url.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the App type based on our expected structure
export interface MiniApp {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  bundle_url?: string;
  version: string;
  category: string;
  rating?: number;
  downloads?: number;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  tags?: string[];
}
