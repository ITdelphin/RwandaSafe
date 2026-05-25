import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, DISTRICTS } from "../config/constants";
import { Icon } from "../components/Badges";
import API from "../config/api";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        national_id: "",
        password: "",
        confirm: "",
        district: "",
        agree: false,
    });
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        if (form.password !== form.confirm) {
            setError("Passwords don't match");
            return;
        }
        setError("");
        try {
            await API.post("/auth/register", form);
            setDone(true);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    if (done)
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
                <div style={{ textAlign: "center", maxWidth: 400 }}>
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: "50%",
                            background: "rgba(16,185,129,.15)",
                            border: `2px solid ${COLORS.success}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                        }}
                    >
                        <Icon name="check" size={36} color={COLORS.success} />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Account Created!</h2>
                    <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
                        Welcome to SafeRwanda. Your account has been verified and is ready to use.
                    </p>
                    <button
                        className="btn-primary"
                        style={{ padding: "12px 32px", borderRadius: 10 }}
                        onClick={() => navigate("/login")}
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );

    return (
        <div
            style={{
                minHeight: "calc(100vh - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
            className="slide-in"
        >
            <div style={{ width: "100%", maxWidth: 480 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
                    Create Account
                </h2>
                <p
                    style={{
                        color: COLORS.textMuted,
                        textAlign: "center",
                        fontSize: 14,
                        marginBottom: 28,
                    }}
                >
                    Join SafeRwanda to report and track emergencies
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            style={{
                                width: 80,
                                height: 4,
                                borderRadius: 2,
                                background: step >= s ? COLORS.primary : COLORS.border,
                                transition: "background .3s",
                            }}
                        />
                    ))}
                </div>
                <div className="card">
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
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    placeholder="Jean Baptiste Nkurunziza"
                                    value={form.name}
                                    onChange={(e) => upd("name", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="jean@example.com"
                                    value={form.email}
                                    onChange={(e) => upd("email", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    placeholder="+250 7XX XXX XXX"
                                    value={form.phone}
                                    onChange={(e) => upd("phone", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">National ID</label>
                                <input
                                    placeholder="1 XXXX X XXXXXXX X XX"
                                    value={form.national_id}
                                    onChange={(e) => upd("national_id", e.target.value)}
                                />
                                <div className="form-hint">Your National ID is required for account verification</div>
                            </div>
                            <button
                                className="btn-primary"
                                style={{ width: "100%", padding: 12, borderRadius: 10 }}
                                onClick={() => setStep(2)}
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">District</label>
                                <select value={form.district} onChange={(e) => upd("district", e.target.value)}>
                                    <option value="">Select your district</option>
                                    {DISTRICTS.map((d) => (
                                        <option key={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={(e) => upd("password", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Repeat password"
                                    value={form.confirm}
                                    onChange={(e) => upd("confirm", e.target.value)}
                                />
                            </div>
                            <div
                                style={{
                                    background: "rgba(245,158,11,.08)",
                                    border: "1px solid rgba(245,158,11,.2)",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    marginBottom: 18,
                                    fontSize: 12,
                                    color: COLORS.textMuted,
                                    lineHeight: 1.6,
                                }}
                            >
                                <strong style={{ color: COLORS.warning }}>⚠️ Important:</strong> Submitting
                                false or misleading reports is a criminal offense under Rwandan law. By
                                registering, you agree to use this platform responsibly.
                            </div>
                            <label
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    marginBottom: 18,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    color: COLORS.textMuted,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.agree}
                                    onChange={(e) => upd("agree", e.target.checked)}
                                    style={{ width: 16, height: 16, marginTop: 2 }}
                                />
                                I agree to the Terms of Service and acknowledge that false reporting is a
                                punishable offense
                            </label>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    className="btn-secondary"
                                    style={{ flex: 1, padding: 12, borderRadius: 10 }}
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 2, padding: 12, borderRadius: 10 }}
                                    onClick={submit}
                                    disabled={!form.agree}
                                >
                                    Create Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.textMuted }}>
                    Already registered?{" "}
                    <span
                        style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
