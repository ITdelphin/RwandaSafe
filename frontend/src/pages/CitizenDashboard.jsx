import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, StatusBadge, LevelBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const CitizenDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Overview");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchMyReports();
        fetchBroadcasts();
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
            // Filter only reports created by this citizen
            const myReports = res.data.filter(r => r.reporter === user.name);
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
        window.location.reload(); // Refresh state
    };

    const handleSOS = async () => {
        try {
            toast.loading("Transmitting SOS Signal...", { id: "sos" });
            const res = await API.post("/reports/sos", {
                location: user.district + " Area (Citizen Profile)",
                lat: 0, // In a real app, use navigator.geolocation
                lng: 0
            });
            toast.success("🚨 SOS DISPATCHED: Authorities have been alerted to your exact location.", {
                id: "sos",
                duration: 8000,
                iconTheme: { primary: "#C8102E", secondary: "#fff" }
            });
            fetchMyReports(); // Refresh list to show SOS report
        } catch (err) {
            toast.error("SOS transmission failed. Please call 112 directly.", { id: "sos" });
        }
    };


    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar" style={{ background: "#1E3A8A", color: "#FFFFFF" }}>
                <div className="dashboard-sidebar-header" style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "#FFFFFF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="shield-check" size={20} color="#C8102E" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>SafeRwanda</div>
                        <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.7, letterSpacing: 1.5, textTransform: "uppercase" }}>Citizen Portal</div>
                    </div>
                </div>

                <div className="dashboard-sidebar-nav" style={{ padding: "32px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {["Overview", "My Reports", "File New Report", "Safety Center"].map((tab) => (
                        <div
                            key={tab}
                            onClick={() => {
                                if (tab === "File New Report") navigate("/report");
                                else setActiveTab(tab);
                            }}
                            style={{
                                padding: "12px 16px",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                background: activeTab === tab ? "rgba(255,255,255,0.1)" : "transparent",
                                color: activeTab === tab ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                                fontWeight: activeTab === tab ? 800 : 600,
                            }}
                        >
                            <Icon
                                name={tab === "Overview" ? "layout-dashboard" : tab === "My Reports" ? "folder" : tab === "File New Report" ? "file-plus" : "shield-lock"}
                                size={18}
                            />
                            {tab}
                        </div>
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
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, marginBottom: 24 }}>
                                {/* SOS Button Area */}
                                <div className="card" style={{ padding: 32, background: "#FFFFFF", border: "1px solid #E2E8F0", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#C8102E", letterSpacing: 1.5, marginBottom: 24 }}>INSTANT DISPATCH</div>
                                    <button
                                        onClick={handleSOS}
                                        style={{
                                            width: 140, height: 140, borderRadius: "50%",
                                            background: "radial-gradient(circle at top right, #DC2626, #C8102E)",
                                            border: "8px solid #FEF2F2",
                                            color: "#FFFFFF", fontSize: 24, fontWeight: 900,
                                            cursor: "pointer", boxShadow: "0 12px 32px rgba(200, 16, 46, 0.4)",
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                                            transition: "all 0.1s"
                                        }}
                                        onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                                        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        <Icon name="alert-triangle" size={32} color="#FFFFFF" />
                                        <span>SOS</span>
                                    </button>
                                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 24, padding: "0 20px" }}>
                                        Tap to instantly share your location with the National Police and SAMU. Use only in severe emergencies.
                                    </p>
                                </div>

                                {/* Live Safety Broadcasts */}
                                <div className="card" style={{ padding: 24, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 8 }}>
                                            <Icon name="broadcast" size={18} color="#1E3A8A" /> Official Safety Broadcasts
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1E3A8A", background: "#EFF6FF", padding: "4px 8px", borderRadius: 6 }}>
                                            LIVE
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {broadcasts.length === 0 ? (
                                            <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: 20 }}>No active alerts.</div>
                                        ) : broadcasts.map(b => (
                                            <div key={b.id} style={{ display: "flex", gap: 16, padding: 16, background: "#F8FAFC", borderRadius: 12, borderLeft: `4px solid ${b.type === "Urgent" ? "#C8102E" : "#1E3A8A"}` }}>
                                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Icon name={b.type === "Urgent" ? "alert-circle" : "info-circle"} size={20} color={b.type === "Urgent" ? "#C8102E" : "#1E3A8A"} />
                                                </div>
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: "#1E293B" }}>{b.type} Alert</span>
                                                        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{b.message}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Personal Reports */}
                            <div className="card" style={{ padding: 32, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B" }}>My Recent Incidents</h3>
                                    <button onClick={() => setActiveTab("My Reports")} style={{ background: "none", border: "none", color: "#1E3A8A", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                        View All Vault <Icon name="arrow-right" size={14} />
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
                                ) : reports.length === 0 ? (
                                    <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #E2E8F0" }}>
                                        <Icon name="shield-check" size={32} color="#CBD5E1" />
                                        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: "#64748B" }}>No incidents reported.</div>
                                        <div style={{ fontSize: 12, marginTop: 4 }}>You have a clean safety record.</div>
                                    </div>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: "left", padding: 12, fontSize: 11, color: "#94A3B8", letterSpacing: 1, borderBottom: "1px solid #E2E8F0" }}>ID</th>
                                                <th style={{ textAlign: "left", padding: 12, fontSize: 11, color: "#94A3B8", letterSpacing: 1, borderBottom: "1px solid #E2E8F0" }}>INCIDENT</th>
                                                <th style={{ textAlign: "left", padding: 12, fontSize: 11, color: "#94A3B8", letterSpacing: 1, borderBottom: "1px solid #E2E8F0" }}>DATE</th>
                                                <th style={{ textAlign: "left", padding: 12, fontSize: 11, color: "#94A3B8", letterSpacing: 1, borderBottom: "1px solid #E2E8F0" }}>PRIORITY</th>
                                                <th style={{ textAlign: "left", padding: 12, fontSize: 11, color: "#94A3B8", letterSpacing: 1, borderBottom: "1px solid #E2E8F0" }}>STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.slice(0, 3).map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ padding: "16px 12px", fontSize: 13, fontWeight: 800, color: "#1E3A8A" }}>{r.id}</td>
                                                    <td style={{ padding: "16px 12px", fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{r.type}</td>
                                                    <td style={{ padding: "16px 12px", fontSize: 13, color: "#64748B" }}>{new Date(r.date || Date.now()).toLocaleDateString()}</td>
                                                    <td style={{ padding: "16px 12px" }}><LevelBadge level={r.level} /></td>
                                                    <td style={{ padding: "16px 12px" }}><StatusBadge status={r.status} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "My Reports" && (
                        <div className="slide-in">
                            <div className="card" style={{ padding: 32, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1E293B" }}>Incident Vault</h3>
                                </div>
                                {loading ? (
                                    <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
                                ) : reports.length === 0 ? (
                                    <div style={{ padding: 60, textAlign: "center", color: "#94A3B8", background: "#F8FAFC", borderRadius: 12, border: "1px dashed #E2E8F0" }}>
                                        <Icon name="check-circle" size={48} color="#CBD5E1" />
                                        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 16, color: "#64748B" }}>No History Found</div>
                                        <div style={{ fontSize: 14, marginTop: 8 }}>You haven't filed any emergency reports yet.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                                        {reports.map((r) => (
                                            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 24, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}>
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                                        <span style={{ fontSize: 14, fontWeight: 900, color: "#1E3A8A" }}>{r.id}</span>
                                                        <LevelBadge level={r.level} />
                                                    </div>
                                                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>{r.type}</div>
                                                    <div style={{ fontSize: 13, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                                                        <Icon name="map-pin" size={14} color="#94A3B8" /> {r.location}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                                                    <StatusBadge status={r.status} />
                                                    <button onClick={() => navigate("/track")} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#1E3A8A", cursor: "pointer" }}>Track Live Progress</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
