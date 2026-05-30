const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");

const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const broadcastRoutes = require("./routes/broadcastRoutes");

const app = express();

// Security & Logging
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Expose static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/broadcasts", broadcastRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK", db: "Supabase" }));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    sequelize.sync({ force: false }).then(() => {
        console.log("📦 Supabase Database & Sequelize Models Synced");
        app.listen(PORT, () => {
            console.log(`🛡️  SafeRwanda secure API running on http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error("Unable to connect to the database:", err);
    });
}

module.exports = app;
