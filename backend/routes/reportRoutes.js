const express = require("express");
const { Report, Evidence, ReportUpdate, User, AuditLog } = require("../models");
const { auth, authorize } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const supabase = require("../config/supabase");

const router = express.Router();

// Buffer storage for serverless environments
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// POST new report (Authenticated)
router.post("/", auth, upload.array("evidenceFiles", 5), async (req, res) => {
    try {
        const { type, description, location, lat, lng, date, level, reporter } = req.body;
        const reportId = `RPT-${Math.floor(1000 + Math.random() * 9000)}`;

        const newReport = await Report.create({
            id: reportId,
            type,
            description,
            location,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            date,
            level,
            reporter: reporter || "Anonymous",
            reporterId: req.user?.id || null,
            status: "Open"
        });

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                let publicUrl = "";

                if (supabase) {
                    const filePath = `${reportId}/${fileName}`;
                    const { data, error } = await supabase.storage
                        .from("evidence")
                        .upload(filePath, file.buffer, {
                            contentType: file.mimetype,
                            upsert: false
                        });

                    if (!error) {
                        const { data: { publicUrl: url } } = supabase.storage
                            .from("evidence")
                            .getPublicUrl(filePath);
                        publicUrl = url;
                    }
                }

                // Local Fallback if Supabase fails or is missing
                if (!publicUrl) {
                    const fs = require("fs");
                    const uploadDir = path.join(__dirname, "../uploads", reportId);
                    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                    const localPath = path.join(uploadDir, fileName);
                    fs.writeFileSync(localPath, file.buffer);
                    publicUrl = `/uploads/${reportId}/${fileName}`;
                }

                await Evidence.create({
                    filename: file.originalname,
                    type: file.mimetype.split('/')[0] === "image" ? "Photo" : file.mimetype.split('/')[0] === "video" ? "Video" : "Audio",
                    url: publicUrl,
                    ReportId: reportId
                });
            }
        }

        await ReportUpdate.create({
            msg: "Report submitted to dispatch",
            time: new Date().toISOString(),
            ReportId: reportId
        });

        // Emit real-time event to police and medical units
        req.io.emit("new_report", newReport);

        res.status(201).json({ id: reportId, message: "Report logged successfully" });
    } catch (error) {
        console.error("Report submission error:", error);
        res.status(500).json({ error: "Failed to submit report. " + error.message });
    }
});

// POST SOS instant dispatch
router.post("/sos", auth, async (req, res) => {
    try {
        const { lat, lng, location } = req.body;
        const reportId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;

        const newReport = await Report.create({
            id: reportId,
            type: "Emergency SOS",
            description: "Instant Panic Button Triggered. Immediate assistance required.",
            location: location || "Undefined (GPS Pending)",
            lat: parseFloat(lat) || 0,
            lng: parseFloat(lng) || 0,
            date: new Date().toISOString(),
            level: "Critical",
            reporter: req.user.name,
            reporterId: req.user.id,
            status: "In Progress",
            isSOS: true,
            station: "National Dispatch Center"
        });

        await ReportUpdate.create({
            msg: "SOS Signal Received - Police Units Dispatched",
            time: new Date().toISOString(),
            ReportId: reportId
        });

        // Emit real-time panic signal
        req.io.emit("sos_signal", newReport);

        // Record Audit Log
        await AuditLog.create({
            action: "SOS Triggered",
            actor: req.user.name,
            target: reportId,
            type: "Danger"
        });

        res.status(201).json({ id: reportId, message: "SOS Dispatched" });
    } catch (error) {
        console.error("SOS error:", error);
        res.status(500).json({ error: "SOS transmission failed." });
    }
});

// GET all reports (filtered by user if citizen)
router.get("/", auth, async (req, res) => {
    try {
        const options = {
            include: [
                { model: Evidence, as: "evidenceFiles" },
                { model: ReportUpdate, as: "updates" }
            ],
            order: [["createdAt", "DESC"]]
        };

        if (req.user.role === "Citizen") {
            options.where = { reporterId: req.user.id };
        }

        const reports = await Report.findAll(options);

        // Map output to match frontend expectation
        const formatted = reports.map(r => ({
            ...r.toJSON(),
            evidence: r.evidenceFiles.map(e => e.url),
            updates: r.updates.map(u => ({ msg: u.msg, time: new Date(u.time).toLocaleString() }))
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

// UPDATE report status
router.patch("/:id/status", auth, async (req, res) => {
    try {
        const { status, officer } = req.body;
        const report = await Report.findByPk(req.params.id);

        if (!report) return res.status(404).json({ error: "Report not found" });

        // Allow Admin, Police, Hospital to update
        if (req.user.role === "Citizen") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        report.status = status;
        if (officer) report.assignedOfficer = officer;
        await report.save();

        await ReportUpdate.create({
            msg: `Status changed to ${status} by ${req.user.name}`,
            time: new Date().toISOString(),
            ReportId: report.id
        });

        // Emit live update
        req.io.emit("report_update", { id: report.id, status, officer });

        // Record Audit Log
        await AuditLog.create({
            action: "Status Update",
            actor: req.user.name,
            target: `${report.id} -> ${status}`,
            type: status === "Resolved" ? "Security" : "Info"
        });

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update report" });
    }
});

module.exports = router;
