'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car, AlertOctagon, HeartPulse, Flame, Shield, Ambulance,
  Search, MapPin, Radio, CheckCircle2, Siren, Clock,
  FileText, ClipboardList, Phone, ArrowRight, Bell,
} from 'lucide-react';
import { statsApi } from '../lib/apiClient';
import { Navbar } from '../components/Navbar';

interface PublicStats {
  totalIncidents: number;
  resolvedIncidents: number;
  activeIncidents: number;
  todayIncidents: number;
  avgResponseMinutes: number | null;
  resolutionRate: number | null;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setValue(target); clearInterval(interval); }
      else setValue(Math.floor(current));
    }, 1400 / steps);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{value.toLocaleString()}{suffix}</span>;
}

const SERVICES = [
  { type: 'ACCIDENT', label: 'Road Accident', icon: <Car size={28} />, grad: 'linear-gradient(135deg,#F97316,#EA580C)', badge: '#FED7AA', badgeText: '#9A3412' },
  { type: 'CRIME', label: 'Crime & Security', icon: <AlertOctagon size={28} />, grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', badge: '#DBEAFE', badgeText: '#1E3A8A' },
  { type: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: <HeartPulse size={28} />, grad: 'linear-gradient(135deg,#EF4444,#B91C1C)', badge: '#FEE2E2', badgeText: '#7F1D1D' },
  { type: 'FIRE', label: 'Fire & Hazard', icon: <Flame size={28} />, grad: 'linear-gradient(135deg,#F59E0B,#D97706)', badge: '#FEF3C7', badgeText: '#78350F' },
];

const AGENCIES = [
  { name: 'Rwanda National Police', short: 'RNP', icon: <Shield size={20} />, color: '#1D4ED8', bg: '#EFF6FF', hotline: '112', desc: 'Crime, accidents, and public safety across all 30 districts.' },
  { name: 'SAMU Medical Services', short: 'SAMU', icon: <Ambulance size={20} />, color: '#B91C1C', bg: '#FEF2F2', hotline: '912', desc: 'Medical emergencies, ambulance dispatch, and hospital coordination.' },
  { name: 'Rwanda Fire Brigade', short: 'RFB', icon: <Flame size={20} />, color: '#D97706', bg: '#FFFBEB', hotline: '111', desc: 'Fire suppression, rescue operations, and hazardous materials.' },
  { name: 'Rwanda Investigation Bureau', short: 'RIB', icon: <Search size={20} />, color: '#059669', bg: '#F0FDF4', hotline: '3512', desc: 'Criminal investigations, intelligence, and anti-corruption.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [trackCode, setTrackCode] = useState('');
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    statsApi.getPublic().then((res: any) => setStats(res.data.data)).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden text-white text-center"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #0F4C75 60%, #0D3B5E 100%)',
          paddingTop: 'clamp(100px, 20vw, 160px)',
          paddingBottom: 'clamp(60px, 12vw, 100px)',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#3B82F6,transparent)', filter: 'blur(60px)' }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Bell size={12} className="text-blue-300" />
            <span className="text-blue-200 text-xs font-bold tracking-widest uppercase">Ministry of Internal Security · Rwanda</span>
          </div>
          <h1 className="font-black leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
            Rwanda
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#60A5FA,#EF4444)' }}> Safe</span>
            <span className="block text-blue-200 font-bold mt-1" style={{ fontSize: 'clamp(1rem, 3.5vw, 1.5rem)' }}>
              Emergency Response Platform
            </span>
          </h1>
          <p className="text-blue-200 mb-8 mx-auto max-w-xl" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.125rem)', lineHeight: 1.7 }}>
            Report any emergency instantly. Get connected to Police, SAMU, Fire Brigade, or RIB — anywhere in Rwanda, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/report')}
              className="flex items-center justify-center gap-2 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg,#EF4444,#B91C1C)',
                fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)',
                boxShadow: '0 0 40px rgba(239,68,68,0.4)',
              }}
            >
              <Siren size={20} /> Report Emergency
            </button>
            <button
              onClick={() => document.getElementById('track-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all active:scale-95 border border-white/30 bg-white/10 hover:bg-white/20 text-white"
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)',
              }}
            >
              <ClipboardList size={20} /> Track My Report
            </button>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      <section style={{ background: '#0F172A' }} className="text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Total Reports', value: stats?.totalIncidents ?? null, suffix: '+', color: '#60A5FA', icon: <FileText size={18} /> },
            { label: 'Resolved', value: stats?.resolvedIncidents ?? null, suffix: '', color: '#34D399', icon: <CheckCircle2 size={18} /> },
            { label: 'Active Now', value: stats?.activeIncidents ?? null, suffix: '', color: '#F87171', icon: <Siren size={18} /> },
            { label: 'Avg Response', value: stats?.avgResponseMinutes ?? null, suffix: ' min', color: '#FBBF24', icon: <Clock size={18} /> },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="font-extrabold" style={{ color: s.color, fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
                {s.value === null ? <span className="animate-pulse text-gray-600">—</span> : <AnimatedCounter target={s.value} suffix={s.suffix} />}
              </span>
              <span className="text-gray-400 text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES GRID ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-red-600 text-xs font-black uppercase tracking-widest">Emergency Services</span>
            <h2 className="font-extrabold text-gray-900 mt-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>What Can You Report?</h2>
            <p className="text-gray-500 text-sm mt-2">Tap any category to report immediately. No account required.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.map((svc) => (
              <button
                key={svc.type}
                onClick={() => router.push(`/report?type=${svc.type}`)}
                className="group relative rounded-2xl p-5 text-left transition-all active:scale-95 hover:-translate-y-1 border border-gray-100 hover:shadow-lg overflow-hidden"
                style={{ background: '#FAFAFA' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 transition-transform group-hover:scale-110" style={{ background: svc.grad }}>
                  {svc.icon}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1 leading-snug">{svc.label}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: svc.badge, color: svc.badgeText }}>Report →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-blue-700 text-xs font-black uppercase tracking-widest">Simple & Fast</span>
            <h2 className="font-extrabold text-gray-900 mt-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Report the Emergency', desc: 'Submit your location & description with optional photos. No account needed.', icon: <MapPin size={28} />, color: '#3B82F6' },
              { num: '02', title: 'Agency Dispatched', desc: 'The right agency — Police, SAMU, Fire, or RIB — gets your report instantly.', icon: <Radio size={28} />, color: '#10B981' },
              { num: '03', title: 'Track Resolution', desc: 'Follow your report in real time with your unique code until resolved.', icon: <CheckCircle2 size={28} />, color: '#F59E0B' },
            ].map((step, i) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: step.color }}>
                  {step.icon}
                </div>
                <div className="text-xs font-black text-gray-400 tracking-widest mb-1">{step.num}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 z-10"><ArrowRight size={20} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCIES ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-green-700 text-xs font-black uppercase tracking-widest">Response Agencies</span>
            <h2 className="font-extrabold text-gray-900 mt-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>Who Responds?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">Rwanda Safe connects you to the right agency based on your incident type.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {AGENCIES.map((agency) => (
              <div key={agency.short} className="flex gap-4 items-start p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all bg-gray-50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: agency.bg, color: agency.color }}>
                  {agency.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{agency.name}</h3>
                    <a href={`tel:${agency.hotline}`}
                      className="text-xs font-bold px-3 py-1 rounded-full text-white flex items-center gap-1 flex-shrink-0"
                      style={{ background: agency.color }}
                    >
                      <Phone size={11} /> {agency.hotline}
                    </a>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{agency.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section id="track-section" className="py-16 px-4" style={{ background: '#F8FAFC' }}>
        <div className="max-w-lg mx-auto text-center">
          <span className="text-blue-700 text-xs font-black uppercase tracking-widest">Already Reported?</span>
          <h2 className="font-extrabold text-gray-900 mt-2 mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>Track Your Report</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your unique tracking code to see the live status of your incident.</p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none font-mono uppercase transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                placeholder="e.g. RW-2026-00042"
                onKeyDown={(e) => e.key === 'Enter' && trackCode && router.push(`/track/${trackCode}`)}
              />
              <button
                onClick={() => trackCode && router.push(`/track/${trackCode}`)}
                disabled={!trackCode}
                className="text-white px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-1 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#0F4C75,#0D3B5E)' }}
              >
                <Search size={16} /> Track
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              No code?{' '}
              <Link href="/my-reports?login=1" className="text-blue-600 font-semibold hover:underline">Sign in to see all your reports →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A' }} className="text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-extrabold text-lg mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#C62828,#0F4C75)' }}>
                  <Shield size={14} />
                </div>
                SafeRwanda
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Emergency reporting platform by the Ministry of Internal Security, Republic of Rwanda.</p>
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Emergency Hotlines</div>
              <div className="grid grid-cols-2 gap-2">
                {AGENCIES.map((a) => (
                  <a key={a.short} href={`tel:${a.hotline}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    {a.icon}
                    <span>{a.short}: <strong>{a.hotline}</strong></span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Quick Links</div>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link href="/report" className="hover:text-white transition-colors">Report Emergency</Link>
                <Link href="/track" className="hover:text-white transition-colors">Track Report</Link>
                <Link href="/map" className="hover:text-white transition-colors">Live Map</Link>
                <Link href="/signin" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>© 2026 Rwanda Safe — Ministry of Internal Security</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
