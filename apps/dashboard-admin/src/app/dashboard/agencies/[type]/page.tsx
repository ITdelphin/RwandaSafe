'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../../lib/apiClient';
import { Building2, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { getScoreColor } from '../../../../lib/formatters';

const AGENCY_MAP: Record<string, string> = {
  police: 'POLICE', hospital: 'HOSPITAL', fire: 'FIRE', rib: 'RIB',
};

const AGENCY_NAMES: Record<string, string> = {
  POLICE: 'Rwanda National Police',
  HOSPITAL: 'SAMU / Hospital',
  FIRE: 'Fire Brigade',
  RIB: 'Rwanda Investigation Bureau',
};

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95',
};

export default function AgencyDrillDownPage() {
  const params = useParams();
  const type = AGENCY_MAP[params.type as string] ?? 'POLICE';
  const color = AGENCY_COLORS[type] ?? '#64748B';

  const { data: scorecards, isLoading } = useQuery({
    queryKey: ['admin', 'scorecard'],
    queryFn: () => adminApi.getScorecard().then((r) => r.data.data),
  });

  const agency = scorecards?.find((s: any) => s.agency === type);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading...</div>;
  }

  if (!agency) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#EF4444' }}>Agency not found</div>;
  }

  const scoreColor = getScoreColor(agency.performanceScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0', borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Building2 size={28} color={color} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{AGENCY_NAMES[type]}</h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Detailed performance report</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: scoreColor }}>{agency.performanceScore}/100</div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Performance Score</div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Cases', value: agency.totalCases, icon: <AlertTriangle size={18} color="#3B82F6" />, bg: '#3B82F6' },
          { label: 'Resolution Rate', value: `${agency.resolutionRate}%`, icon: <CheckCircle size={18} color="#22C55E" />, bg: '#22C55E' },
          { label: 'Avg Response Time', value: `${agency.avgResponseTimeMinutes} min`, icon: <Clock size={18} color="#F59E0B" />, bg: '#F59E0B' },
          { label: 'On-Duty Officers', value: `${agency.onDutyCount}/${agency.officerCount}`, icon: <Users size={18} color="#8B5CF6" />, bg: '#8B5CF6' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${kpi.bg}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              {kpi.icon}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* SLA & Open cases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>SLA & Quality Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'SLA Compliance', value: `${agency.slaCompliance}%`, good: agency.slaCompliance >= 90 },
              { label: 'SLA Breaches', value: agency.slaBreachCount, good: agency.slaBreachCount === 0 },
              { label: 'Critical Open Cases', value: agency.criticalOpen, good: agency.criticalOpen === 0 },
              { label: 'Open Cases', value: agency.openCases, good: agency.openCases < 10 },
            ].map((m) => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{m.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: m.good ? '#22C55E' : '#EF4444' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: `Open ${AGENCY_NAMES[type]} Dashboard`, href: `http://localhost:${type === 'POLICE' ? 3001 : type === 'HOSPITAL' ? 3002 : type === 'FIRE' ? 3003 : 3004}`, target: '_blank' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                target={action.target}
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${color}`,
                  color, fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center',
                }}
              >
                {action.label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
