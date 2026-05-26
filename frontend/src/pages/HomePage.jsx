import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Emergencies Reported", val: "1,245+", icon: "👥", color: "#1E3A8A" },
        { label: "Resolved Cases", val: "978+", icon: "✅", color: "#0B8043" },
        { label: "Active Units", val: "320+", icon: "🚑", color: "#C8102E" },
        { label: "Registered Users", val: "2,450+", icon: "👥", color: "#6366F1" },
    ];

    const portals = [
        {
            title: "For Citizens",
            desc: "Report emergencies, track status and get real-time updates.",
            cta: "Get Help Now",
            icon: "👥",
            color: "#1E3A8A",
            path: "/report"
        },
        {
            title: "For Police",
            desc: "Receive alerts, respond faster and manage incidents.",
            cta: "Access Police Portal",
            icon: "🛡️",
            color: "#0B8043",
            path: "/login"
        },
        {
            title: "For Medical Hub",
            desc: "View requests, dispatch teams and save lives.",
            cta: "Open Medical Dashboard",
            icon: "🏥",
            color: "#C8102E",
            path: "/login"
        },
        {
            title: "For Admin",
            desc: "Monitor system, manage users and ensure smooth operations.",
            cta: "Admin Panel",
            icon: "⚙️",
            color: "#6366F1",
            path: "/login"
        }
    ];

    return (
        <div style={S.page}>
            {/* Navigation Header */}
            <header style={S.header}>
                <div style={S.logoSection}>
                    <div style={S.logoIcon}>🚨</div>
                    <div style={S.logoText}>
                        <div style={S.logoMain}>EMERGENCY</div>
                        <div style={S.logoSub}>RESPONSE SYSTEM</div>
                    </div>
                </div>
                <nav style={S.nav}>
                    <span style={S.navItemActive}>Home</span>
                    <span style={S.navItem}>About Us</span>
                    <span style={S.navItem}>Services</span>
                    <span style={S.navItem}>How It Works</span>
                    <span style={S.navItem}>Contact</span>
                </nav>
                <button style={S.loginBtn} onClick={() => navigate("/login")}>
                    <span style={{ marginRight: 8 }}>👤</span> Login
                </button>
            </header>

            {/* Hero Section */}
            <section style={S.hero}>
                <div style={S.heroBg} />
                <div style={S.heroContent}>
                    <div style={S.emergencySupport}>
                        <span style={S.pulseDot} />
                        24/7 Emergency Support
                    </div>
                    <h1 style={S.heroTitle}>
                        One Platform.<br />
                        <span style={{ color: "#C8102E" }}>Every Emergency.</span>
                    </h1>
                    <p style={S.heroSubtitle}>
                        Connecting citizens, police, and medical services for<br />
                        faster response, smarter coordination, and safer communities.
                    </p>
                    <div style={S.heroBtns}>
                        <button style={S.reportBtn} onClick={() => navigate("/report")}>
                            📞 Report an Emergency
                        </button>
                        <button style={S.howItWorksBtn}>
                            ▶ How It Works
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <div style={S.statsOuter}>
                <div style={S.statsContainer}>
                    {stats.map((s, i) => (
                        <div key={i} style={S.statItem}>
                            <div style={S.statIcon}>{s.icon}</div>
                            <div style={S.statText}>
                                <div style={S.statVal}>{s.val}</div>
                                <div style={S.statLabel}>{s.label}</div>
                            </div>
                            {i < stats.length - 1 && <div style={S.statDivider} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Portal Cards */}
            <section style={S.portalSection}>
                <div style={S.portalGrid}>
                    {portals.map((p, i) => (
                        <div key={i} style={S.portalCard} onClick={() => navigate(p.path)}>
                            <div style={{ ...S.portalIcon, background: `${p.color}15`, color: p.color }}>{p.icon}</div>
                            <div style={S.portalContent}>
                                <h3 style={S.portalTitle}>{p.title}</h3>
                                <p style={S.portalDesc}>{p.desc}</p>
                                <div style={{ ...S.portalCta, color: p.color }}>
                                    {p.cta} <span style={S.ctaArrow}>→</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Info Bar */}
            <footer style={S.bottomBar}>
                <div style={S.infoItem}>
                    <span style={S.infoIcon}>🔔</span>
                    <div>
                        <div style={S.infoTitle}>Real-time Alerts</div>
                        <div style={S.infoSub}>Instant notifications</div>
                    </div>
                </div>
                <div style={S.infoDivider} />
                <div style={S.infoItem}>
                    <span style={S.infoIcon}>🔒</span>
                    <div>
                        <div style={S.infoTitle}>Secure & Reliable</div>
                        <div style={S.infoSub}>Your data is protected</div>
                    </div>
                </div>
                <div style={S.infoDivider} />
                <div style={S.infoItem}>
                    <span style={S.infoIcon}>🛡️</span>
                    <div>
                        <div style={S.infoTitle}>Unified Platform</div>
                        <div style={S.infoSub}>All services in one place</div>
                    </div>
                </div>
                <div style={S.infoDivider} />
                <div style={S.infoItem}>
                    <span style={S.infoIcon}>🕒</span>
                    <div>
                        <div style={S.infoTitle}>24/7 Availability</div>
                        <div style={S.infoSub}>Always here to help</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const S = {
    page: {
        fontFamily: "'Inter', sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
        color: "#1E293B"
    },
    header: {
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid #E2E8F0"
    },
    logoSection: { display: "flex", alignItems: "center", gap: 12 },
    logoIcon: {
        width: 44,
        height: 44,
        background: "#1E1B4B",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20
    },
    logoText: { display: "flex", flexDirection: "column" },
    logoMain: { fontSize: 18, fontWeight: 900, color: "#1E1B4B", letterSpacing: 0.5 },
    logoSub: { fontSize: 11, fontWeight: 700, color: "#C8102E", letterSpacing: 1 },
    nav: { display: "flex", gap: 32 },
    navItem: { fontSize: 14, fontWeight: 600, color: "#64748B", cursor: "pointer", transition: "color 0.2s" },
    navItemActive: { fontSize: 14, fontWeight: 700, color: "#1E1B4B", cursor: "pointer", borderBottom: "2px solid #1E1B4B", paddingBottom: 4 },
    loginBtn: {
        background: "#1E3A8A",
        color: "#fff",
        border: "none",
        padding: "10px 24px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(30,58,138,0.2)"
    },
    hero: {
        position: "relative",
        height: "600px",
        display: "flex",
        alignItems: "center",
        padding: "0 80px",
        overflow: "hidden"
    },
    heroBg: {
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/emergency_hero_bg_1779824463840.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1,
        maskImage: "linear-gradient(to right, black 60%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, black 60%, transparent)"
    },
    heroContent: { maxWidth: 650, zIndex: 1 },
    emergencySupport: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(30,58,138,0.08)",
        color: "#1E3A8A",
        padding: "6px 16px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 24
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#10B981",
        animation: "pulse 2s infinite"
    },
    heroTitle: {
        fontSize: 72,
        fontWeight: 900,
        lineHeight: 1.05,
        color: "#1E1B4B",
        marginBottom: 24,
        letterSpacing: -1.5
    },
    heroSubtitle: {
        fontSize: 18,
        color: "#475569",
        lineHeight: 1.6,
        marginBottom: 40
    },
    heroBtns: { display: "flex", gap: 16 },
    reportBtn: {
        background: "#EF4444",
        color: "#fff",
        border: "none",
        padding: "16px 32px",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
        transition: "transform 0.2s"
    },
    howItWorksBtn: {
        background: "#fff",
        color: "#1E293B",
        border: "1.5px solid #E2E8F0",
        padding: "16px 32px",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.2s"
    },
    statsOuter: {
        marginTop: -60,
        padding: "0 60px",
        zIndex: 10,
        position: "relative"
    },
    statsContainer: {
        background: "#fff",
        borderRadius: 20,
        padding: "32px",
        display: "flex",
        justifyContent: "space-between",
        boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        border: "1px solid #E2E8F0"
    },
    statItem: { flex: 1, display: "flex", alignItems: "center", gap: 16, justifyContent: "center", position: "relative" },
    statIcon: { width: 48, height: 48, borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
    statText: { display: "flex", flexDirection: "column" },
    statVal: { fontSize: 24, fontWeight: 900, color: "#1E1B4B" },
    statLabel: { fontSize: 13, color: "#64748B", fontWeight: 500 },
    statDivider: { height: 40, width: 1, background: "#E2E8F0", position: "absolute", right: 0 },
    portalSection: { padding: "80px 60px" },
    portalGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 },
    portalCard: {
        background: "#fff",
        borderRadius: 20,
        padding: "32px",
        cursor: "pointer",
        transition: "all 0.3s",
        border: "1.5px solid #F1F5F9",
        display: "flex",
        flexDirection: "column",
        gap: 20
    },
    portalIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28
    },
    portalContent: { display: "flex", flexDirection: "column", gap: 10 },
    portalTitle: { fontSize: 20, fontWeight: 800, color: "#1E1B4B" },
    portalDesc: { fontSize: 14, color: "#64748B", lineHeight: 1.6 },
    portalCta: { fontSize: 14, fontWeight: 700, marginTop: 10, display: "flex", alignItems: "center", gap: 6 },
    ctaArrow: { transition: "transform 0.2s" },
    bottomBar: {
        background: "#0F172A",
        padding: "32px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    infoItem: { display: "flex", alignItems: "center", gap: 12 },
    infoIcon: { fontSize: 20 },
    infoTitle: { color: "#fff", fontSize: 14, fontWeight: 700 },
    infoSub: { color: "#94A3B8", fontSize: 12 },
    infoDivider: { height: 32, width: 1, background: "rgba(255,255,255,0.1)" }
};

export default HomePage;
