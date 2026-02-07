require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log("Running WhatsApp & AI Features migration...");
  
  try {
    // Add phone column to users table
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users
        ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
        
        COMMENT ON COLUMN public.users.phone IS 'Phone number with country code (e.g., 919876543210) for WhatsApp communication';
      `
    });

    if (error) {
      // If RPC doesn't exist, try direct SQL
      console.log("RPC method not available, trying direct approach...");
      
      // Check if column exists
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users')
        .eq('column_name', 'phone');
      
      if (!columns || columns.length === 0) {
        console.log("Phone column doesn't exist. Please run this SQL in Supabase SQL Editor:");
        console.log("\n--- COPY AND RUN THIS SQL ---");
        console.log(`
ALTER TABLE public.users
ADD COLUMN phone VARCHAR(15);

COMMENT ON COLUMN public.users.phone IS 'Phone number with country code (e.g., 919876543210) for WhatsApp communication';
        `);
        console.log("--- END SQL ---\n");
      } else {
        console.log("✓ Phone column already exists");
      }
    } else {
      console.log("✓ Migration completed successfully");
    }
  } catch (err) {
    console.error("Migration error:", err.message);
    console.log("\nPlease run this SQL manually in Supabase SQL Editor:");
    console.log("\n--- COPY AND RUN THIS SQL ---");
    console.log(`
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(15);

COMMENT ON COLUMN public.users.phone IS 'Phone number with country code (e.g., 919876543210) for WhatsApp communication';
    `);
    console.log("--- END SQL ---\n");
  }
}

runMigration();
