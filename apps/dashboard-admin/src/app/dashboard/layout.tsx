'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Map, Activity, Building2, Users, Bell, Gauge,
  ScrollText, Database, Server, Shield, LogOut, ChevronRight, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'National Overview', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'National Map', icon: Map },
  { href: '/dashboard/heatmap', label: 'Heat Map', icon: Activity },
  { href: '/dashboard/agencies', label: 'Agency Comparison', icon: Building2 },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/broadcast', label: 'Broadcast Alerts', icon: Bell },
  { href: '/dashboard/sla', label: 'SLA Config', icon: Gauge },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/dashboard/opendata', label: 'Open Data', icon: Database },
  { href: '/dashboard/system', label: 'System Health', icon: Server },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
        {time.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
        {time.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        <span style={{ color: '#22C55E', fontWeight: 600, marginLeft: '6px' }}>● Live</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F1F5F9',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E2E8F0',
            borderTopColor: '#0F4C75',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F1F5F9', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '0px',
          background: '#0F172A',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 0.2s',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 20px',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #C62828, #0F4C75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
              Safe<span style={{ color: '#EF4444' }}>Rwanda</span>
            </div>
            <div style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Admin Console
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  marginBottom: '2px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#94A3B8',
                  background: active ? '#1E3A5F' : 'transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = '#1E293B';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
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
          <div
            style={{
              background: '#1E293B',
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0F4C75, #1E3A5F)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0] ?? 'A'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {user?.name ?? 'Admin'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Super Admin</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#EF4444',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header
          style={{
            height: '64px',
            background: '#fff',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              {sidebarOpen ? <Menu size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Rwanda Safe — National Emergency Response Dashboard
              </h1>
            </div>
          </div>
          <LiveClock />
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
