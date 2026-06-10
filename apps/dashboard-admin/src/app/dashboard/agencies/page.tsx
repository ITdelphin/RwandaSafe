'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '../../../lib/apiClient';
import { Building2, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '../../../lib/formatters';

const AGENCY_NAMES: Record<string, string> = {
  POLICE: 'Rwanda National Police',
  HOSPITAL: 'SAMU / Hospital',
  FIRE: 'Fire Brigade',
  RIB: 'Rwanda Investigation Bureau',
};

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1B5E82',
  HOSPITAL: '#C62828',
  FIRE: '#EA580C',
  RIB: '#4C1D95',
};

const AGENCY_ROUTES: Record<string, string> = {
  POLICE: 'police',
  HOSPITAL: 'hospital',
  FIRE: 'fire',
  RIB: 'rib',
};

export default function AdminAgenciesPage() {
  const { data: scorecards, isLoading } = useQuery({
    queryKey: ['admin', 'scorecard'],
    queryFn: () => adminApi.getScorecard().then((r) => r.data.data),
    refetchInterval: 300000,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading agency data...</div>;
  }

  const bestScore = Math.max(...(scorecards?.map((s: any) => s.performanceScore) ?? [0]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Agency Performance Comparison</h2>

      {/* Scorecards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {scorecards?.map((s: any) => {
          const scoreColor = getScoreColor(s.performanceScore);
          const color = AGENCY_COLORS[s.agency] ?? '#64748B';
          const isBest = s.performanceScore >= bestScore;

          return (
            <div
              key={s.agency}
              style={{
                background: '#fff',
                borderRadius: '14px',
                border: `1px solid ${isBest ? scoreColor : '#E2E8F0'}`,
                borderTop: `4px solid ${color}`,
                padding: '24px',
                position: 'relative',
              }}
            >
              {isBest && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: scoreColor, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Best Performer
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Building2 size={22} color={color} />
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>{AGENCY_NAMES[s.agency] ?? s.agency}</span>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Performance Score</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: scoreColor }}>{s.performanceScore}/100</span>
                </div>
                <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(s.performanceScore, 100)}%`, height: '100%', borderRadius: '4px', background: scoreColor, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '11px', color: scoreColor, fontWeight: 600, marginTop: '2px' }}>{getScoreLabel(s.performanceScore)}</div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#64748B' }}>
                <div>Total Cases: <strong style={{ color: '#0F172A' }}>{s.totalCases}</strong></div>
                <div>Resolution Rate: <strong style={{ color: s.resolutionRate >= 80 ? '#22C55E' : '#F59E0B' }}>{s.resolutionRate}%</strong></div>
                <div>Avg Response: <strong style={{ color: '#0F172A' }}>{s.avgResponseTimeMinutes} min</strong></div>
                <div>SLA Compliance: <strong style={{ color: s.slaCompliance >= 90 ? '#22C55E' : '#F59E0B' }}>{s.slaCompliance}%</strong></div>
                <div>Open Critical: <strong style={{ color: s.criticalOpen > 0 ? '#EF4444' : '#22C55E' }}>{s.criticalOpen}</strong></div>
                <div>Officers On Duty: <strong style={{ color: '#0F172A' }}>{s.onDutyCount}/{s.officerCount}</strong></div>
              </div>

              <Link
                href={`/dashboard/agencies/${AGENCY_ROUTES[s.agency] ?? s.agency.toLowerCase()}`}
                style={{
                  display: 'block', textAlign: 'center', marginTop: '16px', padding: '8px',
                  borderRadius: '8px', border: `1px solid ${color}`, color, fontSize: '12px',
                  fontWeight: 600, textDecoration: 'none',
                }}
              >
                View Full Report →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Comparison charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Response Time Comparison (min)</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '200px' }}>
            {scorecards?.map((s: any) => (
              <div key={s.agency} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: '#64748B' }}>{s.avgResponseTimeMinutes}</span>
                <div style={{ width: '100%', height: `${Math.min((s.avgResponseTimeMinutes / 60) * 100, 100)}%`, background: AGENCY_COLORS[s.agency] ?? '#94A3B8', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{s.agency}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Resolution Rate Comparison (%)</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '200px' }}>
            {scorecards?.map((s: any) => (
              <div key={s.agency} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '10px', color: '#64748B' }}>{s.resolutionRate}%</span>
                <div style={{ width: '100%', height: `${s.resolutionRate}%`, background: s.resolutionRate >= 80 ? '#22C55E' : '#F59E0B', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{s.agency}</span>
              </div>
            ))}
            {/* Target line */}
            <div style={{ position: 'relative', width: 0 }}>
              <div style={{ position: 'absolute', bottom: '80%', left: '-200px', right: '0', height: '2px', background: '#EF4444', borderTop: '2px dashed #EF4444', opacity: 0.5 }} />
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#EF4444', textAlign: 'right', marginTop: '4px' }}>--- 80% target</div>
        </div>
      </div>
    </div>
  );
}
