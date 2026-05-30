'use client';
import { useState } from 'react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useIncidentFeed } from '../../hooks/useIncidentFeed';
import { useOnDutyOfficers } from '../../hooks/useOfficers';
import { StatCard } from '../../components/stats/StatCard';
import { StatusBreakdown } from '../../components/stats/StatusBreakdown';
import { TypeBreakdown } from '../../components/stats/TypeBreakdown';
import { IncidentRow } from '../../components/incidents/IncidentRow';
import { IncidentDetail } from '../../components/incidents/IncidentDetail';
import { OfficerCard } from '../../components/officers/OfficerCard';
import { EmptyState } from '../../components/shared/EmptyState';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();
  const { data: feed, isLoading: feedLoading, newCount, resetNewCount } = useIncidentFeed();
  const { data: officers = [] } = useOnDutyOfficers();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const incidents = Array.isArray(feed) ? feed : feed?.data ?? [];

  return (
    <div className="space-y-6">
      {/* New incident toast */}
      {newCount > 0 && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">🚨 {newCount} new incident{newCount > 1 ? 's' : ''} received</span>
          <button onClick={resetNewCount} className="text-xs underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Open Cases" value={stats?.openCases ?? '—'} color="#1B5E82" icon="📂" />
        <StatCard label="Critical Open" value={stats?.criticalOpen ?? '—'} color="#D32F2F" icon="🚨" />
        <StatCard label="Received Today" value={stats?.totalToday ?? '—'} color="#7B1FA2" icon="📥" />
        <StatCard label="Resolved Today" value={stats?.resolvedToday ?? '—'} color="#22C55E" icon="✅" />
        <StatCard label="Avg Response" value={stats?.avgResponseTimeMinutes != null ? `${stats.avgResponseTimeMinutes}m` : '—'} color="#F57C00" icon="⏱️" />
      </div>

      {/* Live Feed + Officers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Incident Feed */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-semibold text-gray-800 text-sm">Live Incidents</h2>
            </div>
            <Link href="/dashboard/incidents" className="text-xs text-blue-600 hover:underline">View All →</Link>
          </div>
          {feedLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : incidents.length === 0 ? (
            <EmptyState message="No incidents yet" icon="✅" />
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

        {/* Officers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">On-Duty Officers</h2>
            <Link href="/dashboard/officers" className="text-xs text-blue-600 hover:underline">Manage →</Link>
          </div>
          <div className="px-4 py-2 divide-y divide-gray-50">
            {officers.length === 0 ? (
              <EmptyState message="No officers on duty" icon="👮" />
            ) : (
              officers.map((o: any) => <OfficerCard key={o.id} officer={o} compact />)
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TypeBreakdown data={stats?.byType ?? {}} />
        <StatusBreakdown data={stats?.byStatus ?? {}} />
      </div>

      {selectedId && <IncidentDetail incidentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
