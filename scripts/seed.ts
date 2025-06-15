import { createClient } from "@supabase/supabase-js";
import { MiniApp } from "../lib/supabase";
import { runMigrations } from "./migrate";

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing Supabase configuration. Please check your environment variables:"
  );
  console.error("- EXPO_PUBLIC_SUPABASE_URL");
  console.error(
    "- SUPABASE_SERVICE_ROLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock data for seeding - using the same data from the app
const getSeedApps = (): Omit<MiniApp, "created_at" | "updated_at">[] => [
  {
    id: "1",
    name: "Weather Pro",
    description:
      "Beautiful weather app with 7-day forecast and location tracking",
    category: "Utilities",
    version: "1.0.0",
    rating: 4.8,
    downloads: 15420,
    is_featured: true,
    tags: ["weather", "forecast", "location"],
  },
  {
    id: "2",
    name: "Task Master",
    description: "Simple and elegant todo list with reminders and categories",
    category: "Productivity",
    version: "2.1.0",
    rating: 4.6,
    downloads: 8930,
    is_featured: false,
    tags: ["todo", "tasks", "productivity"],
  },
  {
    id: "3",
    name: "Color Palette",
    description: "Generate beautiful color palettes for your design projects",
    category: "Design",
    version: "1.2.0",
    rating: 4.5,
    downloads: 3210,
    is_featured: true,
    tags: ["design", "colors", "palette"],
  },
  {
    id: "4",
    name: "Quick Calculator",
    description: "Fast and intuitive calculator with scientific functions",
    category: "Utilities",
    version: "1.0.5",
    rating: 4.3,
    downloads: 12680,
    is_featured: false,
    tags: ["calculator", "math", "utilities"],
  },
  {
    id: "5",
    name: "Meditation Timer",
    description:
      "Peaceful meditation timer with nature sounds and guided sessions",
    category: "Health",
    version: "1.1.0",
    rating: 4.9,
    downloads: 6754,
    is_featured: true,
    tags: ["meditation", "mindfulness", "wellness"],
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // First, check if table exists and has data
    const { data: existingApps, error: checkError } = await supabase
      .from("mini_apps")
      .select("id")
      .limit(1);

    if (checkError) {
      // If table doesn't exist, run migrations first
      if (
        checkError.message.includes("does not exist") ||
        checkError.message.includes("schema cache") ||
        checkError.message.includes("relation") ||
        checkError.code === "PGRST116"
      ) {
        console.log("📋 Table does not exist. Running migrations...");
        await runMigrations();
        console.log("✅ Migrations completed. Continuing with seeding...");
      } else {
        console.error("❌ Error checking existing data:", checkError.message);
        process.exit(1);
      }
    } else if (existingApps && existingApps.length > 0) {
      console.log(
        "⚠️  Database already contains data. Do you want to clear existing data first?"
      );
      console.log(
        "   Run with --clear flag to remove existing data before seeding."
      );

      // Check if --clear flag is provided
      if (process.argv.includes("--clear")) {
        console.log("🗑️  Clearing existing data...");
        const { error: deleteError } = await supabase
          .from("mini_apps")
          .delete()
          .neq("id", ""); // Delete all records

        if (deleteError) {
          console.error(
            "❌ Error clearing existing data:",
            deleteError.message
          );
          process.exit(1);
        }
        console.log("✅ Existing data cleared");
      } else {
        console.log(
          "ℹ️  Skipping seed. Use --clear flag to remove existing data first."
        );
        process.exit(0);
      }
    }

    // Insert seed data
    const seedApps = getSeedApps();
    console.log(`📝 Inserting ${seedApps.length} apps...`);

    const { data, error } = await supabase
      .from("mini_apps")
      .insert(seedApps)
      .select();

    if (error) {
      console.error("❌ Error inserting seed data:", error.message);
      process.exit(1);
    }

    console.log("✅ Database seeded successfully!");
    console.log(`📊 Inserted ${data?.length || 0} apps:`);

    data?.forEach((app: any) => {
      console.log(
        `   • ${app.name} (${app.category}) - ${app.is_featured ? "⭐ Featured" : "Regular"}`
      );
    });

    console.log("\n🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Unexpected error during seeding:", error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

export { getSeedApps, seedDatabase };
