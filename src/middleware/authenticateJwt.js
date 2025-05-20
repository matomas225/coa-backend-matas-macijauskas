const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Optionally attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const authenticateJwt = (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(403)
      .json({ message: "Access denied, no auth token", status: false });
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7, authHeader.length);
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Token is invalid or expired", status: false });
      }
      return res
        .status(200)
        .json({ message: "The Token is Good! Loged in", status: true });
    });
  } else {
    return res.status(400).json({ message: "Token is invalid", status: false });
  }
};

module.exports = {
  authenticateJwt,
  authMiddleware,
};
