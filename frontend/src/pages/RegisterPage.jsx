import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Badges";
import toast from "react-hot-toast";
import API from "../config/api";

const RegisterPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", nationalId: "", province: "" });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/auth/register", form);
            localStorage.setItem("saferwanda_token", res.data.token);
            localStorage.setItem("saferwanda_user", JSON.stringify(res.data.user));
            onLogin(res.data.user);
            toast.success("Account Created Successfully");
            navigate("/citizen");
        } catch (err) {
            toast.error(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ width: "100%", maxWidth: 540 }}>
                {/* Visual Branding */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, background: "#FFFFFF", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1.5px solid #E2E8F0", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
                        <Icon name="id" size={28} color="#0F172A" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.5px" }}>Citizen Registration</h1>
                    <p style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Create your official Safe Rwanda account</p>
                </div>

                {/* Progress Stepper - LIGHT */}
                <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: step >= s ? "#C8102E" : "#E2E8F0", transition: "all 0.3s" }} />
                    ))}
                </div>

                <div className="card" style={{ padding: 40 }}>
                    <form onSubmit={handleRegister}>
                        {step === 1 ? (
                            <div className="fadeIn">
                                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: "#0F172A" }}>Personal Details</h3>
                                <div className="grid-2" style={{ gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" placeholder="First & Last Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" placeholder="example@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid-2" style={{ gap: 20, marginTop: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input type="tel" placeholder="+250..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">National ID (16 Digits)</label>
                                        <input type="text" placeholder="1 199X X XXXXXX X XX" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep(2)} className="btn-primary" style={{ width: "100%", marginTop: 32, padding: 16 }}>Next Step →</button>
                            </div>
                        ) : (
                            <div className="fadeIn">
                                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: "#0F172A" }}>Security Setup</h3>
                                <div className="form-group">
                                    <label className="form-label">Strong Password</label>
                                    <input type="password" placeholder="••••••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                </div>
                                <div className="form-group" style={{ marginTop: 20 }}>
                                    <label className="form-label">Province of Residence</label>
                                    <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} required>
                                        <option value="">Select Province</option>
                                        <option value="Kigali">Kigali City</option>
                                        <option value="North">Northern Province</option>
                                        <option value="East">Eastern Province</option>
                                        <option value="South">Southern Province</option>
                                        <option value="West">Western Province</option>
                                    </select>
                                </div>

                                <div style={{ background: "#F1F5F9", padding: "16px", borderRadius: 12, marginTop: 28, border: "1px solid #E2E8F0" }}>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <input type="checkbox" required style={{ width: 20, height: 20 }} />
                                        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
                                            I agree to the <b>Public Safety Terms</b> and understand that providing false information is punishable under Law No. 68/2018.
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: 16 }}>← Back</button>
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, padding: 16 }}>{loading ? "Registering..." : "Create Account"}</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>
                        Already have an account? <span onClick={() => navigate("/login")} style={{ color: "#C8102E", fontWeight: 800, cursor: "pointer" }}>Log In</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
