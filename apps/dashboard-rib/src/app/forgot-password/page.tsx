'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../lib/apiClient';

const AGENCY = { name: 'Rwanda Investigation Bureau', role: 'Investigation Portal', icon: '🔍', color: '#9334E6' };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Something went wrong. Please try again.');
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
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontSize: '28px' }}>📧</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#202124', margin: '0 0 8px' }}>Check your inbox</h2>
              <p style={{ fontSize: '13px', color: '#5f6368', marginBottom: '20px', lineHeight: 1.5 }}>
                If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link href="/login" style={{ fontSize: '13px', fontWeight: 600, color: AGENCY.color, textDecoration: 'none' }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Reset your password</h2>
              <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Enter your email and we&apos;ll send a reset link</p>

              <form onSubmit={submit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Email address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@rwandasafe.rw"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', color: '#202124' }}
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

                <button type="submit" disabled={loading || !email}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || !email ? '#dadce0' : AGENCY.color, color: loading || !email ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || !email ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
                  {loading ? (
                    <>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px', marginBottom: 0 }}>
                Remembered it?{' '}
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
