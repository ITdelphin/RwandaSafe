'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, ClipboardList, AlertTriangle, Map, User,
  LogOut, ChevronRight, Menu, X, Shield, Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/my-reports', label: 'My Reports', icon: ClipboardList },
  { href: '/report', label: 'Report Incident', icon: AlertTriangle },
  { href: '/map', label: 'Emergency Map', icon: Map },
];

export default function CitizenDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hydrate } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login');
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '3px solid #E2E8F0', borderTopColor: '#0F4C75', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F1F5F9', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40,
          display: sidebarOpen ? 'block' : 'none',
        }}
        className="md:hidden"
      />

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '0px',
          minWidth: sidebarOpen ? '260px' : '0px',
          background: '#0F172A', color: '#fff',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          transition: 'width 0.25s ease, min-width 0.25s ease',
          overflow: 'hidden', zIndex: 50,
          position: 'fixed', height: '100vh',
        }}
        className="md:relative md:block"
      >
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #C62828, #0F4C75)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
              Safe<span style={{ color: '#EF4444' }}>Rwanda</span>
            </div>
            <div style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Citizen Portal
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'none' }}
            className="md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
                  marginBottom: '1px', fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#94A3B8',
                  background: active ? '#1E3A5F' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={14} style={{ color: '#60A5FA' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid #1E293B' }}>
          <div style={{ background: '#1E293B', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #0F4C75, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                {user?.name?.[0] ?? user?.email?.[0] ?? 'C'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name ?? user?.email ?? 'Citizen'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Citizen</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#EF4444', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '56px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0 }}
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Citizen Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: '#64748B', cursor: 'pointer' }} />
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
