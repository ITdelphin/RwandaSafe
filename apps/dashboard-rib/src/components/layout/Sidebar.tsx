'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RIBTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { href: '/dashboard',                 label: 'Overview',        icon: '🏠' },
  { href: '/dashboard/investigations',  label: 'Investigations',  icon: '🔎' },
  { href: '/dashboard/tips',            label: 'Tips',            icon: '💬' },
  { href: '/dashboard/patterns',        label: 'Patterns',        icon: '📡' },
  { href: '/dashboard/map',             label: 'Map',             icon: '🗺️' },
  { href: '/dashboard/analytics',       label: 'Analytics',       icon: '📊' },
  { href: '/dashboard/handover',        label: 'Handover',        icon: '🔄' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="h-screen flex flex-col w-64 flex-shrink-0" style={{ backgroundColor: RIBTheme.sidebar }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <div className="text-white font-bold text-sm">Rwanda Safe</div>
            <div className="text-purple-300 text-xs">RIB Investigations</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: active ? RIBTheme.sidebarActive : 'transparent',
                color: active ? '#FFFFFF' : '#94A3B8',
              }}>
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: RIBTheme.primary }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? 'I'}
          </div>
          <div>
            <div className="text-white text-xs font-medium">{user?.name ?? 'Investigator'}</div>
            <div className="text-gray-400 text-[11px]">{user?.phone}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}
