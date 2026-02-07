require("dotenv").config();
const supabase = require("./utils/supabase");

async function checkPhone() {
    const phone = "8762149468";
    console.log(`Checking for users with phone number containing: ${phone}`);

    // Check for exact match
    const { data: exactUser, error: exactError } = await supabase
        .from("users")
        .select("id, name, phone, role")
        .eq("phone", phone);

    if (exactUser && exactUser.length > 0) {
        console.log("Found user with EXACT match (missing country code?):", exactUser);
    } else {
        console.log("No exact match found.");
    }

    // Check for match with +91
    const { data: indiaUser } = await supabase
        .from("users")
        .select("id, name, phone, role")
        .eq("phone", "+91" + phone);

    if (indiaUser && indiaUser.length > 0) {
        console.log("Found user with +91 prefix:", indiaUser);
    }
}

checkPhone();
