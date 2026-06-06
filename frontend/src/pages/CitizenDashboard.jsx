import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, StatusBadge, LevelBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CitizenDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Overview");
    const [sosHolding, setSosHolding] = useState(false);
    const [sosProgress, setSosProgress] = useState(0);
    const socketRef = useRef(null);
    const sosTimerRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchMyReports();
        fetchBroadcasts();

        // Socket.io Connection
        socketRef.current = io(SOCKET_URL);
        socketRef.current.on("connect", () => {
            console.log("📡 Connected to Emergency Network");
            socketRef.current.emit("join", `citizen_${user.id}`);
        });

        socketRef.current.on("safety_broadcast", (broadcast) => {
            setBroadcasts(prev => [broadcast, ...prev]);
            toast((t) => (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 24 }}>📢</div>
                    <div>
                        <div style={{ fontWeight: 800, color: "#C8102E" }}>OFFICIAL ALERT</div>
                        <div style={{ fontSize: 13, color: "#1E293B" }}>{broadcast.message}</div>
                    </div>
                </div>
            ), { duration: 6000, position: "top-right" });
        });

        socketRef.current.on("report_update", ({ id, status }) => {
            setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            toast.success(`Report #${id} status updated to ${status}`, { icon: "🛡️" });
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user, navigate]);

    const fetchBroadcasts = async () => {
        try {
            const res = await API.get("/broadcasts");
            setBroadcasts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyReports = async () => {
        try {
            const res = await API.get("/reports");
            const myReports = res.data.filter(r => r.reporterId === user.id || r.reporter === user.name);
            setReports(myReports);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("saferwanda_token");
        localStorage.removeItem("saferwanda_user");
        navigate("/");
        window.location.reload();
    };

    const submitSOS = async (coords = { lat: 0, lng: 0 }) => {
        try {
            toast.loading("Transmitting SOS Signal...", { id: "sos" });
            const res = await API.post("/reports/sos", {
                location: user.district + " District (Verified Citizen Profile)",
                lat: coords.lat,
                lng: coords.lng
            });
            toast.success("🚨 SOS DISPATCHED: Authorities have been alerted to your exact location.", {
                id: "sos",
                duration: 8000,
                iconTheme: { primary: "#C8102E", secondary: "#fff" }
            });
            fetchMyReports();
        } catch (err) {
            toast.error("SOS transmission failed. Please call 112 directly.", { id: "sos" });
        }
    };

    const startSOS = () => {
        setSosHolding(true);
        setSosProgress(0);
        let progress = 0;
        sosTimerRef.current = setInterval(() => {
            progress += 5;
            setSosProgress(progress);
            if (progress >= 100) {
                clearInterval(sosTimerRef.current);
                setSosHolding(false);
                setSosProgress(0);
                // Trigger SOS with Geolocation
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => submitSOS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => submitSOS() // Fallback
                    );
                } else {
                    submitSOS();
                }
            }
        }, 50);
    };

    const cancelSOS = () => {
        clearInterval(sosTimerRef.current);
        setSosHolding(false);
        setSosProgress(0);
    };


    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar" style={{ background: "#1E3A8A", color: "#FFFFFF" }}>
                <div className="dashboard-sidebar-header" style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <Icon name="shield-check" size={24} color="#FFFFFF" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5, color: "#FFFFFF" }}>SafeRwanda</div>
                        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, letterSpacing: 2, textTransform: "uppercase" }}>Citizen Authority</div>
                    </div>
                </div>

                <div className="dashboard-sidebar-nav" style={{ padding: "32px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    {["Overview", "My Reports", "File New Report", "Safety Center"].map((tab) => (
                        <button
                            key={tab}
                            className={`sidebar-link ${activeTab === tab ? "active" : ""}`}
                            onClick={() => {
                                if (tab === "File New Report") navigate("/report");
                                else setActiveTab(tab);
                            }}
                        >
                            <Icon
                                name={tab === "Overview" ? "layout-dashboard" : tab === "My Reports" ? "folder" : tab === "File New Report" ? "file-plus" : "shield-lock"}
                                size={18}
                            />
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="dashboard-sidebar-footer" style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                            {user?.name?.[0]}
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{user?.name}</div>
                            <div style={{ fontSize: 11, opacity: 0.7 }}>{user?.district} District</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        <Icon name="logout" size={14} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Header Strip */}
                <div className="dashboard-header">
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#1E293B" }}>{activeTab}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA", fontSize: 11, fontWeight: 800, color: "#C8102E" }}>
                            <Icon name="phone-call" size={14} /> 112 EMERGENCY
                        </div>
                        <div className="dashboard-system-clock" style={{ width: 1, height: 24, background: "#E2E8F0" }} />
                        <div className="dashboard-system-clock"><Icon name="bell" size={20} color="#64748B" /></div>
                    </div>
                </div>

                <div className="dashboard-content">
                    {activeTab === "Overview" && (
                        <div className="slide-in">
                            {/* Top Tier: SOS and Broadcasts */}
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginBottom: 32 }}>
                                {/* Premium SOS Card */}
                                <div className="card" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "60px 40px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: "-20%", left: "-20%", width: "140%", height: "140%", background: "radial-gradient(circle, rgba(200,16,46,0.05) 0%, transparent 70%)", pointerEvents: "none" }}></div>

                                    <div style={{ maxWidth: 400 }}>
                                        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: "#0F172A", letterSpacing: -1 }}>Emergency Response</h1>
                                        <p style={{ color: "#64748B", fontSize: 16, lineHeight: 1.6 }}>Hold the button below for 2 seconds to trigger an immediate SOS alert to all nearby authorities.</p>
                                    </div>

                                    <div
                                        className={`sos-button-container ${sosHolding ? "holding" : ""}`}
                                        onMouseDown={startSOS}
                                        onMouseUp={cancelSOS}
                                        onMouseLeave={cancelSOS}
                                        onTouchStart={startSOS}
                                        onTouchEnd={cancelSOS}
                                        style={{
                                            position: "relative",
                                            width: 180,
                                            height: 180,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            userSelect: "none"
                                        }}
                                    >
                                        <svg width="200" height="200" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(200,16,46,0.08)" strokeWidth="10" />
                                            <circle
                                                cx="100" cy="100" r="90" fill="none" stroke="#C8102E" strokeWidth="10"
                                                strokeDasharray={565}
                                                strokeDashoffset={565 - (565 * sosProgress) / 100}
                                                strokeLinecap="round"
                                                style={{ transition: sosHolding ? "none" : "stroke-dashoffset 0.3s ease-out" }}
                                            />
                                        </svg>

                                        <div style={{
                                            width: 150, height: 150, borderRadius: "50%",
                                            background: sosHolding ? "#A50D27" : "linear-gradient(135deg, #C8102E, #8a2436)",
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                            boxShadow: sosHolding ? "inset 0 4px 12px rgba(0,0,0,0.2)" : "0 12px 32px rgba(200, 16, 46, 0.4)",
                                            transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            transform: sosHolding ? "scale(0.92)" : "scale(1)",
                                            zIndex: 2, border: "6px solid rgba(255,255,255,0.2)"
                                        }}>
                                            <Icon name="zap" size={48} color="#FFFFFF" />
                                            <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: 24, marginTop: 4 }}>SOS</span>
                                        </div>
                                    </div>

                                    <div style={{ padding: "8px 20px", borderRadius: 20, background: "#F1F5F9", fontSize: 13, fontWeight: 800, color: "#475569", display: "flex", alignItems: "center", gap: 10 }}>
                                        <Icon name="map-pin" size={14} color="#C8102E" />
                                        Monitoring Active: {user?.district}
                                    </div>
                                </div>

                                {/* Right Side: Highlights & Broadcasts */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                    {/* Action Cards */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                        {[
                                            { title: "Report Accident", icon: "car-crash", color: "#C8102E" },
                                            { title: "Crime Alert", icon: "shield-alert", color: "#1E3A8A" }
                                        ].map((action, i) => (
                                            <div key={i} className="card" style={{ padding: 24, cursor: "pointer", display: "flex", flexDirection: "column", gap: 16 }}>
                                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${action.color}15`, color: action.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <Icon name={action.icon} size={24} />
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 16, color: "#1E293B" }}>{action.title}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Safety Broadcasts */}
                                    <div className="card" style={{ flex: 1, padding: 32 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
                                                <Icon name="broadcast" size={20} color="#1E3A8A" /> Safety Feed
                                            </h3>
                                            <div className="badge-critical" style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800 }}>LIVE</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                            {broadcasts.length === 0 ? (
                                                <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", background: "rgba(0,0,0,0.02)", borderRadius: 16 }}>No active alerts</div>
                                            ) : broadcasts.map(b => (
                                                <div key={b.id} className="fadeIn" style={{ padding: 16, background: "rgba(30,58,138,0.03)", borderRadius: 16, borderLeft: `6px solid ${b.type === "Urgent" ? "#C8102E" : "#1E3A8A"}` }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                        <span style={{ fontWeight: 800, fontSize: 13, color: b.type === "Urgent" ? "#C8102E" : "#1E3A8A" }}>{b.type} ALERT</span>
                                                        <span style={{ fontSize: 11, opacity: 0.6 }}>{new Date(b.time).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "#475569" }}>{b.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Tier: Reports */}
                            <div className="card" style={{ padding: 32 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>My Request History</h3>
                                    <button onClick={() => setActiveTab("My Reports")} style={{ background: "transparent", color: "#1E3A8A", fontWeight: 800, fontSize: 13 }}>View Full Archive →</button>
                                </div>

                                {reports.length === 0 ? (
                                    <div style={{ padding: 60, textAlign: "center", borderRadius: 24, background: "#F8FAFC", border: "2px dashed #E2E8F0" }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: "#64748B" }}>No incidents registered</div>
                                        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>Your safety record is completely clear.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                                        {reports.slice(0, 3).map(r => (
                                            <div key={r.id} className="fadeIn" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 24, background: "rgba(30,58,138,0.02)", borderRadius: 20, border: "1px solid rgba(0,0,0,0.03)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                        <Icon name="file-text" size={24} color="#1E3A8A" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 4 }}>{r.id} • {new Date(r.date || Date.now()).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: 16, fontWeight: 800, color: "#1E293B" }}>{r.type}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <StatusBadge status={r.status} />
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginTop: 8, cursor: "pointer" }}>Track Details</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "My Reports" && (
                        <div className="slide-in">
                            <div className="card" style={{ padding: 32 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>Incident Archive</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                                    {reports.map(r => (
                                        <div key={r.id} className="card" style={{ display: "flex", justifyContent: "space-between", padding: 24, background: "rgba(0,0,0,0.01)" }}>
                                            {/* List details here */}
                                            <div>
                                                <div style={{ fontWeight: 900, color: "#1E3A8A", marginBottom: 8 }}>{r.id}</div>
                                                <div style={{ fontSize: 18, fontWeight: 800 }}>{r.type}</div>
                                                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{r.location}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <StatusBadge status={r.status} />
                                                <LevelBadge level={r.level} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default CitizenDashboard;
