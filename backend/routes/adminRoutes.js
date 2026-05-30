const express = require("express");
const { Report, User, Notification, AuditLog } = require("../models");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", auth, authorize("Admin"), async (req, res) => {
    try {
        const totalReports = await Report.count();
        const resolved = await Report.count({ where: { status: "Resolved" } });
        const criticalAlerts = await Report.count({ where: { level: "Critical", status: ["Open", "In Progress"] } });
        const activeCases = await Report.count({ where: { status: "In Progress" } });
        const openCases = await Report.count({ where: { status: "Open" } });
        const fakeDetected = await Report.count({ where: { status: "Rejected" } });

        // Group by type for graph
        const allReports = await Report.findAll({ attributes: ["type"] });
        const byType = allReports.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {});

        res.json({
            stats: { totalReports, activeCases, resolved, criticalAlerts, openCases, fakeDetected },
            byType
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch admin stats" });
    }
});

router.get("/users", auth, authorize("Admin"), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "status"],
            include: {
                model: Report,
                attributes: ["id"]
            }
        });

        const formatted = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            reports: u.Reports.length
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.patch("/users/:id/status", auth, authorize("Admin"), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Cannot suspend other admins
        if (user.role === "Admin" && req.user.id !== user.id) {
            return res.status(403).json({ error: "Cannot suspend another admin" });
        }

        user.status = user.status === "Active" ? "Suspended" : "Active";
        await user.save();

        // Record Audit Log
        await AuditLog.create({
            action: `User ${user.status === "Suspended" ? "Suspension" : "Activation"}`,
            actor: req.user.name,
            target: user.name,
            type: user.status === "Suspended" ? "Danger" : "Security"
        });

        res.json({ message: `User status changed to ${user.status}`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update user status" });
    }
});

router.get("/audit-logs", auth, authorize("Admin"), async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 50
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
});

module.exports = router;
