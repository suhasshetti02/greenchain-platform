require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const CONFIGS = [
    { version: "v1beta", model: "gemini-1.5-flash" },
    { version: "v1beta", model: "gemini-1.5-flash-latest" },
    { version: "v1beta", model: "gemini-pro" },
    { version: "v1", model: "gemini-pro" },
    { version: "v1beta", model: "gemini-1.0-pro" },
];

async function probe() {
    console.log("Probing Gemini API...");

    for (const conf of CONFIGS) {
        const url = `https://generativelanguage.googleapis.com/${conf.version}/models/${conf.model}:generateContent?key=${GEMINI_API_KEY}`;
        process.stdout.write(`Testing [${conf.version}] ${conf.model} ... `);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                }),
            });

            if (response.ok) {
                console.log("✅ WORKING!");
                console.log(`>>> USE THIS URL: https://generativelanguage.googleapis.com/${conf.version}/models/${conf.model}:generateContent`);
                return;
            } else {
                console.log(`❌ ${response.status} ${response.statusText}`);
                const err = await response.json();
                // console.log(JSON.stringify(err, null, 2));
            }
        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }
    console.log("No working configuration found.");
}

probe();
