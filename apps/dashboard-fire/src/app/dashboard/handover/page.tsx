'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { dashboardApi, officersApi } from '../../../lib/apiClient';
import { useAuthStore } from '../../../store/authStore';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { SeverityBadge } from '../../../components/shared/SeverityBadge';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function HandoverPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: handoverData } = useQuery({
    queryKey: ['latest-handover'],
    queryFn: () => dashboardApi.getLatestHandover().then(r => (r.data as any).data),
  });

  const { data: openCases = [] } = useQuery({
    queryKey: ['my-open-cases'],
    queryFn: () => dashboardApi.getIncidents({ agencyType: 'FIRE', status: 'ASSIGNED', limit: 50 }).then(r => {
      const d = (r.data as any).data;
      return Array.isArray(d) ? d : d?.data ?? [];
    }),
  });

  const handoverMutation = useMutation({
    mutationFn: async () => {
      await dashboardApi.createHandover({ summary });
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => { logout(); router.push('/login'); }, 2000);
    },
    onError: (e: any) => setError(e.response?.data?.message ?? 'Failed to submit handover'),
  });

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Handover Complete</h2>
        <p className="text-sm text-gray-500">You are now off duty. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Shift Handover</h1>

      {/* Open Cases */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Your Open Cases ({openCases.length})</h2>
        </div>
        {openCases.length === 0 ? (
          <EmptyState message="No open cases assigned to you" icon="✅" />
        ) : (
          <div className="divide-y divide-gray-50">
            {openCases.map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-xs text-blue-700 font-bold">{inc.trackingCode}</span>
                <span className="text-xs text-gray-600 flex-1 truncate">{inc.type?.replace(/_/g,' ')}</span>
                <SeverityBadge severity={inc.severity} />
                <StatusBadge status={inc.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handover form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Handover Notes</h2>
        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none mb-4"
          placeholder="Describe any ongoing situations, key cases to watch, etc." />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button onClick={() => handoverMutation.mutate()} disabled={!summary.trim() || handoverMutation.isPending}
          className="w-full py-3 text-sm text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#1B5E82' }}>
          {handoverMutation.isPending ? 'Submitting...' : 'Complete Handover & Go Off Duty'}
        </button>
      </div>

      {/* Previous handovers */}
      {handoverData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Last Handover</h2>
          <p className="text-xs text-gray-500 mb-2">{new Date(handoverData.createdAt).toLocaleString()}</p>
          <p className="text-sm text-gray-700">{handoverData.summary}</p>
          <p className="text-xs text-gray-400 mt-2">{handoverData.openCaseIds?.length ?? 0} cases transferred</p>
        </div>
      )}
    </div>
  );
}
