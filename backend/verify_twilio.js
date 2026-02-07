require('dotenv').config();
const twilio = require('twilio');

async function verifyCredentials() {
    console.log("Checking Twilio Credentials...");
    console.log(`Account SID Present: ${!!process.env.TWILIO_ACCOUNT_SID}`);
    console.log(`Auth Token Present: ${!!process.env.TWILIO_AUTH_TOKEN}`);

    if (process.env.TWILIO_ACCOUNT_SID) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;

        console.log(`Account SID Length: ${sid.length}`);
        console.log(`Account SID Start/End Config: [${sid[0]}] ... [${sid[sid.length - 1]}]`);
        console.log(`Token Length: ${token.length}`);
        console.log(`Token Start/End Config: [${token[0]}] ... [${token[token.length - 1]}]`);

        // precise character check
        if (sid.trim() !== sid) console.log("⚠️ WARNING: Account SID has leading/trailing whitespace!");
        if (token.trim() !== token) console.log("⚠️ WARNING: Auth Token has leading/trailing whitespace!");
    }

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const account = await client.api.v2010.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        console.log("✅ Authentication Successful!");
        console.log(`Account Status: ${account.status}`);
        console.log(`Account Name: ${account.friendlyName}`);
    } catch (error) {
        console.error("❌ Authentication Failed:");
        console.error(error.message);
        if (error.code) console.error(`Error Code: ${error.code}`);
    }
}

verifyCredentials();
