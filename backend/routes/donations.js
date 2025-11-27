const express = require("express");
const multer = require("multer");

const { verifyToken } = require("../middleware/auth");
const {
  listDonations,
  listMyDonations,
  listAvailableDonations,
  getDonation,
  createDonation,
  updateDonation,
  deleteDonation,
  claimDonation,
  getDonationStats,
} = require("../controllers/donationController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listDonations);
router.get("/mine", verifyToken, listMyDonations);
router.get("/available", verifyToken, listAvailableDonations);
router.get("/stats/overview", verifyToken, getDonationStats);
router.post("/", verifyToken, upload.single("image"), createDonation);
router.patch("/:id", verifyToken, upload.single("image"), updateDonation);
router.delete("/:id", verifyToken, deleteDonation);
router.post("/:id/claim", verifyToken, claimDonation);
router.get("/:id", getDonation);

module.exports = router;
