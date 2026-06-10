'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { incidentsApi } from '../../lib/apiClient';
import { IncidentCard } from '../../components/IncidentCard';
import { Navbar } from '../../components/Navbar';
import { LoginModal } from '../../components/LoginModal';
import { useAuthStore } from '../../store/authStore';

export default function MyReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (searchParams.get('login') === '1' && !isAuthenticated) {
      setShowLogin(true);
      setLoading(false);
      return;
    }
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    incidentsApi.list()
      .then((r) => setIncidents(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, searchParams]);

  const handleLoginClose = () => {
    setShowLogin(false);
    if (isAuthenticated) {
      incidentsApi.list()
        .then((r) => setIncidents(r.data.data ?? []))
        .catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LoginModal open={showLogin} onClose={handleLoginClose} />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Reports</h1>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" /></div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4 text-gray-300"><ClipboardList size={48} /></div>
            <p className="text-gray-500 mb-4">Sign in to see your reports</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition"
            >
              Sign In
            </button>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4 text-gray-300"><ClipboardList size={48} /></div>
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
