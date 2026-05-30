'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useIncidentFeed } from '../../hooks/useIncidentFeed';
import { fireApi } from '../../lib/apiClient';
import { StatCard } from '../../components/stats/StatCard';
import { IncidentRow } from '../../components/incidents/IncidentRow';
import { IncidentDetail } from '../../components/incidents/IncidentDetail';
import { EmptyState } from '../../components/shared/EmptyState';
import { UNIT_COLORS, FIRE_TYPE_ICONS } from '../../constants/theme';
import Link from 'next/link';

function UnitStatusCard({ unit }: { unit: any }) {
  const color = UNIT_COLORS[unit.status] ?? '#64748B';
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="font-semibold text-sm text-gray-800">{unit.callSign}</div>
        <div className="text-xs text-gray-500">{unit.unitType}</div>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {unit.status}
      </span>
    </div>
  );
}

export default function FireDashboardPage() {
  const { data: stats } = useDashboardStats('FIRE');
  const { data: feed, isLoading: feedLoading, newCount, resetNewCount } = useIncidentFeed('FIRE');
  const { data: units = [] } = useQuery({
    queryKey: ['fire-units'],
    queryFn: () => fireApi.getUnits().then(r => (r.data as any).data ?? []),
    refetchInterval: 30000,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const incidents = Array.isArray(feed) ? feed : (feed as any)?.data ?? [];

  const deployedCount = units.filter((u: any) => ['RESPONDING', 'ON_SCENE'].includes(u.status)).length;
  const totalUnits = units.length;

  return (
    <div className="space-y-6">
      {/* New incident toast */}
      {newCount > 0 && (
        <div className="bg-orange-600 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">🔥 {newCount} new fire incident{newCount > 1 ? 's' : ''} received</span>
          <button onClick={resetNewCount} className="text-xs underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Active Fire Incidents" value={stats?.openCases ?? '—'} color="#EA580C" icon="🔥" />
        <StatCard label="Units Deployed" value={`${deployedCount}/${totalUnits}`} color="#EF4444" icon="🚒" />
        <StatCard label="Hazmat Incidents Today" value={stats?.hazmatToday ?? '—'} color="#7C3AED" icon="☣️" />
        <StatCard label="Avg Response Time" value={stats?.avgResponseTimeMinutes != null ? `${stats.avgResponseTimeMinutes}m` : '—'} color="#F59E0B" icon="⏱️" />
        <StatCard label="Post-Reports Pending" value={stats?.postReportsPending ?? '—'} color="#64748B" icon="📋" />
      </div>

      {/* Live Feed + Units */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Fire Incident Feed (65%) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-semibold text-gray-800 text-sm">Live Fire Incidents</h2>
            </div>
            <Link href="/dashboard/incidents" className="text-xs text-orange-600 hover:underline">View All →</Link>
          </div>
          {feedLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : incidents.length === 0 ? (
            <EmptyState message="No active fire incidents" icon="✅" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {incidents.slice(0, 10).map((inc: any) => (
                    <IncidentRow key={inc.id} incident={inc} onClick={() => setSelectedId(inc.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fire Units Status (35%) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Fire Units Status</h2>
            <Link href="/dashboard/dispatch" className="text-xs text-orange-600 hover:underline">Dispatch →</Link>
          </div>
          <div className="px-2 py-2">
            {units.length === 0 ? (
              <EmptyState message="No units configured" icon="🚒" />
            ) : (
              units.map((unit: any) => <UnitStatusCard key={unit.id} unit={unit} />)
            )}
          </div>
          {/* Unit type legend */}
          <div className="px-4 py-3 border-t border-gray-50">
            <div className="flex flex-wrap gap-2">
              {Object.entries(UNIT_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-500">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fire type breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Fire Types Today</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(FIRE_TYPE_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
              <span className="text-base">{icon}</span>
              <span className="text-xs text-gray-600">{type.replace(/_/g, ' ')}</span>
              <span className="text-xs font-bold text-orange-700 ml-1">
                {(stats?.byFireType ?? {})[type] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedId && <IncidentDetail incidentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
