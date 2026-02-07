require("dotenv").config();
const supabase = require("./utils/supabase");

async function debug() {
  console.log("--- Checking User Coords ---");
  const { data: users, error: uErr } = await supabase
    .from("users")
    .select("name, email, role, latitude, longitude")
    .order("created_at", { ascending: false })
    .limit(5);

  if (uErr) console.error(uErr);
  else console.table(users);

  console.log("\n--- Checking Donation Coords ---");
  const { data: donations, error: dErr } = await supabase
    .from("donations")
    .select("title, latitude, longitude")
    .order("created_at", { ascending: false })
    .limit(5);

  if (dErr) console.error(dErr);
  else console.table(donations);
}

debug();
