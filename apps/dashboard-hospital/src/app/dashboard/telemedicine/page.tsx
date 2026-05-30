'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/apiClient';
import { formatDate } from '../../../lib/formatters';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function TelemedicinePage() {
  const { data: rawSessions, isLoading, refetch } = useQuery({
    queryKey: ['telemedicine-sessions'],
    queryFn: async (): Promise<any[]> => {
      try { return (await (apiClient.get('/medical/sessions') as any)).data?.data ?? []; } catch { return []; }
    },
    refetchInterval: 30000,
  });
  const sessions: any[] = rawSessions ?? [];
  const active = sessions.filter((s: any) => ['PENDING','ACTIVE'].includes(s.status));
  const past = sessions.filter((s: any) => ['ENDED','CANCELLED'].includes(s.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Telemedicine Sessions</h1>
        <button onClick={() => refetch()} className="text-xs border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600">🔄 Refresh</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Active Sessions ({active.length})</h2>
        </div>
        {active.length === 0 ? <EmptyState message="No active telemedicine sessions" icon="💻" /> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              {['Tracking Code','Citizen','Status','Duration','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {active.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-blue-700">{s.incident?.trackingCode ?? '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{s.citizenUserId?.substring(0,12) ?? 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.startedAt ? `${Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 60000)} min` : '—'}</td>
                  <td className="py-3 px-4">
                    {s.sessionUrl && <a href={s.sessionUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Join Call</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Past Sessions ({past.length})</h2>
        </div>
        {past.length === 0 ? <EmptyState message="No past sessions" icon="📋" /> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              {['Date','Tracking Code','Status','Notes'].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {past.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-3 px-4 text-xs text-gray-500">{formatDate(s.createdAt)}</td>
                  <td className="py-3 px-4 font-mono text-xs">{s.incident?.trackingCode ?? '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.status}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
