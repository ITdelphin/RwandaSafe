import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar";
import NotificationsPanel from "./components/NotificationsPanel";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import TrackPage from "./pages/TrackPage";
import AdminDashboard from "./pages/AdminDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import ContactPage from "./pages/ContactPage";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import API from "./config/api";

function App() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Pages where TopBar/Footer should be hidden or shown
    const isDashboard = ["/admin", "/police", "/hospital", "/citizen"].includes(location.pathname);
    const noTopBarRoutes = ["/"];
    const showTopBar = !noTopBarRoutes.includes(location.pathname) && !isDashboard;
    const showFooter = !isDashboard;

    useEffect(() => {
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
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                    },
                    success: { iconTheme: { primary: "#1E3A8A", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#C8102E", secondary: "#fff" } },
                }}
            />
            {showTopBar && (
                <TopBar
                    user={user}
                    notifications={notifications.filter((n) => n.unread).length}
                    onToggleNotif={() => setShowNotif(!showNotif)}
                    onLogout={handleLogout}
                    onNavigate={navigate}
                />
            )}
            {showNotif && <NotificationsPanel notifications={notifications} />}
            {showNotif && (
                <div
                    onClick={() => setShowNotif(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 150 }}
                />
            )}
            <div onClick={() => showNotif && setShowNotif(false)} style={{ minHeight: isDashboard ? "auto" : "calc(100vh - 64px)" }}>
                <Routes>
                    <Route path="/" element={<SplashPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage onLogin={setUser} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/report" element={<ReportPage user={user} />} />
                    <Route path="/track" element={<TrackPage user={user} />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/police" element={<PoliceDashboard user={user} />} />
                    <Route path="/hospital" element={<HospitalDashboard />} />
                    <Route path="/citizen" element={<CitizenDashboard user={user} />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Routes>
            </div>
            {showFooter && <Footer />}
        </>
    );
}

export default App;
