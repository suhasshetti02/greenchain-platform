require("dotenv").config();
const supabase = require("./utils/supabase");
const bcrypt = require("bcryptjs");

async function resetPassword() {
    const email = "sam22@email.com";
    const newPass = "123456";
    const hash = await bcrypt.hash(newPass, 10);

    const { data, error } = await supabase
        .from("users")
        .update({ password_hash: hash })
        .eq("email", email)
        .select();

    if (error) console.error(error);
    else console.log("Password reset for sam22@email.com");
}

resetPassword();
