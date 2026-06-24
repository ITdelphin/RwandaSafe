'use client';
import { useState } from 'react';
import { Shield, Mail, Lock, ExternalLink, LogOut, Eye, EyeOff } from 'lucide-react';
import { apiClient, DASHBOARD_URLS } from '../lib/apiClient';

export default function PortalLoginPage() {
  const [step, setStep] = useState<'CREDENTIALS' | 'DASHBOARDS'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [access, setAccess] = useState<string[]>([]);
  const [tokens, setTokens] = useState({ at: '', rt: '' });
  const [user, setUser] = useState<{ name?: string, role: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { dashboardAccess, accessToken, refreshToken, user: u } = res.data.data;
      setAccess(dashboardAccess);
      setTokens({ at: accessToken, rt: refreshToken });
      setUser(u);
      setStep('DASHBOARDS');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Convert dashboard Enum like ADMIN to label like Admin Dashboard
  const formatName = (d: string) => d.charAt(0) + d.slice(1).toLowerCase() + ' Dashboard';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 relative z-10 border border-slate-100">

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/30">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rwanda Safe Gateway</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Unified secure access for authorized personnel</p>
        </div>

        {step === 'CREDENTIALS' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Official Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gov.rw"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm font-medium bg-red-50 py-3 px-4 rounded-xl border border-red-100">{error}</div>}

            <button type="submit" disabled={loading || !email || !password} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm py-4 px-4 rounded-xl transition-all shadow-md mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {step === 'DASHBOARDS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome back, {user?.name || 'Officer'}</h2>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full mb-6 tracking-wide">
              {user?.role.replace(/_/g, ' ')}
            </div>

            {access.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm mb-6">
                You don't have access to any dashboards right now. Please contact a Super Admin.
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-slate-500 text-left mb-2 uppercase tracking-wider text-xs">Your Available Dashboards</p>
                {access.map(d => {
                  const targetUrl = DASHBOARD_URLS[d];
                  if (!targetUrl) return null;
                  return (
                    <a
                      key={d}
                      href={`${targetUrl}/auth/handoff#at=${tokens.at}&rt=${tokens.rt}`}
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl transition-all group"
                    >
                      <span className="font-semibold text-slate-700 group-hover:text-blue-700">{formatName(d)}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  );
                })}
              </div>
            )}

            <button onClick={() => { setStep('CREDENTIALS'); setPassword(''); setAccess([]); }} className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-red-600 font-medium py-3 text-sm transition-colors border border-transparent hover:bg-red-50 rounded-xl">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
