const asyncHandler = require("../utils/asyncHandler");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// gemini-1.5 is NOT available for this key. Using standard gemini-2.0-flash.
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Get AI-powered food spoilage time suggestion
 * POST /api/ai/spoilage-suggestion
 */
exports.getSpoilageSuggestion = asyncHandler(async (req, res) => {
  const { food_type, prepared_time, storage, quantity, title } = req.body;

  // Validate required fields
  if (!food_type || !storage) {
    const error = new Error("Missing required fields: food_type and storage");
    error.status = 400;
    throw error;
  }

  // Construct structured prompt
  const prompt = `You are a food safety assistant helping estimate spoilage times for surplus food redistribution in India.

CRITICAL: You must respect the "Storage condition" provided below. Do NOT assume optimal storage. If the user says "Room Temperature", assume the food is currently at room temperature in a warm Indian climate (approx. 25-30°C / 77-86°F).

Context:
Food item: ${title || 'Not specified'}
Food type/category: ${food_type}
Prepared time: ${prepared_time || 'Not specified'}
Storage condition: ${storage}
Quantity: ${quantity || 'Not specified'}

Task: 
Estimate safe consumption time based strictly on the provided storage condition.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "suggested_hours": <number>,
  "risk_level": "<low|medium|high>",
  "explanation": "<Short practical explanation in 1-2 sentences. Mention the storage condition in your explanation.>"
}

Guidelines for Indian Climate (Warm):
- Cooked food (Room Temp): Very High Risk. Max 3-4 hours.
- Cooked food (Refrigerated): Safe for 24-48 hours.
- Dairy (Room Temp): High Risk. Spoilage within 2-4 hours.
- Bakery (Room Temp): 24-48 hours.
- Fruits/Vegetables (Room Temp): 24-48 hours (accelerated ripening).
- Refrigerated items: significantly extended shelf life.

This is a general advisory suggestion only.`;

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Call Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 256,
          },
        }),
      });

      if (!response.ok) {
        // Handle 429 Rate Limit specifically to reduce noise
        if (response.status === 429) {
          throw new Error("Rate limit exceeded (429)");
        }
        
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Extract text from Gemini response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      // Parse JSON response
      let suggestion;
      try {
        // Clean the response (remove markdown code blocks if present)
        const cleanedText = generatedText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        suggestion = JSON.parse(cleanedText);
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }

      // Validate response structure
      if (
        typeof suggestion.suggested_hours !== 'number' ||
        !['low', 'medium', 'high'].includes(suggestion.risk_level) ||
        typeof suggestion.explanation !== 'string'
      ) {
        throw new Error("Invalid AI response structure");
      }

      // Success! Return the result
      return res.json({
        success: true,
        suggestion,
      });

    } catch (error) {
      lastError = error;
      
      // Simplified logging: Only log generic message for 429 to avoid terminal clutter
      if (error.message.includes("429")) {
         console.warn(`AI Attempt ${attempt}/${maxRetries}: Rate limit hit. Retrying...`);
      } else {
         console.error(`AI Spoilage Suggestion Error (Attempt ${attempt}/${maxRetries}):`, error.message);
      }
      
      // If not the last attempt, wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed - use fallback logic
  console.warn("AI API failed, using rule-based fallback");
  
  const fallbackSuggestion = getFallbackSuggestion(food_type, storage, title);
  
  res.json({
    success: true,
    suggestion: fallbackSuggestion,
    isFallback: true
  });
});

/**
 * Helper: Get rule-based suggestion when AI is down/limited
 */
function getFallbackSuggestion(category, storage, title) {
  // Normalize inputs
  const cat = category?.toLowerCase() || "";
  const store = storage?.toLowerCase() || "";
  const name = title?.toLowerCase() || "";
  
  let hours = 24;
  let risk = "medium";
  let explanation = "Standard spoilage estimate based on food safety guidelines.";

  // Rule 1: High risk items (Cooked/Prepared food)
  if ((cat.includes("cooked") || cat.includes("prepared")) && store.includes("room")) {
    hours = 4;
    risk = "high";
    explanation = "Cooked food left at room temperature grows bacteria rapidly and should be consumed within 4 hours.";
  }
  // Rule 2: Dairy/Meat
  else if (cat.includes("dairy") || cat.includes("meat")) {
    if (store.includes("refrig")) {
      hours = 24;
      risk = "medium";
      explanation = "Dairy and meat must be kept refrigerated. Consume within 24 hours for best safety.";
    } else if (store.includes("frozen")) {
      hours = 72;
      risk = "low";
      explanation = "Frozen items stay safe longer, but ensure they remain frozen until pickup.";
    } else {
      hours = 2;
      risk = "high";
      explanation = "Dairy/Meat left at room temperature spoils dangerously fast.";
    }
  }
  // Rule 3: Produce
  else if (cat.includes("fruit") || cat.includes("veg") || cat.includes("produce")) {
    if (store.includes("room")) {
      hours = 48; // 2 days
      risk = "low";
      explanation = "Fresh produce typically stays good for 2-3 days at room temperature.";
    } else {
      hours = 120; // 5 days
      risk = "low";
      explanation = "Refrigeration extends the life of most produce significantly.";
    }
  }
  // Rule 4: Canned/Packaged
  else if (cat.includes("canned") || cat.includes("packaged")) {
    hours = 72;
    risk = "low";
    explanation = "Packaged goods generally have longer shelf life. Check individual expiry dates.";
  }
  // Rule 5: Bakery
  else if (cat.includes("bakery") || cat.includes("bread")) {
    hours = 48;
    risk = "medium";
    explanation = "Bakery items tend to go stale within 2 days.";
  }
  // Rule 6: Frozen (General)
  else if (store.includes("frozen")) {
    hours = 72;
    risk = "low";
    explanation = "Frozen storage significantly extends shelf life.";
  }
  // Default for refrigerated
  else if (store.includes("refrig")) {
    hours = 48;
    risk = "low";
    explanation = "Refrigeration slows bacterial growth. Most foods are safe for 48 hours.";
  }

  return {
    suggested_hours: hours,
    risk_level: risk,
    explanation: explanation + " (Automated estimation)"
  };
}
