'use client';

interface Props { title?: string; }

export function Topbar({ title }: Props) {
  const now = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 flex-shrink-0"
      style={{ borderBottom: '1px solid #e8eaed' }}>
      <div>
        {title && <h1 className="text-sm font-semibold" style={{ color: '#202124' }}>{title}</h1>}
        <p className="text-xs" style={{ color: '#5f6368' }}>{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
          style={{ backgroundColor: '#e6f4ea', color: '#1B8A3C' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
          Live
        </div>
      </div>
    </header>
  );
}
