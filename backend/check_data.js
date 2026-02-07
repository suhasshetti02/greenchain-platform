require("dotenv").config();
const supabase = require("./utils/supabase");

async function checkData() {
    console.log("--- LATEST DONATIONS ---");
    const { data: donations, error: dError } = await supabase
        .from("donations")
        .select("id, title, quantity_lbs, status, donor_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

    if (dError) console.error("Donation Error:", dError);
    else {
        donations.forEach(d => console.log(`DONATION: ${d.title} (Donor: ${d.donor_id})`));
    }

    console.log("\n--- LATEST USERS ---");
    const { data: users, error: uError } = await supabase
        .from("users")
        .select("id, name, email, phone")
        .order("created_at", { ascending: false })
        .limit(5);

    if (uError) console.error("User Error:", uError);
    else {
        users.forEach(u => console.log(`USER: ${u.name} | ${u.email} | ${u.phone} | ID: ${u.id}`));
    }
}

checkData();
