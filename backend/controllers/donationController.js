const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");
const { haversineDistance } = require("../utils/location");
const { sendWhatsAppMessage } = require("./whatsappController");


/* =========================
   CONSTANTS & HELPERS
========================= */

const DONATION_SELECT = `
  id,
  title,
  category,
  food_type,
  quantity_lbs,
  unit,
  expiry_date,
  storage,
  priority_score,
  risk_score,
  status,
  location,
  latitude,
  longitude,
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
  const { error } = await supabase.storage
    .from("donations")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    const err = new Error("Unable to upload donation image");
    err.status = 400;
    throw err;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("donations").getPublicUrl(filename);

  return publicUrl;
}

/* =========================
   AI PRIORITY SCORING INTEGRATION
========================= */
async function calculatePriorityAI(payload, legacyPayload) {
  try {
    // Attempt to call Python ML Service
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ML Service returned ${response.status}`);
    }

    const data = await response.json();
    console.log("[AI Service] Prediction:", data);
    return data; // { risk_score, priority, priority_score }

  } catch (error) {
    console.warn("[AI Service] Failed, falling back to legacy rules:", error.message);

    // Fallback: Use Legacy Logic
    const legacyScore = calculatePriorityLegacy(legacyPayload || {});
    return {
      risk_score: null, // Unknown risk if AI fails
      priority: legacyScore > 75 ? "HIGH" : legacyScore > 50 ? "MEDIUM" : "LOW",
      priority_score: legacyScore,
    };
  }
}

/**
 * Legacy Rule-Based Logic (Fallback)
 */
function calculatePriorityLegacy({ food_type, quantity_lbs, storage, hours_since_prepared }) {
  let score = 0;
  const quantity = parseFloat(quantity_lbs);

  // 1. Base Score by Food Type
  const lowerType = (food_type || "").toLowerCase();
  if (["prepared", "cooked"].some((t) => lowerType.includes(t))) score = 80;
  else if (["dairy", "meat", "fish", "seafood"].some((t) => lowerType.includes(t))) score = 70;
  else if (["produce", "fruit", "vegetable"].some((t) => lowerType.includes(t))) score = 60;
  else if (["bakery", "bread"].some((t) => lowerType.includes(t))) score = 50;
  else score = 20;

  // 2. Storage Condition
  const lowerStorage = (storage || "").toLowerCase();
  if (["heated", "warm"].includes(lowerStorage)) score += 15;
  else if (lowerStorage === "room_temp") score += 5;
  else if (lowerStorage === "refrigerated") score -= 5;
  else if (lowerStorage === "frozen") score -= 15;

  // 3. Time Factor
  score += hours_since_prepared * 2;

  // 4. Quantity Factor
  const qtyBonus = Math.min(10, Math.floor(quantity / 10));
  score += qtyBonus;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/* =========================
   CREATE DONATION (AI ENHANCED)
========================= */

exports.createDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);

  const {
    title,
    category,
    food_type,
    quantity_lbs,
    unit = "lbs",
    prepared_at,
    expiry_date,
    storage = "room_temp",
    location,
    latitude,
    longitude,
    pickup_window_start,
    pickup_window_end,
    notes,
  } = req.body;

  if (
    !title ||
    !category ||
    !food_type ||
    !quantity_lbs ||
    !prepared_at ||
    !expiry_date ||
    !location
  ) {
    const err = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }

  /* === AI PRIORITY SCORE === */

  // Calculate generic features with safeguards
  const preparedTime = new Date(prepared_at).getTime();
  const nowTime = Date.now();

  const hours_since_prepared = !isNaN(preparedTime)
    ? Math.max(0, (nowTime - preparedTime) / 3600000)
    : 0;

  const expiryTime = new Date(expiry_date).getTime();
  const expiry_hours_remaining = !isNaN(expiryTime)
    ? (expiryTime - nowTime) / 3600000
    : 24; // Default to 24h if invalid

  // Prepare ML Payload
  // Mappings: 
  // Food Type: 0=Packaged, 1=Produce, 2=Cooked, 3=Dairy/Meat
  let typeCode = 0;
  const lowerType = (food_type || "").toLowerCase();

  if (["dairy", "meat", "fish", "seafood", "eggs"].some(t => lowerType.includes(t))) typeCode = 3;
  else if (["cooked", "prepared", "meal", "hot"].some(t => lowerType.includes(t))) typeCode = 2;
  else if (["produce", "fruit", "veg", "greens"].some(t => lowerType.includes(t))) typeCode = 1;
  else typeCode = 0;

  // Storage: 0=Ambient, 1=Refrigerated, 2=Frozen
  let storageCode = 0;
  const lowerStorage = (storage || "").toLowerCase();

  if (["refrigerated", "cool", "chilled"].some(s => lowerStorage.includes(s))) storageCode = 1;
  else if (["frozen", "freezer"].some(s => lowerStorage.includes(s))) storageCode = 2;
  else storageCode = 0;

  const aiPayload = {
    food_type: typeCode,
    quantity_lbs: parseFloat(quantity_lbs) || 0,
    hours_since_prepared,
    storage_condition: storageCode,
    expiry_hours_remaining
  };

  // Get Scores from AI (or Fallback)
  const legacyPayload = { food_type, quantity_lbs, storage, hours_since_prepared };
  const { risk_score, priority_score, priority } = await calculatePriorityAI(aiPayload, legacyPayload);

  const imageUrl = await uploadDonationImage(req.user.id, req.file);

  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_id: req.user.id,
      title,
      category,
      food_type,
      prepared_at,
      quantity_lbs: parseFloat(quantity_lbs),
      unit,
      expiry_date,
      storage,
      location,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      donor_location_label: location, // Map address to label
      pickup_window_start,
      pickup_window_end,
      notes,
      image_url: imageUrl,
      status: "available",
      priority_score,
      risk_score, // Storing new AI field
    })
    .select("id")
    .single();

  if (error) throw error;

  // --- NOTIFY NEARBY NGOS ---
  if ((latitude && longitude) || location) {
    // Fire and forget notification
    notifyNearbyReceivers({
      title,
      quantity_lbs,
      lat: latitude ? parseFloat(latitude) : null,
      lng: longitude ? parseFloat(longitude) : null,
      locationStr: location
    }).catch(err => console.error("Notification Error:", err));
  }

  res.status(201).json({
    message: "Donation created successfully",
    id: data.id,
    priority_score,
    risk_score,
    ai_priority: priority
  });
});

