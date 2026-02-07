const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getProfile, updateProfile, updateLocation } = require("../controllers/userController");

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.patch("/me", verifyToken, updateProfile);
router.post("/me/location", verifyToken, updateLocation);

module.exports = router;
