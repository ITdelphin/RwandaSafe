import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../config/api";

const FEATURES = [
    { icon: "✅", color: "#0B8043", bg: "rgba(11,128,67,0.15)", title: "Easy Reporting", desc: "Report crimes, accidents and emergencies in minutes." },
    { icon: "🔒", color: "#1E3A8A", bg: "rgba(30,58,138,0.15)", title: "Secure & Private", desc: "Your information is encrypted and kept confidential." },
    { icon: "📍", color: "#F4B400", bg: "rgba(244,180,0,0.15)", title: "Real-time Location", desc: "Share your location for faster response." },
    { icon: "🔔", color: "#C8102E", bg: "rgba(200,16,46,0.15)", title: "Instant Notifications", desc: "Get updates on your reports and alerts instantly." },
];

const validate = (form) => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    else if (!/^0[7][0-9]{8}$/.test(form.phone.replace(/\s/g, "")))
        errs.phone = "Enter a valid Rwandan phone number (07XXXXXXXX).";
    if (!form.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Enter a valid email address.";
    if (!form.role) errs.role = "Please select an account type.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
};

const RegisterPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", phone: "", email: "", nationalId: "", password: "", confirmPassword: "", role: "", province: "" });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => {
        const val = e.target.value;
        setForm((prev) => {
            const updated = { ...prev, [key]: val };
            if (touched[key]) {
                const errs = validate(updated);
                setErrors((prev) => ({ ...prev, [key]: errs[key] }));
            }
            return updated;
        });
    };

    const blur = (key) => () => {
        setTouched((prev) => ({ ...prev, [key]: true }));
        const errs = validate(form);
        setErrors((prev) => ({ ...prev, [key]: errs[key] }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const allTouched = Object.fromEntries(["name", "phone", "email", "role", "password", "confirmPassword"].map(k => [k, true]));
        setTouched(allTouched);
        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            toast.error("Please fix the errors below.");
            return;
        }
        if (!agreed) { toast.error("Please agree to the Terms of Service."); return; }
        setLoading(true);
        try {
            const res = await API.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                national_id: form.nationalId,
                district: form.province,
                role: form.role || "citizen"
            });
            localStorage.setItem("saferwanda_token", res.data.token);
            localStorage.setItem("saferwanda_user", JSON.stringify(res.data.user));
            onLogin(res.data.user);
            toast.success("Account Created Successfully!");
            navigate("/citizen");
        } catch (err) {
            const msg = err.response?.data?.error || "Registration failed. Please try again.";
            toast.error(msg);
            if (msg.toLowerCase().includes("email")) setErrors((prev) => ({ ...prev, email: msg }));
        } finally {
            setLoading(false);
        }
    };

    const Field = ({ name, label, type = "text", placeholder, optional, icon, children }) => (
        <div style={{ flex: 1 }}>
            <label style={S.label}>
                {label}
                {optional && <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 12 }}> (Optional)</span>}
            </label>
            <div style={{ ...S.inputWrap, borderColor: errors[name] ? "#C8102E" : touched[name] && !errors[name] ? "#0B8043" : "#E2E8F0" }}>
                <span style={S.inputIcon}>{icon}</span>
                {children || <input style={S.input} type={type} placeholder={placeholder} value={form[name]} onChange={set(name)} onBlur={blur(name)} />}
            </div>
            {errors[name] && <div style={S.errorMsg}>⚠ {errors[name]}</div>}
        </div>
    );

    return (
        <div style={S.page}>
            {/* LEFT */}
            <div style={S.left}>
                <div style={S.logoRow}>
                    <div style={S.logoIcon}>
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <path d="M20 2L36 10V22C36 30.837 28.837 38 20 38C11.163 38 4 30.837 4 22V10L20 2Z" fill="#F4B400" />
                            <path d="M20 8L30 13V22C30 27.523 25.523 32 20 32C14.477 32 10 27.523 10 22V13L20 8Z" fill="#0B5239" />
                            <circle cx="20" cy="20" r="5" fill="#F4B400" />
                        </svg>
                    </div>
                    <div>
                        <div style={S.logoTitle}>RWANDA</div>
                        <div style={S.logoSub}>EMERGENCY SYSTEM</div>
                    </div>
                </div>
                <div style={{ marginTop: 48 }}>
                    <h1 style={S.headline}>Create Account</h1>
                    <h2 style={S.tagline}>Stay Safe, Save Lives</h2>
                    <div style={S.divider} />
                    <p style={S.leftDesc}>Join Rwanda Emergency System and<br />help build a safer community.</p>
                </div>
                <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
                    {FEATURES.map((f) => (
                        <div key={f.title} style={S.featureRow}>
                            <div style={{ ...S.featureIcon, background: f.bg, color: f.color }}>{f.icon}</div>
                            <div>
                                <div style={S.featureTitle}>{f.title}</div>
                                <div style={S.featureDesc}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={S.emergencyBox}>
                    <div style={S.emergencyIcon}>📞</div>
                    <div>
                        <div style={{ fontSize: 12, color: "#CBD5E1" }}>In case of immediate danger</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Call Emergency: <span style={{ color: "#C8102E" }}>112</span></div>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div style={S.right}>
                <div style={S.formBox}>
                    <h2 style={S.formTitle}>Create Your Account</h2>
                    <p style={S.formSub}>Fill in the details below to get started</p>

                    <form onSubmit={handleRegister} noValidate>
                        {/* Row 1: Name + Phone */}
                        <div style={S.row}>
                            <Field name="name" label="Full Name" placeholder="Enter your full name" icon="👤" />
                            <Field name="phone" label="Phone Number" type="tel" placeholder="07XXXXXXXXX" icon="📞" />
                        </div>

                        {/* Row 2: Email + National ID */}
                        <div style={S.row}>
                            <Field name="email" label="Email Address" type="email" placeholder="Enter your email" icon="✉️" />
                            <Field name="nationalId" label="National ID" optional placeholder="Enter national ID" icon="🪪" />
                        </div>

                        {/* Account Type - full width */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Account Type</label>
                            <div style={{ ...S.inputWrap, borderColor: errors.role ? "#C8102E" : touched.role && !errors.role ? "#0B8043" : "#E2E8F0" }}>
                                <span style={S.inputIcon}>👥</span>
                                <select style={S.input} value={form.role} onChange={set("role")} onBlur={blur("role")}>
                                    <option value="">Select account type</option>
                                    <option value="citizen">Citizen</option>
                                    <option value="responder">First Responder</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            {errors.role && <div style={S.errorMsg}>⚠ {errors.role}</div>}
                        </div>

                        {/* Password - full width */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Password</label>
                            <div style={{ ...S.inputWrap, borderColor: errors.password ? "#C8102E" : touched.password && !errors.password ? "#0B8043" : "#E2E8F0" }}>
                                <span style={S.inputIcon}>🔒</span>
                                <input style={S.input} type={showPass ? "text" : "password"} placeholder="Create a password (min. 8 characters)" value={form.password} onChange={set("password")} onBlur={blur("password")} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>{showPass ? "🙈" : "👁️"}</button>
                            </div>
                            {errors.password && <div style={S.errorMsg}>⚠ {errors.password}</div>}
                            {/* Strength indicator */}
                            {form.password && !errors.password && (
                                <PasswordStrength pwd={form.password} />
                            )}
                        </div>

                        {/* Confirm Password - full width, below password */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Confirm Password</label>
                            <div style={{ ...S.inputWrap, borderColor: errors.confirmPassword ? "#C8102E" : touched.confirmPassword && !errors.confirmPassword ? "#0B8043" : "#E2E8F0" }}>
                                <span style={S.inputIcon}>🔒</span>
                                <input style={S.input} type={showConfirm ? "text" : "password"} placeholder="Confirm your password" value={form.confirmPassword} onChange={set("confirmPassword")} onBlur={blur("confirmPassword")} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>{showConfirm ? "🙈" : "👁️"}</button>
                            </div>
                            {errors.confirmPassword
                                ? <div style={S.errorMsg}>⚠ {errors.confirmPassword}</div>
                                : touched.confirmPassword && form.confirmPassword && form.password === form.confirmPassword
                                    ? <div style={{ fontSize: 12, color: "#0B8043", marginTop: 5 }}>✓ Passwords match</div>
                                    : null
                            }
                        </div>

                        {/* Province - optional */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Province of Residence <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 12 }}>(Optional)</span></label>
                            <div style={S.inputWrap}>
                                <span style={S.inputIcon}>📍</span>
                                <select style={S.input} value={form.province} onChange={set("province")}>
                                    <option value="">Select province</option>
                                    <option value="Kigali">Kigali City</option>
                                    <option value="North">Northern Province</option>
                                    <option value="East">Eastern Province</option>
                                    <option value="South">Southern Province</option>
                                    <option value="West">Western Province</option>
                                </select>
                            </div>
                        </div>

                        {/* Terms */}
                        <div style={S.termsRow}>
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0B8043", flexShrink: 0, cursor: "pointer" }} />
                            <span style={S.termsText}>
                                I agree to the <span style={S.termsLink}>Terms of Service</span> and <span style={S.termsLink}>Privacy Policy</span>
                            </span>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Creating Account…" : "👤  Create Account"}
                        </button>

                        {/* OR */}
                        <div style={S.orRow}>
                            <div style={S.orLine} /><span style={S.orText}>or</span><div style={S.orLine} />
                        </div>

                        {/* Social */}
                        <div style={S.row}>
                            <button type="button" style={S.socialBtn}><GoogleIcon /> Sign up with Google</button>
                            <button type="button" style={S.socialBtn}><FacebookIcon /> Sign up with Facebook</button>
                        </div>

                        <p style={{ textAlign: "center", fontSize: 14, color: "#64748B", marginTop: 16 }}>
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")} style={{ color: "#0B8043", fontWeight: 700, cursor: "pointer" }}>Sign In</span>
                        </p>
                    </form>

                    <div style={S.langBar}>
                        <span style={S.langActive}>🇷🇼 English ▾</span>
                        <span style={S.langItem}>Kinyarwanda</span>
                        <span style={S.langItem}>Français</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Password Strength Bar ── */
const PasswordStrength = ({ pwd }) => {
    const score = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, /.{8,}/].filter(r => r.test(pwd)).length;
    const label = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][score];
    const color = ["", "#C8102E", "#F4B400", "#F4B400", "#0B8043", "#0B8043"][score];
    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? color : "#E2E8F0", transition: "background 0.3s" }} />
                ))}
            </div>
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
        </div>
    );
};

