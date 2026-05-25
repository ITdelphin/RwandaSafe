import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "./Badges";

const TopBar = ({ user, notifications, onToggleNotif, onLogout, onNavigate }) => {
    const location = useLocation();
    const [hoveredNav, setHoveredNav] = useState(null);

    const navLinks = [
        { label: "Overview", path: "/", icon: "home" },
        { label: "Report", path: "/report", icon: "file-plus" },
        { label: "Track", path: "/track", icon: "radar-2" },
        { label: "Contact", path: "/contact", icon: "phone" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="topbar">
            {/* Government Strip */}
            <div className="gov-strip" style={{
                height: 36,
                background: "#1E293B",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: "#94A3B8",
            }}>
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
                    <span style={{ color: "#64748B" }} className="dashboard-system-clock">
                        {new Date().toLocaleDateString("en-RW", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="header-main" style={{
                height: 64,
                background: "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
                {/* Left: Logo + Nav */}
                <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                    <div
                        onClick={() => onNavigate("/")}
                        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    >
                        <div style={{
                            width: 36, height: 36,
                            background: "linear-gradient(135deg, #C8102E, #8a2436)",
                            borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(172,46,68,0.25)",
                        }}>
                            <Icon name="shield-check" size={20} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 18, color: "#0F172A", letterSpacing: -0.5, lineHeight: 1 }}>
                                Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
                                Emergency Portal
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 32, background: "#E2E8F0" }} />

                    {/* Navigation */}
                    <nav style={{ display: "flex", gap: 4 }}>
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
                                        padding: "8px 18px",
                                        background: active ? "#EFF6FF" : hovered ? "#F8FAFC" : "transparent",
                                        color: active ? "#1E3A8A" : hovered ? "#1E293B" : "#64748B",
                                        border: "none",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: active ? 800 : 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 7,
                                        position: "relative",
                                    }}
                                >
                                    <Icon name={link.icon} size={16} color={active ? "#1E3A8A" : hovered ? "#1E293B" : "#94A3B8"} />
                                    {link.label}
                                    {active && (
                                        <div style={{
                                            position: "absolute",
                                            bottom: -13,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: 24,
                                            height: 3,
                                            borderRadius: 2,
                                            background: "#1E3A8A",
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: User Area */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Emergency Hotline Badge */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px",
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#C8102E",
                        letterSpacing: 0.5,
                    }}>
                        <Icon name="phone-call" size={14} color="#C8102E" />
                        112
                    </div>

                    <div style={{ width: 1, height: 28, background: "#E2E8F0" }} />

                    {user ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Notifications Bell */}
                            <button
                                onClick={onToggleNotif}
                                style={{
                                    position: "relative",
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: 8, borderRadius: 8,
                                }}
                            >
                                <Icon name="bell" size={20} color="#64748B" />
                                {notifications > 0 && (
                                    <div style={{
                                        position: "absolute", top: 4, right: 4,
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: "#C8102E",
                                        border: "2px solid #fff",
                                    }} />
                                )}
                            </button>

                            <div style={{ width: 1, height: 28, background: "#E2E8F0" }} />

                            {/* User Info */}
                            <div style={{ textAlign: "right", lineHeight: 1.3 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{user.name}</div>
                                <div style={{ fontSize: 9, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{user.role} Authority</div>
                            </div>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: "linear-gradient(135deg, #1E3A8A, #3367D6)",
                                color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 800, fontSize: 15,
                                boxShadow: "0 2px 8px rgba(66,133,244,0.3)",
                            }}>
                                {user.name[0]}
                            </div>
                            <button
                                onClick={onLogout}
                                style={{
                                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                                    color: "#64748B", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", padding: "8px 14px", borderRadius: 8,
                                    display: "flex", alignItems: "center", gap: 6,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#C8102E"; e.currentTarget.style.borderColor = "#FECACA"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
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
                                    padding: "10px 22px", background: "#FFFFFF",
                                    border: "1.5px solid #E2E8F0", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1E3A8A"; e.currentTarget.style.color = "#1E3A8A"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#1E293B"; }}
                            >
                                <Icon name="lock" size={14} />
                                Staff Login
                            </button>
                            <button
                                onClick={() => onNavigate("/register")}
                                style={{
                                    padding: "10px 22px",
                                    background: "linear-gradient(135deg, #1E3A8A, #3367D6)",
                                    color: "#fff", border: "none", borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 2px 10px rgba(66,133,244,0.3)",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = ""}
                            >
                                <Icon name="user-plus" size={14} />
                                Citizen Portal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
