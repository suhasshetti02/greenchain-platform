require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");
const claimRoutes = require("./routes/claims");
const verifyRoutes = require("./routes/verify");
const aiRoutes = require("./routes/ai");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.3:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to normalize URLs (Fix for double slash issues)
app.use((req, res, next) => {
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/^\/+/, '/');
  }
  next();
});


app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", require("./routes/admin")); // Admin Routes
app.use("/api/users", require("./routes/users")); // User Routes (New)
app.use("/api/ai", aiRoutes); // AI Routes (WhatsApp & Spoilage)
app.use("/api/whatsapp", require("./routes/whatsapp")); // WhatsApp Webhooks


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ GreenChain backend running on port ${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  
  // Debug Environment Variables
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log(`[Env] GEMINI_API_KEY: ${geminiKey ? "Set (User Configured)" : "MISSING"}`);
  console.log(`[Env] SUPABASE_URL: ${process.env.SUPABASE_URL ? "Set" : "MISSING"}`);
});
