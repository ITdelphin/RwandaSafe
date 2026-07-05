'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminApi.getAuditLogs({ page, limit: 50 }).then((r: any) => r.data.data),
    refetchInterval: 30000,
  });

  const logs = Array.isArray(data) ? data : data?.data ?? [];
  const total = data?.total ?? logs.length;

  const ACTION_COLORS: Record<string, string> = {
    CREATE: '#34A853',
    UPDATE: '#1a73e8',
    DELETE: '#d93025',
    LOGIN: '#9334E6',
    LOGOUT: '#5f6368',
    SUSPEND: '#E8710A',
    ACTIVATE: '#22C55E',
    APPROVE: '#34A853',
    REJECT: '#d93025',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-800">Audit Logs</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : logs.length === 0 ? (
          <EmptyState message="No audit logs" icon="📋" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                  <th className="text-left px-5 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 text-sm border-b border-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-gray-800">{log.userName ?? log.userEmail ?? '—'}</div>
                      <div className="text-[11px] text-gray-400">{log.userRole ?? ''}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                        backgroundColor: (ACTION_COLORS[log.action] ?? '#5f6368') + '15',
                        color: ACTION_COLORS[log.action] ?? '#5f6368',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 max-w-xs truncate">{log.details ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Total: {total} entries</div>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            Previous
          </button>
          <button onClick={() => setPage(p => p + 1)}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
