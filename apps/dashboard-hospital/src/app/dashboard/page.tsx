'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, medicalApi } from '../../lib/apiClient';
import { useIncidentFeed } from '../../hooks/useIncidentFeed';
import { useAmbulanceFleet } from '../../hooks/useAmbulanceFleet';
import { useHospitalCapacity } from '../../hooks/useHospitalCapacity';
import { StatCard } from '../../components/stats/StatCard';
import { TriageBadge } from '../../components/incidents/TriageBadge';
import { IncidentDetail } from '../../components/incidents/IncidentDetail';
import { EmptyState } from '../../components/shared/EmptyState';
import { AMBULANCE_COLORS, BLOOD_TYPE_LABELS } from '../../constants/theme';
import { timeAgo } from '../../lib/formatters';
import Link from 'next/link';

export default function HospitalDashboard() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => dashboardApi.getStats('HOSPITAL').then(r => r.data.data) });
  const { data: blood } = useQuery({ queryKey: ['blood-bank'], queryFn: () => medicalApi.getBloodBank().then(r => r.data.data ?? []), refetchInterval: 60000 });
  const { data: feed, isLoading } = useIncidentFeed('HOSPITAL');
  const { ambulances, availableCount } = useAmbulanceFleet();
  const { totalBedsAvailable } = useHospitalCapacity();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const incidents = Array.isArray(feed) ? feed : feed?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Open Medical Cases" value={stats?.openCases ?? '—'} color="#C62828" icon="🏥" />
        <StatCard label="Immediate Triage" value={stats?.criticalOpen ?? '—'} color="#D32F2F" icon="🚨" />
        <StatCard label="Ambulances Available" value={`${availableCount} / ${ambulances.length}`} color="#22C55E" icon="🚑" />
        <StatCard label="Avg Response" value={stats?.avgResponseTimeMinutes != null ? `${stats.avgResponseTimeMinutes}m` : '—'} color="#F57C00" icon="⏱️" />
        <StatCard label="Beds Available" value={totalBedsAvailable} color="#1B5E82" icon="🛏️" />
      </div>

      {/* Feed + Ambulances */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-semibold text-gray-800 text-sm">Live Medical Cases</h2>
            </div>
            <Link href="/dashboard/incidents" className="text-xs text-red-600 hover:underline">View All →</Link>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : incidents.length === 0 ? (
            <EmptyState message="No medical incidents yet" icon="✅" />
          ) : (
            <div className="divide-y divide-gray-50">
              {incidents.slice(0, 8).map((inc: any) => (
                <div key={inc.id} onClick={() => setSelectedId(inc.id)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-red-50 cursor-pointer transition-colors">
                  <div>
                    <TriageBadge level={inc.medicalCase?.triageLevel ?? 'URGENT'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-red-700">{inc.trackingCode}</div>
                    <div className="text-xs text-gray-600 truncate">{inc.description?.substring(0, 60)}</div>
                  </div>
                  <div className="text-xs text-gray-400">{timeAgo(inc.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ambulance mini panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Fleet Status</h2>
            <Link href="/dashboard/dispatch" className="text-xs text-red-600 hover:underline">Dispatch →</Link>
          </div>
          <div className="px-4 py-3 grid grid-cols-3 gap-2">
            {ambulances.map((a: any) => {
              const color = AMBULANCE_COLORS[a.status] ?? '#94A3B8';
              return (
                <div key={a.id} className="flex flex-col items-center p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                  title={`${a.callSign} — ${a.status}`}>
                  <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: color }} />
                  <div className="text-[10px] font-bold text-gray-600">{a.callSign}</div>
                </div>
              );
            })}
            {ambulances.length === 0 && <div className="col-span-3 py-4 text-center text-gray-400 text-xs">No ambulances</div>}
          </div>
        </div>
      </div>

      {/* Blood bank */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 text-sm">Blood Bank Status</h2>
          <Link href="/dashboard/capacity" className="text-xs text-red-600 hover:underline">Full Capacity →</Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(blood ?? []).map((b: any) => {
            const color = b.status === 'CRITICAL' ? '#EF4444' : b.status === 'LOW' ? '#F59E0B' : '#22C55E';
            const icon = b.status === 'CRITICAL' ? '❌' : b.status === 'LOW' ? '⚠️' : '✅';
            return (
              <div key={b.type} className="flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor: color + '40', backgroundColor: color + '08' }}>
                <span>{icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color }}>{BLOOD_TYPE_LABELS[b.type] ?? b.type}</div>
                  <div className="text-xs text-gray-500">{b.units} units</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedId && <IncidentDetail incidentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
