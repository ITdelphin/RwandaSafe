import React, { useState, useEffect } from "react";
import { COLORS } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import API from "../config/api";

const TrackPage = ({ user }) => {
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await API.get("/reports");
                let allReports = res.data;
                if (user) {
                    allReports = allReports.filter(
                        (r) => r.reporter === user.name || r.reporter === "Anonymous"
                    );
                }
                setReports(allReports);
            } catch (err) {
                console.error("Failed to load reports", err);
            }
        };
        fetchReports();
    }, [user]);

    const filtered = reports.filter(
        (r) =>
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase())
    );
    const r = selected ? reports.find((x) => x.id === selected) : null;

    return (
        <div style={{ padding: "30px 24px", maxWidth: 900, margin: "0 auto" }} className="slide-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Case Tracker</h1>
                <p style={{ color: COLORS.textMuted, fontSize: 14 }}>
                    Track the status of your submitted reports in real-time
                </p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                        placeholder="Search by report ID or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {filtered.length === 0 ? (
                            <div
                                style={{
                                    color: COLORS.textMuted,
                                    padding: "20px 0",
                                    textAlign: "center",
                                    fontSize: 14,
                                }}
                            >
                                No reports found
                            </div>
                        ) : (
                            filtered.map((rpt) => (
                                <div
                                    key={rpt.id}
                                    onClick={() => setSelected(rpt.id)}
                                    style={{
                                        background: COLORS.bgCard,
                                        border: `1px solid ${selected === rpt.id ? COLORS.primary : COLORS.border}`,
                                        borderRadius: 12,
                                        padding: "16px",
                                        cursor: "pointer",
                                        transition: "all .2s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.primary)}
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.borderColor =
                                        selected === rpt.id ? COLORS.primary : COLORS.border)
                                    }
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    fontFamily: "'JetBrains Mono',monospace",
                                                    color: COLORS.primary,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {rpt.id}
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{rpt.type}</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                            <StatusBadge status={rpt.status} />
                                            <LevelBadge level={rpt.level} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted, display: "flex", gap: 12 }}>
                                        <span>
                                            <Icon name="map-pin" size={11} /> {rpt.location}
                                        </span>
                                        <span>
                                            <Icon name="clock" size={11} /> {rpt.date}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {r && (
                    <div style={{ width: 340, flexShrink: 0 }} className="slide-in">
                        <div className="card">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 20,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: COLORS.textDim,
                                            fontFamily: "'JetBrains Mono',monospace",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {r.id}
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{r.type}</h3>
                                </div>
                                <StatusBadge status={r.status} />
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <div style={{ background: COLORS.bgPanel, borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>LEVEL</div>
                                    <LevelBadge level={r.level} />
                                </div>
                                <div style={{ background: COLORS.bgPanel, borderRadius: 8, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>STATION</div>
                                    <div style={{ fontSize: 11, fontWeight: 600 }}>{r.station}</div>
                                </div>
                                {r.assignedOfficer && (
                                    <div
                                        style={{
                                            background: COLORS.bgPanel,
                                            borderRadius: 8,
                                            padding: "10px 12px",
                                            gridColumn: "1/-1",
                                        }}
                                    >
                                        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>
                                            ASSIGNED OFFICER
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <Icon name="badge" size={12} color={COLORS.info} />
                                            {r.assignedOfficer}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: COLORS.textMuted,
                                    lineHeight: 1.6,
                                    marginBottom: 20,
                                    padding: "10px 12px",
                                    background: COLORS.bgPanel,
                                    borderRadius: 8,
                                }}
                            >
                                {r.description}
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: COLORS.textDim,
                                        textTransform: "uppercase",
                                        letterSpacing: 1,
                                        marginBottom: 12,
                                    }}
                                >
                                    Case Timeline
                                </div>
                                {r.updates.map((u, i) => (
                                    <div
                                        key={i}
                                        className="timeline-item"
                                        style={i === r.updates.length - 1 ? { paddingBottom: 0 } : {}}
                                    >
                                        {i < r.updates.length - 1 && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: 15,
                                                    top: 32,
                                                    bottom: 0,
                                                    width: 2,
                                                    background: COLORS.border,
                                                }}
                                            />
                                        )}
                                        <div
                                            className="timeline-dot"
                                            style={{
                                                background: i === 0 ? `${COLORS.primary}22` : COLORS.bgPanel,
                                                borderColor: i === 0 ? COLORS.primary : COLORS.border,
                                            }}
                                        >
                                            <Icon
                                                name={i === r.updates.length - 1 ? "check" : "clock"}
                                                size={11}
                                                color={i === r.updates.length - 1 ? COLORS.success : COLORS.textDim}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{u.msg}</div>
                                            <div style={{ fontSize: 11, color: COLORS.textDim }}>{u.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {r.evidence && r.evidence.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: COLORS.textDim,
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            marginBottom: 10,
                                        }}
                                    >
                                        Evidence ({r.evidence.length})
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {r.evidence.map((ev, i) => (
                                            <div
                                                key={i}
                                                className="evidence-thumb"
                                                title={ev}
                                                onClick={() => window.open(ev, "_blank")}
                                                style={{
                                                    cursor: "pointer",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: COLORS.bgPanel,
                                                    borderRadius: 8,
                                                    width: 44,
                                                    height: 44,
                                                    border: `1px solid ${COLORS.border}`
                                                }}
                                            >
                                                {ev.match(/\.(jpg|jpeg|png|gif|webp)/i) || ev.includes("supabase.co/storage/v1/object/public/evidence") ? (
                                                    <img src={ev} alt="evidence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <Icon
                                                        name={
                                                            ev.includes("mp4")
                                                                ? "video"
                                                                : ev.includes("mp3")
                                                                    ? "microphone"
                                                                    : "photo"
                                                        }
                                                        size={20}
                                                        color={COLORS.primary}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackPage;
