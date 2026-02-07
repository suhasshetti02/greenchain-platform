const express = require("express");

const { registerUser, loginUser, updateLocation, forgotPassword, resetPassword, deleteAccount } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/location", verifyToken, updateLocation);
router.delete("/delete-account", verifyToken, deleteAccount);

module.exports = router;
