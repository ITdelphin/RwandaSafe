'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

export const dynamic = 'force-dynamic';

const AGENCY = { name: 'Rwanda National Police', role: 'Officer Portal', icon: '🛡️', color: '#1a73e8' };

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

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid reset link. Please request a new one.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Reset failed. The link may have expired.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ fontSize: '28px' }}>✅</span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#202124', margin: '0 0 8px' }}>Password reset!</h2>
        <p style={{ fontSize: '13px', color: '#5f6368' }}>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Set new password</h2>
      <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Choose a strong password for your account</p>

      {!token ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#d93025', marginBottom: '12px' }}>Invalid or missing reset token.</p>
          <Link href="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: AGENCY.color, textDecoration: 'none' }}>Request a new link</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>New Password</label>
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
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              placeholder="Re-enter new password"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${AGENCY.color}15`; }}
              onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; e.target.style.boxShadow = 'none'; }}
            />
            {confirm && password !== confirm && (
              <p style={{ fontSize: '11px', color: '#d93025', marginTop: '4px', marginBottom: 0 }}>Passwords do not match</p>
            )}
          </div>

          {error && (
            <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: '#d93025', fontSize: '14px' }}>⚠️</span>
              <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading || password !== confirm || !password}
            style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || password !== confirm || !password ? '#dadce0' : AGENCY.color, color: loading || password !== confirm || !password ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || password !== confirm || !password ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
            {loading ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px', marginBottom: 0 }}>
            <Link href="/login" style={{ color: AGENCY.color, fontWeight: 500, textDecoration: 'none' }}>← Back to login</Link>
          </p>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div style={{ padding: '16px', textAlign: 'center', color: '#5f6368', fontSize: '14px' }}>Loading...</div>}>
            <ResetForm />
          </Suspense>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#80868b', marginTop: '20px' }}>
          🔒 Secured by Rwanda Safe · Emergency Response Platform
        </p>
      </div>
    </div>
  );
}
