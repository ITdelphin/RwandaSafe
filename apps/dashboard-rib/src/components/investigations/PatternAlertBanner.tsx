'use client';
import Link from 'next/link';

interface Props {
  patternCount: number;
}

export function PatternAlertBanner({ patternCount }: Props) {
  if (patternCount <= 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
      style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E' }}>
      <span>
        ⚠️ {patternCount} new pattern alert{patternCount > 1 ? 's' : ''} detected
      </span>
      <Link
        href="/dashboard/patterns"
        className="text-xs font-semibold underline hover:no-underline"
        style={{ color: '#4C1D95' }}
      >
        Review →
      </Link>
    </div>
  );
}
