const bcrypt = require("bcryptjs");

const supabase = require("../utils/supabase");
const { createToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const ALLOWED_ROLES = ["donor", "receiver", "volunteer"];

exports.registerUser = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;

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
      },
      { returning: "representation", force: true },
    )
    .select("id, email, name, role")
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
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password required");
    error.status = 400;
    throw error;
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, name, role, password_hash")
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