/* =========================
   HELPER: Notify Nearby Receivers
========================= */
async function notifyNearbyReceivers({ title, quantity_lbs, lat, lng, locationStr }) {
  console.log(`[Notification] Finding receivers near [${lat}, ${lng}] OR matching "${locationStr}"...`);

  // Fetch all receivers (NGOs) with valid location OR address
  const { data: receivers } = await supabase
    .from("users")
    .select("id, name, phone, latitude, longitude, address")
    .eq("role", "receiver");

  if (!receivers || receivers.length === 0) return;

  const NEARBY_RADIUS_KM = 15;
  
  // Helper for Token Match (duplicated from list logic for independence)
  const extractTokens = (str) => {
    if (!str) return [];
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  };
  const hasTokenMatch = (userAddr, donationLoc) => {
    const userTokens = extractTokens(userAddr);
    const donationTokens = extractTokens(donationLoc);
    return userTokens.some(t => donationTokens.includes(t));
  };

  const nearby = receivers.filter(user => {
    // 1. Geometric Match
    if (lat && lng && user.latitude && user.longitude) {
        const dist = haversineDistance(lat, lng, user.latitude, user.longitude);
        if (dist <= NEARBY_RADIUS_KM) return true;
    }
    // 2. Text Match (if coords missing OR geometric failed but text might match? usually one or other)
    // Actually, if we have coords, we trust them. Only fallback to text if coords missing.
    if ((!lat || !lng) && locationStr && user.address) {
        if (hasTokenMatch(user.address, locationStr)) return true;
    }
    return false;
  });

  console.log(`[Notification] Found ${nearby.length} nearby NGOs out of ${receivers.length}.`);

  // Notify each nearby NGO
  for (const ngo of nearby) {
    if (ngo.phone) {
      const msg = `📍 New Donation Alert!\n\n"${title}" (${quantity_lbs} lbs) is available just for you near your location.\nBook it before it's gone!`;
      await sendWhatsAppMessage(ngo.phone, msg);
    }
  }
}

/* =========================
   UPDATE DONATION
========================= */

