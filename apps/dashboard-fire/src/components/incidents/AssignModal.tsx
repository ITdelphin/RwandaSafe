'use client';
import { useState } from 'react';
import { useOnDutyOfficers } from '../../hooks/useOfficers';
import { incidentsApi } from '../../lib/apiClient';

interface Props {
  incidentId: string;
  trackingCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignModal({ incidentId, trackingCode, onClose, onSuccess }: Props) {
  const { data: officers = [] } = useOnDutyOfficers();
  const [officerId, setOfficerId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!officerId) { setError('Please select an officer'); return; }
    setLoading(true);
    try {
      await incidentsApi.assign(incidentId, { officerId, notes });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Incident</h2>
        <p className="text-xs text-gray-500 mb-5 font-mono">{trackingCode}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Officer</label>
          <select value={officerId} onChange={e => setOfficerId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
            <option value="">-- Choose officer --</option>
            {officers.map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.badgeNumber ? `[${o.badgeNumber}] ` : ''}{o.user?.name ?? 'Officer'} — {o.openCasesCount ?? 0} open cases
                {(o.openCasesCount ?? 0) >= 3 ? ' ⚠️' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            placeholder="Any instructions for the officer?" />
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
