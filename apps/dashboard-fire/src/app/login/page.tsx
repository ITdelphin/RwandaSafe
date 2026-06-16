'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, AlertCircle, Lock, Info } from 'lucide-react';

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
      setError(e.response?.data?.error ?? e.response?.data?.message ?? 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px',
    backgroundColor: '#f8f9fa', color: '#202124', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: AGENCY.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 4px 14px ${AGENCY.color}40`, fontSize: '26px' }}>
            {AGENCY.icon}
          </div>
          <h1 style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 800, color: '#202124', margin: '0 0 4px' }}>Rwanda Safe</h1>
          <p style={{ fontSize: '13px', color: '#5f6368', margin: 0 }}>{AGENCY.name} · {AGENCY.role}</p>
        </div>

        {/* Info banner */}
        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Info size={16} style={{ color: AGENCY.color, flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '12px', color: '#9A3412', lineHeight: 1.6 }}>
            <strong>Staff Access Only.</strong> Register with a personal email, then wait for a Super Admin to activate your account before signing in.{' '}
            <Link href="/register" style={{ color: AGENCY.color, fontWeight: 600 }}>Create account →</Link>
          </div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: 'clamp(20px,5vw,32px)', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Staff Sign in</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', margin: '0 0 20px' }}>Activated dispatchers only. Enter your credentials.</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#202124', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inp}
                onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}20`; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#202124', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inp, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}20`; }}
                  onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#5f6368' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: AGENCY.color }} /> Remember me
              </label>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: AGENCY.color, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertCircle size={14} style={{ color: '#d93025', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: loading || !email || !password ? '#dadce0' : AGENCY.color, color: loading || !email || !password ? '#80868b' : '#fff', fontSize: '14px', fontWeight: 700, cursor: loading || !email || !password ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
              {loading ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '18px', marginBottom: 0 }}>
            New dispatcher?{' '}<Link href="/register" style={{ color: AGENCY.color, fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#9e9e9e', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Lock size={10} /> Secured by Rwanda Safe · For authorized staff only
        </p>
      </div>
    </div>
  );
}
