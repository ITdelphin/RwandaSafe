'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

const AGENCY = { name: 'Rwanda Fire Brigade', role: 'Dispatcher Portal', icon: '🚒', color: '#E8710A' };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: AGENCY.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', boxShadow: `0 4px 14px ${AGENCY.color}40` }}>
            {AGENCY.icon}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Rwanda Safe</h1>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>{AGENCY.name} · {AGENCY.role}</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Sign in</h2>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Enter your credentials to continue</p>

          <form onSubmit={submit}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@rwandasafe.rw"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', color: '#202124', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 40px 10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', color: '#202124', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
                  onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#5f6368', padding: 0 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#5f6368' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: AGENCY.color }} />
                Remember me
              </label>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: AGENCY.color, textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#d93025', fontSize: '14px' }}>⚠️</span>
                <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || !email || !password}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || !email || !password ? '#dadce0' : AGENCY.color, color: loading || !email || !password ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || !email || !password ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px', marginBottom: 0 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: AGENCY.color, fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#80868b', marginTop: '20px' }}>
          🔒 Secured by Rwanda Safe · Emergency Response Platform
        </p>
      </div>
    </div>
  );
}
