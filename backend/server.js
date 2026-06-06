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
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Security & Logging
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Expose static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Inject IO into routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/broadcasts", broadcastRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK", db: "SQLite" }));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    sequelize.sync({ force: false }).then(() => {
        console.log("📦 SQLite Database & Sequelize Models Synced");
        server.listen(PORT, () => {
            console.log(`🛡️  SafeRwanda secure API running on http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error("Unable to connect to the database:", err);
    });
}

// Socket.io connection logic
io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);
    socket.on("join", (room) => {
        socket.join(room);
        console.log(`👤 Client joined room: ${room}`);
    });
    socket.on("disconnect", () => {
        console.log("🔌 Client disconnected");
    });
});

module.exports = { app, server, io };
