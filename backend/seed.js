require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Report, Notification } = require("./models");

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });

        const salt = await bcrypt.genSalt(10);
        const hash = (pw) => bcrypt.hashSync(pw, salt);

        const admin = await User.create({ name: "System Admin", email: "admin@saferwanda.rw", role: "Admin", password: hash("admin123") });
        await User.create({ name: "Police Dispatcher", email: "police@rdf.gov.rw", role: "Police", password: hash("police123") });
        await User.create({ name: "CHUK ER", email: "hospital@chuk.rw", role: "Hospital", password: hash("hospital123") });
        await User.create({ name: "Citizen User", email: "citizen@gmail.com", role: "Citizen", password: hash("user123") });

        await Report.create({
            id: "RPT-2401", type: "Theft", description: "Phone snatched near Kimironko market", location: "Kimironko, Kigali", lat: -1.9441, lng: 30.0619, date: new Date().toISOString(), level: "High", status: "In Progress", reporter: "Citizen User", reporterId: admin.id
        });
        await Report.create({
            id: "RPT-2402", type: "Road Accident", description: "Car crash on KN 5 Rd", location: "Remera, Kigali", lat: -1.9541, lng: 30.1119, date: new Date().toISOString(), level: "Critical", status: "Resolved", reporter: "Anonymous", reporterId: null
        });

        console.log("✅ Database seeded with Supabase via Sequelize!");
        process.exit(0);
    } catch (err) {
        console.error("Seed error", err);
        process.exit(1);
    }
};

seedDatabase();
