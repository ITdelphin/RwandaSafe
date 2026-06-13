'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import {
  Flame,
  LayoutDashboard,
  Siren,
  Map,
  Users,
  BarChart2,
  ArrowLeftRight,
  FileText,
  Radio,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const AGENCY = { icon: <Flame size={20} />, label: 'Fire Brigade', accent: '#E8710A' };

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/dashboard/incidents', label: 'Incidents', icon: <Siren size={18} /> },
  { href: '/dashboard/dispatch', label: 'Dispatch', icon: <Radio size={18} /> },
  { href: '/dashboard/map', label: 'Map', icon: <Map size={18} /> },
  { href: '/dashboard/officers', label: 'Officers/Units', icon: <Users size={18} /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { href: '/dashboard/handover', label: 'Handover', icon: <ArrowLeftRight size={18} /> },
  { href: '/dashboard/reports', label: 'Reports', icon: <FileText size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="h-screen flex flex-col w-60 flex-shrink-0 bg-[#0F172A] text-slate-400"
      style={{ borderRight: '1px solid #1E293B' }}>

      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)' }}>
            {AGENCY.icon}
          </div>
          <div>
            <div className="text-sm font-bold text-white">Rwanda Safe</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{AGENCY.label}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
              style={{
                backgroundColor: active ? '#1E3A5F' : 'transparent',
                color: active ? '#fff' : '#94A3B8',
              }}>
              <span className={`flex-shrink-0 ${active ? 'text-orange-500' : 'text-slate-500'}`}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-orange-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 bg-[#1E293B]/50 border border-[#1E293B]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner"
            style={{ background: 'linear-gradient(135deg, #EA580C, #C2410C)' }}>
            {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate text-white">{user?.name ?? 'User'}</div>
            <div className="text-[10px] truncate text-slate-500">{user?.email ?? user?.phone ?? ''}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 text-[11px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-500 group">
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
