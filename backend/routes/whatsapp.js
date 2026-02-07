const express = require("express");
const { handleIncomingMessage } = require("../controllers/whatsappController");

const router = express.Router();

// Twilio Webhook
// Twilio Webhook
router.post("/webhook", handleIncomingMessage);
router.post("/incoming", handleIncomingMessage); // Alias for compatibility

module.exports = router;
