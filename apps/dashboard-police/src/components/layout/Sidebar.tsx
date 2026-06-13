'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import {
  Shield,
  LayoutDashboard,
  Siren,
  Map,
  Users,
  BarChart2,
  ArrowLeftRight,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Theme } from '../../constants/theme';

const AGENCY = { icon: <Shield size={20} />, label: 'Police Force', accent: '#1B5E82' };

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/dashboard/incidents', label: 'Incidents', icon: <Siren size={18} /> },
  { href: '/dashboard/map', label: 'Live Map', icon: <Map size={18} /> },
  { href: '/dashboard/officers', label: 'Officers', icon: <Users size={18} /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { href: '/dashboard/handover', label: 'Handover', icon: <ArrowLeftRight size={18} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile, pathname]);

  const sidebarWidth = isMobile
    ? (isOpen ? '100vw' : '0px')
    : (isOpen ? '260px' : '0px');

  return (
    <>
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-3 z-[60] w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-slate-600 border border-slate-200"
        >
          <Menu size={20} />
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
        />
      )}

      <aside
        className="h-screen flex flex-col flex-shrink-0 bg-[#0F172A] text-slate-400 z-50 transition-all duration-300 ease-in-out overflow-hidden relative"
        style={{ width: sidebarWidth, borderRight: '1px solid #1E293B', position: isMobile ? 'fixed' : 'relative' }}
      >
        {isMobile && isOpen && (
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        )}

        <div className="px-6 py-6" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B5E82, #154A6B)' }}>
              {AGENCY.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-bold text-white tracking-tight leading-tight">
                Safe<span className="text-blue-500">Rwanda</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.1em] text-slate-500 font-bold mt-0.5">{AGENCY.label}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? '#1E3A5F' : 'transparent',
                  color: active ? '#fff' : '#94A3B8',
                }}>
                <span className={`transition-colors duration-200 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {active && <ChevronRight size={14} className="text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #1E293B' }}>
          <div className="p-3 rounded-2xl bg-[#1E293B]/40 border border-[#1E293B]/50 backdrop-blur-sm shadow-inner transition-all duration-200 hover:bg-[#1E293B]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1B5E82, #154A6B)' }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate text-white tracking-tight">{user?.name ?? 'Officer'}</div>
                <div className="text-[10px] truncate text-slate-500 font-medium">{user?.role?.replace(/_/g, ' ') ?? 'Police Officer'}</div>
              </div>
            </div>
          </div>

          <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-2 text-[11px] font-bold px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 group border border-transparent hover:border-red-500/20">
            <LogOut size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            SIGN OUT
          </button>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        `}</style>
      </aside>
    </>
  );
}
