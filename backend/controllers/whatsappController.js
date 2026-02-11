const twilio = require("twilio");
const supabase = require("../utils/supabase");
const asyncHandler = require("../utils/asyncHandler");

/* ===============================
   TWILIO CONFIG
=============================== */
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

        // 2. Geocode Location - DISABLED AS PER USER REQUEST
        // User explicitly requested to stop using geocoding due to network errors.
        // We will only store the text location.
        let latitude = null;
        let longitude = null;

        /* 
        // LEGACY GEOCODING LOGIC (Removed)
        if (extracted.location && extracted.location !== "Not provided") {
            try {
                // ... fetch logic ...
            } catch (geoErr) { ... }
        }
        */
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

        const msg = await client.messages.create({
            from: TWILIO_FROM,
            to: toNumber,
            body,
        });

        console.log(`[WhatsApp] Sent (SID: ${msg.sid}, Status: ${msg.status}) to ${toNumber}`);
    } catch (err) {
        console.error("[WhatsApp] Error:", err.message);
    }
}

/* ===============================
   GEMINI FOOD + LOCATION PARSER
=============================== */
/* ===============================
   GEMINI FOOD + LOCATION PARSER
=============================== */
async function parseFoodReportAI(text) {
    console.log("[Gemini] Preparing request for:", text);

    const prompt = `
You are an AI assistant for a food donation platform. Analyze the following message and extract the details.

User Message: "${text}"

Return ONLY valid JSON with this structure:
{
  "title": "Short descriptive title of the food (e.g., '5kg Rice')",
  "food_type": "One of: cooked, produce, dairy, bakery, other",
  "quantity_lbs": "Estimated weight in lbs (number only, default 5 if unknown)",
  "storage": "One of: room_temp, refrigerated, frozen (default room_temp)",
  "expiry_hours": "Estimated hours until expiry (number only, default 24)",
  "location": "City or area name if mentioned (e.g., 'Whitefield, Bangalore'). If not found, return 'Not provided'"
}
`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Gemini] API Error ${response.status}: ${errText}`);
            // Fallback: Create a basic entry
            return { 
                title: text.substring(0, 200), 
                food_type: "other", 
                quantity_lbs: 5, 
                storage: "room_temp",
                location: "Not provided" 
            };
        }

        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        console.log("[Gemini] Response:", raw);

        if (!raw) {
             console.warn("[Gemini] Empty response from AI");
             return { title: text.substring(0, 200), food_type: "other", quantity_lbs: 5, storage: "room_temp", location: "Not provided" };
        }

        // Robust JSON extraction
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : raw;

        return JSON.parse(jsonString);
    } catch (err) {
        console.error("[Gemini] Parsing error:", err.message);
        return {
            title: text.substring(0, 200),
            food_type: "other",
            quantity_lbs: 5,
            storage: "room_temp",
            expiry_hours: 24,
            location: "Not provided"
        };
    }
}

/* ===============================
   WHATSAPP WEBHOOK HANDLER
=============================== */
exports.handleIncomingMessage = async (req, res) => {
    // 1. Acknowledge Twilio immediately to prevent 15s timeout
    // Twilio requires a 200 OK with TwiML (or empty TwiML)
    res.status(200).send("<Response></Response>");

    try {
        const { From, Body } = req.body;

        if (!From || !Body) {
            console.warn("[WhatsApp] Missing From or Body in request");
            return;
        }

        const message = Body.trim();
        const cmd = message.toUpperCase();

        const rawPhone = From.replace("whatsapp:", "");
        // Extract last 10 digits to match database formats typically stored without country code or with inconsistent formats
        const last10 = rawPhone.replace(/\D/g, "").slice(-10);

        /* ===============================
           USER LOOKUP
        =============================== */
        const { data: users, error: userError } = await supabase
            .from("users")
            .select("id, name, phone, role")
            .or(`phone.eq.${rawPhone},phone.ilike.%${last10}`)
            .limit(1);

        if (userError) {
            console.error("[WhatsApp] User lookup error:", userError);
            return;
        }

        const user = users?.[0];
        if (!user) {
            await sendWhatsAppMessage(
                From,
                "Please register in GreenChain app to use WhatsApp donations."
            );
            return;
        }

        /* ===============================
           DONOR YES / NO HANDLER
        =============================== */
        if (["YES", "Y", "NO", "N"].includes(cmd)) {
            const { data: donations } = await supabase
                .from("donations")
                .select("id")
                .eq("donor_id", user.id);

            const donationIds = donations?.map(d => d.id) || [];

            if (donationIds.length === 0) {
                await sendWhatsAppMessage(From, "No active donations found to manage.");
                return;
            }

            const { data: claim } = await supabase
                .from("claims")
                .select(`
            id,
            donation_id,
            receiver_id,
            receiver:receiver_id ( name, phone ),
            donation:donation_id ( title )
          `)
                .in("donation_id", donationIds)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (!claim) {
                await sendWhatsAppMessage(From, "No pending pickup requests found.");
                return;
            }

            if (cmd === "YES" || cmd === "Y") {
                await supabase.from("claims")
                    .update({ status: "accepted" })
                    .eq("id", claim.id);

                // AUTO-REJECT other claims for this donation
                await supabase.from("claims")
                    .update({ status: "cancelled" })
                    .eq("donation_id", claim.donation_id)
                    .neq("id", claim.id);

                await supabase.from("donations")
                    .update({ status: "in_transit" })
                    .eq("id", claim.donation_id);

                await sendWhatsAppMessage(
                    From,
                    `✅ Pickup approved for "${claim.donation.title}". Other claims have been cancelled.`
                );

                if (claim.receiver?.phone) {
                    await sendWhatsAppMessage(
                        claim.receiver.phone,
                        `🎉 Donor approved your pickup for "${claim.donation.title}".`
                    );
                }
            } else {
                // REJECT
                await supabase.from("claims")
                    .update({ status: "cancelled" }) // Changed from rejected to cancelled to match typical enum
                    .eq("id", claim.id);

                await supabase.from("donations")
                    .update({ status: "available" })
                    .eq("id", claim.donation_id);

                await sendWhatsAppMessage(
                    From,
                    `❌ Pickup rejected for "${claim.donation.title}".`
                );

                if (claim.receiver?.phone) {
                    await sendWhatsAppMessage(
                        claim.receiver.phone,
                        `❌ Donor rejected your pickup request for "${claim.donation.title}".`
                    );
                }
            }

            return;
        }

        /* ===============================
           FOOD DONATION MESSAGE
        =============================== */
        // Send processing message first so user knows something is happening
        await sendWhatsAppMessage(From, "🤖 Processing your donation...");

        // 1. Extract Details (AI + Regex Fallback)
        let extracted = await parseFoodReportAI(message);
        
        // Fallback: If AI returned "Not provided", try regex extraction
        if (!extracted.location || extracted.location === "Not provided") {
            const locationMatch = message.match(/(?:at|in|near)\s+([a-zA-Z\s,]+)(?=$|[\n.])/i);
            if (locationMatch && locationMatch[1]) {
                extracted.location = locationMatch[1].trim();
                console.log("[WhatsApp] Regex extracted location:", extracted.location);
            }
        }

        if (!extracted || !extracted.title) {
            await sendWhatsAppMessage(
                From,
                "Couldn't understand.\nExample: '5kg cooked rice at Bengaluru'"
            );
            return;
        }

        // 2. Geocode Location - DISABLED
        let latitude = null;
        let longitude = null;

        // Geocoding block removed as per user request to avoid fetch errors.
        // if (extracted.location && extracted.location !== "Not provided") { ... }

        const { error } = await supabase.from("donations").insert({
            donor_id: user.id,
            title: extracted.title,
            food_type: extracted.food_type,
            category: extracted.food_type,
            quantity_lbs: extracted.quantity_lbs || 5,
            unit: "lbs",
            storage: extracted.storage || "room_temp",
            expiry_date: new Date(
                Date.now() + (extracted.expiry_hours || 24) * 3600000
            ).toISOString(),
            status: "available",
            location: extracted.location || "Not provided",
            latitude,
            longitude,
            priority_score: 50,
            risk_score: 0.1,
            notes: `Reported via WhatsApp: "${message}"`,
        });

        if (error) {
            console.error("[WhatsApp] Donation insert error:", error);
            await sendWhatsAppMessage(From, "❌ Failed to save donation.");
        } else {
            await sendWhatsAppMessage(
                From,
                `✅ Donation listed successfully!`
            );
        }

    } catch (err) {
        console.error("[WhatsApp] Background processing error:", err);
        // Do not send error response since we already sent 200 OK
    }
};

/* ===============================
   EXPORT
=============================== */
exports.sendWhatsAppMessage = sendWhatsAppMessage;
