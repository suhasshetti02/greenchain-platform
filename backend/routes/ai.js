const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getSpoilageSuggestion } = require("../controllers/aiController");

const router = express.Router();

// AI Spoilage Suggestion (authenticated only)
router.post("/spoilage-suggestion", verifyToken, getSpoilageSuggestion);

module.exports = router;
