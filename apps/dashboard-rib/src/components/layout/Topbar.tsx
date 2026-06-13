'use client';

interface Props { title?: string; }

export function Topbar({ title }: Props) {
  const now = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
export function Topbar({ title }: Props) {
    const now = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <header className="h-14 bg-white flex items-center justify-between px-6 flex-shrink-0"
        style={{ borderBottom: '1px solid #E2E8F0' }}>
        <div>
          {title && <h1 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h1>}
          <p className="text-[11px] font-medium text-slate-400">{now}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border border-green-100"
            style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            Live System
          </div>
        </div>
      </header>
    );
  }
  );
}
