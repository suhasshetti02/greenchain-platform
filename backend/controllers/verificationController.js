const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");

exports.getVerificationEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const { data, error } = await supabase
    .from("verification_events")
    .select(
      `
      *,
      donation:donation_id (
        id,
        title,
        donor_id,
        category,
        quantity_lbs,
        status
      )
    `,
    )
    .eq("verification_code", eventId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Verification event not found");
    err.status = 404;
    throw err;
  }

  res.json({
    eventId: data.verification_code,
    donationId: data.donation_id,
    donation: data.donation,
    eventType: data.event_type,
    verified: data.verified_at !== null,
    scheduledFor: data.scheduled_for,
    verifiedAt: data.verified_at,
    dataHash: data.data_hash,
    txHash: data.tx_hash,
    notes: data.notes,
    message: data.verified_at
      ? "Donation verified and recorded"
      : "Pending verification",
  });
});

exports.verifyEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { dataHash, notes } = req.body;

  const { data, error } = await supabase
    .from("verification_events")
    .select("*")
    .eq("verification_code", eventId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Verification event not found");
    err.status = 404;
    throw err;
  }

  if (data.verified_at) {
    const err = new Error("This event has already been verified");
    err.status = 400;
    throw err;
  }

  const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;

  const { data: updated, error: updateError } = await supabase
    .from("verification_events")
    .update({
      verified_at: new Date().toISOString(),
      data_hash: dataHash,
      tx_hash: mockTxHash,
      notes,
    })
    .eq("id", data.id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    message: "Verification recorded successfully",
    event: updated,
    txHash: mockTxHash,
  });
});


