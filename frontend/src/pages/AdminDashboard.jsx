import React, { useState, useEffect } from "react";
import { COLORS, EMERGENCY_TYPES } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const AdminDashboard = () => {
    const [tab, setTab] = useState("overview");
    const [showModal, setShowModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [tab]);

    const fetchData = async () => {
        try {
            if (tab === "overview" || tab === "reports" || tab === "evidence") {
                const repRes = await API.get("/reports");
                setReports(repRes.data);
            }
            if (tab === "overview" || tab === "analytics" || tab === "health") {
                const statRes = await API.get("/admin/stats");
                setStatsData(statRes.data);
            }
            if (tab === "users") {
                const userRes = await API.get("/admin/users");
                setUsers(userRes.data);
            }
            const logsRes = await API.get("/admin/audit-logs");
            setAuditLogs(logsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats = statsData ? [
        { label: "Total Reports", val: statsData.stats.totalReports, icon: "file-report", color: "#C8102E" },
        { label: "Active Units", val: "12", icon: "activity", color: "#1E3A8A" },
        { label: "Resolved", val: statsData.stats.resolved, icon: "check-circle", color: "#1E3A8A" },
        { label: "System Uptime", val: "99.9%", icon: "server", color: "#6366F1" },
    ] : [];

    const tabs = [
        { id: "overview", icon: "dashboard", label: "Overview" },
        { id: "reports", icon: "file-report", label: "Investigations" },
        { id: "users", icon: "users", label: "System Users" },
        { id: "analytics", icon: "chart-bar", label: "Insights" },
        { id: "evidence", icon: "folder", label: "Vault" },
        { id: "health", icon: "shield-check", label: "System Health" },
    ];

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><span className="pulse">Loading Admin Interface...</span></div>;

    return (
        <div className="dashboard-container">
            {/* Sidebar - NEW LIGHT VERSION */}
            <div className="dashboard-sidebar" style={{ background: "#FFFFFF", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, padding: "0 12px" }}>
                    <div style={{ width: 40, height: 40, background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🇷🇼</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>SafeRwanda</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Admin Authority</div>
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

                <div className="dashboard-sidebar-footer" style={{ marginTop: "auto", paddingTop: 40 }}>
                    <div style={{ padding: "20px", background: "#F8FAFC", borderRadius: 16, border: "1px solid #F1F5F9" }}>
                        <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12, fontWeight: 700 }}>SYSTEM STATUS</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div className="pulse-green" style={{ width: 8, height: 8, background: "#1E3A8A", borderRadius: "50%" }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1E3A8A" }}>All Services Online</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>Version 2.1.0-Professional</div>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="dashboard-main dashboard-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#C8102E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>REPUBLIC OF RWANDA</div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A" }}>{tabs.find(t => t.id === tab).label}</h1>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn-secondary" style={{ padding: "10px 20px" }}>
                            📋 Audit Trail
                        </button>
                        <button onClick={() => setShowModal("broadcast")} className="btn-primary" style={{ padding: "10px 20px" }}>
                            📢 Disseminate Alert
                        </button>
                    </div>
                </div>

                {/* Broadcast Modal */}
                {showModal === "broadcast" && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                        <div className="card slide-in" style={{ width: 450, padding: 32, background: "#FFFFFF", borderRadius: 24 }}>
                            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Official Safety Alert</div>
                            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>This broadcast will be visible to all Citizens instantly.</p>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", display: "block", marginBottom: 8 }}>Alert Type</label>
                                <select id="bType" style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", outline: "none", fontSize: 14 }}>
                                    <option>Info</option>
                                    <option>Urgent</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: 32 }}>
                                <label style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", display: "block", marginBottom: 8 }}>Broadcast Message</label>
                                <textarea id="bMsg" placeholder="Enter safety instruction..." style={{ width: "100%", height: 100, padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0", outline: "none", fontSize: 14, resize: "none" }}></textarea>
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <button onClick={() => setShowModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button
                                    onClick={async () => {
                                        const type = document.getElementById("bType").value;
                                        const message = document.getElementById("bMsg").value;
                                        if (!message) return toast.error("Message required");
                                        try {
                                            await API.post("/broadcasts", { type, message });
                                            toast.success("Alert Broadcasted Successfully");
                                            setShowModal(null);
                                        } catch (err) { toast.error("Broadcast failed"); }
                                    }}
                                    className="btn-primary" style={{ flex: 1 }}
                                >
                                    Publish Alert
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="slide-in">
                    {tab === "overview" && (
                        <>
                            <div className="grid-4" style={{ marginBottom: 32 }}>
                                {stats.map(s => (
                                    <div key={s.label} className="card" style={{ padding: 24 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Icon name={s.icon} size={22} color={s.color} />
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>+4.2% ↑</div>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#1E293B" }}>{s.val}</div>
                                        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginTop: 4 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid-2">
                                <div className="card" style={{ padding: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Live Incident Feed</h3>
                                        <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 800, letterSpacing: 0.5 }}>REAL-TIME SYNC</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {reports.slice(0, 6).map(r => (
                                            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #F1F5F9" }}>
                                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                    <div style={{ width: 8, height: 8, background: r.level === "Critical" ? "#EF4444" : "#CBD5E1", borderRadius: "50%" }} />
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{r.type}</div>
                                                        <div style={{ fontSize: 11, color: "#94A3B8" }}>#{r.id} • {r.location}</div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={r.status} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card" style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Security Logs</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {auditLogs.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#94A3B8" }}>No security logs found.</div>
                                        ) : auditLogs.map(log => (
                                            <div key={log.id} style={{ fontSize: 12, display: "flex", gap: 12 }}>
                                                <div style={{ background: log.type === "Danger" ? "#FEF2F2" : "#F1F5F9", color: log.type === "Danger" ? "#C8102E" : "#64748B", padding: "6px 10px", borderRadius: 8, fontWeight: 800, height: "fit-content" }}>{log.type[0]}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#0F172A" }}>{log.action}: {log.target}</div>
                                                    <div style={{ color: "#94A3B8", marginTop: 2 }}>{log.actor} • {new Date(log.createdAt).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {tab === "health" && (
                        <div className="grid-3" style={{ gap: 24 }}>
                            <div className="card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Infrastructure</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {[
                                        { label: "Database", status: "Healthy", val: "2ms" },
                                        { label: "Redis Cache", status: "Healthy", val: "1ms" },
                                        { label: "Gateway", status: "Optimized", val: "48ms" }
                                    ].map(h => (
                                        <div key={h.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700 }}>{h.label}</div>
                                                <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>● {h.status}</div>
                                            </div>
                                            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700 }}>{h.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Performance</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
                                            <span>CPU Load</span>
                                            <span>24%</span>
                                        </div>
                                        <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ width: "24%", height: "100%", background: "#C8102E" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
                                            <span>Memory Usage</span>
                                            <span>4.8GB</span>
                                        </div>
                                        <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ width: "30%", height: "100%", background: "#3B82F6" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, #C8102E, #9B0C23)", color: "#fff" }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Auto-Backup</h3>
                                <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>02:44:11</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Next scheduled sync to National Security Cloud.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
