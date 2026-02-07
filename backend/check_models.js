require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listModels() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    
    const fs = require('fs');
    if (data.models) {
      fs.writeFileSync('models.json', JSON.stringify(data.models.map(m => m.name), null, 2));
      console.log("Models written to models.json");
    } else {
      console.log("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Request Failed:", error.message);
  }
}

listModels();
