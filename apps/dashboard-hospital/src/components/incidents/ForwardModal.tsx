'use client';
import { useState } from 'react';
import { dashboardApi } from '../../lib/apiClient';

interface Props {
  incidentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AGENCIES = [
  { key: 'HOSPITAL', label: 'Hospital / SAMU', icon: '🏥', desc: 'For medical emergencies at the scene' },
  { key: 'FIRE',     label: 'Fire Brigade',    icon: '🚒', desc: 'For fire or hazmat at the scene' },
  { key: 'RIB',      label: 'RIB',             icon: '🔍', desc: 'For serious crimes requiring investigation' },
];

export function ForwardModal({ incidentId, onClose, onSuccess }: Props) {
  const [targetAgency, setTargetAgency] = useState('');
  const [note, setNote] = useState('');
  const [keepOpen, setKeepOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!targetAgency) { setError('Select an agency'); return; }
    if (!note.trim()) { setError('Please provide a reason'); return; }
    setLoading(true);
    try {
      await dashboardApi.forwardIncident({ incidentId, targetAgency, note });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to forward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Forward to Another Agency</h2>

        <div className="mb-4 space-y-2">
          {AGENCIES.map(a => (
            <label key={a.key}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: targetAgency === a.key ? '#1B5E82' : '#E2E8F0', backgroundColor: targetAgency === a.key ? '#EFF6FF' : '' }}>
              <input type="radio" name="agency" value={a.key} checked={targetAgency === a.key}
                onChange={() => setTargetAgency(a.key)} className="accent-blue-600" />
              <span className="text-xl">{a.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-800">{a.label}</div>
                <div className="text-xs text-gray-500">{a.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            placeholder="Why are you forwarding this case?" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 mb-5 cursor-pointer">
          <input type="checkbox" checked={keepOpen} onChange={e => setKeepOpen(e.target.checked)} className="accent-blue-600" />
          Keep this case open in Police dashboard as well
        </label>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Forwarding...' : 'Forward'}
          </button>
        </div>
      </div>
    </div>
  );
}
