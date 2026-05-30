'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { incidentsApi } from '../../lib/apiClient';
import { IncidentCard } from '../../components/IncidentCard';
import { Navbar } from '../../components/Navbar';

export default function MyReportsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { router.replace('/my-reports?login=1'); return; }
    incidentsApi.list()
      .then((r) => setIncidents(r.data.data ?? []))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Reports</h1>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" /></div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500">No reports yet. Stay safe!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)}
          </div>
        )}
      </div>
    </div>
  );
}
