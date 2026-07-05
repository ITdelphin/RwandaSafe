'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { EmptyState } from '../../../components/shared/EmptyState';

export default function BroadcastsPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', severity: 'INFO', targetAgency: '' });
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: () => adminApi.getBroadcasts().then((r: any) => r.data.data),
    refetchInterval: 30000,
  });

  const broadcasts = Array.isArray(data) ? data : data?.data ?? [];

  const handleSend = async () => {
    setSending(true);
    try {
      await adminApi.createBroadcast(form);
      qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      setShowNew(false);
      setForm({ title: '', message: '', severity: 'INFO', targetAgency: '' });
    } catch {}
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteBroadcast(id);
      qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
    } catch {}
  };

  const SEVERITY_COLORS: Record<string, string> = {
    INFO: '#1a73e8',
    WARNING: '#E8710A',
    CRITICAL: '#d93025',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Broadcast Alerts</h1>
        <button onClick={() => setShowNew(!showNew)}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          + New Broadcast
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Send Broadcast</h2>
          <div className="space-y-3">
            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Alert title" />
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 min-h-[80px]"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Alert message..." />
            <div className="flex gap-3">
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
                value={form.targetAgency} onChange={(e) => setForm({ ...form, targetAgency: e.target.value })}>
                <option value="">All Agencies</option>
                <option value="POLICE">Police</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="FIRE">Fire</option>
                <option value="RIB">RIB</option>
              </select>
            </div>
            <button onClick={handleSend} disabled={sending || !form.title || !form.message}
              className="text-xs font-bold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : broadcasts.length === 0 ? (
          <EmptyState message="No broadcasts sent" icon="📢" />
        ) : (
          <div className="divide-y divide-gray-50">
            {broadcasts.map((b: any) => (
              <div key={b.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: SEVERITY_COLORS[b.severity] ?? '#5f6368' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{b.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                      backgroundColor: (SEVERITY_COLORS[b.severity] ?? '#5f6368') + '15',
                      color: SEVERITY_COLORS[b.severity] ?? '#5f6368',
                    }}>
                      {b.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{b.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>Target: {b.targetAgency ?? 'All'}</span>
                    <span>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex-shrink-0">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
