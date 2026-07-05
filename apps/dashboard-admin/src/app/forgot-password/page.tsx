'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../lib/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px', backgroundColor: '#202124', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>⚙️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Rwanda Safe</h1>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: 0 }}>Reset your password</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 8px' }}>Check your email</h2>
              <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>We've sent a password reset link to {email}</p>
              <Link href="/login" style={{ color: '#1a73e8', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Back to Sign in</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Forgot password?</h2>
              <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Enter your email to receive a reset link</p>
              <form onSubmit={submit}>
                <div style={{ marginBottom: '16px' }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="you@rwandasafe.rw"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#202124'; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }} />
                </div>
                {error && (
                  <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading || !email}
                  style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || !email ? '#dadce0' : '#202124', color: loading || !email ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || !email ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px' }}>
                <Link href="/login" style={{ color: '#1a73e8', fontWeight: 500, textDecoration: 'none' }}>Back to Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
