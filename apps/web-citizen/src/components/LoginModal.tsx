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
    // Basic validation for Rwandan numbers or generic test numbers
    if (!phone.match(/^\+?250\d{9}$/) && !phone.startsWith('250')) {
      setError('Enter a valid Rwandan phone number (e.g. 2507XXXXXXXX)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Ensure phone is in 250... format as expected by API
      const formattedPhone = phone.replace(/^\+/, '');
      await authApi.requestOtp(formattedPhone);
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
      const formattedPhone = phone.replace(/^\+/, '');
      const res: any = await authApi.verifyOtp(formattedPhone, code);
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900 border border-blue-100 shadow-sm">
            <Shield size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2 tracking-tight">
          {step === 'phone' ? 'Citizen Sign In' : 'Verification'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
          {step === 'phone'
            ? 'Sign in to track your emergency reports and view history.'
            : `We've sent a secure 6-digit code to your device.`}
        </p>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
              <div className="flex items-center border border-gray-200 rounded-2xl px-5 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-gray-50/50">
                <Phone size={18} className="text-gray-400 mr-3" />
                <input
                  className="w-full bg-transparent outline-none text-base font-medium text-gray-900 placeholder:text-gray-300"
                  placeholder="250 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold px-1">{error}</p>}
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-black disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send Verification Code'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Security Code</label>
              <input
                className="w-full text-center text-3xl tracking-[0.4em] font-black border border-gray-200 rounded-2xl px-5 py-5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-gray-50/50 text-blue-900 placeholder:text-gray-200"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-black disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify & Continue'
              )}
            </button>
            <button
              onClick={() => { setStep('phone'); setCode(''); setError(''); }}
              className="w-full text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors text-center uppercase tracking-wider"
            >
              Change phone number
            </button>
          </div>
        )}

        <p className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
          By continuing, you agree to Rwanda Safe's terms of service and recognize that this platform is for emergency use only.
        </p>
      </div>
    </div>
  );
}
