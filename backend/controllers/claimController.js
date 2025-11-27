const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");

const ALLOWED_STATUSES = ["pending", "accepted", "completed", "cancelled"];

function assertReceiver(req) {
  if (req.user.role !== "receiver") {
    const error = new Error("Only receivers can manage claims");
    error.status = 403;
    throw error;
  }
}

exports.getMyClaims = asyncHandler(async (req, res) => {
  assertReceiver(req);

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      *,
      donation:donation_id (
        id,
        title,
        category,
        location,
        status,
        expiry_date
      )
    `,
    )
    .eq("receiver_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  res.json({ claims: data ?? [] });
});

exports.updateClaimStatus = asyncHandler(async (req, res) => {
  assertReceiver(req);
  const { id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  const { data: claim } = await supabase
    .from("claims")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!claim || claim.receiver_id !== req.user.id) {
    const error = new Error("Claim not found");
    error.status = 404;
    throw error;
  }

  const { error: updateError } = await supabase
    .from("claims")
    .update({ status })
    .eq("id", id);

  if (updateError) throw updateError;

  if (status === "completed") {
    await supabase
      .from("donations")
      .update({ status: "completed" })
      .eq("id", claim.donation_id);
  } else if (status === "accepted") {
    await supabase
      .from("donations")
      .update({ status: "in_transit" })
      .eq("id", claim.donation_id);
  }

  res.json({ message: "Claim updated" });
});


