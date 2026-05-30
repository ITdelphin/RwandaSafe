'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../lib/apiClient';

const BG_GRADIENT = 'linear-gradient(135deg, #1a0000 0%, #7f1d1d 100%)';
const HEADER_GRADIENT = 'linear-gradient(135deg, #1a0000 0%, #991b1b 100%)';
const BTN_GRADIENT = 'linear-gradient(135deg, #C62828 0%, #b71c1c 100%)';
const LINK_COLOR = '#C62828';
const ACCENT_COLOR = '#fca5a5';

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
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Rwanda Safe</h1>
          <p style={{ fontSize: '12px', color: ACCENT_COLOR, marginTop: '3px' }}>King Faisal Hospital SAMU &middot; Medical Portal</p>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: LINK_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Check your inbox</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: 1.5 }}>
                If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <Link href="/login" style={{ fontSize: '13px', fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>&larr; Back to sign in</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>Reset your password</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>Enter your email and we&apos;ll send a reset link</p>
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
                      placeholder="medic@hospital.gov.rw"
                      style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', backgroundColor: '#f9fafb', outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }} />
                  </div>
                </div>
                {error && (
                  <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading || !email}
                  style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: loading ? '#94a3b8' : BTN_GRADIENT, color: '#fff', fontWeight: 600, fontSize: '14px', cursor: loading || !email ? 'not-allowed' : 'pointer', opacity: !email ? 0.6 : 1, boxShadow: '0 4px 12px rgba(198,40,40,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? (<><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Sending...</>) : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px' }}>
                Remembered it?{' '}<Link href="/login" style={{ fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>Sign in</Link>
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
