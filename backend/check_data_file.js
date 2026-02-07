require("dotenv").config();
const supabase = require("./utils/supabase");
const fs = require("fs");

async function checkData() {
    let output = "--- LATEST DONATIONS ---\n";
    const { data: donations } = await supabase
        .from("donations")
        .select("title, donor_id")
        .order("created_at", { ascending: false })
        .limit(5);

    if (donations) {
        donations.forEach(d => output += `DONATION: ${d.title} (Donor: ${d.donor_id})\n`);
    }

    output += "\n--- LATEST USERS ---\n";
    const { data: users } = await supabase
        .from("users")
        .select("name, email, phone, id")
        .order("created_at", { ascending: false })
        .limit(5);

    if (users) {
        users.forEach(u => output += `USER: ${u.name} | ${u.email} | ${u.phone} | ID: ${u.id}\n`);
    }

    fs.writeFileSync("data_dump.txt", output);
    console.log("Done.");
}

checkData();
