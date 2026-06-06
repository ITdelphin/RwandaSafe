'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  AlertOctagon,
  HeartPulse,
  Flame,
  Shield,
  Ambulance,
  Search,
  MapPin,
  Radio,
  CheckCircle2,
  Siren,
  Clock,
  FileText,
  ClipboardList,
  Phone,
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

interface ServiceItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  description: string;
}

interface AgencyItem {
  name: string;
  short: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  hotline: string;
  desc: string;
}

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const duration = 1400;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

const SERVICES: ServiceItem[] = [
  {
    type: 'ACCIDENT',
    label: 'Road Accidents',
    icon: <Car size={32} />,
    color: '#E65100',
    bg: '#FFF3E0',
    border: '#FFCC80',
    description: 'Report traffic accidents, vehicle collisions, and road hazards across Rwanda.',
  },
  {
    type: 'CRIME',
    label: 'Crime & Security',
    icon: <AlertOctagon size={32} />,
    color: '#1A237E',
    bg: '#E8EAF6',
    border: '#9FA8DA',
    description: 'Report crimes, suspicious activity, and security threats to Rwanda National Police.',
  },
  {
    type: 'MEDICAL_EMERGENCY',
    label: 'Medical Emergency',
    icon: <HeartPulse size={32} />,
    color: '#B71C1C',
    bg: '#FFEBEE',
    border: '#EF9A9A',
    description: 'Dispatch SAMU ambulances for medical emergencies, injuries, and critical health crises.',
  },
  {
    type: 'FIRE',
    label: 'Fire & Hazard',
    icon: <Flame size={32} />,
    color: '#BF360C',
    bg: '#FBE9E7',
    border: '#FFAB91',
    description: 'Alert fire brigades for fires, gas leaks, chemical spills, and structural hazards.',
  },
];

const AGENCIES: AgencyItem[] = [
  {
    name: 'Rwanda National Police',
    short: 'RNP',
    icon: <Shield size={24} />,
    color: '#1A237E',
    bg: '#E8EAF6',
    hotline: '112',
    desc: 'Maintaining law and order, crime prevention, and emergency response across all 30 districts.',
  },
  {
    name: 'SAMU / Medical Services',
    short: 'SAMU',
    icon: <Ambulance size={24} />,
    color: '#B71C1C',
    bg: '#FFEBEE',
    hotline: '912',
    desc: 'Pre-hospital emergency medical care, ambulance dispatch, and hospital coordination.',
  },
  {
    name: 'Rwanda Fire Brigade',
    short: 'RFB',
    icon: <Flame size={24} />,
    color: '#BF360C',
    bg: '#FBE9E7',
    hotline: '111',
    desc: 'Fire suppression, rescue operations, hazardous material response, and fire safety.',
  },
  {
    name: 'Rwanda Investigation Bureau',
    short: 'RIB',
    icon: <Search size={24} />,
    color: '#1B5E20',
    bg: '#E8F5E9',
    hotline: '3512',
    desc: 'Criminal investigations, intelligence gathering, and anti-corruption enforcement.',
  },
];

