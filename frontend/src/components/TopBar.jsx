import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "./Badges";

const TopBar = ({ user, notifications, onToggleNotif, onLogout, onNavigate }) => {
    const location = useLocation();
    const [hoveredNav, setHoveredNav] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const navLinks = [
        { label: "Overview", path: "/", icon: "layout-dashboard" },
        { label: "Report", path: "/report", icon: "file-plus" },
        { label: "Track", path: "/track", icon: "radar-2" },
        { label: "Contact", path: "/contact", icon: "phone" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{
            position: "sticky", top: 0, zIndex: 200,
            transition: "box-shadow 0.3s ease",
            boxShadow: scrolled
                ? "0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)"
                : "0 1px 3px rgba(0,0,0,0.03)",
        }}>
            {/* ═══ Government Authority Strip ═══ */}
            <div style={{
                height: 34,
                background: "linear-gradient(90deg, #0F172A 0%, #1E293B 100%)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 48px",
                fontSize: 9.5, fontWeight: 700, letterSpacing: 2, color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, lineHeight: 1 }}>🇷🇼</span>
                    <span style={{ color: "#94A3B8" }}>REPUBLIC OF RWANDA</span>
                    <span style={{ margin: "0 4px", opacity: 0.2, color: "#475569" }}>•</span>
                    <span>MINISTRY OF INTERNAL SECURITY</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "#22C55E",
                            boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                            animation: "pulse 2s infinite",
                        }} />
                        <span style={{ color: "#22C55E", fontSize: 9, letterSpacing: 1.5 }}>OPERATIONAL</span>
                    </div>
                    <span style={{ opacity: 0.15, color: "#475569" }}>|</span>
                    <span style={{ color: "#475569", letterSpacing: 1 }}>
                        {currentTime.toLocaleDateString("en-RW", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        {" • "}
                        {currentTime.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                </div>
            </div>

            {/* ═══ Main Navigation Bar ═══ */}
            <div style={{
                height: 68,
                background: scrolled
                    ? "rgba(255,255,255,0.95)"
                    : "#FFFFFF",
                backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
                borderBottom: "1px solid #E2E8F0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 48px",
                transition: "all 0.3s ease",
            }}>
                {/* Left: Logo + Nav */}
                <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
                    {/* Logo */}
                    <div
                        onClick={() => onNavigate("/")}
                        style={{
                            display: "flex", alignItems: "center", gap: 14,
                            cursor: "pointer",
                            transition: "transform 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={e => e.currentTarget.style.transform = ""}
                    >
                        <div style={{
                            width: 40, height: 40,
                            background: "linear-gradient(145deg, #C8102E, #9A0C24)",
                            borderRadius: 12,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(200,16,46,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                            position: "relative",
                        }}>
                            <Icon name="shield-check" size={22} color="#fff" />
                            {/* Subtle shine overlay */}
                            <div style={{
                                position: "absolute", inset: 0, borderRadius: 12,
                                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                                pointerEvents: "none",
                            }} />
                        </div>
                        <div>
                            <div style={{
                                fontWeight: 900, fontSize: 20, color: "#0F172A",
                                letterSpacing: -0.7, lineHeight: 1,
                                fontFamily: "'Sora', sans-serif",
                            }}>
                                Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                            </div>
                            <div style={{
                                fontSize: 8.5, fontWeight: 800, color: "#94A3B8",
                                letterSpacing: 2.5, textTransform: "uppercase", marginTop: 3,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                EMERGENCY SYSTEM
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: 1, height: 36,
                        background: "linear-gradient(180deg, transparent, #CBD5E1, transparent)",
                    }} />

                    {/* Navigation */}
                    <nav style={{ display: "flex", gap: 2 }}>
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            const hovered = hoveredNav === link.path;
                            return (
                                <button
                                    key={link.path}
                                    onClick={() => onNavigate(link.path)}
                                    onMouseEnter={() => setHoveredNav(link.path)}
                                    onMouseLeave={() => setHoveredNav(null)}
                                    style={{
                                        padding: "9px 20px",
                                        background: active
                                            ? "linear-gradient(135deg, rgba(30,58,138,0.08), rgba(51,103,214,0.06))"
                                            : hovered ? "rgba(241,245,249,0.8)" : "transparent",
                                        color: active ? "#1E3A8A" : hovered ? "#0F172A" : "#64748B",
                                        border: active ? "1px solid rgba(30,58,138,0.12)" : "1px solid transparent",
                                        borderRadius: 10,
                                        fontSize: 13,
                                        fontWeight: active ? 800 : 600,
                                        cursor: "pointer",
                                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                        display: "flex", alignItems: "center", gap: 8,
                                        position: "relative",
                                        fontFamily: "'Sora', sans-serif",
                                    }}
                                >
                                    <Icon name={link.icon} size={16} color={active ? "#1E3A8A" : hovered ? "#475569" : "#94A3B8"} />
                                    {link.label}
                                    {active && (
                                        <div style={{
                                            position: "absolute",
                                            bottom: -16, left: "50%",
                                            transform: "translateX(-50%)",
                                            width: 28, height: 3,
                                            borderRadius: 3,
                                            background: "linear-gradient(90deg, #1E3A8A, #3367D6)",
                                            boxShadow: "0 1px 4px rgba(30,58,138,0.3)",
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: Action Area */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Emergency Hotline CTA */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "7px 16px",
                        background: "linear-gradient(135deg, #FEF2F2, #FFF1F2)",
                        border: "1px solid #FECDD3",
                        borderRadius: 10,
                        fontSize: 11, fontWeight: 800, color: "#C8102E",
                        letterSpacing: 0.8,
                        cursor: "default",
                        transition: "all 0.2s",
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "#C8102E",
                            boxShadow: "0 0 6px rgba(200,16,46,0.4)",
                            animation: "pulse 2s infinite",
                        }} />
                        <Icon name="phone-call" size={13} color="#C8102E" />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>112</span>
                    </div>

                    <div style={{
                        width: 1, height: 32,
                        background: "linear-gradient(180deg, transparent, #E2E8F0, transparent)",
                    }} />

                    {user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Notifications */}
                            <button
                                onClick={onToggleNotif}
                                style={{
                                    position: "relative",
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: 9, borderRadius: 10,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                            >
                                <Icon name="bell" size={20} color="#475569" />
                                {notifications > 0 && (
                                    <div style={{
                                        position: "absolute", top: 4, right: 4,
                                        minWidth: 18, height: 18, borderRadius: 9,
                                        background: "linear-gradient(135deg, #C8102E, #E11D48)",
                                        border: "2.5px solid #fff",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 9, fontWeight: 800, color: "#fff",
                                        padding: "0 4px",
                                        boxShadow: "0 2px 6px rgba(200,16,46,0.3)",
                                    }}>
                                        {notifications > 9 ? "9+" : notifications}
                                    </div>
                                )}
                            </button>

                            <div style={{ width: 1, height: 28, background: "#E2E8F0" }} />

                            {/* User Profile */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ textAlign: "right", lineHeight: 1.3 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{user.name}</div>
                                    <div style={{
                                        fontSize: 9, color: "#64748B", fontWeight: 700,
                                        textTransform: "uppercase", letterSpacing: 1.2,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {user.role} AUTHORITY
                                    </div>
                                </div>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: "linear-gradient(145deg, #1E3A8A, #3367D6)",
                                    color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 900, fontSize: 16,
                                    boxShadow: "0 3px 10px rgba(30,58,138,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                                    border: "2px solid rgba(255,255,255,0.2)",
                                    fontFamily: "'Sora', sans-serif",
                                }}>
                                    {user.name[0]}
                                </div>
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={onLogout}
                                style={{
                                    background: "#FFFFFF",
                                    border: "1.5px solid #E2E8F0",
                                    color: "#64748B", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", padding: "9px 16px", borderRadius: 10,
                                    display: "flex", alignItems: "center", gap: 7,
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    fontFamily: "'Sora', sans-serif",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "#FEF2F2";
                                    e.currentTarget.style.color = "#C8102E";
                                    e.currentTarget.style.borderColor = "#FECDD3";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(200,16,46,0.1)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "#FFFFFF";
                                    e.currentTarget.style.color = "#64748B";
                                    e.currentTarget.style.borderColor = "#E2E8F0";
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <Icon name="logout" size={14} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => onNavigate("/login")}
                                style={{
                                    padding: "10px 24px", background: "#FFFFFF",
                                    border: "1.5px solid #E2E8F0", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    color: "#1E293B",
                                    fontFamily: "'Sora', sans-serif",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#1E3A8A";
                                    e.currentTarget.style.color = "#1E3A8A";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(30,58,138,0.1)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#E2E8F0";
                                    e.currentTarget.style.color = "#1E293B";
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <Icon name="lock" size={14} />
                                Staff Login
                            </button>
                            <button
                                onClick={() => onNavigate("/register")}
                                style={{
                                    padding: "10px 24px",
                                    background: "linear-gradient(145deg, #1E3A8A, #2D5DD6)",
                                    color: "#fff", border: "none", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 3px 12px rgba(30,58,138,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    fontFamily: "'Sora', sans-serif",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(30,58,138,0.35), inset 0 1px 0 rgba(255,255,255,0.12)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.boxShadow = "0 3px 12px rgba(30,58,138,0.25), inset 0 1px 0 rgba(255,255,255,0.12)";
                                }}
                            >
                                <Icon name="user-plus" size={14} />
                                Citizen Portal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Mobile Menu (Hamburger) ═══ */}
            {mobileOpen && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0,
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    padding: "16px 24px",
                    zIndex: 199,
                }}>
                    {navLinks.map(link => (
                        <button
                            key={link.path}
                            onClick={() => { onNavigate(link.path); setMobileOpen(false); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 16px", width: "100%",
                                background: isActive(link.path) ? "rgba(30,58,138,0.06)" : "transparent",
                                border: "none", borderRadius: 10,
                                fontSize: 14, fontWeight: isActive(link.path) ? 700 : 500,
                                color: isActive(link.path) ? "#1E3A8A" : "#475569",
                                cursor: "pointer",
                                fontFamily: "'Sora', sans-serif",
                            }}
                        >
                            <Icon name={link.icon} size={18} color={isActive(link.path) ? "#1E3A8A" : "#94A3B8"} />
                            {link.label}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default TopBar;
