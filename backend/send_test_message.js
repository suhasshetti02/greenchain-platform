require('dotenv').config();
const twilio = require('twilio');

// Parse command line arguments
// Usage: node send_test_message.js <phone_number>
const toPhone = process.argv[2];

if (!toPhone) {
    console.error("Please provide a phone number.");
    console.error("Usage: node send_test_message.js <phone_number>");
    process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTest() {
    console.log(`Attempting to send to: ${toPhone}`);
    console.log(`From: ${process.env.TWILIO_PHONE_NUMBER}`);

    try {
        const message = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`,
            body: "🔔 GreenChain Test Message: If you see this, the connection is working!"
        });

        console.log("✅ Message Created Successfully!");
        console.log(`SID: ${message.sid}`);
        console.log(`Status: ${message.status}`);
        console.log(`Error Code: ${message.errorCode}`);
        console.log(`Error Message: ${message.errorMessage}`);

        if (message.status === 'queued') {
            console.log("\n⚠️  NOTE: Status is 'queued'.");
            console.log("If using Twilio Sandbox, ensure the recipient has joined by sending the join code to the sandbox number.");
        }
    } catch (err) {
        console.error("❌ Failed to send message:");
        console.error(err.message);
        if (err.code) console.error(`Twilio Error Code: ${err.code}`);
        if (err.moreInfo) console.error(`More Info: ${err.moreInfo}`);
    }
}

sendTest();
