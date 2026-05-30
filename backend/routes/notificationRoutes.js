const express = require("express");
const { Notification } = require("../models");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [["createdAt", "DESC"]]
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Optionally, a mark-as-read endpoint
router.post("/:id/read", auth, async (req, res) => {
    try {
        const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (notif) {
            notif.unread = false;
            await notif.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});

module.exports = router;
