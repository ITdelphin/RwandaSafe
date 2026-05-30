'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

const BG_GRADIENT = 'linear-gradient(135deg, #1a0000 0%, #7f1d1d 100%)';
const HEADER_GRADIENT = 'linear-gradient(135deg, #1a0000 0%, #991b1b 100%)';
const BTN_GRADIENT = 'linear-gradient(135deg, #C62828 0%, #b71c1c 100%)';
const LINK_COLOR = '#C62828';
const ACCENT_COLOR = '#fca5a5';
const AGENCY_TYPE = 'HOSPITAL';

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#22c55e' };
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 16px',
  border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px',
  backgroundColor: '#f9fafb', outline: 'none',
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
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '16px',
      background: BG_GRADIENT,
    }}>
      <div style={{
        width: '100%', maxWidth: '448px', backgroundColor: '#fff',
        borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 32px 20px', textAlign: 'center', background: HEADER_GRADIENT }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Rwanda Safe</h1>
          <p style={{ fontSize: '12px', color: ACCENT_COLOR, marginTop: '3px' }}>King Faisal Hospital SAMU &middot; Medical Portal</p>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Account Created!</h2>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>Create your account</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>Register as a medical staff member</p>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2}
                    placeholder="Dr. Marie Uwimana" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="medic@hospital.gov.rw" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: '44px' }}
                      onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: i <= strength.score ? strength.color : '#e5e7eb', transition: 'background-color 0.2s' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: strength.color }}>{strength.label} password</p>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    placeholder="Re-enter your password" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                  {confirm && password !== confirm && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Passwords do not match</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>
                    Phone <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                </div>
                {error && (
                  <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading || password !== confirm}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                    background: loading ? '#94a3b8' : BTN_GRADIENT,
                    color: '#fff', fontWeight: 600, fontSize: '14px',
                    cursor: loading || password !== confirm ? 'not-allowed' : 'pointer',
                    opacity: password !== confirm ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(198,40,40,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                  {loading ? (<><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creating account...</>) : 'Create Account'}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '16px' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Secured by Rwanda Safe &middot; Emergency Response Platform
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
