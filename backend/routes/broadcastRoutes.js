const express = require("express");
const { Broadcast, User } = require("../models");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// GET all broadcasts
router.get("/", async (req, res) => {
    try {
        const broadcasts = await Broadcast.findAll({
            order: [["createdAt", "DESC"]],
            limit: 10,
        });
        res.json(broadcasts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch broadcasts" });
    }
});

// POST new broadcast (Admin only)
router.post("/", auth, authorize("Admin"), async (req, res) => {
    try {
        const { type, message } = req.body;
        const broadcast = await Broadcast.create({
            type,
            message,
            time: new Date().toISOString(),
            senderId: req.user.id,
        });
        res.status(201).json(broadcast);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create broadcast" });
    }
});

module.exports = router;
