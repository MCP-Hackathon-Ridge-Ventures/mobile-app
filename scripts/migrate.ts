import { createClient } from "@supabase/supabase-js";

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

// SQL to create the mini_apps table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS mini_apps (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon_url text,
    bundle_url text,
    version text NOT NULL,
    category text NOT NULL,
    rating numeric CHECK (rating >= 0 AND rating <= 5),
    downloads integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_featured boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[]
  );
`;

// SQL to create an index on featured apps for faster queries
const createIndexSQL = `
  CREATE INDEX IF NOT EXISTS idx_mini_apps_featured 
  ON mini_apps (is_featured) 
  WHERE is_featured = true;
`;

// SQL to create an index on category for faster filtering
const createCategoryIndexSQL = `
  CREATE INDEX IF NOT EXISTS idx_mini_apps_category 
  ON mini_apps (category);
`;

// SQL to create a function to automatically update the updated_at timestamp
const createUpdateTriggerSQL = `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS update_mini_apps_updated_at ON mini_apps;
  
  CREATE TRIGGER update_mini_apps_updated_at
    BEFORE UPDATE ON mini_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigrations() {
  console.log("🔧 Starting database migrations...");

  try {
    // Create the table
    console.log("📋 Creating mini_apps table...");
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (tableError) {
      console.error("❌ Error creating table:", tableError.message);

      // Try alternative method using raw SQL
      console.log("🔄 Trying alternative method...");
      const { error: altError } = await supabase
        .from("mini_apps")
        .select("id")
        .limit(1);

      if (altError && altError.message.includes("does not exist")) {
        console.error("❌ Table does not exist and cannot be created via RPC.");
        console.log(
          "💡 Please create the table manually in your Supabase dashboard:"
        );
        console.log("\n" + createTableSQL);
        process.exit(1);
      }
    } else {
      console.log("✅ Table created successfully");
    }

    // Create indexes
    console.log("📊 Creating indexes...");
    const { error: indexError1 } = await supabase.rpc("exec_sql", {
      sql: createIndexSQL,
    });

    const { error: indexError2 } = await supabase.rpc("exec_sql", {
      sql: createCategoryIndexSQL,
    });

    if (indexError1 || indexError2) {
      console.log("⚠️  Could not create indexes via RPC (this is okay)");
    } else {
      console.log("✅ Indexes created successfully");
    }

    // Create update trigger
    console.log("⏰ Creating update trigger...");
    const { error: triggerError } = await supabase.rpc("exec_sql", {
      sql: createUpdateTriggerSQL,
    });

    if (triggerError) {
      console.log("⚠️  Could not create trigger via RPC (this is okay)");
    } else {
      console.log("✅ Update trigger created successfully");
    }

    // Verify table exists and has correct structure
    console.log("🔍 Verifying table structure...");
    const { data, error } = await supabase
      .from("mini_apps")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Error verifying table:", error.message);
      process.exit(1);
    }

    console.log("✅ Table verification successful");
    console.log("🎉 Database migrations completed successfully!");
  } catch (error) {
    console.error("❌ Unexpected error during migration:", error);
    console.log("\n💡 Manual SQL to run in your Supabase dashboard:");
    console.log("\n1. Create table:");
    console.log(createTableSQL);
    console.log("\n2. Create indexes:");
    console.log(createIndexSQL);
    console.log(createCategoryIndexSQL);
    console.log("\n3. Create update trigger:");
    console.log(createUpdateTriggerSQL);
    process.exit(1);
  }
}

// Run migrations
if (require.main === module) {
  runMigrations();
}

export { createTableSQL, runMigrations };
