import React from "react";
import { COLORS } from "../config/constants";
import { Icon } from "../components/Badges";

const ContactPage = () => (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "30px 24px" }} className="slide-in">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Contact & Help</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28 }}>
            Emergency hotlines and support contacts for Rwanda
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 28 }}>
            {[
                { label: "General Emergency", num: "112", desc: "All emergencies", icon: "alert-triangle", color: COLORS.danger },
                { label: "Rwanda National Police", num: "113", desc: "Crime & security", icon: "shield", color: COLORS.primary },
                { label: "Ambulance Service", num: "912", desc: "Medical emergencies", icon: "first-aid-kit", color: COLORS.success },
                { label: "Fire Brigade", num: "111", desc: "Fire & rescue", icon: "flame", color: COLORS.warning },
                { label: "Traffic Police", num: "113", desc: "Road accidents", icon: "car", color: COLORS.info },
                { label: "Anti-Corruption", num: "997", desc: "Report corruption", icon: "badge-off", color: "#A855F7" }
            ].map((c) => (
                <div key={c.label} className="card" style={{ display: "flex", gap: 14, padding: 18 }}>
                    <div
                        style={{
                            width: 46,
                            height: 46,
                            borderRadius: 12,
                            background: `${c.color}22`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Icon name={c.icon} size={22} color={c.color} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{c.desc}</div>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: c.color,
                                fontFamily: "'JetBrains Mono',monospace",
                            }}
                        >
                            {c.num}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Send Us a Message</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input placeholder="Your full name" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input placeholder="your@email.com" />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Subject</label>
                <input placeholder="Support request or feedback" />
            </div>
            <div className="form-group">
                <label className="form-label">Message</label>
                <textarea rows={4} placeholder="Describe your issue or question..." />
            </div>
            <button className="btn-primary" style={{ padding: "10px 24px", borderRadius: 8 }}>
                <Icon name="send" size={14} /> Send Message
            </button>
        </div>
    </div>
);

export default ContactPage;
