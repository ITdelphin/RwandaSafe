import React, { useState } from "react";
import { COLORS } from "../config/constants";
import toast from "react-hot-toast";

const ContactPage = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sending, setSending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all required fields");
            return;
        }
        setSending(true);
        setTimeout(() => {
            toast.success("Message sent! Our support team will contact you within 24 hours.");
            setForm({ name: "", email: "", subject: "", message: "" });
            setSending(false);
        }, 1000);
    };

    const hotlines = [
        { label: "General Emergency", num: "112", desc: "All emergencies — 24/7", icon: "🚨", color: "#EF4444" },
        { label: "Rwanda National Police", num: "113", desc: "Crime & security incidents", icon: "👮", color: "#C8102E" },
        { label: "Ambulance / SAMU", num: "912", desc: "Medical emergencies", icon: "🚑", color: "#059669" },
        { label: "Fire Brigade", num: "111", desc: "Fire & rescue services", icon: "🚒", color: "#F59E0B" },
        { label: "Traffic Police", num: "113", desc: "Road accidents & traffic", icon: "🚗", color: "#3B82F6" },
        { label: "Anti-Corruption", num: "9191", desc: "Report corruption", icon: "🛡️", color: "#7C3AED" },
    ];

    const offices = [
        { name: "National Emergency Centre", address: "KN 3 Rd, Kigali, Rwanda", hours: "24/7", phone: "+250 788 000 000" },
        { name: "SafeRwanda Technical Support", address: "KG 7 Ave, Kigali", hours: "Mon-Fri 8:00-18:00", phone: "support@saferwanda.rw" },
    ];

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }} className="slide-in">
            {/* Page Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#C8102E", textTransform: "uppercase", marginBottom: 8 }}>SUPPORT</div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Contact & Emergency Help</h1>
                <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>
                    Emergency hotlines, support contacts, and feedback — we're here to help 24/7.
                </p>
            </div>

            {/* Emergency Hotlines */}
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    📞 Emergency Hotlines
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                    {hotlines.map((c) => (
                        <div key={c.label} className="card" style={{ display: "flex", gap: 14, padding: 18 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: `${c.color}12`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                fontSize: 22,
                            }}>
                                {c.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{c.label}</div>
                                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>{c.desc}</div>
                                <div style={{
                                    fontSize: 24,
                                    fontWeight: 800,
                                    color: c.color,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    letterSpacing: 1,
                                }}>
                                    {c.num}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Contact Form */}
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        ✉️ Send Us a Message
                    </h2>
                    <div className="card" style={{ padding: 24 }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        placeholder="Your full name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <select
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="report">Report Issue</option>
                                    <option value="account">Account Help</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message *</label>
                                <textarea
                                    rows={5}
                                    placeholder="Describe your issue or question in detail..."
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={sending}
                                style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14 }}
                            >
                                {sending ? "Sending..." : "📨 Send Message"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Office Info */}
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        🏢 Our Offices
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {offices.map((o, i) => (
                            <div key={i} className="card" style={{ padding: 20 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>{o.name}</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#64748B" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>📍</span> {o.address}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>🕐</span> {o.hours}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>📞</span> {o.phone}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* FAQ */}
                        <div className="card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>❓ Quick FAQ</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { q: "Is my report anonymous?", a: "Reports require identity for accountability, but your information is protected by law." },
                                    { q: "How fast is the response?", a: "Average emergency response time is under 5 minutes in Kigali districts." },
                                    { q: "Can I track my case?", a: "Yes, use the Track My Case feature with your case ID for real-time updates." },
                                ].map((faq, i) => (
                                    <div key={i}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{faq.q}</div>
                                        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{faq.a}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
