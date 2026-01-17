require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");
const claimRoutes = require("./routes/claims");
const verifyRoutes = require("./routes/verify");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/claims", claimRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ GreenChain backend running on port ${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
});
