import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import API from "../config/api";

const HospitalDashboard = () => {
    const [tab, setTab] = useState("alerts");
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await API.get("/reports");
                setReports(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchReports();
    }, []);

    const criticals = reports.filter(r => (r.level === "Critical" || r.type === "Road Accident") && r.status !== "Resolved");

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
            <div style={{ width: 200, background: COLORS.bgCard, borderRight: `1px solid ${COLORS.border}`, padding: "20px 12px", flexShrink: 0 }}>
                <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, padding: "0 14px", marginBottom: 8 }}>Hospital Portal</div>
                {[{ id: "alerts", icon: "bell-ringing", label: "Emergency Alerts" }, { id: "team", icon: "users", label: "Response Teams" }].map(t => (
                    <button key={t.id} className={`sidebar-link ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                        <Icon name={t.icon} size={16} />{t.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                {tab === "alerts" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Emergency Alerts</h2>
                        {criticals.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textMuted }}>
                                <Icon name="check-circle" size={48} color={COLORS.success} />
                                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 16 }}>No Active Emergencies</div>
                            </div>
                        ) : criticals.map(r => (
                            <div key={r.id} className="card" style={{ borderLeft: `4px solid ${COLORS.danger}`, marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{r.type}</h3>
                                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 10 }}>{r.description}</p>
                                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: COLORS.textDim }}>
                                            <span><Icon name="map-pin" size={12} /> {r.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === "team" && (
                    <div className="slide-in">
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Emergency Response Teams</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                            {[{ name: "Team Alpha", members: 4, vehicle: "Ambulance #01", status: "Available", lead: "Dr. Mukamana R." }].map(t => (
                                <div key={t.name} className="card" style={{ padding: 18 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</h3>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{t.lead}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalDashboard;
