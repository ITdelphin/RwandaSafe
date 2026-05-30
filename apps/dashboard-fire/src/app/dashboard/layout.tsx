'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { useAuthStore } from '../../store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fire_access_token') : null;
      if (!token) router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#FFF7ED' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