exports.updateDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { id } = req.params;

  const { data: existing } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.donor_id !== req.user.id) {
    const err = new Error("Donation not found");
    err.status = 404;
    throw err;
  }

  const payload = { ...req.body };
  delete payload.id;

  if (req.file) {
    payload.image_url = await uploadDonationImage(req.user.id, req.file);
  }

  const { error } = await supabase.from("donations").update(payload).eq("id", id);
  if (error) throw error;

  res.json({ message: "Donation updated" });
});

/* =========================
   DELETE DONATION
========================= */

exports.deleteDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { id } = req.params;

  const { data } = await supabase
    .from("donations")
    .select("donor_id")
    .eq("id", id)
    .maybeSingle();

  if (!data || data.donor_id !== req.user.id) {
    const err = new Error("Donation not found");
    err.status = 404;
    throw err;
  }

  await supabase.from("donations").delete().eq("id", id);
  res.json({ message: "Donation deleted" });
});

/* =========================
   CLAIM DONATION
========================= */

exports.claimDonation = asyncHandler(async (req, res) => {
  assertRole(req, ["receiver"]);
  const { id } = req.params;

  const { data: donation } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!donation || donation.status !== "available") {
    const err = new Error("Donation unavailable");
    err.status = 400;
    throw err;
  }

  const { scheduled_pickup } = req.body;

  // 1️⃣ Create claim (THIS is the workflow state)
  await supabase.from("claims").insert({
    donation_id: id,
    receiver_id: req.user.id,
    status: "pending",
    scheduled_pickup: scheduled_pickup || null,
  });

  // 🚫 DO NOT UPDATE donations.status HERE
  // Keeping it "available" avoids DB constraint violations
  // Approval flow is handled through claims.status

  /* === NOTIFICATION === */
  const { data: receiver } = await supabase
    .from("users")
    .select("name")
    .eq("id", req.user.id)
    .single();

  const receiverName = receiver?.name || "A generic NGO";

  const { data: donor } = await supabase
    .from("users")
    .select("phone, name")
    .eq("id", donation.donor_id)
    .single();

  if (donor && donor.phone) {
    console.log(`[Claim] Notifying donor ${donor.name} (${donor.phone}) about claim by ${receiverName}`);
    try {
      await sendWhatsAppMessage(
        donor.phone,
        `Hello ${donor.name}, ${receiverName} has requested to claim your donation "${donation.title}".\n\nReply "YES" to approve or "NO" to decline.`
      );
      console.log(`[Claim] Notification sent to donor.`);
    } catch (err) {
      console.error(`[Claim] Failed to notify donor:`, err);
    }
  } else {
    console.warn(`[Claim] Donor for donation ${id} has no phone number. Cannot notify.`);
  }

  await supabase.from("alerts").insert({
    user_id: donation.donor_id,
    type: "donation_claimed",
    message: `Your donation "${donation.title}" has been claimed by ${receiverName}. Check WhatsApp to confirm.`,
    is_read: false,
  });

  res.json({
    message: "Donation claimed successfully. Waiting for donor confirmation."
  });
});


/* =========================
   LIST ALL DONATIONS (Admin/Debug)
========================= */
exports.listDonations = asyncHandler(async (req, res) => {
  let query = supabase
    .from("donations")
    .select(DONATION_SELECT)
    .order("created_at", { ascending: false });

  // Filter 1: Optional Status from Query
  if (req.query.status) {
    query = query.eq("status", req.query.status);
  }

  // Filter 2: DATA ISOLATION
  // For unauthenticated users, only show available donations
  // For authenticated users, allow them to see all statuses

  if (!req.user && (!req.query.status || req.query.status !== 'available')) {
    // Public access: only show available donations
    query = query.eq("status", "available");
  }

  // DEBUG LOGGING
  console.log("--- listDonations DEBUG ---");
  console.log("User:", req.user ? req.user.id : "Guest");
  console.log("Query Status:", req.query.status);

  const { data, error } = await query;

  console.log("Found count:", data ? data.length : 0);
  if (data && data.length === 0) {
    // Double check if ANY claimed exist
    const check = await supabase.from('donations').select('id, status').eq('status', 'claimed').limit(1);
    console.log("Are there ANY claimed in DB?", check.data);
  }
  console.log("---------------------------");

  if (error) throw error;
  res.json({ donations: data });
});

