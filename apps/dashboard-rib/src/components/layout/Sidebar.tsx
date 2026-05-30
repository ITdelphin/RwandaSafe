'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

const AGENCY = { icon: '🔍', label: 'RIB', accent: '#9334E6' };

const NAV = [
  { href: '/dashboard',                label: 'Overview',       icon: '🏠' },
  { href: '/dashboard/investigations', label: 'Investigations', icon: '🔎' },
  { href: '/dashboard/tips',           label: 'Tips',           icon: '💬' },
  { href: '/dashboard/patterns',       label: 'Patterns',       icon: '📡' },
  { href: '/dashboard/map',            label: 'Map',            icon: '🗺️' },
  { href: '/dashboard/analytics',      label: 'Analytics',      icon: '📊' },
  { href: '/dashboard/handover',       label: 'Handover',       icon: '🔄' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="h-screen flex flex-col w-60 flex-shrink-0 bg-white"
      style={{ borderRight: '1px solid #e8eaed' }}>

      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #e8eaed' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-bold"
            style={{ backgroundColor: AGENCY.accent }}>
            {AGENCY.icon}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#202124' }}>Rwanda Safe</div>
            <div className="text-xs" style={{ color: '#5f6368' }}>{AGENCY.label} Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? '#e8f0fe' : 'transparent',
                color: active ? AGENCY.accent : '#5f6368',
              }}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AGENCY.accent }} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #e8eaed' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1 hover:bg-gray-50 cursor-default">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: AGENCY.accent }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: '#202124' }}>{user?.name ?? 'User'}</div>
            <div className="text-[11px] truncate" style={{ color: '#5f6368' }}>{user?.email ?? user?.phone ?? ''}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-red-50"
          style={{ color: '#d93025' }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
