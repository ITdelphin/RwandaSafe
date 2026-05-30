'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

export const dynamic = 'force-dynamic';

const BG_GRADIENT = 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)';
const HEADER_GRADIENT = 'linear-gradient(135deg, #0D1B2A 0%, #1B5E82 100%)';
const BTN_GRADIENT = 'linear-gradient(135deg, #1B5E82 0%, #1565C0 100%)';
const LINK_COLOR = '#1B5E82';
const ACCENT_COLOR = '#93C5FD';

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
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '14px',
  backgroundColor: '#f9fafb',
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

  return (
    <div style={{ padding: '24px 32px 32px' }}>
      {success ? (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Password reset!</h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px' }}>Set new password</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>Choose a strong password for your account</p>

          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '12px' }}>Invalid or missing reset token.</p>
              <Link href="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex',
                  }}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  placeholder="Re-enter new password"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = LINK_COLOR; e.target.style.backgroundColor = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                />
                {confirm && password !== confirm && (
                  <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Passwords do not match</p>
                )}
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
                  boxShadow: '0 4px 12px rgba(27,94,130,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px' }}>
            <Link href="/login" style={{ fontWeight: 600, color: LINK_COLOR, textDecoration: 'none' }}>&larr; Back to login</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: BG_GRADIENT,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '448px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 20px', textAlign: 'center', background: HEADER_GRADIENT }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 28, color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Rwanda Safe</h1>
          <p style={{ fontSize: '12px', color: ACCENT_COLOR, marginTop: '3px' }}>Rwanda National Police &middot; Officer Portal</p>
        </div>

        <Suspense fallback={
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Loading...</div>
        }>
          <ResetForm />
        </Suspense>
      </div>

      <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Secured by Rwanda Safe &middot; Emergency Response Platform
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
