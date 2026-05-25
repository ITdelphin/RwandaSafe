import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Badges";

const SplashPage = () => {
    const navigate = useNavigate();
    const [liveTime, setLiveTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const hotlines = [
        { label: "Emergency", number: "112", color: "#C8102E", icon: "phone-call" },
        { label: "Police", number: "113", color: "#1E3A8A", icon: "shield-check" },
        { label: "Ambulance", number: "912", color: "#1E3A8A", icon: "ambulance" },
        { label: "Fire", number: "111", color: "#F4B400", icon: "flame" },
    ];

    return (
        <div style={{ fontFamily: "'Sora', sans-serif", background: "#FFFFFF", minHeight: "100vh", color: "#1E293B" }}>

            {/* National Top Bar - Matches TopBar Gov Strip */}
            <div className="gov-strip" style={{ background: "#1E293B", color: "#94A3B8", padding: "10px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>🇷🇼</span>
                    <span>REPUBLIC OF RWANDA</span>
                    <span style={{ margin: "0 6px", opacity: 0.3 }}>|</span>
                    <span>MINISTRY OF INTERNAL SECURITY</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1E3A8A", boxShadow: "0 0 6px #1E3A8A" }} />
                        <span style={{ color: "#1E3A8A", fontSize: 9 }}>SYSTEM ONLINE</span>
                    </div>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <span className="dashboard-system-clock" style={{ color: "#64748B" }}>
                        KIGALI: {liveTime.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            </div>

            {/* Hero Section - BRIGHT LIGHT MODE */}
            <div style={{ position: "relative", padding: "100px 40px", textAlign: "center", background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", overflow: "hidden", borderBottom: "1px solid #E2E8F0" }}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(#C8102E 0.5px, transparent 0.5px)", backgroundSize: "30px 30px" }} />

                <div style={{ position: "relative", zIndex: 1, maxWidth: 850, margin: "0 auto" }}>
                    <div style={{ width: 80, height: 80, background: "#C8102E", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", boxShadow: "0 20px 40px rgba(172,46,68,0.15)" }}>
                        <Icon name="shield-check" size={42} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: "62px", fontWeight: 900, color: "#0F172A", marginBottom: 20, letterSpacing: "-2.5px", lineHeight: 1 }}>
                        Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                    </h1>
                    <p style={{ fontSize: "22px", color: "#475569", marginBottom: 44, lineHeight: 1.6, fontWeight: 500 }}>
                        Professional Rwanda Emergency Management System. <br />
                        Secure reporting, real-time dispatch, and citizen protection.
                    </p>

                    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 64 }}>
                        <button
                            onClick={() => navigate("/report")}
                            style={{ padding: "18px 44px", background: "#C8102E", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(172,46,68,0.3)", transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = ""}
                        >
                            🚨 REPORT EMERGENCY
                        </button>
                        <button
                            onClick={() => navigate("/track")}
                            style={{ padding: "18px 44px", background: "#FFFFFF", color: "#1E293B", border: "1px solid #E2E8F0", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                            onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                        >
                            <Icon name="search" size={20} /> TRACK STATUS
                        </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: 48, padding: "32px", background: "#FFFFFF", borderRadius: 24, border: "1px solid #E2E8F0", maxWidth: 600, margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                        {hotlines.map(h => (
                            <div key={h.number} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "26px", fontWeight: 900, color: h.color, letterSpacing: 1, fontFamily: "monospace" }}>{h.number}</div>
                                <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", marginTop: 4, fontWeight: 700 }}>{h.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Portals - LIGHT MODE */}
            <div className="grid-4" style={{ maxWidth: 1240, margin: "80px auto 0", padding: "0 40px" }}>
                {[
                    { title: "Citizens", icon: "user-plus", desc: "Report & Track Incidents", link: "/register", color: "#C8102E" },
                    { title: "Police Force", icon: "shield-lock", desc: "Dispatch & Patrol", link: "/login", color: "#1E3A8A" },
                    { title: "Medical Hub", icon: "building-hospital", desc: "Ambulance & Triage", link: "/login", color: "#1E3A8A" },
                    { title: "Command Admin", icon: "settings", desc: "System Oversight", link: "/login", color: "#6366F1" },
                ].map(p => (
                    <div key={p.title}
                        onClick={() => navigate(p.link)}
                        className="card"
                        style={{ padding: "40px 24px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.3s ease" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = `0 20px 40px ${p.color}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = ""; }}
                    >
                        <div style={{ width: 64, height: 64, background: `${p.color}10`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <Icon name={p.icon} size={32} color={p.color} />
                        </div>
                        <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 10, color: "#0F172A" }}>{p.title}</h3>
                        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>{p.desc}</p>
                    </div>
                ))}
            </div>

            {/* Features Section */}
            <div style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#C8102E", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>NATIONAL SECURITY ARCHITECTURE</div>
                    <h2 style={{ fontSize: "42px", fontWeight: 900, color: "#0F172A", letterSpacing: "-1.5px" }}>The Standard in Emergency Response.</h2>
                </div>

                <div className="grid-2" style={{ gap: 40 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                        {[
                            { t: "Integrated Multi-Agency Dispatch", d: "A unified platform connecting Police, SAMU, and Fire Brigade in under 500ms." },
                            { t: "Evidence-Based Reporting", d: "Citizens can upload real-time encrypted media directly to the security vault." },
                            { t: "Public Safety Analytics", d: "Advanced data insights for authorities to predict and prevent future incidents." }
                        ].map(f => (
                            <div key={f.t} style={{ display: "flex", gap: 20 }}>
                                <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "#F0FDF4", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon name="check" size={16} color="#10B981" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#0F172A" }}>{f.t}</h4>
                                    <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.6 }}>{f.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "#FFFFFF", borderRadius: 32, padding: "40px", border: "1px solid #E2E8F0", boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                            <div style={{ fontWeight: 900, fontSize: 14, color: "#0F172A" }}>NETWORK ACTIVITY</div>
                            <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>• LIVE SYNC</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 16, borderBottom: i < 3 ? "1px solid #F1F5F9" : "none" }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 1 ? "#EF4444" : "#E2E8F0" }} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Unit Dispatch #{4800 + i}</div>
                                        <div style={{ fontSize: 12, color: "#94A3B8" }}>Assigned to Kigali North Sector • 2m ago</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "80px 40px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: 24 }}>Safe<span style={{ color: "#C8102E" }}>Rwanda</span></div>
                    <p style={{ color: "#64748B", fontSize: 15, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.8 }}>
                        The official emergency management system of the Republic of Rwanda. Providing rapid response services and public safety infrastructure to all citizens.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 60, fontSize: 13, fontWeight: 700, color: "#475569" }}>
                        <a href="/report" style={{ color: "inherit", textDecoration: "none" }}>REPORT</a>
                        <a href="/track" style={{ color: "inherit", textDecoration: "none" }}>TRACK</a>
                        <a href="/login" style={{ color: "inherit", textDecoration: "none" }}>STAFF</a>
                        <a href="/register" style={{ color: "inherit", textDecoration: "none" }}>CITIZEN</a>
                    </div>
                    <div style={{ pt: 32, borderTop: "1px solid #E2E8F0", fontSize: 12, color: "#94A3B8", letterSpacing: 0.5 }}>
                        © 2024 REPUBLIC OF RWANDA. ALL SYSTEMS OPERATIONAL.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SplashPage;
