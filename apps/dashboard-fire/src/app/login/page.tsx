'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [phone, setPhone] = useState('+250');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    setError(''); setLoading(true);
    try {
      await authApi.requestOtp(phone);
      setStep('otp');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError(''); setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, code);
      const { accessToken, user } = (res.data as any).data;
      if (user.role === 'CITIZEN') {
        setError('This portal is for fire dispatchers only. Please use the citizen app.');
        return;
      }
      login(user, accessToken);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12" style={{ backgroundColor: '#1A0800' }}>
        <div className="text-center">
          <div className="text-7xl mb-6">🚒</div>
          <h1 className="text-3xl font-bold text-white mb-2">Rwanda Safe</h1>
          <p className="text-orange-300 text-lg">Rwanda Fire Brigade</p>
          <p className="text-orange-400 mt-1">Dispatcher Portal</p>
          <div className="mt-12 text-orange-300 text-sm space-y-2">
            <div>🔥 Real-time fire incident management</div>
            <div>🚒 Unit dispatch & tracking</div>
            <div>☣️ Hazmat guide & weather data</div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-orange-50">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Fire Dispatcher Login</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to access your dashboard</p>

          {step === 'phone' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 mb-4"
                placeholder="+250 7XX XXX XXX" />
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              <button onClick={handleRequestOtp} disabled={loading || phone.length < 10}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#EA580C' }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP sent to {phone}</label>
              <input value={code} onChange={e => setCode(e.target.value)} maxLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 mb-4 font-mono text-center tracking-widest text-lg"
                placeholder="000000" />
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              <button onClick={handleVerify} disabled={loading || code.length < 6}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-colors mb-3"
                style={{ backgroundColor: '#EA580C' }}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700">← Change number</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
