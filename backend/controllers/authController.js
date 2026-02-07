const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const supabase = require("../utils/supabase");
const { createToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
// Import WhatsApp helper (safely require to avoid circular issues if any, though none currently)
// We might need to handle the case where whatsappController hasn't initialized yet if we are too fast, but unlikely.
const { sendWhatsAppMessage } = require("./whatsappController");

const ALLOWED_ROLES = ["donor", "receiver"];

exports.registerUser = asyncHandler(async (req, res) => {
    const { email, password, name, role, phone, address, latitude, longitude } = req.body;

    console.log("[Register] Received body:", req.body);
    console.log("[Register] Address value:", address);

    if (!email || !password || !name || !role) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
    }

    if (!ALLOWED_ROLES.includes(role)) {
        const error = new Error("Invalid role");
        error.status = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert(
            {
                email,
                password_hash: passwordHash,
                name,
                role,
                phone,
                address,
                latitude,
                longitude
            },
            { returning: "representation", force: true },
        )
        .select("id, email, name, role, phone, address, created_at")
        .single();

    if (insertError) {
        if (insertError.code === "23505") {
            const err = new Error("Email already registered");
            err.status = 409;
            throw err;
        }
        throw insertError;
    }

    const token = createToken(inserted.id, inserted.email, inserted.role);

    res.status(201).json({ token, user: inserted });
});

exports.loginUser = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    console.log(`[Auth] Attempting login for: '${email}' with password length: ${password ? password.length : 0}`);

    if (!email || !password) {
        const error = new Error("Email and password required");
        error.status = 400;
        throw error;
    }

    email = email.trim();

    if (!email || !password) {
        const error = new Error("Email and password required");
        error.status = 400;
        throw error;
    }

    const { data: userData } = await supabase
        .from("users")
        .select("id, email, name, role, password_hash, created_at")
        .eq("email", email)
        .maybeSingle();

    if (!userData) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);

    if (!isPasswordValid) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
    }

    const token = createToken(userData.id, userData.email, userData.role);
    const { password_hash, ...userWithoutPassword } = userData;

    res.json({ token, user: userWithoutPassword });
});

exports.updateLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, address } = req.body;
    const userId = req.user.id;

    if (!latitude || !longitude) {
        const error = new Error("Latitude and Longitude are required");
        error.status = 400;
        throw error;
    }

    const { data, error } = await supabase
        .from("users")
        .update({
            latitude,
            longitude,
            address
        })
        .eq("id", userId)
        .select("id, email, name, role, latitude, longitude, address")
        .single();

    if (error) throw error;

    res.json({
        message: "Location updated successfully",
        user: data
    });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        const error = new Error("Email is required");
        error.status = 400;
        throw error;
    }

    // Check if user exists
    const { data: user } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();

    if (!user) {
        // Return same message to avoid enumeration, but locally we know it resets
        return res.json({ message: "If that email exists, we have reset the password." });
    }

    // INSTANT RESET TO 123456
    const tempPassword = "123456";
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const { error } = await supabase
        .from("users")
        .update({ password_hash: passwordHash })
        .eq("id", user.id);

    if (error) throw error;

    console.log(`[Auth] Password for ${email} manually reset to ${tempPassword}`);

    res.json({
        message: "Password reset successfully",
        tempPassword: tempPassword
    });
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        const error = new Error("Token and new password are required");
        error.status = 400;
        throw error;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'reset') throw new Error("Invalid token type");
    } catch (err) {
        const error = new Error("Invalid or expired reset token");
        error.status = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update Password
    const { error } = await supabase
        .from("users")
        .update({ password_hash: passwordHash })
        .eq("id", decoded.id);

    if (error) throw error;

    res.json({ message: "Password updated successfully. Please login." });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(`[Auth] Deleting account for user ${userId}`);

    // Clean up dependent data manually if cascades aren't set up perfectly
    // 1. Delete Alerts
    await supabase.from("alerts").delete().eq("user_id", userId);

    // 2. If Donor: Delete active donations (or mark them deleted?)
    // Let's hard delete for privacy as requested "completely"
    if (req.user.role === 'donor') {
        // Also need to delete claims on those donations to avoid orphans?
        // Actually, if we delete donations, claims might cascade or need explicit delete.
        // Let's rely on DB constraints or explicit delete if we want to be sure.
        // Safest: Delete donations where donor_id = userId
        // But claims reference donations.
        // Let's try deleting donations, if it fails due to FK, we delete claims first.
        
        // Find user's donations
        const { data: donations } = await supabase.from("donations").select("id").eq("donor_id", userId);
        if (donations && donations.length > 0) {
            const donationIds = donations.map(d => d.id);
            // Delete claims referencing these donations
            await supabase.from("claims").delete().in("donation_id", donationIds);
            // Now delete donations
            await supabase.from("donations").delete().in("id", donationIds);
        }
    } else if (req.user.role === 'receiver') {
        // Delete claims made by this user
        await supabase.from("claims").delete().eq("receiver_id", userId);
    }

    // 3. Delete User Profile
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
        console.error("Delete account error:", error);
        throw new Error("Failed to delete account data");
    }

    res.json({ message: "Account deleted successfully" });
});
