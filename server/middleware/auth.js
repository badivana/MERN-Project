const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET || "supersecretkey_quantumtask_2026";
        const verified = jwt.verify(token, secret);
        req.user = verified; // verified contains { id, username }
        next();
    } catch (err) {
        res.status(401).json({ message: "Access Denied: Invalid or Expired Token" });
    }
};

module.exports = authMiddleware;
