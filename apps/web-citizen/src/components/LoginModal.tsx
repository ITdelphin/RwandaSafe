'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Phone, Shield } from 'lucide-react';
import { authApi } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleRequestOtp = async () => {
    if (!phone.match(/^\+?250\d{9}$/)) {
      setError('Enter a valid Rwandan phone number (+250XXXXXXXXX)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.requestOtp(phone.replace(/^\+/, ''));
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res: any = await authApi.verifyOtp(phone.replace(/^\+/, ''), code);
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield size={28} className="text-blue-800" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-1">
          {step === 'phone' ? 'Sign In' : 'Enter Code'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {step === 'phone'
            ? 'Enter your phone number to receive a code'
            : `We sent a 6-digit code to ${phone}`}
        </p>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Phone size={18} className="text-gray-400 mr-3" />
              <input
                className="w-full outline-none text-sm"
                placeholder="+250 7XX XXX XXX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                autoFocus
              />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              className="w-full text-center text-2xl tracking-[0.5em] font-mono border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              autoFocus
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError(''); }}
              className="w-full text-sm text-blue-600 hover:underline text-center"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
