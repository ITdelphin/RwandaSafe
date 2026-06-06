require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Report, Notification, Broadcast, AuditLog, ReportUpdate } = require("./models");

const seedDatabase = async () => {
    try {
        console.log("🚀 Starting SafeRwanda Professional Data Seeding...");
        await sequelize.sync({ force: true });

        const salt = await bcrypt.genSalt(10);
        const hash = (pw) => bcrypt.hashSync(pw, salt);

        // 1. Create Authorities
        const admin = await User.create({
            name: "H.E. System Controller",
            email: "admin@saferwanda.rw",
            role: "Admin",
            password: hash("safe2026"),
            district: "Gasabo",
            status: "Active"
        });

        const police = await User.create({
            name: "Comm. Kagabo John",
            email: "police@rnp.gov.rw",
            role: "Police",
            password: hash("police999"),
            district: "Nyarugenge",
            status: "Active"
        });

        const hospital = await User.create({
            name: "Dr. Uwase Alice",
            email: "emergency@kfh.rw",
            role: "Hospital",
            password: hash("medical555"),
            district: "Kicukiro",
            status: "Active"
        });

        const citizen = await User.create({
            name: "Mugabe Patrick",
            email: "pmugabe@gmail.com",
            role: "Citizen",
            password: hash("user123"),
            district: "Musanze",
            status: "Active"
        });

        console.log("✅ Users Created");

        // 2. Create Safety Broadcasts
        await Broadcast.create({
            type: "Urgent",
            message: "Heavy rainfall expected in Rubavu District. Residents in low-lying areas advised to relocate to designated safe zones.",
            time: new Date().toISOString(),
            senderId: admin.id
        });

        await Broadcast.create({
            type: "Info",
            message: "New National ID integration feature now active on SafeRwanda portal. Please update your profile.",
            time: new Date().toISOString(),
            senderId: admin.id
        });

        console.log("✅ Broadcasts Created");

        // 3. Create Incident Reports
        const reports = [
            {
                id: "RPT-1001",
                type: "Medical Emergency",
                description: "Severe respiratory distress reported at Kimironko Bus Terminal.",
                location: "Gasabo, Kimironko",
                lat: -1.9441,
                lng: 30.0619,
                date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                level: "High",
                status: "In Progress",
                reporter: "Mugabe Patrick",
                reporterId: citizen.id,
                station: "King Faisal Hospital ER"
            },
            {
                id: "SOS-8821",
                type: "Emergency SOS",
                description: "Instant Panic Button Triggered. Immediate assistance required.",
                location: "Musanze, City Center",
                lat: -1.5000,
                lng: 29.6333,
                date: new Date().toISOString(),
                level: "Critical",
                status: "Open",
                reporter: "Mugabe Patrick",
                reporterId: citizen.id,
                isSOS: true,
                station: "National Dispatch Center"
            },
            {
                id: "RPT-1002",
                type: "Fire Outbreak",
                description: "Electrical fire detected in commercial building near Muhima.",
                location: "Nyarugenge, Muhima",
                lat: -1.9400,
                lng: 30.0500,
                date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                level: "Critical",
                status: "Resolved",
                reporter: "Anonymous",
                reporterId: null,
                assignedOfficer: "Capt. Karekezi"
            }
        ];

        for (const r of reports) {
            const report = await Report.create(r);
            await ReportUpdate.create({
                msg: "Incident logged in National Emergency Database",
                time: r.date,
                ReportId: report.id
            });
            if (r.status === "Resolved") {
                await ReportUpdate.create({
                    msg: "Resolution verified by on-site responder",
                    time: new Date().toISOString(),
                    ReportId: report.id
                });
            }
        }

        console.log("✅ Reports Created");

        // 4. Create Audit Logs
        await AuditLog.create({
            action: "System Initialization",
            actor: "SYSTEM",
            target: "Database",
            type: "Security"
        });

        await AuditLog.create({
            action: "SOS Triggered",
            actor: "Mugabe Patrick",
            target: "SOS-8821",
            type: "Danger"
        });

        console.log("✅ Audit Logs Created");

        console.log("🏁 SafeRwanda Professional Data Seeding Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
};

seedDatabase();
