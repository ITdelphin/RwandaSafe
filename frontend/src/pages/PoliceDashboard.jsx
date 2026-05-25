import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import API from "../config/api";

const PoliceDashboard = ({ user }) => {
    const [tab, setTab] = useState("cases");
    const [showModal, setShowModal] = useState(null);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await API.get("/reports");
            setReports(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.patch(`/reports/${id}/status`, { status, officer: user?.name });
            fetchReports();
        } catch (err) {
            console.error(err);
        }
    };

    const myReports = reports.filter(r => r.status !== "Resolved");

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
            <div style={{ width: 200, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, padding: "20px 12px", flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, padding: "0 14px", marginBottom: 8 }}>Police Portal</div>
                {[{ id: "cases", icon: "file-report", label: "Active Cases" }, { id: "map", icon: "map", label: "Crime Map" }, { id: "history", icon: "history", label: "History" }].map(t => (
                    <button key={t.id} className={`sidebar-link ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                        <Icon name={t.icon} size={16} />{t.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                {tab === "cases" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Active Cases</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                            {myReports.map(r => (
                                <div key={r.id} className="card" style={{ borderLeft: `4px solid ${r.level === "Critical" ? COLORS.danger : r.level === "High" ? COLORS.warning : r.level === "Medium" ? COLORS.info : COLORS.success}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: COLORS.primary }}>{r.id}</span>
                                                <LevelBadge level={r.level} />
                                                <StatusBadge status={r.status} />
                                            </div>
                                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{r.type}</h3>
                                            <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 10 }}>{r.description.slice(0, 120)}...</p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 20 }}>
                                            <button className="btn-info" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setShowModal(r.id)}><Icon name="eye" size={13} /> View</button>
                                            {r.status === "Open" && <button className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => updateStatus(r.id, "In Progress")}><Icon name="check" size={13} /> Accept</button>}
                                            {r.status === "In Progress" && <button className="btn-success" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => updateStatus(r.id, "Resolved")}><Icon name="check-circle" size={13} /> Resolve</button>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "map" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Crime Map — Kigali</h2>
                        <div className="map-placeholder" style={{ height: 480, marginBottom: 20 }}>
                            <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,.7)", padding: "10px 14px", borderRadius: 10, fontSize: 12 }}>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Active Reports</div>
                                {reports.filter(r => r.status !== "Resolved").map(r => (
                                    <div key={r.id} style={{ display: "flex", gap: 6, marginBottom: 3, color: COLORS.textMuted }}>
                                        <Icon name="map-pin" size={11} color={r.level === "Critical" ? COLORS.danger : r.level === "High" ? COLORS.warning : COLORS.info} />
                                        {r.location}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === "history" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Case History</h2>
                        <div className="card" style={{ padding: 0 }}>
                            <table>
                                <thead><tr><th>ID</th><th>Type</th><th>Level</th><th>Status</th><th>Officer</th></tr></thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: COLORS.primary }}>{r.id}</td>
                                            <td style={{ fontSize: 13 }}>{r.type}</td>
                                            <td><LevelBadge level={r.level} /></td>
                                            <td><StatusBadge status={r.status} /></td>
                                            <td style={{ fontSize: 12, color: COLORS.textMuted }}>{r.assignedOfficer || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{r.type}</h2>
                            <div style={{ fontSize: 13, lineHeight: 1.7, color: COLORS.textMuted, marginBottom: 16 }}>{r.description}</div>
                            <button className="btn-secondary" onClick={() => setShowModal(null)}>Close</button>
                        </div>
                    </div>
                ) : null;
            })()}
        </div>
    );
};

export default PoliceDashboard;
