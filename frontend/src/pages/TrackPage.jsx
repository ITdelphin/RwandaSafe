import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const TrackPage = () => {
    const [reports, setReports] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get("/reports");
                setReports(res.data);
                if (res.data.length > 0 && !selected) setSelected(res.data[0]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 15000);
        return () => clearInterval(interval);
    }, []);

    const timelines = [
        { status: "Signal Received", time: "10:24 AM", desc: "Emergency intake confirmed by National Security Gateway.", done: true },
        { status: "Dispatched", time: "10:26 AM", desc: "Nearest RNP unit (Alpha-04) assigned to location.", done: true },
        { status: "On Site", time: "10:32 AM", desc: "Response units have arrived and are securing the scene.", done: selected?.status !== "Open" },
        { status: "Investigation", time: "Pending", desc: "Evidence review and case documentation in progress.", done: selected?.status === "Resolved" },
    ];

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><span className="pulse">Connecting to Tracking System...</span></div>;

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 64px)", background: "#F8FAFC" }}>
            {/* Case List Sidebar - LIGHT */}
            <div style={{ width: 360, background: "#FFFFFF", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "32px 24px", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#C8102E", letterSpacing: 1.5, marginBottom: 8 }}>INVESTIGATION VAULT</div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>Track Incident</h2>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                    {reports.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>No active signals found.</div>
                    ) : reports.map(r => (
                        <div
                            key={r.id}
                            onClick={() => setSelected(r)}
                            style={{
                                padding: "20px",
                                borderRadius: 16,
                                cursor: "pointer",
                                border: selected?.id === r.id ? "1.5px solid #1E3A8A" : "1.5px solid transparent",
                                background: selected?.id === r.id ? "#E8F0FE" : "transparent",
                                transition: "all 0.2s",
                                marginBottom: 4
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: selected?.id === r.id ? "#1E3A8A" : "#94A3B8" }}>#{r.id}</span>
                                <StatusBadge status={r.status} />
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{r.type}</div>
                            <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                                <Icon name="map-pin" size={12} color="#94A3B8" /> {r.location}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "60px", background: "#FFFFFF", overflowY: "auto" }}>
                {selected ? (
                    <div className="slide-in" style={{ maxWidth: 700 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 48 }}>
                            <div>
                                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                                    <LevelBadge level={selected.level} />
                                    <span style={{ fontSize: 14, color: "#94A3B8", fontWeight: 700 }}>Case ID: {selected.id}</span>
                                </div>
                                <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px" }}>{selected.type}</h1>
                                <p style={{ color: "#64748B", fontSize: 16, marginTop: 8 }}>Emergency reported at <b>{selected.location}</b></p>
                            </div>
                            <button className="btn-secondary" style={{ padding: "12px 24px" }}>Export PDF Report</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
                            <div className="card" style={{ padding: 32, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Detailed Narrative</h3>
                                <p style={{ fontSize: 15, lineHeight: 1.8, color: "#334155" }}>{selected.description}</p>
                            </div>

                            <div style={{ padding: "0 20px" }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 32 }}>Investigation Timeline</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {timelines.map((t, i) => (
                                        <div key={i} style={{ display: "flex", gap: 24, paddingBottom: 32, position: "relative" }}>
                                            {i < timelines.length - 1 && <div style={{ position: "absolute", left: 11, top: 32, bottom: 0, width: 2, background: t.done ? "#1E3A8A" : "#F1F5F9" }} />}
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                background: t.done ? "#1E3A8A" : "#FFFFFF",
                                                border: "2px solid #1E3A8A",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 1
                                            }}>
                                                {t.done && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                                            </div>
                                            <div>
                                                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                                                    <span style={{ fontSize: 14, fontWeight: 800, color: t.done ? "#0F172A" : "#94A3B8" }}>{t.status}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>{t.time}</span>
                                                </div>
                                                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{t.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                        Select an incident from the vault to track live progress.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackPage;
