const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    national_id: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM("Admin", "Police", "Hospital", "Citizen"),
        defaultValue: "Citizen",
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM("Active", "Suspended"),
        defaultValue: "Active",
    },
});

const Report = sequelize.define("Report", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    location: {
        type: DataTypes.STRING,
    },
    lat: {
        type: DataTypes.FLOAT,
    },
    lng: {
        type: DataTypes.FLOAT,
    },
    date: {
        type: DataTypes.STRING,
    },
    level: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
    },
    status: {
        type: DataTypes.ENUM("Open", "In Progress", "Pending", "Resolved", "Rejected"),
        defaultValue: "Open",
    },
    reporter: {
        type: DataTypes.STRING,
    },
    reporterId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    assignedOfficer: {
        type: DataTypes.STRING,
    },
    station: {
        type: DataTypes.STRING,
        defaultValue: "Central Dispatch",
    },
});

const Evidence = sequelize.define("Evidence", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    filename: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
    url: {
        type: DataTypes.STRING,
    },
});

const ReportUpdate = sequelize.define("ReportUpdate", {
    msg: DataTypes.STRING,
    time: DataTypes.STRING,
});

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
    },
    title: DataTypes.STRING,
    sub: DataTypes.STRING,
    icon: DataTypes.STRING,
    color: DataTypes.STRING,
    unread: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

// Relationships
Report.hasMany(Evidence, { as: "evidenceFiles" });
Evidence.belongsTo(Report);

Report.hasMany(ReportUpdate, { as: "updates" });
ReportUpdate.belongsTo(Report);

User.hasMany(Report, { foreignKey: "reporterId" });
Report.belongsTo(User, { foreignKey: "reporterId" });

User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, User, Report, Evidence, ReportUpdate, Notification };
