'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { investigationApi } from '../../../lib/apiClient';
import { INVESTIGATION_STATUS_COLORS } from '../../../constants/theme';
import { formatDate, timeAgo } from '../../../lib/formatters';
import { EmptyState } from '../../../components/shared/EmptyState';

const INVESTIGATION_STATUSES = ['OPEN', 'ACTIVE', 'SUSPENDED', 'CLOSED_SOLVED', 'CLOSED_UNSOLVED', 'REFERRED'];

interface CreateForm {
  title: string;
  description: string;
  incidentId: string;
}

export default function InvestigationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ title: '', description: '', incidentId: '' });
  const [createError, setCreateError] = useState('');

  const params: any = { limit: 50 };
  if (statusFilter) params.status = statusFilter;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (search) params.search = search;

  const { data: result, isLoading } = useQuery({
    queryKey: ['investigations', 'list', params],
    queryFn: () => investigationApi.list(params).then((r: any) => r.data?.data),
    refetchInterval: 30000,
  });

  const investigations = Array.isArray(result) ? result : result?.data ?? [];
  const total = result?.total ?? investigations.length;

  const createMutation = useMutation({
    mutationFn: () => investigationApi.create({
      title: createForm.title,
      description: createForm.description,
      ...(createForm.incidentId ? { incidentIds: [createForm.incidentId] } : {}),
    }) as Promise<any>,
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['investigations'] });
      setShowCreate(false);
      setCreateForm({ title: '', description: '', incidentId: '' });
      const newId = res.data?.data?.id;
      if (newId) router.push(`/dashboard/investigations/${newId}`);
    },
    onError: (e: any) => setCreateError(e.response?.data?.message ?? 'Failed to create'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Investigations</h1>
          <p className="text-xs text-gray-500 mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm text-white rounded-xl font-semibold"
          style={{ backgroundColor: '#4C1D95' }}
        >
          + New Investigation
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 bg-white"
        >
          <option value="">All Statuses</option>
          {INVESTIGATION_STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 bg-white"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 bg-white"
        />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-400 bg-white flex-1 min-w-[160px]"
        />

        <button
          onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); }}
          className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 bg-white"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : investigations.length === 0 ? (
          <EmptyState message="No investigations match your filters" icon="🔍" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Case #</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Title</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Lead Investigator</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Suspects</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Evidence</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Opened</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500">Updated</th>
                </tr>
              </thead>
              <tbody>
                {investigations.map((inv: any) => {
                  const statusColor = INVESTIGATION_STATUS_COLORS[inv.status] ?? '#6B7280';
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/dashboard/investigations/${inv.id}`)}
                      className="border-b border-gray-50 hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-bold text-purple-700">
                            {inv.caseNumber ?? inv.id?.slice(0, 8)}
                          </span>
                          {inv.isSensitive && <span className="text-xs">🔒</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-xs text-gray-800 font-medium truncate">{inv.title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40` }}
                        >
                          {inv.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {inv.leadInvestigator?.user?.name ?? inv.leadInvestigator?.name ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 text-center">{inv.suspects?.length ?? 0}</td>
                      <td className="py-3 px-4 text-xs text-gray-600 text-center">{inv.evidence?.length ?? 0}</td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {inv.openedAt ? timeAgo(inv.openedAt) : timeAgo(inv.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {inv.updatedAt ? timeAgo(inv.updatedAt) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">New Investigation</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  value={createForm.title}
                  onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                  placeholder="e.g. Operation Sunrise — Kigali Fraud Ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none"
                  placeholder="Brief description of the investigation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident ID (optional)</label>
                <input
                  value={createForm.incidentId}
                  onChange={e => setCreateForm(f => ({ ...f, incidentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                  placeholder="Link to an existing incident ID"
                />
              </div>
            </div>

            {createError && <p className="text-xs text-red-500 mt-3">{createError}</p>}

            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !createForm.title.trim()}
                className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: '#4C1D95' }}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Investigation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
