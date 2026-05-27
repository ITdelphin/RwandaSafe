import React, { useState, useEffect, useRef } from "react";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

/* ─────────────────────────── helpers ─────────────────────────── */
const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" });

const levelColor = { Critical: "#EF4444", High: "#F59E0B", Medium: "#3B82F6", Low: "#10B981" };
const levelBg = { Critical: "#FEF2F2", High: "#FFFBEB", Medium: "#EFF6FF", Low: "#F0FDF4" };
const statusColor = { Open: "#F59E0B", "In Progress": "#3B82F6", Resolved: "#10B981", Pending: "#94A3B8" };

/* ─────────────────────────── sidebar items ─────────────────────── */
const TABS = [
    { id: "intel", icon: "shield-search", label: "Active Intel", badge: null },
    { id: "map", icon: "map-2", label: "District Map", badge: null },
    { id: "history", icon: "archive", label: "Case Archive", badge: null },
];

/* ═══════════════════════════════════════════════════════════════════
   POLICE DASHBOARD
═══════════════════════════════════════════════════════════════════ */
const PoliceDashboard = ({ user }) => {
    const [tab, setTab] = useState("intel");
    const [showModal, setShowModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [filterLevel, setFilterLevel] = useState("All");
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const pollRef = useRef(null);

    /* Live clock */
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* Auto-refresh every 15 s */
    useEffect(() => {
        fetchReports();
        pollRef.current = setInterval(() => {
            setRefreshing(true);
            fetchReports().finally(() => setRefreshing(false));
        }, 15000);
        return () => clearInterval(pollRef.current);
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
            toast.success(`Status updated → ${status}`, { icon: "🛡️" });
            fetchReports();
        } catch {
            toast.error("Update failed — check connection");
        }
    };

    /* ─── derived data ─── */
    const active = reports.filter((r) => r.status !== "Resolved");
    const resolved = reports.filter((r) => r.status === "Resolved");
    const displayed =
        tab === "history"
            ? resolved
            : filterLevel === "All"
                ? active
                : active.filter((r) => r.level === filterLevel);

    const stats = [
        { label: "All Active", val: active.length, icon: "radar-2", color: "#1E3A8A", bg: "#EFF6FF", border: "#BFDBFE" },
        { label: "Critical", val: active.filter((r) => r.level === "Critical").length, icon: "flame", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
        { label: "In Progress", val: active.filter((r) => r.status === "In Progress").length, icon: "loader-2", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
        { label: "Resolved", val: resolved.length, icon: "circle-check", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
    ];

    /* ─── loading screen ─── */
    if (loading) return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "100vh", background: "#F8FAFC", gap: 16,
        }}>
            <div style={{
                width: 56, height: 56,
                background: "linear-gradient(145deg, #1E3A8A, #2D5DD6)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(30,58,138,0.25)",
                animation: "pulse 1.5s infinite",
            }}>
                <Icon name="shield" size={28} color="#fff" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
                Syncing with Police Network...
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Rwanda National Police — Secure Link</div>
        </div>
    );

    /* ═══════════════════════════════════
       RENDER
    ═══════════════════════════════════ */
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Sora', sans-serif" }}>

            {/* ├── SIDEBAR ──────────────────────────────────────── */}
            <aside style={{
                width: 260, flexShrink: 0,
                background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
                display: "flex", flexDirection: "column",
                position: "sticky", top: 0, height: "100vh",
                overflowY: "auto",
                boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
            }}>
                {/* Logo strip */}
                <div style={{
                    padding: "28px 20px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                        <div style={{
                            width: 42, height: 42,
                            background: "linear-gradient(145deg, #C8102E, #9A0C24)",
                            borderRadius: 12,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(200,16,46,0.3)",
                        }}>
                            <Icon name="shield-lock" size={22} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 16, color: "#FFFFFF", letterSpacing: -0.3 }}>
                                RNP Portal
                            </div>
                            <div style={{
                                fontSize: 8.5, color: "#475569", fontWeight: 700,
                                letterSpacing: 2, textTransform: "uppercase",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                SECURITY NETWORK
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live clock */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10, padding: "12px 14px",
                    }}>
                        <div style={{
                            fontSize: 24, fontWeight: 900, color: "#FFFFFF",
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: 2, lineHeight: 1,
                        }}>
                            {currentTime.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, letterSpacing: 1, fontWeight: 600 }}>
                            {currentTime.toLocaleDateString("en-RW", { weekday: "long", month: "short", day: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{
                        fontSize: 9, fontWeight: 800, color: "#334155",
                        letterSpacing: 2, textTransform: "uppercase",
                        padding: "4px 8px 12px",
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        OPERATIONS
                    </div>
                    {TABS.map((t) => {
                        const active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "11px 14px",
                                    background: active
                                        ? "linear-gradient(135deg, rgba(200,16,46,0.15), rgba(200,16,46,0.08))"
                                        : "transparent",
                                    border: active ? "1px solid rgba(200,16,46,0.2)" : "1px solid transparent",
                                    borderRadius: 10,
                                    color: active ? "#FFFFFF" : "#64748B",
                                    fontSize: 13, fontWeight: active ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    textAlign: "left",
                                    width: "100%",
                                    position: "relative",
                                    fontFamily: "'Sora', sans-serif",
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                    if (!active) e.currentTarget.style.color = "#CBD5E1";
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) e.currentTarget.style.background = "transparent";
                                    if (!active) e.currentTarget.style.color = "#64748B";
                                }}
                            >
                                {active && (
                                    <div style={{
                                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                                        width: 3, borderRadius: "0 2px 2px 0",
                                        background: "#C8102E",
                                    }} />
                                )}
                                <Icon name={t.icon} size={18} color={active ? "#F87171" : "#475569"} />
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Officer status card */}
                <div style={{ padding: "16px 12px 20px" }}>
                    <div style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 12, padding: "16px 14px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: "linear-gradient(145deg, #1E3A8A, #2D5DD6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 900, fontSize: 15, color: "#fff",
                                boxShadow: "0 3px 10px rgba(30,58,138,0.3)",
                            }}>
                                {(user?.name || "P")[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#F1F5F9" }}>
                                    {user?.name || "Police Officer"}
                                </div>
                                <div style={{
                                    fontSize: 9, color: "#475569", fontWeight: 700,
                                    letterSpacing: 1.5, textTransform: "uppercase",
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                    {user?.role || "Police"} UNIT
                                </div>
                            </div>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 10px",
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            borderRadius: 8,
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#22C55E",
                                boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                                animation: "pulse 2s infinite",
                            }} />
                            <span style={{
                                fontSize: 10, fontWeight: 800, color: "#22C55E",
                                letterSpacing: 1.5, textTransform: "uppercase",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                DUTY ACTIVE
                            </span>
                        </div>
                    </div>

                    {/* Refresh indicator */}
                    {refreshing && (
                        <div style={{
                            marginTop: 10, display: "flex", alignItems: "center", gap: 6,
                            justifyContent: "center", fontSize: 10, color: "#475569",
                        }}>
                            <Icon name="refresh" size={11} color="#475569" />
                            Syncing live data...
                        </div>
                    )}
                </div>
            </aside>

            {/* ├── MAIN CONTENT ─────────────────────────────────── */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* ── Top Header Bar ── */}
                <div style={{
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E2E8F0",
                    padding: "0 36px",
                    height: 68,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7,
                                background: "rgba(30,58,138,0.08)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon name="shield-search" size={15} color="#1E3A8A" />
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                                {tab === "intel" && "Active Intelligence"}
                                {tab === "map" && "District Operations Map"}
                                {tab === "history" && "Case Archive & Reports"}
                            </h1>
                            {refreshing && (
                                <div style={{
                                    padding: "3px 10px",
                                    background: "#EFF6FF",
                                    border: "1px solid #BFDBFE",
                                    borderRadius: 20,
                                    fontSize: 10, fontWeight: 700, color: "#1E3A8A",
                                    letterSpacing: 0.5,
                                }}>
                                    LIVE
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, marginLeft: 38 }}>
                            Rwanda National Police · Secure Operations Portal
                        </div>
                    </div>

                    {/* Level filters */}
                    {tab !== "history" && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginRight: 4 }}>FILTER:</span>
                            {["All", "Critical", "High", "Medium"].map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setFilterLevel(l)}
                                    style={{
                                        padding: "7px 16px",
                                        borderRadius: 8,
                                        fontSize: 11, fontWeight: 700,
                                        border: filterLevel === l
                                            ? `1.5px solid ${l === "All" ? "#1E3A8A" : levelColor[l]}`
                                            : "1.5px solid #E2E8F0",
                                        background: filterLevel === l
                                            ? l === "All" ? "rgba(30,58,138,0.08)" : levelBg[l]
                                            : "#FFFFFF",
                                        color: filterLevel === l
                                            ? l === "All" ? "#1E3A8A" : levelColor[l]
                                            : "#64748B",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        fontFamily: "'Sora', sans-serif",
                                    }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Scrollable Body ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px 48px" }}>

                    {/* ── KPI Row ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 16, marginBottom: 32,
                    }}>
                        {stats.map((s) => (
                            <div key={s.label} style={{
                                background: "#FFFFFF",
                                border: `1px solid ${s.border}`,
                                borderRadius: 16,
                                padding: "22px 24px",
                                display: "flex", alignItems: "center", gap: 16,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                transition: "all 0.25s ease",
                                cursor: "default",
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-3px)";
                                    e.currentTarget.style.boxShadow = `0 8px 24px ${s.border}88`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                                }}
                            >
                                <div style={{
                                    width: 46, height: 46, borderRadius: 12,
                                    background: s.bg,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Icon name={s.icon} size={22} color={s.color} />
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: 32, fontWeight: 900, color: s.color,
                                        lineHeight: 1, fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {s.val}
                                    </div>
                                    <div style={{
                                        fontSize: 10, fontWeight: 700, color: "#94A3B8",
                                        textTransform: "uppercase", letterSpacing: 1.2, marginTop: 4,
                                    }}>
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Active Intel Tab ── */}
                    {(tab === "intel" || tab === "history") && (
                        <div>
                            {/* Section header */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                marginBottom: 16,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 4, height: 20, borderRadius: 2,
                                        background: tab === "history"
                                            ? "linear-gradient(180deg, #10B981, #059669)"
                                            : "linear-gradient(180deg, #C8102E, #9A0C24)",
                                    }} />
                                    <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                                        {tab === "history"
                                            ? `${resolved.length} Resolved Cases`
                                            : `${displayed.length} Active Incident${displayed.length !== 1 ? "s" : ""}`}
                                    </span>
                                </div>
                                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
                                    Auto-refresh every 15s
                                </span>
                            </div>

                            {displayed.length === 0 ? (
                                <div style={{
                                    background: "#FFFFFF", border: "1px solid #E2E8F0",
                                    borderRadius: 16, padding: "60px 24px",
                                    textAlign: "center",
                                }}>
                                    <Icon name="circle-check" size={40} color="#10B981" />
                                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 16 }}>
                                        {tab === "history" ? "No resolved cases yet" : "All clear — no active incidents"}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>
                                        {tab === "history" ? "Resolved cases will appear here." : "Monitoring live feeds..."}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {displayed.map((r) => {
                                        const lColor = levelColor[r.level] || "#94A3B8";
                                        const sColor = statusColor[r.status] || "#94A3B8";
                                        return (
                                            <div key={r.id} style={{
                                                background: "#FFFFFF",
                                                border: "1px solid #E2E8F0",
                                                borderLeft: `4px solid ${lColor}`,
                                                borderRadius: 14,
                                                padding: "22px 24px",
                                                display: "flex", gap: 20,
                                                alignItems: "flex-start",
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                                transition: "all 0.25s ease",
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)";
                                                    e.currentTarget.style.transform = "translateY(-1px)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                                                    e.currentTarget.style.transform = "";
                                                }}
                                            >
                                                {/* Level indicator column */}
                                                <div style={{
                                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                                    background: levelBg[r.level] || "#F8FAFC",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    border: `1px solid ${lColor}33`,
                                                }}>
                                                    <Icon
                                                        name={r.level === "Critical" ? "flame" : r.level === "High" ? "alert-triangle" : "alert-circle"}
                                                        size={20} color={lColor}
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {/* Meta row */}
                                                    <div style={{
                                                        display: "flex", gap: 8, alignItems: "center",
                                                        marginBottom: 10, flexWrap: "wrap",
                                                    }}>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, color: "#C8102E",
                                                            background: "#FEF2F2", padding: "3px 8px",
                                                            borderRadius: 5,
                                                            fontFamily: "'JetBrains Mono', monospace",
                                                        }}>
                                                            #{r.id}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800,
                                                            color: lColor,
                                                            background: levelBg[r.level] || "#F8FAFC",
                                                            padding: "3px 10px", borderRadius: 6,
                                                            border: `1px solid ${lColor}33`,
                                                            textTransform: "uppercase", letterSpacing: 0.5,
                                                        }}>
                                                            {r.level}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 700,
                                                            color: sColor,
                                                            background: `${sColor}15`,
                                                            padding: "3px 10px", borderRadius: 6,
                                                            border: `1px solid ${sColor}30`,
                                                            textTransform: "uppercase", letterSpacing: 0.5,
                                                        }}>
                                                            {r.status}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 style={{
                                                        fontSize: 17, fontWeight: 800, color: "#0F172A",
                                                        margin: "0 0 8px", letterSpacing: -0.3,
                                                    }}>
                                                        {r.type}
                                                    </h3>
                                                    <p style={{
                                                        fontSize: 13, color: "#64748B", lineHeight: 1.65,
                                                        marginBottom: 14,
                                                    }}>
                                                        {r.description}
                                                    </p>

                                                    {/* Location + time */}
                                                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                                        {r.location && (
                                                            <span style={{
                                                                display: "flex", alignItems: "center", gap: 5,
                                                                fontSize: 12, fontWeight: 600, color: "#475569",
                                                            }}>
                                                                <Icon name="map-pin" size={13} color="#94A3B8" />
                                                                {r.location}
                                                            </span>
                                                        )}
                                                        {r.reporter && (
                                                            <span style={{
                                                                display: "flex", alignItems: "center", gap: 5,
                                                                fontSize: 12, fontWeight: 600, color: "#475569",
                                                            }}>
                                                                <Icon name="user" size={13} color="#94A3B8" />
                                                                {r.reporter}
                                                            </span>
                                                        )}
                                                        <span style={{
                                                            display: "flex", alignItems: "center", gap: 5,
                                                            fontSize: 12, fontWeight: 600, color: "#475569",
                                                        }}>
                                                            <Icon name="clock" size={13} color="#94A3B8" />
                                                            {fmtDate(r.date)} · {fmtTime(r.date)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                {tab !== "history" && (
                                                    <div style={{
                                                        display: "flex", flexDirection: "column",
                                                        gap: 8, flexShrink: 0, minWidth: 140,
                                                    }}>
                                                        <button
                                                            onClick={() => setShowModal(r.id)}
                                                            style={{
                                                                padding: "10px 0", width: "100%",
                                                                background: "linear-gradient(135deg, #1E3A8A, #2D5DD6)",
                                                                color: "#fff", border: "none", borderRadius: 9,
                                                                fontSize: 12, fontWeight: 700, cursor: "pointer",
                                                                display: "flex", alignItems: "center",
                                                                justifyContent: "center", gap: 6,
                                                                boxShadow: "0 2px 8px rgba(30,58,138,0.2)",
                                                                transition: "all 0.2s",
                                                                fontFamily: "'Sora', sans-serif",
                                                            }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(30,58,138,0.3)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,58,138,0.2)"; }}
                                                        >
                                                            <Icon name="file-report" size={13} color="#fff" />
                                                            View Docket
                                                        </button>
                                                        {r.status === "Open" && (
                                                            <button
                                                                onClick={() => updateStatus(r.id, "In Progress")}
                                                                style={{
                                                                    padding: "10px 0", width: "100%",
                                                                    background: "linear-gradient(135deg, #D97706, #B45309)",
                                                                    color: "#fff", border: "none", borderRadius: 9,
                                                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                                                    display: "flex", alignItems: "center",
                                                                    justifyContent: "center", gap: 6,
                                                                    transition: "all 0.2s",
                                                                    fontFamily: "'Sora', sans-serif",
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                                                                onMouseLeave={(e) => e.currentTarget.style.transform = ""}
                                                            >
                                                                <Icon name="user-check" size={13} color="#fff" />
                                                                Accept Unit
                                                            </button>
                                                        )}
                                                        {r.status === "In Progress" && (
                                                            <button
                                                                onClick={() => updateStatus(r.id, "Resolved")}
                                                                style={{
                                                                    padding: "10px 0", width: "100%",
                                                                    background: "linear-gradient(135deg, #16A34A, #15803D)",
                                                                    color: "#fff", border: "none", borderRadius: 9,
                                                                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                                                                    display: "flex", alignItems: "center",
                                                                    justifyContent: "center", gap: 6,
                                                                    transition: "all 0.2s",
                                                                    fontFamily: "'Sora', sans-serif",
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                                                                onMouseLeave={(e) => e.currentTarget.style.transform = ""}
                                                            >
                                                                <Icon name="circle-check" size={13} color="#fff" />
                                                                Close Case
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── District Map Tab ── */}
                    {tab === "map" && (
                        <div style={{
                            background: "#FFFFFF", border: "1px solid #E2E8F0",
                            borderRadius: 16, overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}>
                            {/* Map header */}
                            <div style={{
                                padding: "20px 24px",
                                borderBottom: "1px solid #F1F5F9",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Icon name="map-2" size={18} color="#1E3A8A" />
                                    <span style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>
                                        Rwanda District Operations Map
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: 16, fontSize: 11, fontWeight: 700 }}>
                                    {Object.entries(levelColor).map(([lvl, col]) => (
                                        <div key={lvl} style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B" }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
                                            {lvl}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Interactive map placeholder */}
                            <div style={{
                                height: 480,
                                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
                                position: "relative", overflow: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {/* Grid overlay */}
                                <div style={{
                                    position: "absolute", inset: 0,
                                    backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                                    backgroundSize: "40px 40px",
                                }} />

                                {/* Incident dots */}
                                {active.map((r, i) => {
                                    const x = 15 + (i * 17 % 70);
                                    const y = 15 + (i * 23 % 70);
                                    const col = levelColor[r.level] || "#94A3B8";
                                    return (
                                        <div key={r.id} style={{
                                            position: "absolute",
                                            left: `${x}%`, top: `${y}%`,
                                            transform: "translate(-50%, -50%)",
                                        }}>
                                            <div style={{
                                                width: 14, height: 14, borderRadius: "50%",
                                                background: col,
                                                boxShadow: `0 0 16px ${col}99`,
                                                border: "2.5px solid #0F172A",
                                                animation: r.level === "Critical" ? "pulse 1.5s infinite" : undefined,
                                                zIndex: 2,
                                                position: "relative",
                                                cursor: "pointer",
                                            }}
                                                title={`${r.type} — ${r.location}`}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Center message */}
                                {active.length === 0 && (
                                    <div style={{ textAlign: "center", color: "#475569" }}>
                                        <Icon name="map-2" size={40} color="#334155" />
                                        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: "#475569" }}>
                                            No active incidents to plot
                                        </div>
                                    </div>
                                )}

                                {/* Watermark */}
                                <div style={{
                                    position: "absolute", bottom: 16, right: 16,
                                    fontSize: 10, color: "#334155", fontWeight: 700,
                                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                                }}>
                                    RNP TACTICAL VIEW • CLASSIFIED
                                </div>
                            </div>

                            {/* Legend row */}
                            <div style={{
                                padding: "16px 24px",
                                background: "#F8FAFC", borderTop: "1px solid #F1F5F9",
                                display: "flex", gap: 24, flexWrap: "wrap",
                            }}>
                                {active.map((r) => (
                                    <div key={r.id} style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        fontSize: 12, fontWeight: 600, color: "#475569",
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            background: levelColor[r.level] || "#94A3B8",
                                        }} />
                                        {r.type} — {r.location}
                                    </div>
                                ))}
                                {active.length === 0 && (
                                    <div style={{ fontSize: 12, color: "#94A3B8" }}>All clear — no incidents to display</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═══ MODAL — Investigation Docket ═══ */}
            {showModal && (() => {
                const r = reports.find((x) => x.id === showModal);
                if (!r) return null;
                return (
                    <div
                        style={{
                            position: "fixed", inset: 0,
                            background: "rgba(15,23,42,0.65)",
                            backdropFilter: "blur(8px)",
                            zIndex: 1000,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 20,
                        }}
                        onClick={() => setShowModal(null)}
                    >
                        <div
                            style={{
                                background: "#FFFFFF", borderRadius: 20,
                                width: "100%", maxWidth: 660,
                                overflow: "hidden",
                                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
                                animation: "slideUp 0.3s ease-out",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div style={{
                                padding: "24px 28px 20px",
                                borderBottom: "1px solid #F1F5F9",
                                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                background: "linear-gradient(135deg, #0F172A, #1E293B)",
                            }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 9,
                                            background: "rgba(200,16,46,0.2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Icon name="file-report" size={16} color="#F87171" />
                                        </div>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, color: "#F87171",
                                            letterSpacing: 2, textTransform: "uppercase",
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}>
                                            INVESTIGATION DOCKET
                                        </span>
                                    </div>
                                    <h2 style={{
                                        fontSize: 22, fontWeight: 900, color: "#FFFFFF",
                                        margin: 0, letterSpacing: -0.5,
                                    }}>
                                        {r.type}
                                    </h2>
                                    <div style={{
                                        fontSize: 12, color: "#64748B", marginTop: 4,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        Case #{r.id} · {fmtDate(r.date)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(null)}
                                    style={{
                                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                                        color: "#94A3B8", width: 32, height: 32, borderRadius: 8,
                                        fontSize: 15, cursor: "pointer", display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94A3B8"; }}
                                >✕</button>
                            </div>

                            {/* Modal body */}
                            <div style={{ padding: "24px 28px" }}>
                                {/* Badges row */}
                                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                                    <span style={{
                                        padding: "5px 12px", borderRadius: 7,
                                        background: levelBg[r.level], color: levelColor[r.level],
                                        fontSize: 11, fontWeight: 800,
                                        border: `1px solid ${levelColor[r.level]}33`,
                                        textTransform: "uppercase", letterSpacing: 0.5,
                                    }}>{r.level}</span>
                                    <span style={{
                                        padding: "5px 12px", borderRadius: 7,
                                        background: `${statusColor[r.status]}15`, color: statusColor[r.status],
                                        fontSize: 11, fontWeight: 800,
                                        border: `1px solid ${statusColor[r.status]}33`,
                                        textTransform: "uppercase", letterSpacing: 0.5,
                                    }}>{r.status}</span>
                                </div>

                                {/* Description */}
                                <div style={{
                                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                                    borderRadius: 12, padding: "18px 20px", marginBottom: 20,
                                }}>
                                    <div style={{
                                        fontSize: 9.5, fontWeight: 800, color: "#C8102E",
                                        letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>INCIDENT NARRATIVE</div>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1E293B", margin: 0 }}>
                                        {r.description}
                                    </p>
                                </div>

                                {/* Info grid */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr",
                                    gap: 12, marginBottom: 24,
                                }}>
                                    {[
                                        { label: "Location", val: r.location, icon: "map-pin" },
                                        { label: "Reported By", val: r.reporter || "Anonymous", icon: "user" },
                                        { label: "Date", val: fmtDate(r.date), icon: "calendar" },
                                        { label: "Time", val: fmtTime(r.date), icon: "clock" },
                                    ].map((item) => (
                                        <div key={item.label} style={{
                                            background: "#F8FAFC", border: "1px solid #F1F5F9",
                                            borderRadius: 10, padding: "12px 14px",
                                            display: "flex", alignItems: "center", gap: 10,
                                        }}>
                                            <Icon name={item.icon} size={14} color="#94A3B8" />
                                            <div>
                                                <div style={{ fontSize: 9, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
                                                    {item.label}
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginTop: 2 }}>
                                                    {item.val || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: "flex", gap: 10 }}>
                                    {r.status === "Open" && (
                                        <button
                                            onClick={() => { updateStatus(r.id, "In Progress"); setShowModal(null); }}
                                            style={{
                                                flex: 1, padding: 14,
                                                background: "linear-gradient(135deg, #D97706, #B45309)",
                                                color: "#fff", border: "none", borderRadius: 10,
                                                fontSize: 13, fontWeight: 700, cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                                fontFamily: "'Sora', sans-serif",
                                            }}
                                        >
                                            <Icon name="user-check" size={15} color="#fff" />
                                            Accept & Dispatch Unit
                                        </button>
                                    )}
                                    {r.status === "In Progress" && (
                                        <button
                                            onClick={() => { updateStatus(r.id, "Resolved"); setShowModal(null); }}
                                            style={{
                                                flex: 1, padding: 14,
                                                background: "linear-gradient(135deg, #16A34A, #15803D)",
                                                color: "#fff", border: "none", borderRadius: 10,
                                                fontSize: 13, fontWeight: 700, cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                                fontFamily: "'Sora', sans-serif",
                                            }}
                                        >
                                            <Icon name="circle-check" size={15} color="#fff" />
                                            Mark Case Resolved
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowModal(null)}
                                        style={{
                                            flex: 1, padding: 14,
                                            background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                                            color: "#64748B", borderRadius: 10,
                                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                                            fontFamily: "'Sora', sans-serif",
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PoliceDashboard;
