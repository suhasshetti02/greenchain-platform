// Native fetch (Node 18+)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'donations' table schema with relations...");

    // Attempt to select ALL columns + relations to simulate the crash
    const { data, error } = await supabase
        .from('donations')
        .select(`
          id,
          title,
          category,
          food_type,
          quantity_lbs,
          unit,
          expiry_date,
          storage,
          priority_score,
          risk_score,
          status,
          location,
          image_url,
          notes,
          created_at,
          donor:donor_id (id, name, email),
          claims:claims (
            id,
            status,
            receiver:receiver_id (id, name)
          )
        `)
        .limit(1);

    if (error) {
        console.error("❌ Schema Check Failed:");
        console.error(error.message);
        console.log("\nLikely Cause: Missing Foreign Key relations for 'donor' or 'claims'");
    } else {
        console.log("✅ Schema Check Passed: Relations are working.");
    }
}

checkSchema();
