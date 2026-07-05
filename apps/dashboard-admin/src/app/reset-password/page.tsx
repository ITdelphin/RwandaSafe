'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      router.push('/login');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Reset password</h2>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Enter your new password</p>
          <form onSubmit={submit}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              placeholder="New password"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', marginBottom: '16px', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#202124'; e.target.style.backgroundColor = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }} />
            {error && (
              <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading || !password}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || !password ? '#dadce0' : '#202124', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || !password ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
