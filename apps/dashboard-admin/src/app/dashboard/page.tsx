'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Users, Shield,
  Building2, TrendingUp,
} from 'lucide-react';

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function AgencyCard({ name, type, data }: { name: string; type: string; data: any }) {
  const score = data?.performanceScore ?? 0;
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#84CC16' : score >= 40 ? '#F59E0B' : '#EF4444';
  const agencyColors: Record<string, string> = { POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95' };
  const color = agencyColors[type] ?? '#64748B';

  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building2 size={20} color={color} />
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '15px' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '48px', height: '6px', borderRadius: '3px', background: '#E2E8F0', overflow: 'hidden',
            }}
          >
            <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', borderRadius: '3px', background: scoreColor }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor }}>{score}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#64748B' }}>
        <div>Open: <strong style={{ color: '#0F172A' }}>{data?.openCases ?? 0}</strong></div>
        <div>Resolved: <strong style={{ color: '#0F172A' }}>{data?.resolvedCases ?? 0}</strong></div>
        <div>Avg Response: <strong style={{ color: '#0F172A' }}>{data?.avgResponseTimeMinutes ?? 0} min</strong></div>
        <div>Officers: <strong style={{ color: '#0F172A' }}>{data?.onDutyCount ?? 0}/{data?.officerCount ?? 0}</strong></div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: scorecardData, isLoading: scorecardLoading } = useQuery({
    queryKey: ['admin', 'scorecard'],
    queryFn: () => adminApi.getScorecard().then((r) => r.data.data),
    refetchInterval: 300000,
  });

  const agencyNames: Record<string, string> = {
    POLICE: 'Rwanda National Police',
    HOSPITAL: 'SAMU / Hospital',
    FIRE: 'Fire Brigade',
    RIB: 'Rwanda Investigation Bureau',
  };

  if (statsLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading national statistics...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <StatCard label="Total Incidents Today" value={statsData?.totalIncidents ?? 0} icon={<Activity size={20} color="#3B82F6" />} color="#3B82F6" />
        <StatCard label="Currently Open" value={statsData?.openIncidents ?? 0} icon={<AlertTriangle size={20} color="#EF4444" />} color="#EF4444" />
        <StatCard label="Resolved Today" value={statsData?.resolvedIncidents ?? 0} icon={<CheckCircle size={20} color="#22C55E" />} color="#22C55E" />
        <StatCard label="Active Officers" value={statsData?.activeOfficers ?? 0} icon={<Users size={20} color="#14B8A6" />} color="#14B8A6" />
        <StatCard label="Total Incidents" value={statsData?.closedIncidents ?? 0} icon={<Shield size={20} color="#8B5CF6" />} color="#8B5CF6" sub="Closed cases" />
      </div>

      {/* Agency Status */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Agency Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {scorecardData?.map((a: any) => (
            <AgencyCard key={a.agency} name={agencyNames[a.agency] ?? a.agency} type={a.agency} data={a} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* By Type */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Incidents by Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statsData?.byType?.slice(0, 8).map((item: any) => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', width: '120px', flexShrink: 0 }}>{item.type.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '20px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(item._count / Math.max(...statsData.byType.map((t: any) => t._count))) * 100}%`,
                      height: '100%',
                      background: '#0F4C75',
                      borderRadius: '4px',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', width: '40px', textAlign: 'right' }}>{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By District */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Top Districts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statsData?.byDistrict?.slice(0, 8).map((item: any) => (
              <div key={item.district} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', width: '100px', flexShrink: 0 }}>{item.district ?? 'Unknown'}</span>
                <div style={{ flex: 1, height: '20px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(item._count / Math.max(...statsData.byDistrict.map((t: any) => t._count))) * 100}%`,
                      height: '100%',
                      background: '#EA580C',
                      borderRadius: '4px',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', width: '40px', textAlign: 'right' }}>{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Daily Trend (30 days)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px' }}>
          {statsData?.dailyTrend?.map((d: any) => {
            const maxCount = Math.max(...statsData.dailyTrend.map((t: any) => t.count), 1);
            const height = Math.max((d.count / maxCount) * 100, 2);
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${height}%`,
                    background: d.count > 0 ? '#0F4C75' : '#E2E8F0',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s',
                    minHeight: '2px',
                    opacity: d.count > 0 ? 0.6 + (d.count / maxCount) * 0.4 : 0.3,
                  }}
                  title={`${d.date}: ${d.count}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
