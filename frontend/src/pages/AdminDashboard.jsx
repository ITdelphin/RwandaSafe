import React, { useState, useEffect } from "react";
import { COLORS, EMERGENCY_TYPES } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import API from "../config/api";

const AdminDashboard = () => {
    const [tab, setTab] = useState("overview");
    const [showModal, setShowModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [statsData, setStatsData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [tab]);

    const fetchData = async () => {
        try {
            if (tab === "overview" || tab === "reports" || tab === "evidence") {
                const repRes = await API.get("/reports");
                setReports(repRes.data);
            }
            if (tab === "overview" || tab === "analytics") {
                const statRes = await API.get("/admin/stats");
                setStatsData(statRes.data);
            }
            if (tab === "users") {
                const userRes = await API.get("/admin/users");
                setUsers(userRes.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.patch(`/reports/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleUserStatus = async (id) => {
        try {
            await API.patch(`/admin/users/${id}/status`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const stats = statsData ? [
        { label: "Total Reports", val: statsData.stats.totalReports, icon: "file-report", color: COLORS.primary, sub: "Total tracked" },
        { label: "Active Cases", val: statsData.stats.activeCases, icon: "activity", color: COLORS.warning, sub: "In progress" },
        { label: "Resolved", val: statsData.stats.resolved, icon: "check-circle", color: COLORS.success, sub: "Case solved" },
        { label: "Critical Alerts", val: statsData.stats.criticalAlerts, icon: "alert-triangle", color: COLORS.danger, sub: "Needs attention" },
        { label: "Open Cases", val: statsData.stats.openCases, icon: "folder-open", color: COLORS.info, sub: "Awaiting officer" },
        { label: "Fake Detected", val: statsData.stats.fakeDetected, icon: "shield-x", color: "#A855F7", sub: "Flagged reports" },
    ] : [];

    const byType = statsData ? Object.entries(statsData.byType).map(([type, count]) => ({ type, count })) : [];
    const maxCount = Math.max(...byType.map(x => x.count), 1);

    const tabs = [
        { id: "overview", icon: "dashboard", label: "Overview" },
        { id: "reports", icon: "file-report", label: "All Reports" },
        { id: "users", icon: "users", label: "Users" },
        { id: "analytics", icon: "chart-bar", label: "Analytics" },
        { id: "evidence", icon: "folder", label: "Evidence" }
    ];

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
            {/* Sidebar */}
            <div
                style={{
                    width: 220,
                    background: COLORS.bgCard,
                    borderRight: `1px solid ${COLORS.border}`,
                    padding: "20px 12px",
                    flexShrink: 0,
                    position: "sticky",
                    top: 60,
                    height: "calc(100vh - 60px)",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        color: COLORS.textDim,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        padding: "0 14px",
                        marginBottom: 8,
                    }}
                >
                    Admin Panel
                </div>
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        className={`sidebar-link ${tab === t.id ? "active" : ""}`}
                        onClick={() => setTab(t.id)}
                    >
                        <Icon name={t.icon} size={16} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                {tab === "overview" && statsData && (
                    <div className="slide-in">
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                                Admin Dashboard
                            </h2>
                            <p style={{ color: COLORS.textMuted, fontSize: 14 }}>
                                System overview — {new Date().toLocaleDateString("en-RW", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
                            {stats.map((s) => (
                                <div key={s.label} className="stat-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                                        </div>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Icon name={s.icon} size={20} color={s.color} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                            <div className="card">
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Recent Reports</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Type</th>
                                            <th>Level</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.slice(0, 5).map((r) => (
                                            <tr key={r.id}>
                                                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: COLORS.primary }}>
                                                    {r.id}
                                                </td>
                                                <td style={{ fontSize: 13 }}>{r.type}</td>
                                                <td><LevelBadge level={r.level} /></td>
                                                <td><StatusBadge status={r.status} /></td>
                                                <td>
                                                    <button className="btn-info" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setShowModal(r.id)}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Reports by Type</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {byType.filter(x => x.count > 0).map((x) => (
                                        <div key={x.type}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                                <span style={{ color: COLORS.textMuted }}>{x.type}</span>
                                                <span style={{ fontWeight: 600 }}>{x.count}</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${(x.count / maxCount) * 100}%`, background: COLORS.primary }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "reports" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>All Reports</h2>
                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Report ID</th>
                                        <th>Type</th>
                                        <th>Reporter</th>
                                        <th>Level</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr key={r.id}>
                                            <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: COLORS.primary }}>{r.id}</td>
                                            <td style={{ fontSize: 13, fontWeight: 600 }}>{r.type}</td>
                                            <td style={{ fontSize: 12, color: COLORS.textMuted }}>{r.reporter}</td>
                                            <td><LevelBadge level={r.level} /></td>
                                            <td><StatusBadge status={r.status} /></td>
                                            <td>
                                                <div style={{ display: "flex", gap: 5 }}>
                                                    <button className="btn-info" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => setShowModal(r.id)}>View</button>
                                                    {r.status !== "Resolved" && (
                                                        <button className="btn-success" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => updateStatus(r.id, "Resolved")}>Resolve</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === "users" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>User Management</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                            {users.map((u, i) => (
                                <div key={i} className="card" style={{ padding: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${COLORS.primary}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: COLORS.primary }}>
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                                            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{u.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 12 }}>
                                        <span style={{ background: COLORS.bgPanel, padding: "3px 8px", borderRadius: 6, fontSize: 11 }}>{u.role}</span>
                                        <span className={`badge badge-${u.status === "Active" ? "low" : "critical"}`}>{u.status}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>{u.reports} reports submitted</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button className={u.status === "Active" ? "btn-danger" : "btn-success"} style={{ flex: 1, padding: "5px", fontSize: 11 }} onClick={() => toggleUserStatus(u.id)}>
                                            {u.status === "Active" ? "Suspend" : "Activate"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "analytics" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Analytics & Statistics</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                            {[
                                { label: "Resolution Rate", val: "91%", icon: "check", color: COLORS.success },
                                { label: "Avg Response Time", val: "4.9 min", icon: "clock", color: COLORS.info },
                                { label: "Critical Handled", val: "100%", icon: "flame", color: COLORS.danger },
                                { label: "False Reports", val: "2.1%", icon: "shield-x", color: "#A855F7" }
                            ].map(s => (
                                <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                                    <Icon name={s.icon} size={24} color={s.color} />
                                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 10 }}>{s.val}</div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "evidence" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Evidence Vault</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
                            {reports.flatMap(r => r.evidence.map(ev => ({ ev, id: r.id, type: r.type }))).map(({ ev, id, type }, i) => (
                                <div key={i} className="card" style={{ padding: 12, textAlign: "center", cursor: "pointer" }} onClick={() => window.open(ev, "_blank")}>
                                    <div style={{ width: "100%", height: 120, borderRadius: 10, background: COLORS.bgPanel, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden" }}>
                                        {ev.match(/\.(jpg|jpeg|png|gif|webp)/i) || ev.includes("supabase.co/storage/v1/object/public/evidence") ? (
                                            <img src={ev} alt="evidence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <Icon name={ev.includes("mp4") ? "video" : ev.includes("mp3") ? "microphone" : "photo"} size={32} color={COLORS.primary} />
                                        )}
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{type}</div>
                                    <div style={{ fontSize: 10, color: COLORS.textMuted }}>Case {id}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Modal */}
            {showModal && (() => {
                const r = reports.find(x => x.id === showModal);
                return r ? (
                    <div className="modal-overlay" onClick={() => setShowModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: COLORS.primary, fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{r.id}</div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{r.type}</h2>
                                </div>
                                <button onClick={() => setShowModal(null)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><LevelBadge level={r.level} /><StatusBadge status={r.status} /></div>
                            <div style={{ fontSize: 13, lineHeight: 1.7, color: COLORS.textMuted, marginBottom: 16 }}>{r.description}</div>

                            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                <button className="btn-success" style={{ flex: 1, padding: "10px" }} onClick={() => { updateStatus(showModal, "Resolved"); setShowModal(null); }}>Resolve Case</button>
                            </div>
                        </div>
                    </div>
                ) : null;
            })()}
        </div>
    );
};

export default AdminDashboard;
