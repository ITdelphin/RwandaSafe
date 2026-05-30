'use client';
import { useState } from 'react';
import { STATUS_TRANSITIONS, STATUS_COLORS } from '../../constants/theme';
import { incidentsApi } from '../../lib/apiClient';
import { StatusBadge } from '../shared/StatusBadge';

interface Props {
  incidentId: string;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatusUpdateModal({ incidentId, currentStatus, onClose, onSuccess }: Props) {
  const validNext = STATUS_TRANSITIONS[currentStatus] ?? [];
  const [newStatus, setNewStatus] = useState(validNext[0] ?? '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!newStatus) { setError('Select a status'); return; }
    setLoading(true);
    try {
      await incidentsApi.updateStatus(incidentId, { status: newStatus, note });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs text-gray-500">Current:</span>
          <StatusBadge status={currentStatus} />
        </div>

        {validNext.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">No further status transitions available.</p>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <div className="space-y-2">
              {validNext.map(s => (
                <label key={s} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: newStatus === s ? STATUS_COLORS[s] : '#E2E8F0' }}>
                  <input type="radio" name="status" value={s} checked={newStatus === s}
                    onChange={() => setNewStatus(s)} className="accent-blue-600" />
                  <StatusBadge status={s} />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            placeholder="Add a note about this update" />
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          {validNext.length > 0 && (
            <button onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
