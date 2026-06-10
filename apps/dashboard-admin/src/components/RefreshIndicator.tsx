'use client';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshIndicator({ interval }: { interval: number }) {
  const [elapsed, setElapsed] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1000);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLastUpdate(new Date());
    setElapsed(0);
  }, [interval]);

  const pct = Math.min((elapsed / interval) * 100, 100);
  const isNearRefresh = pct > 85;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: isNearRefresh ? '#0F4C75' : '#94A3B8' }}>
      <div style={{ position: 'relative', width: '14px', height: '14px' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="7" cy="7" r="5.5" fill="none" stroke={isNearRefresh ? '#0F4C75' : '#94A3B8'} strokeWidth="2"
            strokeDasharray={`${(pct / 100) * 34.54} 34.54`} style={{ transition: 'stroke-dasharray 1s linear' }} />
        </svg>
        {isNearRefresh && (
          <RefreshCw size={8} style={{ position: 'absolute', top: '3px', left: '3px', animation: 'spin 1s linear infinite' }} />
        )}
      </div>
      <span className="hide-sm">Auto-refreshes every {interval / 1000}s</span>
    </div>
  );
}
