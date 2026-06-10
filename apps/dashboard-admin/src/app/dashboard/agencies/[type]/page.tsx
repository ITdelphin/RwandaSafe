'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../../lib/apiClient';
import { Building2, Clock, CheckCircle, AlertTriangle, Users, ArrowLeft, ExternalLink } from 'lucide-react';
import { getScoreColor } from '../../../../lib/formatters';

const AGENCY_MAP: Record<string, string> = {
  police: 'POLICE', hospital: 'HOSPITAL', fire: 'FIRE', rib: 'RIB',
};
const AGENCY_NAMES: Record<string, string> = {
  POLICE: 'Rwanda National Police', HOSPITAL: 'SAMU / Hospital', FIRE: 'Fire Brigade', RIB: 'Rwanda Investigation Bureau',
};
const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95',
};

export default function AgencyDrillDownPage() {
  const router = useRouter();
  const params = useParams();
  const type = AGENCY_MAP[params.type as string] ?? 'POLICE';
  const color = AGENCY_COLORS[type] ?? '#64748B';

  const { data: scorecards, isLoading } = useQuery({
    queryKey: ['admin', 'scorecard'],
    queryFn: () => adminApi.getScorecard().then((r) => r.data.data),
  });

  const agency = scorecards?.find((s: any) => s.agency === type);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading...</div>;
  if (!agency) return <div style={{ textAlign: 'center', padding: '60px', color: '#EF4444' }}>Agency not found</div>;

  const scoreColor = getScoreColor(agency.performanceScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Back + Header */}
      <div>
        <button onClick={() => router.push('/dashboard/agencies')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0F4C75', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '12px', padding: 0 }}>
          <ArrowLeft size={14} /> Back to Agencies
        </button>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E2E8F0', borderLeft: `4px solid ${color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Building2 size={26} color={color} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{AGENCY_NAMES[type]}</h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Detailed performance report</p>
            </div>
            <div style={{ flex: 1, minWidth: '20px' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color: scoreColor }}>{agency.performanceScore}/100</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Performance Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Cases', value: agency.totalCases, icon: <AlertTriangle size={16} color="#3B82F6" />, bg: '#3B82F6' },
          { label: 'Resolution Rate', value: `${agency.resolutionRate}%`, icon: <CheckCircle size={16} color="#22C55E" />, bg: '#22C55E' },
          { label: 'Avg Response Time', value: `${agency.avgResponseTimeMinutes} min`, icon: <Clock size={16} color="#F59E0B" />, bg: '#F59E0B' },
          { label: 'On-Duty Officers', value: `${agency.onDutyCount}/${agency.officerCount}`, icon: <Users size={16} color="#8B5CF6" />, bg: '#8B5CF6' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${kpi.bg}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              {kpi.icon}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* SLA & Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>SLA & Quality Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'SLA Compliance', value: `${agency.slaCompliance}%`, good: agency.slaCompliance >= 90 },
              { label: 'SLA Breaches', value: agency.slaBreachCount, good: agency.slaBreachCount === 0 },
              { label: 'Critical Open Cases', value: agency.criticalOpen, good: agency.criticalOpen === 0 },
              { label: 'Open Cases', value: agency.openCases, good: agency.openCases < 10 },
            ].map((m) => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{m.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: m.good ? '#22C55E' : '#EF4444' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '14px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: `Open ${AGENCY_NAMES[type]} Dashboard`, href: `http://localhost:${type === 'POLICE' ? 3001 : type === 'HOSPITAL' ? 3002 : type === 'FIRE' ? 3003 : 3004}`, target: '_blank' as const },
            ].map((action) => (
              <a key={action.label} href={action.href} target={action.target} rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 16px', borderRadius: '8px', border: `1px solid ${color}`,
                  color, fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${color}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ExternalLink size={14} /> {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
