import React, { useState, useEffect } from "react";
import { COLORS, EMERGENCY_TYPES } from "../config/constants";
import { Icon, LevelBadge, StatusBadge } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const ReportPage = ({ user }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        type: "",
        level: "Medium",
        location: "",
        description: "",
        reporter: user?.name || "Anonymous",
        contact: user?.phone || "",
        anonymous: false
    });

    const submitReport = async () => {
        if (!form.type || !form.location || !form.description) {
            toast.error("Please complete all required fields");
            return;
        }
        setLoading(true);
        try {
            await API.post("/reports", form);
            toast.success("Emergency Dispatch Initiated");
            setStep(4);
        } catch (err) {
            toast.error(err.response?.data?.error || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "#F8FAFC", padding: "60px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <div style={{ color: "#C8102E", fontSize: 13, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>OFFICIAL EMERGENCY INTAKE</div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px" }}>Rapid Dispatch System</h1>
                    <p style={{ color: "#64748B", fontSize: 16, marginTop: 12 }}>Secure, encrypted connection to National Emergency Services.</p>
                </div>

                {/* Stepper - LIGHT */}
                <div style={{ display: "flex", gap: 8, marginBottom: 40, position: "relative" }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            background: step >= s ? "#1E3A8A" : "#E2E8F0",
                            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                        }} />
                    ))}
                </div>

                <div className="card" style={{ padding: 48, boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}>
                    {step === 1 && (
                        <div className="fadeIn">
                            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, color: "#0F172A" }}>1. Incident Classification</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                                {EMERGENCY_TYPES.map((t, idx) => (
                                    <button
                                        key={t.name || t || idx}
                                        onClick={() => setForm({ ...form, type: t.name, level: t.defaultLevel })}
                                        style={{
                                            padding: "24px 16px",
                                            borderRadius: 16,
                                            border: form.type === t.name ? `2px solid #1E3A8A` : "1.5px solid #E2E8F0",
                                            background: form.type === t.name ? "#E8F0FE" : "#FFFFFF",
                                            textAlign: "center",
                                            transition: "all 0.2s",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div style={{ width: 44, height: 44, background: form.type === t.name ? "#D2E3FC" : "#F8FAFC", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                            <Icon name={t.icon} size={24} color={form.type === t.name ? "#1E3A8A" : "#64748B"} />
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: form.type === t.name ? "#1E3A8A" : "#0F172A" }}>{t.name}</div>
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => form.type ? setStep(2) : toast.error("Select incident type")}
                                    className="btn-primary"
                                    style={{ padding: "16px 40px", fontSize: 15 }}
                                >
                                    Continue to Evidence →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="fadeIn">
                            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, color: "#0F172A" }}>2. Situational Details</h2>
                            <div className="form-group">
                                <label className="form-label">Location (Sector, Street, or Landmark)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nyarugenge, KN 2 St, Near CHUK"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    style={{ padding: 16, fontSize: 15 }}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: 24 }}>
                                <label className="form-label">Incident Description & Immediate Needs</label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the situation clearly..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ padding: 16, fontSize: 15, resize: "none" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
                                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: 16 }}>Back</button>
                                <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, padding: 16 }}>Assign Priority →</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="fadeIn">
                            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, color: "#0F172A" }}>3. Final Authorization</h2>
                            <div className="card" style={{ background: "#F8FAFC", padding: 24, marginBottom: 32, border: "1px solid #E2E8F0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8" }}>INTAKE SUMMARY</div>
                                    <LevelBadge level={form.level} />
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{form.type}</div>
                                <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>📍 {form.location}</div>
                            </div>

                            <div style={{ padding: "20px", background: "#FEF2F2", borderRadius: 12, border: "1px solid #FEE2E2", marginBottom: 32 }}>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <div style={{ fontSize: 20, color: "#C8102E" }}>
                                        <Icon name="alert-triangle" size={24} />
                                    </div>
                                    <div style={{ fontSize: 12, color: "#C8102E", lineHeight: 1.6, fontWeight: 600 }}>
                                        <b>LEGAL NOTICE:</b> By submitting this report, you confirm the information is accurate. False reporting is a crime under Rwanda Penal Code Article 39.
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 16 }}>
                                <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, padding: 16 }}>Back</button>
                                <button
                                    onClick={submitReport}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ flex: 2, padding: 16, background: "#C8102E" }}
                                >
                                    {loading ? "COMMUNICATING WITH DISPATCH..." : "INITIATE RESPONSE NOW"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="fadeIn" style={{ textAlign: "center", padding: "40px 0" }}>
                            <div style={{ width: 100, height: 100, background: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", boxShadow: "0 10px 30px rgba(16,185,129,0.2)" }}>
                                <Icon name="check" size={48} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#0F172A", marginBottom: 16 }}>Signal Received.</h2>
                            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 450, margin: "0 auto 40px", lineHeight: 1.6 }}>
                                Your emergency report has been prioritized. Deployment of nearest response units is currently in progress.
                            </p>
                            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                                <button onClick={() => navigate("/track")} className="btn-primary" style={{ padding: "14px 40px" }}>Track Response</button>
                                <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: "14px 40px" }}>New Signal</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
