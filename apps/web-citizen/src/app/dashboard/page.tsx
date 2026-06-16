'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { incidentsApi, statsApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';
import {
  Activity, AlertTriangle, CheckCircle, ClipboardList,
  Shield, ArrowRight, TrendingUp, Clock,
} from 'lucide-react';

function StatCard({ label, value, icon, color, delay = 0 }: { label: string; value: string | number; icon: React.ReactNode; color: string; delay?: number }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0',
      animation: `fadeIn 0.4s ease-out ${delay}s both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function CitizenDashboardPage() {
  const { user } = useAuthStore();

  const { data: statsData } = useQuery({
    queryKey: ['citizen', 'stats'],
    queryFn: () => statsApi.getPublic().then((r: any) => r.data?.data ?? r.data),
    refetchInterval: 60000,
  });

  const { data: incidents } = useQuery({
    queryKey: ['citizen', 'incidents'],
    queryFn: () => incidentsApi.list({ limit: 5 }).then((r: any) => r.data?.data ?? r.data?.incidents ?? []),
  });

  const myIncidents = Array.isArray(incidents) ? incidents : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, #0F4C75, #1E3A5F)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
          Welcome, {user?.name ?? user?.email ?? 'Citizen'}
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          Here&apos;s your current safety overview
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`, gap: '14px' }}>
        <StatCard label="My Reports" value={myIncidents.length} icon={<ClipboardList size={20} color="#3B82F6" />} color="#3B82F6" delay={0} />
        <StatCard label="Active Incidents" value={statsData?.openIncidents ?? statsData?.activeIncidents ?? 0} icon={<AlertTriangle size={20} color="#EF4444" />} color="#EF4444" delay={0.05} />
        <StatCard label="Resolved" value={statsData?.resolvedIncidents ?? statsData?.closedIncidents ?? 0} icon={<CheckCircle size={20} color="#22C55E" />} color="#22C55E" delay={0.1} />
        <StatCard label="Avg Response" value={statsData?.avgResponseTimeMinutes ? `${statsData.avgResponseTimeMinutes}m` : '--'} icon={<Clock size={20} color="#8B5CF6" />} color="#8B5CF6" delay={0.15} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/report" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color="#EF4444" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Report an Incident</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Submit a new emergency report</div>
            </div>
            <ArrowRight size={18} color="#94A3B8" />
          </div>
        </Link>
        <Link href="/my-reports" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={22} color="#3B82F6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>My Reports</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>View all your submitted reports</div>
            </div>
            <ArrowRight size={18} color="#94A3B8" />
          </div>
        </Link>
      </div>

      {/* Recent Reports */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Activity size={16} color="#0F4C75" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Recent Reports</h3>
        </div>
        {myIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '13px' }}>
            No reports yet. Stay safe!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myIncidents.slice(0, 5).map((inc: any) => (
              <Link key={inc.id} href={`/my-reports/${inc.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{inc.type?.replace(/_/g, ' ') ?? 'Incident'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : ''} · {inc.district ?? ''}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: inc.status === 'RESOLVED' ? '#F0FDF4' : inc.status === 'OPEN' ? '#FEF2F2' : '#FFF7ED', color: inc.status === 'RESOLVED' ? '#16A34A' : inc.status === 'OPEN' ? '#DC2626' : '#EA580C' }}>
                    {inc.status ?? 'OPEN'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {myIncidents.length > 0 && (
          <Link href="/my-reports" style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '12px', fontWeight: 600, color: '#0F4C75', textDecoration: 'none' }}>
            View all reports →
          </Link>
        )}
      </div>

      {/* Stats summary */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingUp size={16} color="#0F4C75" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Incidents by Type</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {statsData?.byType?.slice(0, 5).map((item: any) => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.type?.replace(/_/g, ' ')}</span>
                  <div style={{ flex: 1, height: '14px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(item._count / Math.max(...statsData.byType.map((t: any) => t._count))) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0F4C75, #1E3A5F)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', width: '30px', textAlign: 'right' }}>{item._count}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/map" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapIcon size={16} color="#EA580C" />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Emergency Map</h3>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', borderRadius: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <MapIcon size={24} color="#94A3B8" />
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>View emergency stations near you →</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function MapIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
