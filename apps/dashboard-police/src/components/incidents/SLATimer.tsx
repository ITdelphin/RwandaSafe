'use client';
import { useEffect, useState } from 'react';
import { elapsedMinutes } from '../../lib/formatters';
import { Theme } from '../../constants/theme';

// SLA color thresholds mapped to new Material palette
const slaGreen  = Theme.secondary;    // #34A853
const slaYellow = Theme.warning;      // #F9AB00
const slaOrange = '#E8710A';          // Google Orange
const slaRed    = Theme.danger;       // #d93025

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
      <span className="text-xs font-medium" style={{ color: slaGreen }}>
        ✓ {mins}m
      </span>
    );
  }

  let color = slaGreen;
  let pulse = false;
  if (elapsed >= 15) { color = slaRed; pulse = true; }
  else if (elapsed >= 10) { color = slaOrange; }
  else if (elapsed >= 5) { color = slaYellow; }

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
