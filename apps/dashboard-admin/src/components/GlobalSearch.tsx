'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, LayoutDashboard, Map, Activity, Building2, Users, Bell, Gauge, ScrollText, Database, Server, ArrowRight } from 'lucide-react';

const SEARCH_ITEMS = [
  { href: '/dashboard', label: 'National Overview', icon: LayoutDashboard, keywords: 'overview home stats dashboard' },
  { href: '/dashboard/map', label: 'National Map', icon: Map, keywords: 'map incidents locations' },
  { href: '/dashboard/heatmap', label: 'Heat Map', icon: Activity, keywords: 'heatmap heat map trends' },
  { href: '/dashboard/agencies', label: 'Agency Comparison', icon: Building2, keywords: 'agencies police hospital fire rib' },
  { href: '/dashboard/users', label: 'User Management', icon: Users, keywords: 'users citizens officers accounts' },
  { href: '/dashboard/users/new', label: 'Create Officer', icon: Users, keywords: 'new officer create account' },
  { href: '/dashboard/broadcast', label: 'Broadcast Alerts', icon: Bell, keywords: 'broadcast alert notification message' },
  { href: '/dashboard/sla', label: 'SLA Config', icon: Gauge, keywords: 'sla service level agreement config' },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ScrollText, keywords: 'audit log history activity' },
  { href: '/dashboard/opendata', label: 'Open Data', icon: Database, keywords: 'open data export csv json' },
  { href: '/dashboard/system', label: 'System Health', icon: Server, keywords: 'system health status config' },
];

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.toLowerCase().includes(query.toLowerCase()),
      )
    : SEARCH_ITEMS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      handleSelect(filtered[selectedIdx].href);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 'min(640px, 90vw)',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'scaleIn 0.15s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <Search size={18} color="#94A3B8" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, settings..."
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '15px',
              color: '#0F172A', background: 'transparent',
            }}
          />
          <kbd style={{ padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 'min(400px, 50vh)', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8', fontSize: '13px' }}>
              No results for "<strong>{query}</strong>"
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: i === selectedIdx ? '#F1F5F9' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color="#64748B" />
                  </div>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{item.label}</span>
                  <ArrowRight size={14} color="#94A3B8" />
                </div>
              );
            })
          )}
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '16px', fontSize: '11px', color: '#94A3B8' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
