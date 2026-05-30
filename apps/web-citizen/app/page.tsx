'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../src/components/Navbar';

const QUICK_ACTIONS = [
  { type: 'ACCIDENT',          label: 'Report Accident',   icon: '🚗', color: '#FF6F00' },
  { type: 'CRIME',             label: 'Report Crime',      icon: '🚨', color: '#283593' },
  { type: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🏥', color: '#C62828' },
  { type: 'FIRE',              label: 'Fire / Hazard',     icon: '🔥', color: '#BF360C' },
];

export default function LandingPage() {
  const router = useRouter();
  const [trackCode, setTrackCode] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Report emergencies fast.<br />Help arrives faster.</h1>
        <p className="text-blue-200 text-lg mb-10">Your safety is our priority</p>
        <button
          onClick={() => router.push('/report')}
          className="bg-red-600 hover:bg-red-700 text-white text-2xl font-bold px-12 py-5 rounded-2xl shadow-xl transition-transform active:scale-95"
        >
          🆘 SOS — Report Now
        </button>
      </section>

      {/* Quick Actions */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.type}
              onClick={() => router.push(`/report?type=${a.type}`)}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
            >
              <span className="text-3xl block mb-2">{a.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Track Report */}
      <section className="max-w-xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Track your report</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
              placeholder="e.g. RW-2026-00042"
            />
            <button
              onClick={() => trackCode && router.push(`/track/${trackCode}`)}
              className="bg-blue-800 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-900"
            >
              Track
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Strip */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        <div className="flex justify-center gap-8 text-sm font-semibold">
          <a href="tel:112" className="hover:text-red-300">🚔 Police: 112</a>
          <a href="tel:912" className="hover:text-red-300">🚑 Ambulance: 912</a>
          <a href="tel:111" className="hover:text-red-300">🚒 Fire: 111</a>
        </div>
        <p className="text-gray-400 text-xs mt-4">© 2026 Rwanda Safe — Ministry of Internal Security</p>
      </footer>
    </div>
  );
}
