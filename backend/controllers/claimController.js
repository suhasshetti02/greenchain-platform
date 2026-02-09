// const supabase = require("../utils/supabase");
// const asyncHandler = require("../utils/asyncHandler");

// const ALLOWED_STATUSES = ["pending", "accepted", "completed", "cancelled"];

// function assertReceiver(req) {
//   if (req.user.role !== "receiver") {
//     const error = new Error("Only receivers can manage claims");
//     error.status = 403;
//     throw error;
//   }
// }

// exports.getMyClaims = asyncHandler(async (req, res) => {
//   assertReceiver(req);

//   const { data, error } = await supabase
//     .from("claims")
//     .select(
//       `
//       *,
//       donation:donation_id (
//         id,
//         title,
//         category,
//         location,
//         status,
//         expiry_date,
//         donor:donor_id (
//           name,
//           phone
//         )
//       )
//     `,
//     )
//     .eq("receiver_id", req.user.id)
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   res.json({ claims: data ?? [] });
// });

// exports.updateClaimStatus = asyncHandler(async (req, res) => {
//   assertReceiver(req);
//   const { id } = req.params;
//   const { status, scheduled_pickup } = req.body;

//   if (status && !ALLOWED_STATUSES.includes(status)) {
//     const error = new Error("Invalid status");
//     error.status = 400;
//     throw error;
//   }

//   const { data: claim } = await supabase
//     .from("claims")
//     .select("*")
//     .eq("id", id)
//     .maybeSingle();

//   if (!claim || claim.receiver_id !== req.user.id) {
//     const error = new Error("Claim not found");
//     error.status = 404;
//     throw error;
//   }

//   const updates = {};
//   if (status) updates.status = status;
//   if (scheduled_pickup) updates.scheduled_pickup = scheduled_pickup;

//   if (Object.keys(updates).length === 0) {
//     res.json({ message: "No changes provided" });
//     return;
//   }

//   const { error: updateError } = await supabase
//     .from("claims")
//     .update(updates)
//     .eq("id", id);

//   if (updateError) throw updateError;

//   if (status === "completed") {
//     await supabase
//       .from("donations")
//       .update({ status: "completed" })
//       .eq("id", claim.donation_id);
//   } else if (status === "accepted") {
//     await supabase
//       .from("donations")
//       .update({ status: "in_transit" })
//       .eq("id", claim.donation_id);
//   }

//   /* === ALERT LOGIC === */
//   const { data: claimDetails } = await supabase
//     .from("claims")
//     .select(`
//       *,
//       donation:donation_id (title, donor_id)
//     `)
//     .eq("id", id)
//     .single();

//   if (claimDetails?.donation) {
//     let alertMessage = "";
//     const donationTitle = claimDetails.donation.title;
//     const donorId = claimDetails.donation.donor_id;

//     if (status === "accepted") {
//       alertMessage = `Your donation "${donationTitle}" has been picked up and is on its way.`;
//     } else if (status === "completed") {
//       alertMessage = `Your donation "${donationTitle}" was successfully delivered. Thank you!`;
//     }

//     if (alertMessage) {
//       await supabase.from("alerts").insert({
//         user_id: donorId,
//         type: "status_update",
//         message: alertMessage,
//         is_read: false,
//       });
//     }
//   }

//   res.json({ message: "Claim updated" });
// });




const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");
const twilio = require("twilio");

/* ===============================
   TWILIO CONFIG
=============================== */
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

async function sendWhatsAppMessage(to, body) {
  try {
    // 1. Normalize Phone Number
    // Remove "whatsapp:" prefix if present
    let raw = to.replace("whatsapp:", "").trim();
    
    // Remove all non-numeric characters (keep digits only)
    let cleanPhone = raw.replace(/\D/g, "");

    // Default to India (+91) if only 10 digits provided
    if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
    }

    const toNumber = `whatsapp:+${cleanPhone}`;

    await client.messages.create({
      from: TWILIO_FROM,
      to: toNumber,
      body,
    });

    console.log("[WhatsApp] Sent:", body);
  } catch (err) {
    console.error("[WhatsApp] Error:", err.message);
  }
}

const ALLOWED_STATUSES = ["pending", "accepted", "completed", "rejected"];

function assertReceiver(req) {
  if (req.user.role !== "receiver") {
    const error = new Error("Only receivers can manage claims");
    error.status = 403;
    throw error;
  }
}

/* ===============================
   GET MY CLAIMS
=============================== */
exports.getMyClaims = asyncHandler(async (req, res) => {
  assertReceiver(req);

  const { data, error } = await supabase
    .from("claims")
    .select(`
      *,
      donation:donation_id (
        id,
        title,
        category,
        location,
        status,
        quantity_lbs,
        expiry_date,
        donor:donor_id (
          id,
          name,
          phone
        )
      )
    `)
    .eq("receiver_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  res.json({ claims: data ?? [] });
});

/* ===============================
   CREATE CLAIM (RECEIVER CLAIMS DONATION)
=============================== */
exports.createClaim = asyncHandler(async (req, res) => {
  assertReceiver(req);

  const { donation_id } = req.body;

  // Get donation + donor
  const { data: donation } = await supabase
    .from("donations")
    .select("id, title, donor_id, status")
    .eq("id", donation_id)
    .single();

  if (!donation || donation.status !== "available") {
    throw new Error("Donation not available for claim");
  }

  // Create claim
  const { data: claim, error } = await supabase
    .from("claims")
    .insert({
      donation_id,
      receiver_id: req.user.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  // Update donation status → requested
  await supabase
    .from("donations")
    .update({ status: "requested" })
    .eq("id", donation_id);

  // Fetch donor details
  const { data: donor } = await supabase
    .from("users")
    .select("name, phone")
    .eq("id", donation.donor_id)
    .single();

  // Notify donor via WhatsApp
  if (donor?.phone) {
    await sendWhatsAppMessage(
      donor.phone,
      `📦 ${req.user.name} has claimed your donation "${donation.title}".\n\nReply YES to approve or NO to reject.`
    );
  }

  res.json({ message: "Claim created, donor notified", claim });
});

/* ===============================
   UPDATE CLAIM STATUS (RECEIVER SIDE)
=============================== */
exports.updateClaimStatus = asyncHandler(async (req, res) => {
  assertReceiver(req);

  const { id } = req.params;
  const { status, scheduled_pickup } = req.body;

  if (status && !ALLOWED_STATUSES.includes(status)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const { data: claim } = await supabase
    .from("claims")
    .select("*")
    .eq("id", id)
    .single();

  if (!claim || claim.receiver_id !== req.user.id) {
    const error = new Error("Claim not found");
    error.status = 404;
    throw error;
  }

  const updates = {};
  if (status) updates.status = status;
  if (scheduled_pickup) updates.scheduled_pickup = scheduled_pickup;

  await supabase.from("claims").update(updates).eq("id", id);

  // Sync donation status
  if (status === "completed") {
    await supabase
      .from("donations")
      .update({ status: "completed" })
      .eq("id", claim.donation_id);
  }

  // Notify donor on completion
  if (status === "completed") {
    const { data: donation } = await supabase
      .from("donations")
      .select("title, donor_id")
      .eq("id", claim.donation_id)
      .single();

    const { data: donor } = await supabase
      .from("users")
      .select("phone")
      .eq("id", donation.donor_id)
      .single();

    if (donor?.phone) {
      await sendWhatsAppMessage(
        donor.phone,
        `✅ Your donation "${donation.title}" has been successfully delivered. Thank you!`
      );
    }
  }

  res.json({ message: "Claim updated successfully" });
});
