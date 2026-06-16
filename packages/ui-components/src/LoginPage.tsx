'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import React from 'react';

export interface LoginPageProps {
  agencyName: string;
  agencyRole: string;
  accentColor: string;
  icon: React.ReactNode;
  portalLabel: string;
  subtitleText: string;
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>;
  showRegisterLink?: boolean;
  registerPath?: string;
  registerLabel?: string;
  infoBannerColor?: string;
  infoBannerBg?: string;
  infoBannerBorder?: string;
  infoBannerText?: string;
  infoText?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

export function LoginPage({
  agencyName,
  agencyRole,
  accentColor,
  icon,
  portalLabel,
  subtitleText,
  onLogin,
  showRegisterLink = false,
  registerPath = '/register',
  registerLabel = 'Create account',
  infoBannerColor = accentColor,
  infoBannerBg = '#FFF7ED',
  infoBannerBorder = '#FED7AA',
  infoBannerText = '#9A3412',
  infoText,
  gradientFrom = '#0F172A',
  gradientVia = '#1E3A5F',
  gradientTo = '#0F4C75',
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password, remember);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px',
    backgroundColor: '#f8f9fa', color: '#202124', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientVia} 50%, ${gradientTo} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 4px 14px ${accentColor}40` }}>
            {icon}
          </div>
          <h1 style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Rwanda Safe</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>{agencyName} · {agencyRole}</p>
        </div>

        {infoText && (
          <div style={{ backgroundColor: infoBannerBg, border: `1px solid ${infoBannerBorder}`, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} style={{ color: infoBannerColor, flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '12px', color: infoBannerText, lineHeight: 1.6 }}>{infoText}</div>
          </div>
        )}

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: 'clamp(20px,5vw,32px)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>{portalLabel} Sign in</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', margin: '0 0 20px' }}>{subtitleText}</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#202124', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inp}
                onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#202124', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inp, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
                  onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#5f6368' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: accentColor }} /> Remember me
              </label>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: accentColor, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={14} style={{ color: '#d93025', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: loading || !email || !password ? '#dadce0' : accentColor, color: loading || !email || !password ? '#80868b' : '#fff', fontSize: '14px', fontWeight: 700, cursor: loading || !email || !password ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
              {loading ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          {showRegisterLink && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '18px', marginBottom: 0 }}>
              {registerLabel}{' '}<Link href={registerPath} style={{ color: accentColor, fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#9e9e9e', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Lock size={10} /> Secured by Rwanda Safe · For authorized staff only
        </p>
      </div>
    </div>
  );
}
