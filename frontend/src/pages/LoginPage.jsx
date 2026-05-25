import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../config/constants";
import { Icon } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handle = async () => {
        try {
            const res = await API.post("/auth/login", form);
            localStorage.setItem("saferwanda_token", res.data.token);
            localStorage.setItem("saferwanda_user", JSON.stringify(res.data.user));
            onLogin(res.data.user);

            const role = res.data.user.role;
            toast.success(`Welcome back, ${res.data.user.name}`);
            navigate(
                role === "Admin" ? "/admin" :
                    role === "Police" ? "/police" :
                        role === "Hospital" ? "/hospital" :
                            "/report"
            );
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid credentials");
            setError(err.response?.data?.error || "Invalid credentials");
        }
    };

    const demos = [
        { label: "Admin", email: "admin@saferwanda.rw", pw: "admin123" },
        { label: "Police", email: "police@rdf.gov.rw", pw: "police123" },
        { label: "Hospital", email: "hospital@chuk.rw", pw: "hospital123" },
        { label: "Citizen", email: "citizen@gmail.com", pw: "user123" },
    ];

    return (
        <div
            style={{
                minHeight: "calc(100vh - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                background: "radial-gradient(ellipse at 50% 50%,rgba(200,16,46,.08) 0%,transparent 70%)",
            }}
            className="slide-in"
        >
            <div style={{ width: "100%", maxWidth: 440 }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 16,
                            background: COLORS.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                        }}
                    >
                        <Icon name="shield-lock" size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Secure Sign In</h1>
                    <p style={{ color: COLORS.textMuted, fontSize: 14 }}>
                        SafeRwanda Emergency Reporting System
                    </p>
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
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        style={{ width: "100%", padding: "12px", fontSize: 15, borderRadius: 10, marginTop: 4 }}
                        onClick={handle}
                    >
                        Sign In
                    </button>
                    <div
                        style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.textMuted }}
                    >
                        Don't have an account?{" "}
                        <span
                            style={{ color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </span>
                    </div>
                </div>
                <div style={{ marginTop: 20 }}>
                    <div
                        style={{
                            fontSize: 11,
                            color: COLORS.textDim,
                            textAlign: "center",
                            marginBottom: 12,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                        }}
                    >
                        Demo Accounts
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {demos.map((d) => (
                            <button
                                key={d.label}
                                onClick={() => setForm({ email: d.email, password: d.pw })}
                                style={{
                                    background: COLORS.bgPanel,
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: 8,
                                    padding: "10px",
                                    fontSize: 12,
                                    color: COLORS.textMuted,
                                    cursor: "pointer",
                                    transition: "all .2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.primary)}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
                            >
                                <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{d.label}</div>
                                <div style={{ fontSize: 10 }}>{d.email}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