/* =========================
   LIST MY DONATIONS (Donor)
========================= */
exports.listMyDonations = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { data, error } = await supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("donor_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json({ donations: data });
});

/* =========================
   LIST AVAILABLE (Receiver)
========================= */
exports.listAvailableDonations = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const now = new Date().toISOString();

  let query = supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("status", "available")
    .gt("expiry_date", now);

  // If no location provided, just sort by priority
  if (!lat || !lng) {
    query = query.order("priority_score", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  /* ============================================================
     TOKEN MATCHING HELPER
     Extracts "significant" words (len > 3) to match cities/areas
  ============================================================ */
  const extractTokens = (str) => {
    if (!str) return [];
    return str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // remove special chars
      .split(/\s+/)
      .filter(w => w.length > 3); // only keep "big" words (e.g. "bangalore", "whitefield")
  };

  const hasTokenMatch = (userAddr, donationLoc) => {
    const userTokens = extractTokens(userAddr);
    const donationTokens = extractTokens(donationLoc);
    // Return true if ANY significant token overlaps
    return userTokens.some(t => donationTokens.includes(t));
  };

  // Determine User Coordinates & Address
  let userLat = lat ? parseFloat(lat) : null;
  let userLng = lng ? parseFloat(lng) : null;
  let userAddress = null;

  // If receiver is logged in, fetch their stored location & address
  if (req.user && req.user.role === 'receiver') {
    const { data: userData } = await supabase
      .from('users')
      .select('latitude, longitude, address')
      .eq('id', req.user.id)
      .single();

    if (userData) {
      if (!userLat && !userLng && userData.latitude && userData.longitude) {
        userLat = userData.latitude;
        userLng = userData.longitude;
      }
      userAddress = userData.address;
    }
  }

  // Calculate Distances & Filter
  if (userLat && userLng) {
    results = data.map(d => {
      // CASE 1: Donation has coordinates -> Geometric Distance
      if (d.latitude && d.longitude) {
        const dist = haversineDistance(userLat, userLng, d.latitude, d.longitude);
        return { ...d, distance_km: dist };
      }
      
      // CASE 2: Donation has NO coordinates (Text-Only) -> Strict Token Match
      if (userAddress && d.location && hasTokenMatch(userAddress, d.location)) {
         return { ...d, distance_km: 5 }; // Treat as "Nearby"
      }

      // Default: irrelevant / far
      return { ...d, distance_km: 9999 };
    });

    // FILTER: Only show donations within 30km
    // This removes distant geometric matches AND non-matching text locations (9999km)
    results = results.filter(d => d.distance_km <= 30);

    results.sort((a, b) => {
      // Primary sort: Distance (Ascending)
      return a.distance_km - b.distance_km;
    });

  } else if (userAddress) {
    // Fallback: No coordinates, filtering purely by address token match
    results = results.filter(d => {
      if (!d.location) return false; 
      return hasTokenMatch(userAddress, d.location);
    });
  } else {
    // Fallback: No user address/coords at all? 
    // Show everything (or nothing?). Currently showing all available sorted by priority as per pre-existing logic if !lat/lng
    // If we want strict privacy, we could return empty, but let's keep it open for guests until specified otherwise.
  }

  res.json({ donations: results });
});

/* =========================
   GET SINGLE DONATION
========================= */
exports.getDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("donations")
    .select(DONATION_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    const err = new Error("Donation not found");
    err.status = 404;
    throw err;
  }
  res.json(data);
});

/* =========================
   GET STATS
========================= */
exports.getDonationStats = asyncHandler(async (req, res) => {
  const { count: available, error: err1 } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("status", "available")
    .gt("expiry_date", new Date().toISOString());

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { count: expiringSoon, error: err2 } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("status", "available")
    .lt("expiry_date", tomorrow)
    .gt("expiry_date", new Date().toISOString());

  let userStats = {};
  if (req.user.role === "donor") {
    const { data } = await supabase.from("donations").select("status").eq("donor_id", req.user.id);
    userStats = {
      total: data?.length || 0,
      completed: data?.filter(d => d.status === "completed").length || 0,
      available: data?.filter(d => d.status === "available").length || 0,
    };
  }

  if (err1 || err2) throw new Error("Unable to fetch stats");

  res.json({
    available: available || 0,
    expiringSoon: expiringSoon || 0,
    byStatus: userStats
  });
});

