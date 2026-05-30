'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOnDutyOfficers, useAllOfficers } from '../../../hooks/useOfficers';
import { OfficerCard } from '../../../components/officers/OfficerCard';
import { EmptyState } from '../../../components/shared/EmptyState';
import { officersApi } from '../../../lib/apiClient';

export default function OfficersPage() {
  const [search, setSearch] = useState('');
  const { data: onDuty = [] } = useOnDutyOfficers();
  const { data: all = [], isLoading } = useAllOfficers(search || undefined);
  const qc = useQueryClient();

  const toggle = useMutation({
    mutationFn: (id: string) => officersApi.toggleDuty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-officers'] });
      qc.invalidateQueries({ queryKey: ['on-duty-officers'] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Officers</h1>

      {/* On-Duty Grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">On Duty ({onDuty.length})</h2>
        {onDuty.length === 0 ? (
          <EmptyState message="No officers currently on duty" icon="👮" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {onDuty.map((o: any) => <OfficerCard key={o.id} officer={o} />)}
          </div>
        )}
      </section>

      {/* All Officers Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-600">All Officers</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or badge..."
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 w-56 bg-white" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : all.length === 0 ? (
            <EmptyState message="No officers found" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name','Badge','Rank','Status','Open Cases','Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((o: any) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
                          {o.user?.name?.charAt(0) ?? 'O'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{o.user?.name ?? 'Officer'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">{o.badgeNumber ?? '—'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{o.rank ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.isOnDuty ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {o.isOnDuty ? 'On Duty' : 'Off Duty'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{o.openCasesCount ?? 0}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggle.mutate(o.id)}
                        className="text-xs text-blue-600 hover:underline">
                        {o.isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
