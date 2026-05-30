'use client';
import { useEffect, useState } from 'react';
import { elapsedMinutes } from '../../lib/formatters';
const SLA = { green: '#22C55E', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444' };

interface Props {
  createdAt: string;
  status: string;
  dispatchedAt?: string | null;
  compact?: boolean;
}

export function SLATimer({ createdAt, status, dispatchedAt, compact = false }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (['RESOLVED', 'CLOSED', 'CANCELLED'].includes(status)) return;
    setElapsed(elapsedMinutes(createdAt));
    const interval = setInterval(() => setElapsed(elapsedMinutes(createdAt)), 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (['RESOLVED', 'CLOSED', 'CANCELLED'].includes(status)) return null;

  if (['DISPATCHED', 'ON_SCENE'].includes(status)) {
    const mins = dispatchedAt ? elapsedMinutes(createdAt) : elapsed;
    return (
      <span className="text-xs font-medium" style={{ color: SLA.green }}>
        ✓ {mins}m
      </span>
    );
  }

  let color = SLA.green;
  let pulse = false;
  if (elapsed >= 15) { color = SLA.red; pulse = true; }
  else if (elapsed >= 10) { color = SLA.orange; }
  else if (elapsed >= 5) { color = SLA.yellow; }

  const mins = Math.floor(elapsed);
  const secs = Math.floor((elapsed * 60) % 60);

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${pulse ? 'animate-pulse' : ''}`}
      style={{ color }}
    >
      {compact ? `${mins}m` : `${mins}:${String(secs).padStart(2, '0')}`}
      {elapsed >= 15 && !compact && <span className="text-[10px]">⚠</span>}
    </span>
  );
}
