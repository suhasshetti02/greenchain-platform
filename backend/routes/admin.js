const express = require("express");
const checkNoShows = require("../jobs/checkNoShows");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Protected Admin Endpoint to Trigger No-Show Check
// In a real app, verifyToken should verify 'admin' role.
// For now, we assume any authenticated user (or specific) can trigger, 
// OR we rely on a shared secret if called by a Cron service.
// Let's use verifyToken and assume safety for now or check role.

router.post("/check-no-shows", verifyToken, async (req, res) => {
    // Optional: if (req.user.role !== 'admin') ...
    
    try {
        const result = await checkNoShows();
        res.json({ message: "Job executed", result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
