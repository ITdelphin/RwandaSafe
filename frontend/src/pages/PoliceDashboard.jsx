import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const PoliceDashboard = ({ user }) => {
    const [tab, setTab] = useState("cases");
    const [showModal, setShowModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [filterLevel, setFilterLevel] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 15000);
        return () => clearInterval(interval);
    }, []);

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

    const updateStatus = async (id, status) => {
        try {
            await API.patch(`/reports/${id}/status`, { status, officer: user?.name });
            toast.success(`Priority updated: ${status}`);
            fetchReports();
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const activeReports = reports.filter(r => r.status !== "Resolved");
    const resolvedReports = reports.filter(r => r.status === "Resolved");
    const filteredReports = filterLevel === "All" ? activeReports : activeReports.filter(r => r.level === filterLevel);

    const stats = [
        { label: "Pending", val: activeReports.filter(r => r.status === "Open").length, color: "#C8102E" },
        { label: "Critical", val: activeReports.filter(r => r.level === "Critical").length, color: "#C8102E" },
        { label: "Assigned", val: activeReports.filter(r => r.status === "In Progress").length, color: "#1E3A8A" },
        { label: "Successful", val: resolvedReports.length, color: "#1E3A8A" },
    ];

    const tabs = [
        { id: "cases", icon: "file-report", label: "Active Intel" },
        { id: "map", icon: "map", label: "District Map" },
        { id: "history", icon: "history", label: "Archives" },
    ];

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><span className="pulse">Syncing with Police Network...</span></div>;

    return (
        <div className="dashboard-container">
            {/* Sidebar - LIGHT THEME */}
            <div className="dashboard-sidebar" style={{ background: "#FFFFFF", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 12px" }}>
                    <div style={{ width: 40, height: 40, background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="shield-lock" size={20} color="#C8102E" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>RNP Portal</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Security Network</div>
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
                    <div style={{ background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 16, padding: "16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#10B981", marginBottom: 8 }}>DUTY STATUS</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                            <div className="pulse-green" style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                            Officer {user?.name?.split(' ')[0]}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main dashboard-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Emergency Queue</h1>
                        <p style={{ color: "#64748B", fontSize: 14 }}>Real-time coordination with National Police Headquarters.</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["All", "Critical", "High"].map(l => (
                            <button
                                key={l}
                                onClick={() => setFilterLevel(l)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: 10,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    border: "1px solid #E2E8F0",
                                    background: filterLevel === l ? "#C8102E" : "#fff",
                                    color: filterLevel === l ? "#fff" : "#64748B",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid-4" style={{ marginBottom: 32 }}>
                    {stats.map(s => (
                        <div key={s.label} className="card" style={{ padding: 24, textAlign: "center" }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {tab === "cases" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                        {filteredReports.map(r => (
                            <div key={r.id} className="card" style={{ padding: 24, borderLeft: `6px solid ${r.level === "Critical" ? "#EF4444" : "#F59E0B"}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: "#C8102E", background: "#FEF2F2", padding: "4px 8px", borderRadius: 6, fontFamily: "monospace" }}>#{r.id}</span>
                                            <LevelBadge level={r.level} />
                                            <StatusBadge status={r.status} />
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>{r.type}</h3>
                                        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{r.description}</p>
                                        <div style={{ display: "flex", gap: 20, color: "#94A3B8", fontSize: 12, fontWeight: 700 }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Icon name="map-pin" size={14} /> {r.location}
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Icon name="clock" size={14} /> {new Date(r.date).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 24 }}>
                                        <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: 10 }} onClick={() => setShowModal(r.id)}>Action Center</button>
                                        {r.status === "Open" && <button className="btn-success" style={{ padding: "10px 20px", borderRadius: 10 }} onClick={() => updateStatus(r.id, "In Progress")}>Accept Unit</button>}
                                        {r.status === "In Progress" && <button className="btn-success" style={{ padding: "10px 20px", borderRadius: 10 }} onClick={() => updateStatus(r.id, "Resolved")}>Close Case</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (() => {
                const r = reports.find(x => x.id === showModal);
                return (
                    <div className="modal-overlay" onClick={() => setShowModal(null)}>
                        <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>Investigation Docket</h2>
                                <button onClick={() => setShowModal(null)} style={{ background: "none", fontSize: 24, color: "#94A3B8" }}>✕</button>
                            </div>
                            <div className="card" style={{ padding: 20, marginBottom: 24, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                                <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, color: "#C8102E" }}>INCIDENT DESCRIPTION</div>
                                <div style={{ fontSize: 15, lineHeight: 1.6, color: "#1E293B" }}>{r?.description}</div>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-primary" style={{ flex: 1, padding: 14 }}>Download Files</button>
                                <button className="btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setShowModal(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PoliceDashboard;
