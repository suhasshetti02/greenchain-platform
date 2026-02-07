require("dotenv").config();
const fs = require("fs");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function listModels() {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            const names = data.models.map(m => m.name).join("\n");
            fs.writeFileSync("models.txt", names);
            console.log("Wrote models to models.txt");
        } else {
            console.error("Error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

listModels();
