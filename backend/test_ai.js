require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Try a standard stable model first
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

async function testAI() {
    console.log("Testing Gemini API with Key:", GEMINI_API_KEY ? "Present" : "MISSING");

    const prompt = "Say hello";

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        const data = await response.json();
        console.log("Response Status:", response.status);

        if (data.error) {
            console.error("Gemini Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Success! Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

testAI();
