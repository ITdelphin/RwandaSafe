'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';

const AGENCY = { name: 'Super Admin', role: 'System Management Portal', icon: '⚙️', color: '#202124' };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.register({ name, email, password, role: 'SUPER_ADMIN' });
      router.push('/login');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Registration failed');
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
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#202124', margin: '0 0 4px' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#5f6368', margin: '0 0 24px' }}>Register a new admin account</p>

          <form onSubmit={submit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa' }}
                onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa' }}
                onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #dadce0', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa' }}
                onFocus={e => { e.target.style.borderColor = AGENCY.color; e.target.style.backgroundColor = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.backgroundColor = '#f8f9fa'; }} />
            </div>

            {error && (
              <div style={{ backgroundColor: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#c5221f', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !name || !email || !password}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading || !name || !email || !password ? '#dadce0' : AGENCY.color, color: loading || !name || !email || !password ? '#80868b' : '#ffffff', fontSize: '14px', fontWeight: 600, cursor: loading || !name || !email || !password ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#5f6368', marginTop: '20px', marginBottom: 0 }}>
            Already have an account? <Link href="/login" style={{ color: AGENCY.color, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
