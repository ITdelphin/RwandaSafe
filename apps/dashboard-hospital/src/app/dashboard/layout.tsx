'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { MassCasualtyBanner } from '../../components/mass-casualty/MassCasualtyBanner';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [massCasualtyEvent, setMassCasualtyEvent] = useState<any>(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hospital_access_token') : null;
      if (!token) router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let socket: any;
    try {
      const { getSocket } = require('../../lib/socket');
      socket = getSocket();
      socket.on('mass_casualty:activated', (event: any) => setMassCasualtyEvent(event));
    } catch {}
    return () => { if (socket) socket.off('mass_casualty:activated'); };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {massCasualtyEvent && <MassCasualtyBanner event={massCasualtyEvent} onResolve={() => setMassCasualtyEvent(null)} />}
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
