require("dotenv").config();
const supabase = require("./utils/supabase");

async function checkUsers() {
    const emails = ["sam22@email.com", "sam22@gmail.com"];

    const { data: users, error } = await supabase
        .from("users")
        .select("id, email, password_hash")
        .in("email", emails);

    if (error) console.error(error);
    else {
        console.log("Found Users:");
        users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
        if (users.length === 0) console.log("No users found with these emails.");
    }
}

checkUsers();
