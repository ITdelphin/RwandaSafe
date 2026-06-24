'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import GlobalSearch from '../../components/GlobalSearch';
import DarkModeToggle, { useDarkMode } from '../../components/DarkModeToggle';
import NotificationsPanel from '../../components/NotificationsPanel';
import RefreshIndicator from '../../components/RefreshIndicator';
import '../../styles/globals.css';
import {
  LayoutDashboard, Map, Activity, Building2, Users, Bell, Gauge,
  ScrollText, Database, Server, Shield, LogOut, ChevronRight, Menu, X,
  Search as SearchIcon, Keyboard, Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'National Overview', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'National Map', icon: Map },
  { href: '/dashboard/heatmap', label: 'Heat Map', icon: Activity },
  { href: '/dashboard/agencies', label: 'Agency Comparison', icon: Building2 },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/access', label: 'Access Control', icon: Shield },
  { href: '/dashboard/broadcast', label: 'Broadcast Alerts', icon: Bell },
  { href: '/dashboard/sla', label: 'SLA Config', icon: Gauge },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/dashboard/opendata', label: 'Open Data', icon: Database },
  { href: '/dashboard/system', label: 'System Health', icon: Server },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B' }} className="hide-sm">
        {time.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
        {time.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
        <span style={{ color: '#22C55E', fontWeight: 600, marginLeft: '4px', fontSize: '9px' }}>● Live</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hydrate } = useAuthStore();
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const isTablet = useMediaQuery(BREAKPOINTS.lg);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/login');
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (isMobile && sidebarOpen) setSidebarOpen(false);
  }, [isMobile, pathname]);

  useKeyboardShortcuts(
    useMemo(() => [
      { key: 'k', ctrlOrCmd: true, handler: () => setSearchOpen(true) },
      { key: '/', ctrlOrCmd: true, handler: () => setSearchOpen(true) },
      { key: 'b', ctrlOrCmd: true, handler: () => setSidebarOpen((s) => !s) },
      { key: '?', handler: () => setShowShortcuts((s) => !s) },
      { key: 'Escape', handler: () => { setSearchOpen(false); setShowShortcuts(false); } },
    ], []),
  );

  const sidebarWidth = isMobile
    ? (sidebarOpen ? '100vw' : '0px')
    : (sidebarOpen ? '260px' : '0px');

  if (!mounted || !isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', margin: '0 auto 16px',
            border: '3px solid #E2E8F0', borderTopColor: '#0F4C75',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Global Search */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowShortcuts(false); }}
        >
          <div style={{
            width: 'min(420px, 90vw)', background: '#fff', borderRadius: '16px',
            padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Keyboard size={20} color="#0F4C75" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Keyboard Shortcuts</h3>
            </div>
            {[
              { keys: '⌘K /', desc: 'Open search' },
              { keys: '⌘B', desc: 'Toggle sidebar' },
              { keys: '?', desc: 'Show shortcuts' },
              { keys: 'ESC', desc: 'Close overlays' },
            ].map((s) => (
              <div key={s.keys} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{s.desc}</span>
                <kbd style={{ padding: '2px 10px', borderRadius: '4px', background: '#F1F5F9', fontSize: '11px', color: '#0F172A', fontFamily: 'monospace', fontWeight: 600 }}>{s.keys}</kbd>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)}
              style={{ marginTop: '16px', width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', background: '#F1F5F9', overflow: 'hidden' }}>
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          />
        )}

        {/* Sidebar */}
        <div
          style={{
            width: sidebarWidth,
            minWidth: isMobile ? (sidebarOpen ? '100vw' : '0px') : (sidebarOpen ? '260px' : '0px'),
            background: '#0F172A', color: '#fff',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            transition: 'width 0.25s ease, min-width 0.25s ease',
            overflow: 'hidden', zIndex: 50,
            position: isMobile ? 'fixed' : 'relative',
            height: '100vh',
          }}
        >
          {/* Logo */}
          <div style={{ padding: '20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #C62828, #0F4C75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
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

          {/* Search prompt */}
          <div style={{ padding: '12px' }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px', border: '1px solid #1E293B',
                background: 'transparent', color: '#64748B', fontSize: '12px', cursor: 'pointer',
              }}
            >
              <SearchIcon size={14} />
              <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
              <kbd style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', padding: '1px 4px', borderRadius: '3px', background: '#1E293B' }}>⌘K</kbd>
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0 12px 12px', overflowY: 'auto' }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { if (isMobile) setSidebarOpen(false); }}
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
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#1E293B'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
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
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0F4C75, #1E3A5F)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '12px', flexShrink: 0,
                }}>
                  {user?.name?.[0] ?? 'A'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name ?? 'Admin'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Super Admin</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: 'transparent', color: '#EF4444', fontSize: '12px',
                cursor: 'pointer', fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Topbar */}
          <header
            style={{
              height: '56px', background: '#fff', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px', flexShrink: 0, gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  width: '34px', height: '34px', borderRadius: '8px', border: 'none',
                  background: '#F1F5F9', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#64748B', flexShrink: 0,
                }}
              >
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              {!isMobile && (
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC',
                    color: '#94A3B8', fontSize: '12px', cursor: 'pointer', fontWeight: 400,
                    minWidth: '200px',
                  }}
                >
                  <SearchIcon size={14} />
                  <span>Search pages...</span>
                  <kbd style={{ marginLeft: 'auto', fontSize: '10px', color: '#CBD5E1', fontFamily: 'monospace' }}>⌘K</kbd>
                </button>
              )}
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hide-sm">
                Rwanda Safe
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <RefreshIndicator interval={60000} />
              <NotificationsPanel />
              <DarkModeToggle dark={dark} onToggle={toggleDark} />
              <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
              <LiveClock />
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
