'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

const BG_GRADIENT = 'linear-gradient(135deg, #1a0500 0%, #7c2d12 100%)';
const HEADER_GRADIENT = 'linear-gradient(135deg, #1a0500 0%, #9a3412 100%)';
const BTN_GRADIENT = 'linear-gradient(135deg, #EA580C 0%, #c2410c 100%)';
const LINK_COLOR = '#EA580C';
const ACCENT_COLOR = '#fed7aa';

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

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { accessToken, user } = (res as any).data.data;
      login(user, accessToken, remember);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.response?.data?.error ?? 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: BG_GRADIENT }}>
      <div style={{ width: '100%', maxWidth: '448px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center', background: HEADER_GRADIENT }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Rwanda Safe</h1>
          <p style={{ fontSize: '13px', color: ACCENT_COLOR, marginTop: '4px' }}>Rwanda Fire Brigade &middot; Dispatcher Portal</p>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 32px 32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>Welcome back</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>Sign in to your dispatcher account</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="dispatcher@fire.gov.rw"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', backgroundColor: '#f9fafb', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 16px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', backgroundColor: '#f9fafb', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: LINK_COLOR }} />
                <span style={{ fontSize: '13px', color: '#4b5563' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" style={{ fontSize: '13px', fontWeight: 500, color: LINK_COLOR, textDecoration: 'none' }}>Forgot password?</Link>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16, color: '#ef4444', flexShrink: 0, marginTop: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: loading ? '#94a3b8' : BTN_GRADIENT, color: '#fff', fontWeight: 600, fontSize: '14px', cursor: loading || !email || !password ? 'not-allowed' : 'pointer', opacity: !email || !password ? 0.6 : 1, boxShadow: '0 4px 12px rgba(234,88,12,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (<><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in...</>) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Secured by Rwanda Safe &middot; Emergency Response Platform
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
