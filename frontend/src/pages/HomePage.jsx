import React from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../config/constants";
import { Icon } from "../components/Badges";

const HomePage = () => {
    const navigate = useNavigate();
    const stats = [
        { label: "Reports Today", val: "24", icon: "file-report", color: COLORS.primary },
        { label: "Cases Resolved", val: "91%", icon: "check-circle", color: COLORS.success },
        { label: "Avg Response", val: "4 min", icon: "clock", color: COLORS.warning },
        { label: "Active Officers", val: "182", icon: "badge", color: COLORS.info },
    ];
    const types = [
        { name: "Theft", icon: "backpack", color: "#EF4444" },
        { name: "Accident", icon: "car-crash", color: "#F59E0B" },
        { name: "Fire", icon: "flame", color: "#F97316" },
        { name: "Violence", icon: "bolt", color: "#8B5CF6" },
        { name: "Suspicious", icon: "eye", color: "#06B6D4" },
        { name: "Emergency", icon: "first-aid-kit", color: "#10B981" },
    ];

    return (
        <div className="slide-in">
            {/* Hero */}
            <div
                style={{
                    position: "relative",
                    padding: "80px 40px",
                    textAlign: "center",
                    overflow: "hidden",
                    background:
                        "radial-gradient(ellipse at 50% 0%,rgba(200,16,46,.18) 0%,transparent 70%)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "radial-gradient(circle at 20% 80%,rgba(0,106,78,.1) 0%,transparent 50%), radial-gradient(circle at 80% 20%,rgba(200,16,46,.08) 0%,transparent 50%)",
                    }}
                />
                <div
                    className="ring-animation"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(200,16,46,.12)",
                        border: "1px solid rgba(200,16,46,.3)",
                        borderRadius: 20,
                        padding: "6px 14px",
                        marginBottom: 24,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: COLORS.primary,
                            display: "inline-block",
                        }}
                        className="pulse"
                    />
                    <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>
                        Emergency Response System — Active
                    </span>
                </div>
                <h1
                    className="glow-text"
                    style={{
                        fontSize: 52,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        marginBottom: 20,
                        letterSpacing: -1.5,
                    }}
                >
                    Protect Rwanda.<br />
                    <span style={{ color: COLORS.primary }}>Report. Respond. Resolve.</span>
                </h1>
                <p
                    style={{
                        fontSize: 17,
                        color: COLORS.textMuted,
                        maxWidth: 560,
                        margin: "0 auto 36px",
                        lineHeight: 1.7,
                    }}
                >
                    Rwanda's official crime and emergency reporting platform. Submit reports
                    instantly, track case progress, and connect with emergency services in
                    real-time.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        className="btn-primary"
                        style={{
                            padding: "14px 32px",
                            fontSize: 15,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        onClick={() => navigate("/report")}
                    >
                        <Icon name="alert-triangle" size={18} /> Report Emergency
                    </button>
                    <button
                        className="btn-secondary"
                        style={{
                            padding: "14px 32px",
                            fontSize: 15,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        onClick={() => navigate("/track")}
                    >
                        <Icon name="map-search" size={18} /> Track My Case
                    </button>
                    <button
                        className="btn-secondary"
                        style={{
                            padding: "14px 32px",
                            fontSize: 15,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                        onClick={() => navigate("/login")}
                    >
                        <Icon name="login" size={18} /> Login
                    </button>
                </div>
                {/* SOS Button */}
                <div style={{ marginTop: 40 }}>
                    <div
                        style={{
                            fontSize: 12,
                            color: COLORS.textDim,
                            marginBottom: 12,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                        }}
                    >
                        Life-threatening emergency?
                    </div>
                    <button
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: "50%",
                            background: `radial-gradient(circle,${COLORS.primary},${COLORS.primaryDark})`,
                            border: "3px solid rgba(200,16,46,.4)",
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: 800,
                            letterSpacing: 2,
                            cursor: "pointer",
                            boxShadow: "0 0 30px rgba(200,16,46,.5)",
                            animation: "ring 2s infinite",
                        }}
                        onClick={() => {
                            alert(
                                "🚨 SOS ALERT SENT\nEmergency services have been notified. Help is on the way.\n\nRwanda Emergency: 112 | Police: 113 | Ambulance: 912"
                            );
                        }}
                    >
                        SOS
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div
                style={{
                    padding: "0 40px 40px",
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 16,
                }}
            >
                {stats.map((s) => (
                    <div key={s.label} className="stat-card" style={{ textAlign: "center" }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: `${s.color}22`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                            }}
                        >
                            <Icon name={s.icon} size={22} color={s.color} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Types */}
            <div style={{ padding: "0 40px 40px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                    What can you report?
                </h2>
                <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
                    Select a category to begin your emergency report
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                    {types.map((t) => (
                        <button
                            key={t.name}
                            onClick={() => navigate("/report")}
                            style={{
                                background: COLORS.bgCard,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 14,
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                                transition: "all .2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = t.color;
                                e.currentTarget.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = COLORS.border;
                                e.currentTarget.style.transform = "";
                            }}
                        >
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    background: `${t.color}22`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Icon name={t.icon} size={26} color={t.color} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Warning */}
            <div
                style={{
                    margin: "0 40px 40px",
                    background: "rgba(245,158,11,.08)",
                    border: "1px solid rgba(245,158,11,.3)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    gap: 12,
                }}
            >
                <Icon name="alert-triangle" size={20} color={COLORS.warning} />
                <div>
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: COLORS.warning,
                            marginBottom: 4,
                        }}
                    >
                        ⚠️ Warning — False Reports are Illegal
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
                        Submitting fake reports, false information, or misleading emergency alerts
                        is strictly prohibited under Rwandan law. Violators may have their account
                        suspended and their information reported to authorities for prosecution.
                    </div>
                </div>
            </div>

            {/* Contact bar */}
            <div
                style={{
                    background: COLORS.primary,
                    padding: "20px 40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                {[
                    { label: "Emergency", val: "112" },
                    { label: "Rwanda Police", val: "113" },
                    { label: "Ambulance", val: "912" },
                    { label: "Fire Brigade", val: "111" },
                ].map((c) => (
                    <div key={c.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>{c.val}</div>
                    </div>
                ))}
                <button
                    className="btn-secondary"
                    style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff" }}
                    onClick={() => navigate("/contact")}
                >
                    <Icon name="phone" size={14} /> Contact Help
                </button>
            </div>
        </div>
    );
};

export default HomePage;
