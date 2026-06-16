'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Phone, ArrowLeft } from 'lucide-react';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

function normalizePhone(raw: string): string {
    let p = raw.replace(/[\s\-\(\)]/g, '');
    if (p.startsWith('+')) p = p.slice(1);
    if (p.startsWith('07')) p = '250' + p.slice(1);
    if (p.startsWith('7')) p = '250' + p;
    return p;
}

export default function SignInPage() {
    const router = useRouter();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOtp, setDevOtp] = useState('');

    // If already authenticated redirect to my-reports
    if (isAuthenticated) {
        router.replace('/my-reports');
        return null;
    }

    const handleRequestOtp = async () => {
        const clean = phone.replace(/[\s\-\(\)]/g, '');
        if (!/^(\+?250|0)?7\d{8}$/.test(clean)) {
            setError('Enter a valid Rwandan phone number (e.g. 07XX XXX XXX)');
            return;
        }
        setLoading(true);
        setError('');
        setDevOtp('');
        try {
            const formattedPhone = normalizePhone(phone);
            const res: any = await authApi.requestOtp(formattedPhone);
            const data = res.data?.data;
            setDevOtp(data?.devOtp ?? '');
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error ?? err.response?.data?.message ?? 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
        setLoading(true);
        setError('');
        try {
            const formattedPhone = normalizePhone(phone);
            const res: any = await authApi.verifyOtp(formattedPhone, code);
            const { accessToken, refreshToken, user } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            router.push('/my-reports');
        } catch (err: any) {
            setError(err.response?.data?.error ?? err.response?.data?.message ?? 'Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0F4C75 60%, #0D3B5E 100%)' }}
        >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
            }} />
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle,#3B82F6,transparent)', filter: 'blur(60px)' }} />

            {/* Back link */}
            <div className="relative w-full max-w-sm mb-4">
                <Link href="/" className="inline-flex items-center gap-2 text-blue-300 text-sm font-medium hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </div>

            {/* Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 border border-gray-100">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #C62828, #0F4C75)', color: 'white' }}>
                        <Shield size={32} />
                    </div>
                </div>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-3">
                        <span className="text-blue-700 text-[10px] font-bold tracking-widest uppercase">Citizen Portal</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {step === 'phone' ? 'Sign In' : 'Verify Code'}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        {step === 'phone'
                            ? 'Sign in to track your emergency reports and view history.'
                            : `Enter the 6-digit code sent to your phone.`}
                    </p>
                </div>

                {step === 'phone' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                            <div className="flex items-center border border-gray-200 rounded-2xl px-5 py-4 focus-within:border-[#0F4C75] focus-within:ring-4 focus-within:ring-[#0F4C75]/10 transition-all bg-gray-50/50">
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
                            className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #0F4C75, #0D3B5E)' }}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Verification Code'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Security Code</label>
                            <input
                                className="w-full text-center text-3xl tracking-[0.4em] font-black border border-gray-200 rounded-2xl px-5 py-5 outline-none focus:border-[#0F4C75] focus:ring-4 focus:ring-[#0F4C75]/10 transition-all bg-gray-50/50 text-[#0F4C75] placeholder:text-gray-200"
                                placeholder="000000"
                                maxLength={6}
                                value={code}
                                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                                autoFocus
                            />
                        </div>
                        {devOtp && (
                            <div className="text-center py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Dev Mode – OTP</p>
                                <p className="text-2xl font-black text-yellow-800 tracking-widest">{devOtp}</p>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-xs font-semibold text-center">{error}</p>}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #0F4C75, #0D3B5E)' }}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify & Continue'}
                        </button>
                        <button
                            onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                            className="w-full text-xs font-bold text-[#0F4C75] hover:text-[#0D3B5E] transition-colors text-center uppercase tracking-wider"
                        >
                            Change phone number
                        </button>
                    </div>
                )}

                <p className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
                    By continuing, you agree to Rwanda Safe's terms of service. This platform is for emergency reporting only.
                </p>
            </div>
        </div>
    );
}
