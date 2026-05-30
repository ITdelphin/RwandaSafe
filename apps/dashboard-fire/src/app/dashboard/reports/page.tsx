'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../../lib/apiClient';
import { RWANDA_DISTRICTS, FIRE_TYPE_ICONS } from '../../../constants/theme';
import { formatDate } from '../../../lib/formatters';

const FIRE_TYPES = Object.keys(FIRE_TYPE_ICONS);

export default function ReportsPage() {
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    fireType?: string;
    district?: string;
  }>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['fire-reports', filters],
    queryFn: () => fireApi.getReports(filters).then(r => (r.data as any).data ?? []),
  });

  const reports: any[] = Array.isArray(data) ? data : (data as any)?.reports ?? [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => setFilters({});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fire Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Post-incident reports and fire documentation</p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs px-3 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={e => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={e => handleFilterChange('dateTo', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fire Type</label>
            <select
              value={filters.fireType ?? ''}
              onChange={e => handleFilterChange('fireType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            >
              <option value="">All Types</option>
              {FIRE_TYPES.map(t => (
                <option key={t} value={t}>{FIRE_TYPE_ICONS[t]} {t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
            <select
              value={filters.district ?? ''}
              onChange={e => handleFilterChange('district', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
            >
              <option value="">All Districts</option>
              {RWANDA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {(filters.dateFrom || filters.dateTo || filters.fireType || filters.district) && (
          <button
            onClick={clearFilters}
            className="mt-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm font-medium">No reports found</div>
            <p className="text-xs text-gray-400 mt-1">Post-incident reports will appear here after submission</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Incident ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">District</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Fire Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Casualties</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {formatDate(report.createdAt ?? report.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {report.incidentTrackingCode ?? report.incidentId ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{report.district ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {report.fireType ? (
                        <span>
                          {FIRE_TYPE_ICONS[report.fireType] ?? '🔥'} {report.fireType.replace(/_/g, ' ')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {report.casualties != null ? report.casualties : (report.injuries != null ? `${report.injuries} inj.` : '—')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.status === 'SUBMITTED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status ?? 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