const STEPS: StepItem[] = [
  {
    num: '01',
    title: 'Report the Emergency',
    desc: 'Submit an incident report with your location, description, and optional photos. No account needed.',
    icon: <MapPin size={32} />,
  },
  {
    num: '02',
    title: 'Dispatch to Agency',
    desc: 'The relevant agency — Police, SAMU, Fire, or RIB — receives your report instantly and dispatches responders.',
    icon: <Radio size={32} />,
  },
  {
    num: '03',
    title: 'Track & Resolved',
    desc: 'Track your report in real time with your unique code. Get notified when help is on the way and when resolved.',
    icon: <CheckCircle2 size={32} />,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [trackCode, setTrackCode] = useState('');
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    statsApi.getPublic().then((res: any) => setStats(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-white py-24 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1B4B 0%, #1a237e 50%, #0D47A1 100%)' }}
      >
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Ministry of Internal Security · Rwanda
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
            Rwanda Safe
            <span className="block text-blue-300 mt-1">Emergency Response Platform</span>
          </h1>
          <p className="text-blue-200 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Report any emergency instantly. Get connected to Police, SAMU, Fire Brigade, or RIB — anywhere in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/report')}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <Siren size={20} /> Report Emergency
            </button>
            <button
              onClick={() => {
                document.getElementById('track-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xl font-semibold px-10 py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ClipboardList size={20} /> Track My Report
            </button>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            {
              label: 'Total Reports',
              value: stats?.totalIncidents ?? null,
              suffix: '+',
              color: '#60A5FA',
              icon: <FileText size={20} />,
            },
            {
              label: 'Resolved',
              value: stats?.resolvedIncidents ?? null,
              suffix: '',
              color: '#34D399',
              icon: <CheckCircle2 size={20} />,
            },
            {
              label: 'Active Now',
              value: stats?.activeIncidents ?? null,
              suffix: '',
              color: '#F87171',
              icon: <Siren size={20} />,
            },
            {
              label: 'Avg Response',
              value: stats?.avgResponseMinutes ?? null,
              suffix: ' min',
              color: '#FBBF24',
              icon: <Clock size={20} />,
            },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="mb-1" style={{ color: s.color }}>{s.icon}</span>
              <span className="text-3xl md:text-4xl font-extrabold" style={{ color: s.color }}>
                {s.value === null ? (
                  <span className="animate-pulse text-gray-500">—</span>
                ) : (
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                )}
              </span>
              <span className="text-gray-400 text-sm mt-1 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-700 text-sm font-bold uppercase tracking-widest">Simple &amp; Fast</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 text-gray-300 text-2xl z-10">→</div>
                )}
                <div className="flex justify-center mb-4 text-blue-700">{step.icon}</div>
                <span className="text-blue-700 font-black text-xs tracking-widest">{step.num}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services / Quick Report ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest">Emergency Services</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">What Can You Report?</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {SERVICES.map((svc) => (
              <button
                key={svc.type}
                onClick={() => router.push(`/report?type=${svc.type}`)}
                className="group text-left rounded-2xl p-6 border-2 transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
                style={{
                  background: svc.bg,
                  borderColor: svc.border,
                }}
              >
                <span className="block mb-3" style={{ color: svc.color }}>{svc.icon}</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">{svc.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{svc.description}</p>
                <span
                  className="inline-block mt-4 text-xs font-semibold group-hover:underline"
                  style={{ color: svc.color }}
                >
                  Report now →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agencies ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-green-700 text-sm font-bold uppercase tracking-widest">Emergency Agencies</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Who Responds?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              Rwanda Safe connects you to the right agency automatically based on your incident type.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {AGENCIES.map((agency) => (
              <div
                key={agency.short}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: agency.bg, color: agency.color }}
                >
                  {agency.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{agency.name}</h3>
                    <a
                      href={`tel:${agency.hotline}`}
                      className="text-xs font-bold px-3 py-1 rounded-full text-white flex-shrink-0 flex items-center gap-1"
                      style={{ background: agency.color }}
                    >
                      <Phone size={12} /> {agency.hotline}
                    </a>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 leading-relaxed">{agency.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Track Report ── */}
      <section id="track-section" className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-blue-700 text-sm font-bold uppercase tracking-widest">Already Reported?</span>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">Track Your Report</h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter your unique tracking code to see the live status of your incident.
          </p>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all uppercase"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                placeholder="e.g. RW-2026-00042"
                onKeyDown={(e) => e.key === 'Enter' && trackCode && router.push(`/track/${trackCode}`)}
              />
              <button
                onClick={() => trackCode && router.push(`/track/${trackCode}`)}
                disabled={!trackCode}
                className="bg-blue-800 disabled:opacity-40 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1"
              >
                <Search size={16} /> Track
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Don't have a code?{' '}
              <Link href="/my-reports" className="text-blue-600 hover:underline">
                Sign in to see all your reports →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0D1B4B' }} className="text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <div className="text-xl font-extrabold mb-2 flex items-center gap-2">
                <Shield size={20} /> Rwanda Safe
              </div>
              <p className="text-blue-300 text-sm max-w-xs">
                A digital emergency reporting platform by the Ministry of Internal Security, Republic of Rwanda.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">Emergency Hotlines</div>
              <div className="grid grid-cols-2 gap-3">
                {AGENCIES.map((a) => (
                  <a
                    key={a.short}
                    href={`tel:${a.hotline}`}
                    className="flex items-center gap-2 text-sm hover:text-blue-300 transition-colors"
                  >
                    <span>{a.icon}</span>
                    <span>
                      {a.short}: <span className="font-bold">{a.hotline}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">Quick Links</div>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/report" className="hover:text-blue-300 transition-colors">Report an Emergency</Link>
                <Link href="/track" className="hover:text-blue-300 transition-colors">Track a Report</Link>
                <Link href="/map" className="hover:text-blue-300 transition-colors">Live Map</Link>
                <Link href="/my-reports" className="hover:text-blue-300 transition-colors">My Reports</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-blue-400">
            <span>© 2026 Rwanda Safe — Ministry of Internal Security, Republic of Rwanda</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
