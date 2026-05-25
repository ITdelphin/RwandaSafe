import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../config/constants";
import { Icon } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handle = async (e) => {
        e?.preventDefault();
        if (!form.email || !form.password) {
            toast.error("Credentials required");
            return;
        }
        setLoading(true);
        try {
            const res = await API.post("/auth/login", form);
            localStorage.setItem("saferwanda_token", res.data.token);
            localStorage.setItem("saferwanda_user", JSON.stringify(res.data.user));
            onLogin(res.data.user);

            const role = res.data.user.role;
            toast.success(`Access Granted: ${res.data.user.name}`);
            navigate(
                role === "Admin" ? "/admin" :
                    role === "Police" ? "/police" :
                        role === "Hospital" ? "/hospital" :
                            role === "Citizen" ? "/citizen" :
                                "/report"
            );
        } catch (err) {
            toast.error(err.response?.data?.error || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const demos = [
        { label: "Administrator", email: "admin@saferwanda.rw", icon: "user-cog", color: "#6366F1" },
        { label: "Police Officer", email: "police@rdf.gov.rw", icon: "shield-lock", color: "#C8102E" },
        { label: "Medical Hub", email: "hospital@chuk.rw", icon: "building-hospital", color: "#10B981" },
        { label: "Citizen Access", email: "user-circle", email: "citizen@gmail.com", icon: "user", color: "#1D4ED8" },
    ];

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
                {/* Visual Branding */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1.5px solid #E2E8F0", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
                        <Icon name="lock-access" size={28} color="#0F172A" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 4 }}>System Authentication</h1>
                    <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Safe Rwanda Public Safety Network</p>
                </div>

                <div className="card" style={{ padding: 32, background: "#fff", border: "1px solid #E2E8F0" }}>
                    <form onSubmit={handle}>
                        <div className="form-group">
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Staff Email / ID</label>
                            <input
                                type="email"
                                placeholder="name@gov.rw"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, fontFamily: "inherit", outline: "none", transition: "all 0.2s" }}
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: 24 }}>
                            <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "block" }}>Security Passkey</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: "100%", marginTop: 32, padding: 16, background: "#0F172A", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)", transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = ""}
                        >
                            {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS →"}
                        </button>
                    </form>

                    <div style={{ marginTop: 32, padding: "20px", background: "#F8FAFC", borderRadius: 16, border: "1px solid #F1F5F9" }}>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#94A3B8", letterSpacing: 1.5, marginBottom: 16, textAlign: "center" }}>QUICK ACCESS TERMINAL</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {demos.map(d => (
                                <button
                                    key={d.label}
                                    onClick={() => setForm({ email: d.email, password: d.email.split('@')[0] === 'admin' ? 'admin123' : d.email.split('@')[0] === 'police' ? 'police123' : d.email.split('@')[0] === 'hospital' ? 'hospital123' : 'user123' })}
                                    style={{ padding: "10px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = `${d.color}05`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}
                                >
                                    <Icon name={d.icon} size={14} color={d.color} /> {d.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                    Forgot credentials? Contact <span style={{ color: "#C8102E", fontWeight: 800, cursor: "pointer" }}>National Security Support</span>
                </p>

                <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: "#CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700 }}>
                    <div className="pulse-green" style={{ width: 8, height: 8, background: "#10B981", borderRadius: "50%" }} />
                    SECURE TERMINAL CONNECTED · SSA-256 ENCRYPTED
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
