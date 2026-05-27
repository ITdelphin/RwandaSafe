import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const HospitalDashboard = ({ user, onLogout }) => {
    const [tab, setTab] = useState("alerts");
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await API.get("/reports");
                setReports(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
        const interval = setInterval(fetchReports, 10000);
        return () => clearInterval(interval);
    }, []);

    const medicalReports = reports.filter(r =>
        (r.level === "Critical" || r.type === "Road Accident" || r.type === "Medical Emergency" || r.type === "Fire") && r.status !== "Resolved"
    );

    const triageCategories = [
        { label: "Immediate (Red)", cases: medicalReports.filter(r => r.level === "Critical").length, color: "#C8102E", icon: "alert-circle", desc: "Life-threatening emergencies" },
        { label: "Urgent (Orange)", cases: medicalReports.filter(r => r.level === "High").length, color: "#F97316", icon: "alert-triangle", desc: "Non-critical but serious" },
        { label: "Delayed (Yellow)", cases: medicalReports.filter(r => r.level === "Medium").length, color: "#F4B400", icon: "info-circle", desc: "Stable condition" },
    ];

    const ambulanceFleet = [
        { id: "SAMU-01", unit: "Alpha-1", status: "Dispatched", loc: "Nyarugenge", eta: "4m" },
        { id: "SAMU-02", unit: "Bravo-2", status: "Available", loc: "CHUK Base", eta: "—" },
        { id: "SAMU-03", unit: "Charlie-3", status: "Available", loc: "CHUK Base", eta: "—" },
    ];

    const tabs = [
        { id: "alerts", icon: "bell-ringing", label: "Incident Feed" },
        { id: "triage", icon: "heart", label: "Triage Center" },
        { id: "fleet", icon: "ambulance", label: "SAMU Fleet" },
        { id: "resources", icon: "users", label: "ICU Resources" },
    ];

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><span className="pulse">Syncing Medical Protocols...</span></div>;

    return (
        <div className="dashboard-container">
            {/* Sidebar - LIGHT THEME */}
            <div className="dashboard-sidebar" style={{ background: "#FFFFFF", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 12px" }}>
                    <div style={{ width: 40, height: 40, background: "#E6F4EA", border: "1px solid #CEEAD6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="building-hospital" size={20} color="#1E3A8A" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>CHUK Portal</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Medical Systems</div>
                    </div>
                </div>

                <div className="dashboard-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`sidebar-link ${tab === t.id ? "active" : ""}`}
                        >
                            <Icon name={t.icon} size={18} color={tab === t.id ? "#1E3A8A" : "#64748B"} />
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="dashboard-sidebar-footer" style={{ marginTop: "auto", padding: "24px 16px" }}>
                    <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#C8102E", marginBottom: 8 }}>EMERGENCY ALERTS</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#C8102E" }}>{medicalReports.filter(r => r.level === "Critical").length}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Priority cases active</div>
                    </div>

                    {/* Officer / User card */}
                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(145deg, #1E3A8A, #2D5DD6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", boxShadow: "0 3px 10px rgba(30,58,138,0.2)" }}>
                                {(user?.name || "H")[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#1E293B" }}>{user?.name || "Medical Officer"}</div>
                                <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                                    {user?.role || "Hospital"} UNIT
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to sign out from CHUK Portal?")) {
                                    onLogout && onLogout();
                                }
                            }}
                            style={{
                                width: "100%", padding: "10px",
                                background: "#FEF2F2",
                                border: "1.5px solid #FCA5A5",
                                borderRadius: 10, color: "#DC2626",
                                fontSize: 13, fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.2s", fontFamily: "'Sora', sans-serif",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#EF4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FCA5A5"; }}
                        >
                            <Icon name="logout" size={16} color="#DC2626" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main dashboard-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Medical Response</h1>
                        <p style={{ color: "#64748B", fontSize: 14 }}>Real-time triage and ambulance dispatch synchronization.</p>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn-secondary" style={{ padding: "10px 20px" }}>Triage Report</button>
                        <button className="btn-primary" style={{ padding: "10px 20px", background: "#1E3A8A", border: "none", boxShadow: "0 10px 20px rgba(15,157,88,0.2)" }}>Dispatch AMB</button>
                    </div>
                </div>

                {tab === "alerts" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                        {medicalReports.length === 0 ? (
                            <div className="card" style={{ padding: 64, textAlign: "center", color: "#94A3B8" }}>
                                <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>✅</span>
                                No active medical emergencies.
                            </div>
                        ) : medicalReports.map(r => (
                            <div key={r.id} className="card" style={{ padding: 24, borderLeft: `6px solid ${r.level === "Critical" ? "#EF4444" : "#F59E0B"}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", background: "#F0FDF4", padding: "4px 8px", borderRadius: 6 }}>#{r.id}</span>
                                            <LevelBadge level={r.level} />
                                            <StatusBadge status={r.status} />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>{r.type}</h3>
                                        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{r.description}</p>
                                        <div style={{ display: "flex", gap: 20, color: "#94A3B8", fontSize: 12, fontWeight: 700 }}>
                                            <span>📍 {r.location}</span>
                                            <span>📞 Contact: {r.reporter}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 24 }}>
                                        <button className="btn-primary" style={{ padding: "10px 20px", background: "#10B981" }} onClick={() => toast.success("AMBULANCE DISPATCHED")}>Verify & Dispatch</button>
                                        <button className="btn-secondary" style={{ padding: "10px 20px" }}>Clinical Data</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "triage" && (
                    <div className="grid-3">
                        {triageCategories.map(t => (
                            <div key={t.label} className="card" style={{ padding: 32, textAlign: "center", borderTop: `6px solid ${t.color}` }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Icon name={t.icon} size={32} color={t.color} />
                                </div>
                                <div style={{ fontSize: 44, fontWeight: 900, color: t.color }}>{t.cases}</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginTop: 8 }}>{t.label}</div>
                                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{t.desc}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalDashboard;
