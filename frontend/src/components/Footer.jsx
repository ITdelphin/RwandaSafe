import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Badges";

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredSocial, setHoveredSocial] = useState(null);

    const sections = [
        {
            title: "Platform",
            icon: "layout-dashboard",
            links: [
                { label: "Public Dashboard", path: "/", icon: "dashboard" },
                { label: "Emergency Intake", path: "/report", icon: "file-plus" },
                { label: "Track Investigation", path: "/track", icon: "radar-2" },
                { label: "Contact Dispatch", path: "/contact", icon: "phone" },
            ]
        },
        {
            title: "Emergency Lines",
            icon: "phone-call",
            links: [
                { label: "National Police — 112", path: "#", icon: "shield-check" },
                { label: "SAMU Ambulance — 912", path: "#", icon: "ambulance" },
                { label: "Fire & Rescue — 111", path: "#", icon: "flame" },
                { label: "GBV Hotline — 3512", path: "#", icon: "heart-handshake" },
            ]
        },
        {
            title: "Legal & Compliance",
            icon: "scale",
            links: [
                { label: "Privacy Framework", path: "#", icon: "lock" },
                { label: "Terms of Service", path: "#", icon: "file-text" },
                { label: "Penal Code Art. 39", path: "#", icon: "gavel" },
                { label: "Official Gazette", path: "#", icon: "book" },
            ]
        }
    ];

    const emergencyCards = [
        { number: "112", label: "Police", color: "#C8102E", bgGlow: "rgba(200,16,46,0.15)", icon: "shield-check" },
        { number: "912", label: "Ambulance", color: "#1E3A8A", bgGlow: "rgba(30,58,138,0.15)", icon: "ambulance" },
        { number: "111", label: "Fire", color: "#F59E0B", bgGlow: "rgba(245,158,11,0.15)", icon: "flame" },
        { number: "3512", label: "GBV", color: "#8B5CF6", bgGlow: "rgba(139,92,246,0.15)", icon: "heart-handshake" },
    ];

    const socialLinks = [
        { icon: "brand-x", label: "X (Twitter)" },
        { icon: "brand-facebook", label: "Facebook" },
        { icon: "brand-linkedin", label: "LinkedIn" },
        { icon: "brand-youtube", label: "YouTube" },
    ];

    const trustBadges = [
        { icon: "lock", label: "256-bit SSL" },
        { icon: "shield-check", label: "ISO 27001" },
        { icon: "certificate", label: "Gov. Certified" },
        { icon: "server", label: "99.9% Uptime" },
    ];

    return (
        <footer style={{ background: "#FFFFFF", borderTop: "none" }}>
            <style>
                {`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                @keyframes mesh {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>

            {/* ═══ Emergency Hotline Strip ═══ */}
            <div style={{
                background: "linear-gradient(-45deg, #0F172A, #1E1B4B, #0F172A, #020617)",
                backgroundSize: "400% 400%",
                animation: "aurora 15s ease infinite",
                padding: "32px 48px",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 40, flexWrap: "wrap",
                position: "relative", overflow: "hidden",
            }}>
                {/* Tactical Grid Overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    pointerEvents: "none",
                }} />

                {/* Secondary glow element */}
                <div style={{
                    position: "absolute", top: "-50%", left: "-20%", width: "140%", height: "200%",
                    background: "radial-gradient(circle at center, rgba(30,58,138,0.1) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                    }}>
                        <div style={{
                            position: "absolute", inset: -4, borderRadius: 12,
                            border: "1px solid rgba(239,68,68,0.15)",
                            animation: "ping-slow 3s infinite",
                        }} />
                        <Icon name="alert-square-rounded" size={16} color="#F87171" />
                    </div>
                    <span style={{
                        fontSize: 11, fontWeight: 900, color: "#F87171",
                        letterSpacing: 3, textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono', monospace",
                        textShadow: "0 0 12px rgba(248,113,113,0.3)",
                    }}>
                        National Emergency Gateway
                    </span>
                </div>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", zIndex: 1 }}>
                    {emergencyCards.map(e => (
                        <div key={e.number} style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 24px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12,
                            backdropFilter: "blur(12px)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                            onMouseEnter={ev => {
                                ev.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                ev.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                                ev.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                                ev.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.2)";
                            }}
                            onMouseLeave={ev => {
                                ev.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                ev.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                ev.currentTarget.style.transform = "";
                                ev.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                            }}
                        >
                            <div style={{
                                width: 34, height: 34, borderRadius: 9,
                                background: e.bgGlow,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.3s",
                            }}>
                                <Icon name={e.icon} size={16} color={e.color} />
                            </div>
                            <div>
                                <span style={{
                                    fontSize: 22, fontWeight: 950, color: "#FFFFFF",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: 2, lineHeight: 1,
                                    display: "block",
                                }}>
                                    {e.number}
                                </span>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, color: "#94A3B8",
                                    textTransform: "uppercase", letterSpacing: 1.5,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                    {e.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Main Footer Content ═══ */}
            <div style={{
                maxWidth: 1320, margin: "0 auto",
                padding: "80px 48px 48px",
                background: "#FFFFFF",
                position: "relative",
            }}>
                {/* Subtle top divider with gradient */}
                <div style={{
                    position: "absolute", top: 0, left: 48, right: 48, height: "1px",
                    background: "linear-gradient(90deg, transparent, #F1F5F9 15%, #F1F5F9 85%, transparent)",
                }} />

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                    gap: 64,
                    marginBottom: 72,
                }}>

                    {/* ── Branding Column ── */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                            <div style={{
                                width: 48, height: 48,
                                background: "linear-gradient(145deg, #C8102E, #9A0C24)",
                                borderRadius: 14,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 8px 20px rgba(200,16,46,0.25), inset 0 2px 4px rgba(255,255,255,0.2)",
                                position: "relative",
                            }}>
                                <Icon name="shield-half" size={26} color="#fff" />
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: 14,
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
                                    pointerEvents: "none",
                                }} />
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: 950, fontSize: 24, color: "#0F172A",
                                    letterSpacing: -0.8, lineHeight: 0.9,
                                    fontFamily: "'Sora', sans-serif",
                                }}>
                                    Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                                </div>
                                <div style={{
                                    fontSize: 9, fontWeight: 900, color: "#64748B",
                                    letterSpacing: 3, textTransform: "uppercase", marginTop: 6,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                    SECURE GOV NETWORK
                                </div>
                            </div>
                        </div>

                        <p style={{
                            fontSize: 14.5, color: "#475569", lineHeight: 1.8,
                            maxWidth: 360, marginBottom: 36,
                            fontWeight: 450,
                        }}>
                            The centralized intelligence and emergency response gateway for the
                            Republic of Rwanda. Integrated incident handling, rapid dispatch
                            systems, and inter-agency coordination at national scale.
                        </p>

                        {/* Trust "Chips" - Pro Version */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
                            {trustBadges.map(badge => (
                                <div key={badge.label} style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "7px 14px",
                                    background: "rgba(241,245,249,0.5)",
                                    border: "1.5px solid #F1F5F9",
                                    borderRadius: 100,
                                    fontSize: 9.5, fontWeight: 800,
                                    color: "#1E293B",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "#1E3A8A";
                                        e.currentTarget.style.background = "#fff";
                                        e.currentTarget.style.transform = "scale(1.05)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(30,58,138,0.1)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "#F1F5F9";
                                        e.currentTarget.style.background = "rgba(241,245,249,0.5)";
                                        e.currentTarget.style.transform = "";
                                        e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255,255,255,0.8)";
                                    }}
                                >
                                    <Icon name={badge.icon} size={11} color="#C8102E" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>

                        {/* Social Links - Brand Themed */}
                        <div style={{ display: "flex", gap: 12 }}>
                            {socialLinks.map((social, idx) => {
                                const brandColors = {
                                    "brand-x": "#000000",
                                    "brand-facebook": "#1877F2",
                                    "brand-linkedin": "#0A66C2",
                                    "brand-youtube": "#FF0000"
                                };
                                const bColor = brandColors[social.icon] || "#1E3A8A";
                                return (
                                    <div key={social.icon}
                                        style={{
                                            width: 40, height: 40, borderRadius: 12,
                                            background: hoveredSocial === idx ? bColor : "#F8FAFC",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            transform: hoveredSocial === idx ? "translateY(-4px) rotate(8deg)" : "",
                                            boxShadow: hoveredSocial === idx
                                                ? `0 8px 20px ${bColor}40`
                                                : "none",
                                            border: hoveredSocial === idx ? "none" : "1.5px solid #F1F5F9",
                                        }}
                                        onMouseEnter={() => setHoveredSocial(idx)}
                                        onMouseLeave={() => setHoveredSocial(null)}
                                        title={social.label}
                                    >
                                        <Icon name={social.icon} size={20}
                                            color={hoveredSocial === idx ? "#fff" : "#64748B"} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Navigation Columns ── */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                marginBottom: 32,
                                paddingBottom: 16,
                                position: "relative",
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: "rgba(30,58,138,0.06)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Icon name={section.icon} size={14} color="#1E3A8A" />
                                </div>
                                <h4 style={{
                                    fontSize: 11, fontWeight: 900, color: "#1E293B",
                                    letterSpacing: 2, textTransform: "uppercase",
                                    margin: 0,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>{section.title}</h4>
                                <div style={{
                                    position: "absolute", bottom: 0, left: 0, width: 40, height: 2,
                                    background: "#C8102E", borderRadius: 2,
                                }} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {section.links.map(link => {
                                    const linkKey = `${section.title}-${link.label}`;
                                    const isHovered = hoveredLink === linkKey;
                                    return (
                                        <div
                                            key={link.label}
                                            onClick={() => link.path !== "#" && navigate(link.path)}
                                            onMouseEnter={() => setHoveredLink(linkKey)}
                                            onMouseLeave={() => setHoveredLink(null)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                fontSize: 14, fontWeight: isHovered ? 700 : 500,
                                                color: isHovered ? "#1E3A8A" : "#64748B",
                                                cursor: link.path === "#" ? "default" : "pointer",
                                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                padding: "10px 14px",
                                                borderRadius: 10,
                                                background: isHovered ? "rgba(30,58,138,0.05)" : "transparent",
                                                marginLeft: -14,
                                                transform: isHovered ? "translateX(6px)" : "",
                                            }}
                                        >
                                            <Icon name={link.icon} size={15}
                                                color={isHovered ? "#1E3A8A" : "#CBD5E1"} />
                                            {link.label}
                                            {isHovered && link.path !== "#" && (
                                                <Icon name="arrow-right" size={13} color="#1E3A8A" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ Bottom Bar ═══ */}
                <div style={{
                    paddingTop: 40,
                    borderTop: "1.5px solid #F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 24,
                }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        fontSize: 12.5, color: "#64748B", fontWeight: 550,
                    }}>
                        <div style={{ width: 30, height: 20, background: "#C8102E", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 900 }}>RW</div>
                        <span>© {currentYear} Republic of Rwanda. All Infrastructure Operational.</span>
                    </div>

                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                        {/* System Status - Pro Version */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 16px",
                            background: "rgba(34,197,94,0.06)",
                            border: "1.5px solid rgba(34,197,94,0.2)",
                            borderRadius: 100,
                            position: "relative",
                        }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "#22C55E",
                                boxShadow: "0 0 12px rgba(34,197,94,0.6)",
                                position: "relative",
                            }}>
                                <div style={{
                                    position: "absolute", inset: -4, borderRadius: "50%",
                                    border: "2px solid #22C55E",
                                    animation: "ping-slow 2s infinite",
                                }} />
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: 900, color: "#16A34A",
                                letterSpacing: 2, textTransform: "uppercase",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                Network Secure
                            </span>
                        </div>

                        <div style={{ height: 20, width: 1.5, background: "#F1F5F9" }} />

                        {/* Version */}
                        <div style={{
                            fontSize: 11, color: "#94A3B8", fontWeight: 700,
                            letterSpacing: 0.5,
                            fontFamily: "'JetBrains Mono', monospace",
                            background: "#F8FAFC", padding: "4px 10px", borderRadius: 6,
                        }}>
                            ENT v2.5.0
                        </div>

                        <div style={{ height: 20, width: 1.5, background: "#F1F5F9" }} />

                        {/* Intelligence Badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569", fontWeight: 700 }}>
                            <Icon name="brain" size={13} color="#1E3A8A" />
                            <span>Dispatch AI Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
