'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';

export default function TrackPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Track Your Report</h1>
        <p className="text-gray-500 mb-8">Enter the tracking code from your report confirmation</p>
        <div className="flex gap-2">
          <input
            className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-xl font-mono text-lg outline-none focus:border-blue-500 tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="RW-2026-XXXXX"
          />
          <button
            onClick={() => code && router.push(`/track/${code}`)}
            className="bg-blue-800 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-900"
          >
            Track
          </button>
        </div>
      </div>
    </div>
  );
}
