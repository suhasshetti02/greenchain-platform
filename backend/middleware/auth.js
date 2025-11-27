const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key";

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function createToken(userId, userEmail, userRole) {
  return jwt.sign(
    { id: userId, email: userEmail, role: userRole },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { verifyToken, createToken };
