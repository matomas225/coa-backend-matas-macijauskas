const jwt = require("jsonwebtoken");

const authenticateJwt = (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Access denied, no auth token" });
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(403).json({ message: "Token is invalid or expired" });
      }
      return res.status(200).json({ message: "The Token is Good! Loged in" });
    });
  } else {
    return res.status(400).json({ message: "Token is invalid" });
  }
};

module.exports = {
  authenticateJwt,
};
