'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ambulanceApi, medicalApi } from '../../lib/apiClient';
import { AMBULANCE_COLORS } from '../../constants/theme';

interface Props { incidentId: string; incidentLat?: number; incidentLng?: number; onClose: () => void; onSuccess: () => void; }

export function AmbulanceSelectModal({ incidentId, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: ambulances = [] } = useQuery({
    queryKey: ['ambulances-all'],
    queryFn: () => ambulanceApi.list().then(r => r.data.data ?? []),
  });

  const handleDispatch = async () => {
    if (!selected) { setError('Select an ambulance'); return; }
    setLoading(true);
    try {
      await medicalApi.dispatch(incidentId, { ambulanceId: selected });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to dispatch');
    } finally { setLoading(false); }
  };

  const available = ambulances.filter((a: any) => a.status === 'AVAILABLE');
  const unavailable = ambulances.filter((a: any) => a.status !== 'AVAILABLE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Dispatch Ambulance</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {available.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No available ambulances</p>}
          {available.map((a: any) => (
            <label key={a.id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${selected === a.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
              <input type="radio" name="amb" value={a.id} checked={selected === a.id} onChange={() => setSelected(a.id)} className="accent-red-600" />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AMBULANCE_COLORS[a.status] }} />
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{a.callSign}</div>
                <div className="text-xs text-gray-500">
                  {a.hasDefibrillator ? '⚡ Defib' : ''} {a.hasOxygen ? '💨 O₂' : ''} · Crew: {a.crewCount}
                </div>
              </div>
              <span className="text-xs font-medium text-green-600">Available</span>
            </label>
          ))}
          {unavailable.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg opacity-50">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AMBULANCE_COLORS[a.status] }} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">{a.callSign}</div>
                <div className="text-xs text-gray-400">{a.status.replace(/_/g,' ')}</div>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDispatch} disabled={loading || !selected}
            className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#C62828' }}>
            {loading ? 'Dispatching...' : `Dispatch ${selected ? ambulances.find((a: any) => a.id === selected)?.callSign : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
