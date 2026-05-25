import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Badges";

const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [hoveredLink, setHoveredLink] = useState(null);

    const sections = [
        {
            title: "Platform",
            icon: "apps",
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
        { number: "112", label: "Police", color: "#C8102E", icon: "shield-check" },
        { number: "912", label: "Ambulance", color: "#1E3A8A", icon: "ambulance" },
        { number: "111", label: "Fire", color: "#F4B400", icon: "flame" },
    ];

    return (
        <footer style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>

            {/* Emergency Hotline Strip */}
            <div style={{
                background: "#1E293B",
                padding: "20px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="alert-circle" size={16} color="#C8102E" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#FECACA", letterSpacing: 1.5 }}>
                        NATIONAL EMERGENCY HOTLINES
                    </span>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                    {emergencyCards.map(e => (
                        <div key={e.number} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 20px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8,
                        }}>
                            <Icon name={e.icon} size={16} color={e.color} />
                            <span style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
                                {e.number}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
                                {e.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Footer Content */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 48px" }}>
                <div className="grid-4" style={{ marginBottom: 64 }}>

                    {/* Branding Column */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <div style={{
                                width: 40, height: 40,
                                background: "linear-gradient(135deg, #C8102E, #8a2436)",
                                borderRadius: 12,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(172,46,68,0.2)",
                            }}>
                                <Icon name="shield-check" size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 20, color: "#0F172A", letterSpacing: -0.5, lineHeight: 1 }}>
                                    Safe<span style={{ color: "#C8102E" }}>Rwanda</span>
                                </div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>
                                    Emergency Portal
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, maxWidth: 320, marginBottom: 28 }}>
                            The official multi-agency emergency response and incident reporting gateway for the Republic of Rwanda. Securing our nation through rapid digital dispatch.
                        </p>

                        {/* Trust Badges */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                            {[
                                { icon: "lock", label: "SSL Encrypted" },
                                { icon: "shield-check", label: "ISO 27001" },
                                { icon: "certificate", label: "Gov Certified" },
                            ].map(badge => (
                                <div key={badge.label} style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    padding: "5px 10px",
                                    background: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: 6,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: "#64748B",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    <Icon name={badge.icon} size={11} color="#1E3A8A" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>

                        {/* Social Links */}
                        <div style={{ display: "flex", gap: 10 }}>
                            {["brand-twitter", "brand-facebook", "brand-linkedin", "brand-youtube"].map(social => (
                                <div key={social} style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: "#F1F5F9",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#1E3A8A"; e.currentTarget.querySelector("i").style.color = "#fff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.querySelector("i").style.color = "#475569"; }}
                                >
                                    <Icon name={social} size={18} color="#475569" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 24,
                            }}>
                                <Icon name={section.icon} size={14} color="#1E3A8A" />
                                <h4 style={{
                                    fontSize: 11, fontWeight: 900, color: "#0F172A",
                                    letterSpacing: 1.5, textTransform: "uppercase", margin: 0,
                                }}>{section.title}</h4>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                                                fontSize: 13, fontWeight: 500,
                                                color: isHovered ? "#1E3A8A" : "#64748B",
                                                cursor: link.path === "#" ? "default" : "pointer",
                                                transition: "all 0.2s",
                                                padding: "6px 0",
                                            }}
                                        >
                                            <Icon name={link.icon} size={14} color={isHovered ? "#1E3A8A" : "#CBD5E1"} />
                                            {link.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div style={{
                    paddingTop: 28,
                    borderTop: "1px solid #F1F5F9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                        <span style={{ fontSize: 14 }}>🇷🇼</span>
                        <span>© {currentYear} Government of Rwanda — Ministry of Internal Security. All rights reserved.</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 10, fontWeight: 800,
                            color: "#1E3A8A",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#1E3A8A",
                                boxShadow: "0 0 6px #1E3A8A",
                            }} />
                            Secure System Active
                        </div>
                        <div style={{ height: 14, width: 1, background: "#E2E8F0" }} />
                        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, letterSpacing: 0.5 }}>
                            v2.4.0 • Enterprise Edition
                        </div>
                        <div style={{ height: 14, width: 1, background: "#E2E8F0" }} />
                        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
                            Powered by <span style={{ fontWeight: 800, color: "#1E3A8A" }}>SafeRwanda</span> Intelligence
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
