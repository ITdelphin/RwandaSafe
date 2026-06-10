'use client';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery, BREAKPOINTS } from '../../hooks/useMediaQuery';
import { adminApi } from '../../lib/apiClient';
import AnimatedCounter from '../../components/AnimatedCounter';
import {
  Activity, AlertTriangle, CheckCircle, Users, Shield,
  Building2, TrendingUp, Clock,
} from 'lucide-react';

function StatCard({ label, value, icon, color, sub, delay = 0 }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string; delay?: number }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0',
      animation: `fadeIn 0.4s ease-out ${delay}s both`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </div>
      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function AgencyCard({ name, type, data }: { name: string; type: string; data: any }) {
  const score = data?.performanceScore ?? 0;
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#84CC16' : score >= 40 ? '#F59E0B' : '#EF4444';
  const agencyColors: Record<string, string> = { POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95' };
  const color = agencyColors[type] ?? '#64748B';

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0', borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color={color} />
          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '48px', height: '6px', borderRadius: '3px', background: '#E2E8F0', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', borderRadius: '3px', background: scoreColor }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor }}>{score}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '12px', color: '#64748B' }}>
        <div>Open: <strong style={{ color: '#0F172A' }}>{data?.openCases ?? 0}</strong></div>
        <div>Resolved: <strong style={{ color: '#0F172A' }}>{data?.resolvedCases ?? 0}</strong></div>
        <div>Avg Response: <strong style={{ color: '#0F172A' }}>{data?.avgResponseTimeMinutes ?? 0} min</strong></div>
        <div>Officers: <strong style={{ color: '#0F172A' }}>{data?.onDutyCount ?? 0}/{data?.officerCount ?? 0}</strong></div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const isMobile = useMediaQuery(BREAKPOINTS.md);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: scorecardData } = useQuery({
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
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`, gap: '16px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
            <div className="shimmer" style={{ width: '36px', height: '36px', borderRadius: '10px', marginBottom: '12px' }} />
            <div className="shimmer" style={{ width: '60%', height: '24px', borderRadius: '4px', marginBottom: '6px' }} />
            <div className="shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <StatCard label="Total Incidents Today" value={statsData?.totalIncidents ?? 0} icon={<Activity size={20} color="#3B82F6" />} color="#3B82F6" delay={0} />
        <StatCard label="Currently Open" value={statsData?.openIncidents ?? 0} icon={<AlertTriangle size={20} color="#EF4444" />} color="#EF4444" delay={0.05} />
        <StatCard label="Resolved Today" value={statsData?.resolvedIncidents ?? 0} icon={<CheckCircle size={20} color="#22C55E" />} color="#22C55E" delay={0.1} />
        <StatCard label="Active Officers" value={statsData?.activeOfficers ?? 0} icon={<Users size={20} color="#14B8A6" />} color="#14B8A6" delay={0.15} />
        <StatCard label="Closed Cases" value={statsData?.closedIncidents ?? 0} icon={<Shield size={20} color="#8B5CF6" />} color="#8B5CF6" sub="All time" delay={0.2} />
      </div>

      {/* Agency Status */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '10px' }}>Agency Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100%' : '280px'}, 1fr))`, gap: '12px' }}>
          {scorecardData?.map((a: any) => (
            <AgencyCard key={a.agency} name={agencyNames[a.agency] ?? a.agency} type={a.agency} data={a} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* By Type */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <TrendingUp size={16} color="#0F4C75" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Incidents by Type</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statsData?.byType?.slice(0, 8).map((item: any) => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', width: '100px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.type.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '18px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(item._count / Math.max(...statsData.byType.map((t: any) => t._count))) * 100}%`,
                    height: '100%', background: 'linear-gradient(90deg, #0F4C75, #1E3A5F)',
                    borderRadius: '4px', transition: 'width 0.6s ease-out',
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', width: '36px', textAlign: 'right' }}>{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By District */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <MapPinIcon size={16} color="#EA580C" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Top Districts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statsData?.byDistrict?.slice(0, 8).map((item: any) => (
              <div key={item.district} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', width: '90px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.district ?? 'Unknown'}</span>
                <div style={{ flex: 1, height: '18px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(item._count / Math.max(...statsData.byDistrict.map((t: any) => t._count))) * 100}%`,
                    height: '100%', background: 'linear-gradient(90deg, #EA580C, #F97316)',
                    borderRadius: '4px', transition: 'width 0.6s ease-out',
                  }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', width: '36px', textAlign: 'right' }}>{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={16} color="#0F4C75" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Daily Trend (30 days)</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px' }}>
          {statsData?.dailyTrend?.map((d: any) => {
            const maxCount = Math.max(...statsData.dailyTrend.map((t: any) => t.count), 1);
            const h = Math.max((d.count / maxCount) * 100, 2);
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>
                <div
                  style={{
                    width: '100%', height: `${h}%`,
                    background: d.count > 0 ? 'linear-gradient(180deg, #1E3A5F, #0F4C75)' : '#E2E8F0',
                    borderRadius: '2px 2px 0 0', transition: 'height 0.3s',
                    minHeight: '2px', opacity: d.count > 0 ? 0.6 + (d.count / maxCount) * 0.4 : 0.3,
                    cursor: 'pointer',
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

function MapPinIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
