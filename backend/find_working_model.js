require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp"
];

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    console.log(`Testing ${modelName}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            }),
        });

        if (response.ok) {
            console.log(`✅ SUCCESS: ${modelName} is working!`);
            return modelName;
        } else {
            console.log(`❌ FAILED: ${modelName} (Status: ${response.status})`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${modelName} (${e.message})`);
    }
    return null;
}

async function run() {
    console.log("Searching for working Gemini model...");
    for (const model of MODELS_TO_TRY) {
        const working = await testModel(model);
        if (working) break;
    }
}

run();
