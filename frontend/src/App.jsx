import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import NotificationsPanel from "./components/NotificationsPanel";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import TrackPage from "./pages/TrackPage";
import AdminDashboard from "./pages/AdminDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import ContactPage from "./pages/ContactPage";
import { Toaster } from "react-hot-toast";
import API from "./config/api";

function App() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem("saferwanda_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchNotifications();
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("saferwanda_token");
        localStorage.removeItem("saferwanda_user");
        setUser(null);
        navigate("/");
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <TopBar
                user={user}
                notifications={notifications.filter((n) => n.unread).length}
                onToggleNotif={() => setShowNotif(!showNotif)}
                onLogout={handleLogout}
                onNavigate={navigate}
            />
            {showNotif && <NotificationsPanel notifications={notifications} />}
            {showNotif && (
                <div
                    onClick={() => setShowNotif(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 150 }}
                />
            )}
            <div onClick={() => showNotif && setShowNotif(false)}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage onLogin={setUser} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/report" element={<ReportPage user={user} />} />
                    <Route path="/track" element={<TrackPage user={user} />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/police" element={<PoliceDashboard user={user} />} />
                    <Route path="/hospital" element={<HospitalDashboard />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
