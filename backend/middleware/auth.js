const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
    try {
        const header = req.header("Authorization");
        if (!header) return res.status(401).json({ error: "Access denied. No token provided." });

        const token = header.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // Check database to ensure user still exists
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ error: "Invalid token. User not found." });
        if (user.status === "Suspended") return res.status(403).json({ error: "Account is suspended." });

        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === "string") {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
        }
        next();
    };
};

module.exports = { auth, authorize };
