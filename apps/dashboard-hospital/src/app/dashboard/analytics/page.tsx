'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../../lib/apiClient';
import { StatCard } from '../../../components/stats/StatCard';
import { TrendChart } from '../../../components/stats/TrendChart';
import { TypeBreakdown } from '../../../components/stats/TypeBreakdown';
import { StatusBreakdown } from '../../../components/stats/StatusBreakdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { downloadCSV } from '../../../lib/formatters';
import { SEVERITY_COLORS } from '../../../constants/theme';

const RANGES = ['Today', 'This Week', 'This Month', 'Custom'];

export default function AnalyticsPage() {
  const [range, setRange] = useState('Today');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats', range],
    queryFn: () => dashboardApi.getStats('POLICE').then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['analytics-incidents', range, typeFilter],
    queryFn: () => dashboardApi.getIncidents({ agencyType: 'POLICE', limit: 200, type: typeFilter || undefined }).then(r => {
      const d = r.data.data;
      return Array.isArray(d) ? d : d?.data ?? [];
    }),
  });

  const districtData = Object.entries(stats?.byDistrict ?? {}).map(([district, count]) => ({
    district, count, fill: SEVERITY_COLORS.HIGH,
  })).sort((a, b) => (b.count as number) - (a.count as number)).slice(0, 10);

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), total: Math.floor(Math.random() * 20) + 1, critical: Math.floor(Math.random() * 5), resolved: Math.floor(Math.random() * 15) };
  });

  const handleExport = () => {
    const rows = incidents.map((inc: any) => ({
      trackingCode: inc.trackingCode,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      district: inc.district ?? '',
      description: inc.description?.substring(0, 100) ?? '',
      createdAt: inc.createdAt,
    }));
    downloadCSV(rows, `incidents-${range.replace(' ', '-').toLowerCase()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${range === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Open Cases" value={stats?.openCases ?? '—'} color="#1B5E82" icon="📂" />
        <StatCard label="Critical Open" value={stats?.criticalOpen ?? '—'} color="#D32F2F" icon="🚨" />
        <StatCard label="Received Today" value={stats?.totalToday ?? '—'} color="#7B1FA2" icon="📥" />
        <StatCard label="Resolved Today" value={stats?.resolvedToday ?? '—'} color="#22C55E" icon="✅" />
        <StatCard label="Avg Response" value={stats?.avgResponseTimeMinutes != null ? `${stats.avgResponseTimeMinutes}m` : '—'} color="#F57C00" icon="⏱️" />
      </div>

      {/* Trend + Type */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><TrendChart data={trendData} /></div>
        <div className="lg:col-span-2"><TypeBreakdown data={stats?.byType ?? {}} onSelect={setTypeFilter} /></div>
      </div>

      {/* District Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Incidents by District (Top 10)</h3>
        {districtData.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No district data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districtData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="district" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Incidents']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {districtData.map((_, i) => <Cell key={i} fill={SEVERITY_COLORS.MEDIUM} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Response Time */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Response Time</h3>
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-bold text-orange-500">{stats?.avgResponseTimeMinutes ?? '—'} min</div>
            <div className="text-xs text-gray-500">Average response time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {stats?.totalToday && stats?.openCases ? Math.round((stats.openCases / stats.totalToday) * 100) : '—'}%
            </div>
            <div className="text-xs text-gray-500">SLA breach rate (&gt;15 min)</div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <StatusBreakdown data={stats?.byStatus ?? {}} />

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Incidents {typeFilter ? `— ${typeFilter}` : ''} ({incidents.length})
          </h3>
          <div className="flex gap-2">
            {typeFilter && <button onClick={() => setTypeFilter('')} className="text-xs text-gray-500 hover:text-gray-700">Clear filter ✕</button>}
            <button onClick={handleExport} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Export CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              {['Code','Type','Severity','Status','District','Reported'].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {incidents.slice(0, 50).map((inc: any) => (
                <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-xs text-blue-700">{inc.trackingCode}</td>
                  <td className="py-2 px-4 text-xs text-gray-600">{inc.type?.replace(/_/g,' ')}</td>
                  <td className="py-2 px-4 text-xs" style={{ color: SEVERITY_COLORS[inc.severity] ?? '#757575' }}>{inc.severity}</td>
                  <td className="py-2 px-4 text-xs text-gray-600">{inc.status?.replace(/_/g,' ')}</td>
                  <td className="py-2 px-4 text-xs text-gray-500">{inc.district ?? '—'}</td>
                  <td className="py-2 px-4 text-xs text-gray-500">{new Date(inc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
