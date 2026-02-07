require("dotenv").config();
const supabase = require("./utils/supabase");

async function fixPhone() {
    const wrongPhone = "8762149468";
    const correctPhone = "+918762149468";

    console.log(`Updating phone from ${wrongPhone} to ${correctPhone}...`);

    const { data, error } = await supabase
        .from("users")
        .update({ phone: correctPhone })
        .eq("phone", wrongPhone)
        .select();

    if (error) {
        console.error("Error updating phone:", error);
    } else {
        console.log("Success! Updated user:", data);
    }
}

fixPhone();