/* ── Icons ── */
const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);
const FacebookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
        <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
);

/* ── Styles ── */
const S = {
    page: { display: "flex", minHeight: "100vh", fontFamily: "'Sora', sans-serif" },
    left: { width: 400, flexShrink: 0, background: "linear-gradient(160deg,#0F172A 0%,#1E2A4A 60%,#0D1B3E 100%)", padding: "40px 32px", display: "flex", flexDirection: "column", overflow: "hidden" },
    logoRow: { display: "flex", alignItems: "center", gap: 12 },
    logoIcon: { width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" },
    logoTitle: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: 1.5 },
    logoSub: { fontSize: 10, color: "#94A3B8", letterSpacing: 1.5, fontWeight: 600 },
    headline: { fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 8, lineHeight: 1.1 },
    tagline: { fontSize: 20, fontWeight: 700, color: "#4ADE80", marginBottom: 16 },
    divider: { width: 48, height: 3, background: "#F4B400", borderRadius: 2, marginBottom: 16 },
    leftDesc: { fontSize: 14, color: "#94A3B8", lineHeight: 1.6 },
    featureRow: { display: "flex", alignItems: "flex-start", gap: 14 },
    featureIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
    featureTitle: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 },
    featureDesc: { fontSize: 12, color: "#94A3B8", lineHeight: 1.5 },
    emergencyBox: { marginTop: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 },
    emergencyIcon: { width: 40, height: 40, borderRadius: 10, background: "rgba(200,16,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
    right: { flex: 1, background: "#F8FAFC", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 24px", overflowY: "auto" },
    formBox: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 660, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
    formTitle: { fontSize: 24, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 6 },
    formSub: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 28 },
    row: { display: "flex", gap: 16, marginBottom: 20 },
    label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
    inputWrap: { display: "flex", alignItems: "center", border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#fff", overflow: "hidden", transition: "border-color 0.2s" },
    inputIcon: { padding: "0 10px", fontSize: 15, color: "#94A3B8", flexShrink: 0 },
    input: { flex: 1, border: "none", outline: "none", padding: "11px 10px 11px 0", fontSize: 14, color: "#1E293B", background: "transparent", fontFamily: "'Sora', sans-serif", width: "100%" },
    eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: "0 10px", fontSize: 15, color: "#94A3B8", flexShrink: 0 },
    errorMsg: { fontSize: 12, color: "#C8102E", marginTop: 5, fontWeight: 500 },
    termsRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
    termsText: { fontSize: 13, color: "#475569" },
    termsLink: { color: "#0B8043", fontWeight: 600, cursor: "pointer" },
    submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#0B8043,#0d6e38)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 20, letterSpacing: 0.3, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(11,128,67,0.3)" },
    orRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
    orLine: { flex: 1, height: 1, background: "#E2E8F0" },
    orText: { fontSize: 13, color: "#94A3B8" },
    socialBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 16px", border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", gap: 6, transition: "all 0.2s" },
    langBar: { display: "flex", alignItems: "center", gap: 20, marginTop: 24, paddingTop: 18, borderTop: "1px solid #F1F5F9" },
    langActive: { fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer" },
    langItem: { fontSize: 13, color: "#94A3B8", cursor: "pointer" },
};

export default RegisterPage;
