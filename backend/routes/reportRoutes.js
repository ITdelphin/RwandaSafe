const express = require("express");
const { Report, Evidence, ReportUpdate, User } = require("../models");
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

// POST new report
router.post("/", upload.array("evidenceFiles", 5), async (req, res) => {
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
                const fileName = `${reportId}/${Date.now()}-${file.originalname}`;

                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from("evidence")
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("evidence")
                    .getPublicUrl(fileName);

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

        res.status(201).json({ id: reportId, message: "Report logged successfully" });
    } catch (error) {
        console.error("Report submission error:", error);
        res.status(500).json({ error: "Failed to submit report. " + error.message });
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

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update report" });
    }
});

module.exports = router;
