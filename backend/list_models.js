require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function listModels() {
    console.log("Listing Gemini Models...");

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            const flash = data.models.find(m => m.name.includes("gemini-1.5-flash"));
            const anyGemini = data.models.find(m => m.name.includes("gemini"));

            console.log("CHOSEN MODEL: " + (flash ? flash.name : anyGemini.name));
        } else {
            console.error("Error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

listModels();
