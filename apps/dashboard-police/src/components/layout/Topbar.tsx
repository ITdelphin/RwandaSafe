'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, RefreshCcw } from 'lucide-react';

interface Props { title?: string; }

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right hidden sm:block">
      <div className="text-xs font-bold text-slate-700">
        {time.toLocaleDateString('en-RW', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
      <div className="text-[10px] text-slate-400 font-medium">
        {time.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
        <span className="text-green-500 ml-1.5 font-bold">● LIVE</span>
      </div>
    </div>
  );
}

export function Topbar({ title }: Props) {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 flex-shrink-0 z-30"
      style={{ borderBottom: '1px solid #E2E8F0' }}>

      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="hidden lg:block min-w-0">
          <h1 className="text-[17px] font-bold text-slate-900 tracking-tight truncate">{title ?? 'Dashboard'}</h1>
        </div>

        <div className="max-w-md w-full relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search incidents, officers, or units..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <RefreshCcw size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
        <LiveClock />
      </div>
    </header>
  );
}
