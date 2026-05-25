import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, EMERGENCY_TYPES } from "../config/constants";
import { Icon } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const ReportPage = ({ user, onNewReport }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        type: "",
        description: "",
        location: "",
        level: "",
        date: new Date().toISOString().slice(0, 16),
        lat: -1.9441,
        lng: 30.0619,
        evidence: [],
        reporter: user ? user.name : "Anonymous",
    });
    const [submitted, setSubmitted] = useState(null);
    const [error, setError] = useState("");

    const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const addEvidence = (type) =>
        setForm((p) => ({
            ...p,
            evidence: [
                ...p.evidence,
                {
                    type,
                    name: `${type}_${Date.now()}.${type === "Photo" ? "jpg" : type === "Video" ? "mp4" : "mp3"
                        }`,
                },
            ],
        }));

    const submit = async () => {
        try {
            // Evidence needs to be flattened or handled correctly based on API (which just takes strings currently)
            const submitForm = {
                ...form,
                evidence: form.evidence.map((e) => e.name),
            };
            const res = await API.post("/reports", submitForm);
            setSubmitted(res.data.id);
            if (onNewReport) onNewReport(res.data);
        } catch (err) {
            setError("Failed to submit report. Please try again.");
        }
    };

    if (submitted)
        return (
            <div
                style={{
                    minHeight: "calc(100vh-60px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
                className="slide-in"
            >
                <div className="card" style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            background: "rgba(16,185,129,.15)",
                            border: `2px solid ${COLORS.success}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                        }}
                    >
                        <Icon name="check" size={34} color={COLORS.success} />
                    </div>
                    <h2 style={{ marginBottom: 8 }}>Report Submitted</h2>
                    <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>
                        Your emergency report has been logged and dispatched to the nearest police
                        station.
                    </p>
                    <div
                        style={{
                            background: COLORS.bgPanel,
                            borderRadius: 10,
                            padding: 16,
                            marginBottom: 24,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                color: COLORS.textDim,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                marginBottom: 6,
                            }}
                        >
                            Report ID
                        </div>
                        <div
                            style={{
                                fontSize: 26,
                                fontWeight: 800,
                                color: COLORS.primary,
                                letterSpacing: 1,
                                fontFamily: "'JetBrains Mono',monospace",
                            }}
                        >
                            {submitted}
                        </div>
                    </div>
                    {form.level === "Critical" && (
                        <div className="alert-banner" style={{ marginBottom: 20 }}>
                            <Icon name="bell-ringing" size={18} color="#fff" />
                            <span style={{ fontSize: 13 }}>
                                🚨 Emergency alert sent to nearest hospital and police station!
                            </span>
                        </div>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            className="btn-primary"
                            style={{ flex: 1, padding: 12, borderRadius: 10 }}
                            onClick={() => navigate("/track")}
                        >
                            Track Case
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ flex: 1, padding: 12, borderRadius: 10 }}
                            onClick={() => {
                                setSubmitted(null);
                                setStep(1);
                                setForm({
                                    type: "",
                                    description: "",
                                    location: "",
                                    level: "",
                                    date: new Date().toISOString().slice(0, 16),
                                    lat: -1.9441,
                                    lng: 30.0619,
                                    evidence: [],
                                    reporter: user ? user.name : "Anonymous",
                                });
                            }}
                        >
                            New Report
                        </button>
                    </div>
                </div>
            </div>
        );

    const steps = ["Incident Details", "Location & Time", "Evidence Upload", "Review & Submit"];

    return (
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "30px 24px" }} className="slide-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Report Emergency</h1>
                <p style={{ color: COLORS.textMuted, fontSize: 14 }}>
                    Fill in the details accurately. Your report will be sent to emergency services immediately.
                </p>
            </div>

            {error && (
                <div
                    style={{
                        background: "rgba(239,68,68,.1)",
                        border: "1px solid rgba(239,68,68,.3)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        marginBottom: 16,
                        fontSize: 13,
                        color: "#FCA5A5",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 32, overflowX: "auto" }}>
                {steps.map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: i < step ? "pointer" : "default",
                            }}
                            onClick={() => i < step && setStep(i + 1)}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background:
                                        step > i + 1
                                            ? COLORS.success
                                            : step === i + 1
                                                ? COLORS.primary
                                                : COLORS.bgPanel,
                                    border: `2px solid ${step > i + 1
                                        ? COLORS.success
                                        : step === i + 1
                                            ? COLORS.primary
                                            : COLORS.border
                                        }`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    transition: "all .3s",
                                }}
                            >
                                {step > i + 1 ? <Icon name="check" size={14} color="#fff" /> : i + 1}
                            </div>
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: step === i + 1 ? 600 : 400,
                                    color: step === i + 1 ? COLORS.text : COLORS.textDim,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {s}
                            </span>
                        </div>
                        {i < 3 && (
                            <div
                                style={{
                                    width: 20,
                                    height: 2,
                                    background: step > i + 1 ? COLORS.success : COLORS.border,
                                    margin: "0 8px",
                                    flexShrink: 0,
                                    transition: "background .3s",
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                {step === 1 && (
                    <div className="slide-in">
                        <div className="form-group">
                            <label className="form-label">Emergency Type *</label>
                            <select value={form.type} onChange={(e) => upd("type", e.target.value)}>
                                <option value="">Select emergency type...</option>
                                {EMERGENCY_TYPES.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Detailed Description *</label>
                            <textarea
                                rows={5}
                                placeholder="Describe the incident in detail. Include: what happened, number of people involved, any suspects' description, vehicle numbers, etc."
                                value={form.description}
                                onChange={(e) => upd("description", e.target.value)}
                            />
                            <div className="form-hint">
                                {form.description.length}/500 characters — Be as specific as possible
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Emergency Level *</label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                                {[
                                    {
                                        l: "Low",
                                        desc: "Non-urgent situation",
                                        icon: "info-circle",
                                        color: COLORS.success,
                                    },
                                    {
                                        l: "Medium",
                                        desc: "Attention needed soon",
                                        icon: "alert-circle",
                                        color: COLORS.info,
                                    },
                                    {
                                        l: "High",
                                        desc: "Urgent — respond quickly",
                                        icon: "alert-triangle",
                                        color: COLORS.warning,
                                    },
                                    {
                                        l: "Critical",
                                        desc: "Life threatening — immediate",
                                        icon: "flame",
                                        color: COLORS.danger,
                                    },
                                ].map(({ l, desc, icon, color }) => (
                                    <button
                                        key={l}
                                        onClick={() => upd("level", l)}
                                        style={{
                                            background: form.level === l ? `${color}18` : COLORS.bgPanel,
                                            border: `2px solid ${form.level === l ? color : COLORS.border}`,
                                            borderRadius: 10,
                                            padding: "12px",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            transition: "all .2s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                marginBottom: 4,
                                            }}
                                        >
                                            <Icon name={icon} size={16} color={color} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color }}>{l}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: "100%", padding: 12, borderRadius: 10 }}
                            onClick={() => setStep(2)}
                            disabled={!form.type || !form.description || !form.level}
                        >
                            Next: Location →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="slide-in">
                        <div className="form-group">
                            <label className="form-label">Location Description *</label>
                            <input
                                placeholder="e.g. Near Kimironko Market, KG 15 Ave, Kigali"
                                value={form.location}
                                onChange={(e) => upd("location", e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Live GPS Location</label>
                            <div
                                style={{
                                    background: COLORS.bgPanel,
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Icon name="map-pin" size={16} color={COLORS.primary} />
                                    <span style={{ fontSize: 13 }}>
                                        Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)}
                                    </span>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6 }}
                                    onClick={() => {
                                        upd("lat", -1.9441 + (Math.random() - 0.5) * 0.05);
                                        upd("lng", 30.0619 + (Math.random() - 0.5) * 0.05);
                                        alert("📍 GPS location captured!");
                                    }}
                                >
                                    <Icon name="current-location" size={13} /> Capture
                                </button>
                            </div>
                        </div>
                        {/* Fake Map */}
                        <div className="map-placeholder" style={{ marginBottom: 18, height: 200 }}>
                            <div
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%,-50%)",
                                }}
                            >
                                <div className="map-dot ring-animation" />
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 12,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(0,0,0,.7)",
                                    padding: "4px 12px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    color: COLORS.textMuted,
                                }}
                            >
                                Kigali, Rwanda
                            </div>
                            {[
                                { top: "30%", left: "35%" },
                                { top: "60%", left: "65%" },
                                { top: "45%", left: "20%" },
                            ].map((pos, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        ...pos,
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#3B82F6",
                                        opacity: 0.6,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date & Time of Incident *</label>
                            <input
                                type="datetime-local"
                                value={form.date}
                                onChange={(e) => upd("date", e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(1)}
                            >
                                ← Back
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 2, padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(3)}
                                disabled={!form.location}
                            >
                                Next: Evidence →
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="slide-in">
                        <div style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                                Upload Evidence
                            </h3>
                            <p style={{ fontSize: 13, color: COLORS.textMuted }}>
                                Optional but recommended. Attach photos, videos, or audio recordings.
                            </p>
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3,1fr)",
                                gap: 12,
                                marginBottom: 20,
                            }}
                        >
                            {[
                                { t: "Photo", i: "photo", ext: "JPG/PNG" },
                                { t: "Video", i: "video", ext: "MP4/MOV" },
                                { t: "Audio", i: "microphone", ext: "MP3/WAV" },
                            ].map(({ t, i, ext }) => (
                                <button
                                    key={t}
                                    onClick={() => addEvidence(t)}
                                    style={{
                                        background: COLORS.bgPanel,
                                        border: `2px dashed ${COLORS.border}`,
                                        borderRadius: 12,
                                        padding: "24px 12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 8,
                                        cursor: "pointer",
                                        transition: "border-color .2s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.primary)}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
                                >
                                    <Icon name={i} size={28} color={COLORS.primary} />
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>Add {t}</span>
                                    <span style={{ fontSize: 11, color: COLORS.textDim }}>{ext}</span>
                                </button>
                            ))}
                        </div>
                        {form.evidence.length > 0 && (
                            <div>
                                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>
                                    {form.evidence.length} file(s) attached
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                    {form.evidence.map((ev, i) => (
                                        <div
                                            key={i}
                                            className="evidence-thumb"
                                            style={{ flexDirection: "column", gap: 6, padding: 8 }}
                                        >
                                            <Icon
                                                name={
                                                    ev.type === "Photo"
                                                        ? "photo"
                                                        : ev.type === "Video"
                                                            ? "video"
                                                            : "microphone"
                                                }
                                                size={24}
                                                color={COLORS.primary}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    color: COLORS.textDim,
                                                    textAlign: "center",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                {ev.name}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        evidence: p.evidence.filter((_, j) => j !== i),
                                                    }))
                                                }
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: COLORS.danger,
                                                    fontSize: 11,
                                                    cursor: "pointer",
                                                    padding: 0,
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div
                            style={{
                                background: "rgba(59,130,246,.08)",
                                border: "1px solid rgba(59,130,246,.2)",
                                borderRadius: 8,
                                padding: "10px 14px",
                                marginTop: 16,
                                fontSize: 12,
                                color: COLORS.textMuted,
                            }}
                        >
                            <Icon name="lock" size={13} color={COLORS.info} /> Evidence is securely stored
                            and only accessible by authorized officers. Max 50MB per file.
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(2)}
                            >
                                ← Back
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 2, padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(4)}
                            >
                                Next: Review →
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="slide-in">
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
                            Review Your Report
                        </h3>
                        {[
                            ["Emergency Type", form.type],
                            ["Emergency Level", form.level],
                            ["Location", form.location],
                            ["Date & Time", form.date.replace("T", " ")],
                            ["Evidence Files", form.evidence.length + " file(s)"],
                        ].map(([k, v]) => (
                            <div
                                key={k}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "10px 0",
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    fontSize: 13,
                                }}
                            >
                                <span style={{ color: COLORS.textMuted }}>{k}</span>
                                <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>
                                    {v}
                                </span>
                            </div>
                        ))}
                        <div style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>
                                DESCRIPTION
                            </div>
                            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{form.description}</div>
                        </div>
                        {form.level === "Critical" && (
                            <div className="alert-banner" style={{ marginTop: 16 }}>
                                <Icon name="bell-ringing" size={18} color="#fff" />
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                                        Critical Emergency Detected
                                    </div>
                                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                                        Alert will be sent to nearest police station AND hospital upon
                                        submission.
                                    </div>
                                </div>
                            </div>
                        )}
                        <div
                            style={{
                                background: "rgba(245,158,11,.08)",
                                border: "1px solid rgba(245,158,11,.2)",
                                borderRadius: 8,
                                padding: "12px 14px",
                                marginTop: 16,
                                fontSize: 12,
                                color: COLORS.textMuted,
                            }}
                        >
                            ⚠️ By submitting, you confirm this information is accurate and truthful.
                            False reports are illegal.
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(3)}
                            >
                                ← Edit
                            </button>
                            <button
                                className="btn-primary"
                                style={{
                                    flex: 2,
                                    padding: 12,
                                    borderRadius: 10,
                                    background: form.level === "Critical" ? COLORS.danger : COLORS.primary,
                                }}
                                onClick={submit}
                            >
                                <Icon name="send" size={15} /> Submit Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;
