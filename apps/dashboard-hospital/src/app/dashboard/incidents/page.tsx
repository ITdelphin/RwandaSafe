'use client';
import { useState } from 'react';
import { useIncidentFeed } from '../../../hooks/useIncidentFeed';
import { IncidentRow } from '../../../components/incidents/IncidentRow';
import { IncidentFilters } from '../../../components/incidents/IncidentFilters';
import { IncidentDetail } from '../../../components/incidents/IncidentDetail';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function IncidentsPage() {
  const { data: result, isLoading, filters, setFilters, newCount, resetNewCount } = useIncidentFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const incidents = Array.isArray(result) ? result : result?.data ?? [];
  const total = result?.total ?? incidents.length;
  const totalPages = result?.totalPages ?? 1;
  const page = filters.page ?? 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Incidents</h1>
          <p className="text-xs text-gray-500 mt-0.5">{total} total</p>
        </div>
      </div>

      {newCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center justify-between mb-4 text-sm">
          <span>🚨 {newCount} new incident{newCount > 1 ? 's' : ''} received</span>
          <button onClick={resetNewCount} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <IncidentFilters filters={filters} onChange={setFilters} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : incidents.length === 0 ? (
          <EmptyState message="No incidents match your filters" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 pl-0 pr-3 w-1" />
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Code</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Description</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Reported</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Status</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">SLA</th>
                    <th className="py-3 pr-4 text-left text-xs font-semibold text-gray-500">Assigned</th>
                    <th className="py-3 text-left text-xs font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc: any) => (
                    <IncidentRow key={inc.id} incident={inc} onClick={() => setSelectedId(inc.id)} />
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Prev</button>
                  <button disabled={page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedId && <IncidentDetail incidentId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
