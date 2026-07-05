'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { EmptyState } from '../../../components/shared/EmptyState';

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1a73e8',
  HOSPITAL: '#34A853',
  FIRE: '#E8710A',
  RIB: '#9334E6',
};

const AGENCY_ICONS: Record<string, string> = {
  POLICE: '🛡️',
  HOSPITAL: '🚑',
  FIRE: '🚒',
  RIB: '🔍',
};

export default function AgenciesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'POLICE', location: '', phone: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'agencies'],
    queryFn: () => adminApi.getAgencies().then((r: any) => r.data.data),
  });

  const agencies = Array.isArray(data) ? data : data?.data ?? [];

  const handleCreate = async () => {
    try {
      await adminApi.createAgency(form);
      qc.invalidateQueries({ queryKey: ['admin', 'agencies'] });
      setShowCreate(false);
      setForm({ name: '', type: 'POLICE', location: '', phone: '' });
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Agency Management</h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          + Add Agency
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">New Agency</h2>
          <div className="grid grid-cols-2 gap-4">
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Agency name" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="POLICE">Police</option>
              <option value="HOSPITAL">Hospital / SAMU</option>
              <option value="FIRE">Fire Brigade</option>
              <option value="RIB">RIB</option>
            </select>
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location" />
            <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone" />
          </div>
          <button onClick={handleCreate}
            className="mt-4 text-xs font-bold px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            Create Agency
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm col-span-2">Loading...</div>
        ) : agencies.length === 0 ? (
          <div className="col-span-2"><EmptyState message="No agencies configured" icon="🏛️" /></div>
        ) : agencies.map((a: any) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: (AGENCY_COLORS[a.type] ?? '#5f6368') + '15' }}>
                {AGENCY_ICONS[a.type] ?? '🏛️'}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{a.name}</div>
                <div className="text-xs text-gray-500">{a.type} · {a.location ?? 'No location'}</div>
              </div>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                backgroundColor: a.isActive ? '#e6f4ea' : '#fce8e6',
                color: a.isActive ? '#1B8A3C' : '#d93025',
              }}>
                {a.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-gray-800">{a.officerCount ?? 0}</div>
                <div className="text-[10px] text-gray-500">Officers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{a.activeIncidents ?? 0}</div>
                <div className="text-[10px] text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{a.resolvedIncidents ?? 0}</div>
                <div className="text-[10px] text-gray-500">Resolved</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
