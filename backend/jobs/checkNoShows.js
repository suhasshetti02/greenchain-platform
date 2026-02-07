const supabase = require("../utils/supabase");

/**
 * Checks for pending claims that have passed their scheduled pickup time + grace period.
 * Marks them as 'no_show', alerts the receiver, and updates reputation.
 */
async function checkNoShows(gracePeriodMinutes = 60) {
  const now = new Date();
  // Cutoff time: Anything scheduled BEFORE (now - grace minutes) is overdue.
  const cutoffTime = new Date(now.getTime() - gracePeriodMinutes * 60000).toISOString();

  console.log(`[Job] Running checkNoShows. Cutoff: ${cutoffTime}`);

  // 1. Find overdue pending claims
  const { data: overdueClaims, error } = await supabase
    .from("claims")
    .select(`
      id,
      donation_id,
      receiver_id,
      scheduled_pickup,
      donations (title)
    `)
    .eq("status", "pending")
    .lt("scheduled_pickup", cutoffTime);

  if (error) {
    console.error("[Job] Error fetching overdue claims:", error);
    return { error: error.message };
  }

  if (!overdueClaims || overdueClaims.length === 0) {
    console.log("[Job] No overdue claims found.");
    return { processed: 0 };
  }

  console.log(`[Job] Found ${overdueClaims.length} overdue claims.`);
  
  let processedCount = 0;

  for (const claim of overdueClaims) {
    try {
       // A. Mark Claim as no_show
       await supabase.from("claims").update({ status: "no_show" }).eq("id", claim.id);
       
       // B. Make Donation Available again (or expired?)
       // Let's mark available so someone else can claim.
       await supabase.from("donations").update({ status: "available" }).eq("id", claim.donation_id);

       // C. Update Reputation
       const { data: user } = await supabase.from("users").select("successful_pickups, no_shows").eq("id", claim.receiver_id).single();
       if (user) {
         const newNoShows = (user.no_shows || 0) + 1;
         const success = user.successful_pickups || 0;
         const reliability = Math.round(100 * success / (success + newNoShows + 1));
         
         await supabase.from("users").update({
             no_shows: newNoShows,
             reliability_score: reliability
         }).eq("id", claim.receiver_id);
       }

       // D. Alert Receiver
       const title = claim.donations?.title || "Donation";
       await supabase.from("alerts").insert({
           user_id: claim.receiver_id,
           type: "no_show",
           message: `You missed the pickup for "${title}". This has been marked as a no-show.`,
           is_read: false
       });

       processedCount++;

    } catch (err) {
        console.error(`[Job] Failed to process claim ${claim.id}:`, err);
    }
  }

  return { processed: processedCount };
}

module.exports = checkNoShows;
