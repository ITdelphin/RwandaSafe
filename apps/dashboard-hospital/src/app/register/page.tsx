'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

const AGENCY = { name: 'King Faisal Hospital SAMU', role: 'Medical Portal', icon: '🚑', color: '#34A853' };
const AGENCY_TYPE = 'HOSPITAL';

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#d93025' };
  if (score <= 3) return { score, label: 'Medium', color: '#F9AB00' };
  return { score, label: 'Strong', color: '#34A853' };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 14px',
  border: '1px solid #dadce0',
  borderRadius: '10px',
  fontSize: '14px',
  backgroundColor: '#f8f9fa',
  color: '#202124',
  outline: 'none',
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getStrength(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.register({ name, email, password, phone: phone || undefined, agencyType: AGENCY_TYPE });
      setSuccess(true);
      setTimeout(() => router.push('/login?registered=1'), 2000);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: AGENCY.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: `0 4px 14px ${AGENCY.color}40` }}>
            {AGENCY.icon}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Rwanda Safe</h1>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>{AGENCY.name} · {AGENCY.role}</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontSize: '28px' }}>✅</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#202124', margin: '0 0 8px' }}>Account Created!</h2>
              <p style={{ fontSize: '13px', color: '#5f6368' }}>Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Create your account</h2>
              <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Register as a Medical staff member</p>

              <form onSubmit={submit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2}
                    placeholder="Dr. Jean Bosco"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                    onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@rwandasafe.rw"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                    onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      placeholder="Min. 8 characters"
                      style={{ ...inputStyle, paddingRight: '44px' }}
                      onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                      onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#5f6368', padding: 0 }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: i <= strength.score ? strength.color : '#e8eaed', transition: 'background-color 0.2s' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: strength.color, margin: 0 }}>{strength.label} password</p>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    placeholder="Re-enter your password"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                    onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                  />
                  {confirm && password !== confirm && (
                    <p style={{ fontSize: '11px', color: '#d93025', marginTop: '4px', marginBottom: 0 }}>Passwords do not match</p>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>
                    Phone <span style={{ fontWeight: 400, color: '#80868b' }}>(optional)</span>
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                    onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {error && (
                  <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#d93025', fontSize: '14px' }}>⚠️</span>
                    <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || password !== confirm || !name || !email || !password}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || password !== confirm || !name || !email || !password ? '#dadce0' : AGENCY.color, color: loading || password !== confirm || !name || !email || !password ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || password !== confirm || !name || !email || !password ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
                  {loading ? (
                    <>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px', marginBottom: 0 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: AGENCY.color, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#80868b', marginTop: '20px' }}>
          🔒 Secured by Rwanda Safe · Emergency Response Platform
        </p>
      </div>
    </div>
  );
}
