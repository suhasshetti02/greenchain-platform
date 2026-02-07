require("dotenv").config();
const supabase = require("./utils/supabase");

async function checkUsers() {
  console.log("Checking recent users for phone numbers...");
  
  const { data: users, error } = await supabase
    .from("users")
    .select("email, phone, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  if (users.length === 0) {
    console.log("No users found.");
  } else {
    console.log("Recent Users:");
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}): Phone=${u.phone || "MISSING"}`);
    });
  }
}

checkUsers();
