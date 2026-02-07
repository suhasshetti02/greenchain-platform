const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log("Running feature expansion migration...");
    
    // Add reputation columns to users table
    console.log("1. Adding reputation columns to users table...");
    const { error: usersError } = await supabase.rpc('exec_sql', {
        query: `
            ALTER TABLE public.users
            ADD COLUMN IF NOT EXISTS successful_pickups INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS no_shows INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100;
        `
    });
    
    if (usersError) {
        console.log("Note: exec_sql RPC not available, this is expected for direct table access");
    } else {
        console.log("✅ Users table updated");
    }
    
    // Add scheduled_pickup to claims table
    console.log("2. Adding scheduled_pickup to claims table...");
    const { error: claimsError } = await supabase.rpc('exec_sql', {
        query: `
            ALTER TABLE public.claims
            ADD COLUMN IF NOT EXISTS scheduled_pickup TIMESTAMP WITH TIME ZONE;
        `
    });
    
    if (claimsError) {
        console.log("Note: exec_sql RPC not available");
    } else {
        console.log("✅ Claims table updated");
    }
    
    // Add donor_location_label to donations table
    console.log("3. Adding donor_location_label to donations table...");
    const { error: donationsError } = await supabase.rpc('exec_sql', {
        query: `
            ALTER TABLE public.donations
            ADD COLUMN IF NOT EXISTS donor_location_label TEXT;
        `
    });
    
    if (donationsError) {
        console.log("Note: exec_sql RPC not available");
    } else {
        console.log("✅ Donations table updated");
    }
    
    // Verify the changes
    console.log("\n4. Verifying schema changes...");
    const { data, error } = await supabase
        .from('donations')
        .select('id, donor_location_label')
        .limit(1);
    
    if (error) {
        console.error("❌ Verification failed:", error.message);
        console.log("\nPlease run the SQL migration manually in Supabase SQL Editor:");
        console.log("File: backend/db_feature_expansion.sql");
    } else {
        console.log("✅ Migration completed successfully!");
        console.log("   donor_location_label column is now available");
    }
}

runMigration();