/* =========================
   CONFIRM PICKUP (Donor)
========================= */
exports.confirmPickup = asyncHandler(async (req, res) => {
  assertRole(req, ["donor"]);
  const { id } = req.params;
  const { confirmed } = req.body; // true = completed, false = no-show

  // 1. Get Claim
  // We need the latest claim for this donation
  const { data: claim, error: claimError } = await supabase
    .from('claims')
    .select('id, receiver_id, status')
    .eq('donation_id', id)
    .order('created_at', { ascending: false }) // Latest
    .limit(1)
    .single();

  if (claimError || !claim) {
    throw new Error("No active claim found for this donation");
  }

  // Verify donation belongs to donor? Implicit via getting donation first?
  // Let's check donation ownership to be safe.
  const { data: donation } = await supabase.from('donations').select('donor_id, title').eq('id', id).single();
  if (donation.donor_id !== req.user.id) {
    const err = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }

  const receiverId = claim.receiver_id;
  /* FIX: DB Constraint only allows [pending, accepted, completed, cancelled] */
  /* 'confirmed' is invalid. We map 'confirmed' action to 'accepted' status. */
  let newClaimStatus = confirmed ? 'accepted' : 'no_show';
  /* Wait, 'no_show' is also likely invalid if constraint is strict? */
  /* If confirmed=false (no-show), maybe we set it to 'cancelled'? or check if 'no_show' is in DB? */
  /* The ALLOWED_STATUSES array in claimController did NOT have 'no_show'. */
  /* Let's verify if 'no_show' works? User logs didn't fail on 'no_show' but on 'confirmed' */
  /* Actually, let's look at the error: violation of check constraint. */
  /* If I try 'no_show', it might also fail. */
  /* Safe bet: 'cancelled' for no-show? Or does the user schema allow 'no_show'? */
  /* User report: `violations check constraint "claims_status_check"` */
  /* It is safest to assume strict match to ALLOWED_STATUSES found in code: pending, accepted, completed, cancelled */

  if (!confirmed) {
    newClaimStatus = 'cancelled'; // Mapping no-show/rejection to cancelled
  }

  let newDonationStatus = confirmed ? 'completed' : 'available';

  /* DEBUG LOGGING UPDATE REMOVED */

  const { error: updateClaimError } = await supabase.from('claims').update({ status: newClaimStatus }).eq('id', claim.id);
  if (updateClaimError) throw updateClaimError;

  const { error: updateDonationError } = await supabase.from('donations').update({ status: newDonationStatus }).eq('id', id);
  if (updateDonationError) throw updateDonationError;

  // 3a. Update Receiver Reputation
  // Fetch current stats
  const { data: receiverProxy } = await supabase.from('users').select('successful_pickups, no_shows').eq('id', receiverId).single();

  let successCount = receiverProxy.successful_pickups || 0;
  let noShowCount = receiverProxy.no_shows || 0;

  if (confirmed) successCount++;
  else noShowCount++;

  const reliability = Math.round(100 * successCount / (successCount + noShowCount + 1));

  await supabase.from('users').update({
    successful_pickups: successCount,
    no_shows: noShowCount,
    reliability_score: reliability
  }).eq('id', receiverId);

  // 3b. Update Donor Impact (successful_pickups for donor)
  if (confirmed) {
    const { data: donorProxy } = await supabase.from('users').select('successful_pickups').eq('id', donation.donor_id).single();
    const donorSuccess = (donorProxy?.successful_pickups || 0) + 1;
    await supabase.from('users').update({ successful_pickups: donorSuccess }).eq('id', donation.donor_id);
  }

  // 4. Alert Receiver
  const msg = confirmed
    ? `Your pickup for "${donation.title}" was confirmed. Good job!`
    : `You were marked as no-show for "${donation.title}". This affects your reliability score.`;

  await supabase.from('alerts').insert({
    user_id: receiverId,
    type: confirmed ? 'pickup_confirmed' : 'no_show',
    message: msg,
    is_read: false
  });

  res.json({
    message: confirmed ? "Pickup confirmed" : "Marked as no-show",
    reliability_score: reliability
  });
});
