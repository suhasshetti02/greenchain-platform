const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");

const DONATION_SELECT = `
  id,
  title,
  category,
  quantity_lbs,
  unit,
  expiry_date,
  status,
  location,
  image_url,
  notes,
  created_at,
  donor:donor_id (id, name, email, role),
  claims:claims (
    id,
    receiver_id,
    status,
    claimed_at,
    receiver:receiver_id (id, name, email)
  )
`;

function assertRole(req, allowedRoles = []) {
  if (!allowedRoles.includes(req.user.role)) {
    const error = new Error("You are not authorized to perform this action");
    error.status = 403;
    throw error;
  }
}

async function uploadDonationImage(userId, file) {
  if (!file) return null;

  const filename = `donations/${userId}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabase.storage
    .from("donations")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error("Image upload error:", uploadError);
    const err = new Error("Unable to upload donation image");
    err.status = 400;
    throw err;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("donations").getPublicUrl(filename);

  return publicUrl;
}

function buildPriorityMetadata(donation) {
  const expiresInMs = new Date(donation.expiry_date).getTime() - Date.now();
  const hours = Math.max(Math.round(expiresInMs / 1000 / 60 / 60), 0);

  let priority = "normal";
  let hint = "Pickup can be scheduled normally.";

  if (hours <= 6) {
    priority = "critical";
    hint = "Expires soon — prioritize this pickup.";
  } else if (hours <= 24) {
    priority = "high";
    hint = "Pickup within the same day is recommended.";
  }

  return { ...donation, priority, priorityHint: hint, hoursUntilExpiry: hours };
}

exports.listDonations = asyncHandler(async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  // Mark expired donations before listing
  const now = new Date().toISOString();
  await supabase
    .from("donations")
    .update({ status: "expired" })
    .eq("status", "available")
    .lt("expiry_date", now);

  let query = supabase.from("donations").select(DONATION_SELECT);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw error;

  res.json({ donations: data ?? [] });
});

exports.listMyDonations = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);

  const { data, error } = await supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("donor_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  res.json({ donations: data ?? [] });
});

exports.listAvailableDonations = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  // First, mark expired donations as expired
  const now = new Date().toISOString();
  await supabase
    .from("donations")
    .update({ status: "expired" })
    .eq("status", "available")
    .lt("expiry_date", now);

  // Then fetch only available and non-expired donations
  const { data, error } = await supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("status", "available")
    .gt("expiry_date", now)
    .order("expiry_date", { ascending: true })
    .limit(Number(limit));

  if (error) throw error;

  const enriched = (data ?? []).map(buildPriorityMetadata);
  res.json({ donations: enriched });
});

exports.getDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err = new Error("Donation not found");
    err.status = 404;
    throw err;
  }

  res.json(data);
});

exports.createDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);

  const {
    title,
    category,
    quantity_lbs,
    unit = "lbs",
    expiry_date,
    location,
    notes,
  } = req.body;

  if (!title || !category || !quantity_lbs || !expiry_date || !location) {
    const error = new Error("Missing required fields");
    error.status = 400;
    throw error;
  }

  const imageUrl = await uploadDonationImage(req.user.id, req.file);

  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_id: req.user.id,
      title,
      category,
      quantity_lbs: parseFloat(quantity_lbs),
      unit,
      expiry_date,
      location,
      notes,
      image_url: imageUrl,
      status: "available",
    })
    .select("id")
    .single();

  if (error) throw error;

  const verification_code = `VC-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  await supabase.from("verification_events").insert({
    donation_id: data.id,
    event_type: "pickup",
    verification_code,
    scheduled_for: new Date(expiry_date).toISOString(),
  });

  res.status(201).json({ message: "Donation created successfully", id: data.id });
});

exports.updateDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { id } = req.params;

  const { data: existing } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.donor_id !== req.user.id) {
    const error = new Error("Donation not found");
    error.status = 404;
    throw error;
  }

  const allowedFields = [
    "title",
    "category",
    "quantity_lbs",
    "unit",
    "expiry_date",
    "location",
    "notes",
    "status",
  ];

  const payload = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      payload[field] = req.body[field];
    }
  });

  if (payload.quantity_lbs) {
    payload.quantity_lbs = parseFloat(payload.quantity_lbs);
  }

  if (req.file) {
    payload.image_url = await uploadDonationImage(req.user.id, req.file);
  }

  if (!Object.keys(payload).length) {
    const error = new Error("No updates provided");
    error.status = 400;
    throw error;
  }

  const { error } = await supabase
    .from("donations")
    .update(payload)
    .eq("id", id);

  if (error) throw error;

  res.json({ message: "Donation updated" });
});

exports.deleteDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { id } = req.params;

  const { data: existing } = await supabase
    .from("donations")
    .select("id, donor_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.donor_id !== req.user.id) {
    const error = new Error("Donation not found");
    error.status = 404;
    throw error;
  }

  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) throw error;

  res.json({ message: "Donation deleted" });
});

exports.claimDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["receiver"]);
  const { id } = req.params;

  const { data: donation } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!donation) {
    const error = new Error("Donation not found");
    error.status = 404;
    throw error;
  }

  // Check if donation is available
  if (donation.status !== "available") {
    const error = new Error("Donation is no longer available");
    error.status = 400;
    throw error;
  }

  // Check if donation has expired
  const now = new Date();
  const expiryDate = new Date(donation.expiry_date);
  if (expiryDate <= now) {
    // Mark as expired
    await supabase.from("donations").update({ status: "expired" }).eq("id", id);
    const error = new Error("This donation has expired and is no longer available");
    error.status = 400;
    throw error;
  }

  const { data: existingClaim } = await supabase
    .from("claims")
    .select("*")
    .eq("donation_id", id)
    .eq("receiver_id", req.user.id)
    .maybeSingle();

  if (existingClaim) {
    const error = new Error("You have already claimed this donation");
    error.status = 400;
    throw error;
  }

  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .insert({
      donation_id: id,
      receiver_id: req.user.id,
      status: "pending",
    })
    .select()
    .single();

  if (claimError) throw claimError;

  // Update donation status to claimed
  await supabase.from("donations").update({ status: "claimed" }).eq("id", id);

  res.status(201).json({
    message: "Donation claimed successfully",
    claim,
  });
});

exports.getDonationStats = asyncHandler(async (req, res) => {
  if (req.user.role === "donor") {
    const { data, error } = await supabase
      .from("donations")
      .select("status")
      .eq("donor_id", req.user.id);

    if (error) throw error;

    const stats = data.reduce(
      (acc, item) => {
        acc.total += 1;
        acc.byStatus[item.status] = (acc.byStatus[item.status] || 0) + 1;
        return acc;
      },
      { total: 0, byStatus: {} },
    );

    return res.json(stats);
  }

  if (req.user.role === "receiver") {
    const { data, error } = await supabase
      .from("donations")
      .select("status, expiry_date")
      .eq("status", "available");

    if (error) throw error;

    const soon = data.filter((item) => {
      const hours =
        (new Date(item.expiry_date).getTime() - Date.now()) / 1000 / 60 / 60;
      return hours <= 24;
    }).length;

    return res.json({
      available: data.length,
      expiringSoon: soon,
    });
  }

  res.json({ total: 0 });
});


