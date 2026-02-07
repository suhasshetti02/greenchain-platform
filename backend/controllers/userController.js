const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");
const { areaLabelFromCoords } = require("../utils/location");
const { formatPhoneNumber } = require("../utils/whatsapp");

/* =========================
   GET PROFILE
========================= */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, phone, address, latitude, longitude, created_at")
    .eq("id", userId)
    .single();

  if (error) throw error;

  res.json({ user: data });
});

/* =========================
   UPDATE PROFILE
========================= */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

  const updates = {};

  // Update name if provided
  if (name && name.trim()) {
    updates.name = name.trim();
  }

  // Update phone if provided
  if (phone !== undefined) {
    if (phone === "" || phone === null) {
      // Allow clearing phone number
      updates.phone = null;
    } else {
      // Validate and format phone number
      const formattedPhone = formatPhoneNumber(phone);
      if (!formattedPhone) {
        const err = new Error("Invalid phone number format. Use country code + number (e.g., 919876543210)");
        err.status = 400;
        throw err;
      }
      updates.phone = formattedPhone;
    }
  }

  // Update address if provided
  if (address !== undefined) {
    updates.address = address;
  }

  // Update Lat/Lng if provided
  if (req.body.latitude !== undefined) updates.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updates.longitude = req.body.longitude;

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields to update");
    err.status = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select("id, name, email, role, phone, address")
    .single();

  if (error) throw error;

  res.json({ message: "Profile updated successfully", user: data });
});

/* =========================
   UPDATE LOCATION
========================= */
exports.updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng, location_label } = req.body;
  const userId = req.user.id;

  if (lat === undefined || lng === undefined) {
    const err = new Error("Latitude and Longitude are required");
    err.status = 400;
    throw err;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Use provided label or generate fallback
  let label = location_label;
  if (!label) {
    label = areaLabelFromCoords(latitude, longitude);
  }

  // Update User
  const { error } = await supabase
    .from("users")
    .update({
      latitude,
      longitude,
      address: label
    })
    .eq("id", userId);

  if (error) throw error;

  res.json({ message: "Location updated successfully", location_label: label });
});
