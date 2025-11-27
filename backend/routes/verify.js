const express = require("express");

const {
  getVerificationEvent,
  verifyEvent,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/:eventId", getVerificationEvent);
router.post("/:eventId/verify", verifyEvent);

module.exports = router;
