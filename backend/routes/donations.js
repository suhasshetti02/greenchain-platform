const express = require("express");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const { verifyToken, verifyTokenOptional } = require("../middleware/auth");
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
  confirmPickup,
} = require("../controllers/donationController");

const router = express.Router();


router.get("/", verifyTokenOptional, listDonations);
router.get("/mine", verifyToken, listMyDonations);
router.get("/available", verifyToken, listAvailableDonations);
router.get("/stats/overview", verifyToken, getDonationStats);
router.get("/:id", getDonation);
router.post("/", verifyToken, upload.single("image"), createDonation);
router.patch("/:id", verifyToken, upload.single("image"), updateDonation);
router.delete("/:id", verifyToken, deleteDonation);
router.post("/:id/claim", verifyToken, claimDonation);
router.post("/:id/confirm-pickup", verifyToken, confirmPickup);

module.exports = router;
