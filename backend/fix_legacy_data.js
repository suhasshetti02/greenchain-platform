require("dotenv").config();
const supabase = require("./utils/supabase");

async function fix() {
  console.log("--- Patching Data for Distance Demo ---");

  // 1. Update Donation "Idli" with coords (Begihalli area)
  // Lat: 12.785, Lng: 77.605
  const { error: dErr } = await supabase
    .from("donations")
    .update({ 
      latitude: 12.7850, 
      longitude: 77.6050,
      location: "Begihalli, Karnataka (Patched)"
    })
    .eq("title", "Idli");

  if (dErr) console.error("Donation Update Failed:", dErr);
  else console.log("✓ Donation 'Idli' patched with coordinates.");

  // 2. Update User "SuhasShetti2005@gmail.com" (Vijay) with coords (Nearby)
  // Lat: 12.790, Lng: 77.610 (~1km away)
  const { error: uErr } = await supabase
    .from("users")
    .update({
      latitude: 12.7900,
      longitude: 77.6100
    })
    .eq("email", "suhasshetti2005@gmail.com");

  if (uErr) console.error("User Update Failed:", uErr);
  else console.log("✓ User 'Vijay' patched with coordinates.");
}

fix();
