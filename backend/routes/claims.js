const express = require("express");

const { verifyToken } = require("../middleware/auth");
const {
  getMyClaims,
  updateClaimStatus,
} = require("../controllers/claimController");

const router = express.Router();

router.get("/mine", verifyToken, getMyClaims);
router.patch("/:id", verifyToken, updateClaimStatus);

module.exports = router;


