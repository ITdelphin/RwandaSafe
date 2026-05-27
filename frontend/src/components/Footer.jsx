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

            {/* ═══ Emergency Hotline Strip ═══ */}
            <div style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
                padding: "28px 48px",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 40, flexWrap: "wrap",
                position: "relative", overflow: "hidden",
            }}>
                {/* Subtle grid pattern overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: "rgba(200,16,46,0.15)",
                        border: "1px solid rgba(200,16,46,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Icon name="alert-triangle" size={14} color="#F87171" />
                    </div>
                    <span style={{
                        fontSize: 10, fontWeight: 800, color: "#F87171",
                        letterSpacing: 2.5, textTransform: "uppercase",
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        NATIONAL EMERGENCY HOTLINES
                    </span>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", zIndex: 1 }}>
                    {emergencyCards.map(e => (
                        <div key={e.number} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 22px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10,
                            backdropFilter: "blur(10px)",
                            transition: "all 0.25s ease",
                            cursor: "default",
                        }}
                            onMouseEnter={ev => {
                                ev.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                ev.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                                ev.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={ev => {
                                ev.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                ev.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                                ev.currentTarget.style.transform = "";
                            }}
                        >
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: e.bgGlow,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon name={e.icon} size={15} color={e.color} />
                            </div>
                            <div>
                                <span style={{
                                    fontSize: 20, fontWeight: 900, color: "#FFFFFF",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: 2, lineHeight: 1,
                                    display: "block",
                                }}>
                                    {e.number}
                                </span>
                                <span style={{
                                    fontSize: 9, fontWeight: 700, color: "#64748B",
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
                padding: "72px 48px 40px",
                background: "#FFFFFF",
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                    gap: 48,
                    marginBottom: 64,
                }}>

                    {/* ── Branding Column ── */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                            <div style={{
                                width: 44, height: 44,
                                background: "linear-gradient(145deg, #C8102E, #9A0C24)",
                                borderRadius: 14,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 6px 16px rgba(200,16,46,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                                position: "relative",
                            }}>
                                <Icon name="shield-check" size={24} color="#fff" />
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: 14,
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                                    pointerEvents: "none",
                                }} />
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: 900, fontSize: 22, color: "#0F172A",
                                    letterSpacing: -0.7, lineHeight: 1,
                                    fontFamily: "'Sora', sans-serif",
                                }}>
                                    Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                                </div>
                                <div style={{
                                    fontSize: 8.5, fontWeight: 800, color: "#94A3B8",
                                    letterSpacing: 2.5, textTransform: "uppercase", marginTop: 4,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                    EMERGENCY SYSTEM
                                </div>
                            </div>
                        </div>

                        <p style={{
                            fontSize: 14, color: "#64748B", lineHeight: 1.75,
                            maxWidth: 340, marginBottom: 32,
                            fontWeight: 400,
                        }}>
                            The official multi-agency emergency response and incident reporting
                            gateway for the Republic of Rwanda. Securing our nation through
                            rapid digital dispatch and coordinated response.
                        </p>

                        {/* Trust Badges */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
                            {trustBadges.map(badge => (
                                <div key={badge.label} style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    padding: "6px 12px",
                                    background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: 8,
                                    fontSize: 9, fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.8,
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "#1E3A8A";
                                        e.currentTarget.style.background = "rgba(30,58,138,0.04)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "#E2E8F0";
                                        e.currentTarget.style.background = "linear-gradient(135deg, #F8FAFC, #F1F5F9)";
                                    }}
                                >
                                    <Icon name={badge.icon} size={11} color="#1E3A8A" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div style={{ display: "flex", gap: 10 }}>
                            {socialLinks.map((social, idx) => (
                                <div key={social.icon}
                                    style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        background: hoveredSocial === idx
                                            ? "linear-gradient(145deg, #1E3A8A, #2D5DD6)"
                                            : "#F1F5F9",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        transform: hoveredSocial === idx ? "translateY(-3px)" : "",
                                        boxShadow: hoveredSocial === idx
                                            ? "0 6px 16px rgba(30,58,138,0.25)"
                                            : "none",
                                        border: hoveredSocial === idx ? "none" : "1px solid #E2E8F0",
                                    }}
                                    onMouseEnter={() => setHoveredSocial(idx)}
                                    onMouseLeave={() => setHoveredSocial(null)}
                                    title={social.label}
                                >
                                    <Icon name={social.icon} size={18}
                                        color={hoveredSocial === idx ? "#fff" : "#475569"} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Navigation Columns ── */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 28,
                                paddingBottom: 14,
                                borderBottom: "2px solid #F1F5F9",
                            }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: 7,
                                    background: "rgba(30,58,138,0.06)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Icon name={section.icon} size={13} color="#1E3A8A" />
                                </div>
                                <h4 style={{
                                    fontSize: 10.5, fontWeight: 900, color: "#0F172A",
                                    letterSpacing: 2, textTransform: "uppercase",
                                    margin: 0,
                                    fontFamily: "'Sora', sans-serif",
                                }}>{section.title}</h4>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                                                display: "flex", alignItems: "center", gap: 10,
                                                fontSize: 13, fontWeight: isHovered ? 600 : 500,
                                                color: isHovered ? "#1E3A8A" : "#64748B",
                                                cursor: link.path === "#" ? "default" : "pointer",
                                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                padding: "8px 10px",
                                                borderRadius: 8,
                                                background: isHovered ? "rgba(30,58,138,0.04)" : "transparent",
                                                marginLeft: -10,
                                            }}
                                        >
                                            <Icon name={link.icon} size={14}
                                                color={isHovered ? "#1E3A8A" : "#CBD5E1"} />
                                            {link.label}
                                            {isHovered && link.path !== "#" && (
                                                <Icon name="chevron-right" size={12} color="#1E3A8A" />
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
                    paddingTop: 28,
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 20,
                }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        fontSize: 12, color: "#94A3B8", fontWeight: 500,
                    }}>
                        <span style={{ fontSize: 16 }}>🇷🇼</span>
                        <span>© {currentYear} Government of Rwanda — Ministry of Internal Security.</span>
                        <span style={{ opacity: 0.4 }}>|</span>
                        <span style={{ color: "#CBD5E1" }}>All rights reserved.</span>
                    </div>

                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        {/* System Status */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "5px 14px",
                            background: "rgba(34,197,94,0.06)",
                            border: "1px solid rgba(34,197,94,0.15)",
                            borderRadius: 8,
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#22C55E",
                                boxShadow: "0 0 8px rgba(34,197,94,0.5)",
                                animation: "pulse 2s infinite",
                            }} />
                            <span style={{
                                fontSize: 9, fontWeight: 800, color: "#16A34A",
                                letterSpacing: 1.5, textTransform: "uppercase",
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                ALL SYSTEMS OPERATIONAL
                            </span>
                        </div>

                        <div style={{ height: 16, width: 1, background: "#E2E8F0" }} />

                        {/* Version */}
                        <div style={{
                            fontSize: 10, color: "#94A3B8", fontWeight: 600,
                            letterSpacing: 0.5,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            v2.4.0 • Enterprise
                        </div>

                        <div style={{ height: 16, width: 1, background: "#E2E8F0" }} />

                        {/* Powered By */}
                        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                            Powered by{" "}
                            <span style={{
                                fontWeight: 800, color: "#1E3A8A",
                                background: "linear-gradient(135deg, #1E3A8A, #3367D6)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}>
                                SafeRwanda
                            </span>
                            {" "}Intelligence
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
