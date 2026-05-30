'use client';
import { useState } from 'react';
import { investigationApi } from '../../lib/apiClient';
import { SUSPECT_STATUS_COLORS } from '../../constants/theme';

interface Props {
  investigationId: string;
  suspects: any[];
  onRefresh: () => void;
}

const SUSPECT_STATUSES = [
  'PERSON_OF_INTEREST',
  'SUSPECT',
  'CHARGED',
  'ACQUITTED',
  'CONVICTED',
];

export function SuspectPanel({ investigationId, suspects = [], onRefresh }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ alias: '', description: '', age: '', gender: '', nationality: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (suspectId: string, status: string) => {
    setUpdatingId(suspectId);
    try {
      await investigationApi.updateSuspect(suspectId, { status });
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message ?? 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddSuspect = async () => {
    if (!form.alias.trim()) { setError('Alias is required'); return; }
    setSaving(true);
    setError('');
    try {
      await investigationApi.addSuspect(investigationId, {
        alias: form.alias,
        description: form.description,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        nationality: form.nationality || undefined,
      });
      setForm({ alias: '', description: '', age: '', gender: '', nationality: '' });
      setShowAddForm(false);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to add suspect');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {suspects.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No suspects added yet</div>
      ) : (
        suspects.map((suspect: any) => {
          const statusColor = SUSPECT_STATUS_COLORS[suspect.status] ?? '#6B7280';
          return (
            <div key={suspect.id} className="bg-white border border-purple-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{suspect.alias ?? 'Unknown'}</div>
                  {suspect.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{suspect.description}</div>
                  )}
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    {suspect.age && <span>Age: {suspect.age}</span>}
                    {suspect.gender && <span>{suspect.gender}</span>}
                    {suspect.nationality && <span>{suspect.nationality}</span>}
                  </div>
                </div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                  style={{ backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40` }}
                >
                  {suspect.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <label className="text-xs text-gray-500 font-medium">Update Status:</label>
                <select
                  value={suspect.status ?? ''}
                  onChange={e => handleUpdateStatus(suspect.id, e.target.value)}
                  disabled={updatingId === suspect.id}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-purple-400"
                >
                  {SUSPECT_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {updatingId === suspect.id && <span className="text-xs text-gray-400">Updating...</span>}
              </div>
            </div>
          );
        })
      )}

      {/* Add Suspect Form */}
      {showAddForm ? (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-3">Add Suspect / Person of Interest</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Alias / Name <span className="text-red-500">*</span></label>
              <input
                value={form.alias}
                onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                placeholder="Known alias or name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                placeholder="e.g. 34"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
              >
                <option value="">Unknown</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nationality</label>
              <input
                value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
                placeholder="e.g. Rwandan"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none"
                placeholder="Physical description, known associates, etc."
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAddSuspect}
              disabled={saving}
              className="px-4 py-2 text-xs text-white rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: '#4C1D95' }}
            >
              {saving ? 'Adding...' : 'Add Suspect'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setError(''); }}
              className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 text-xs font-medium text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
        >
          + Add Suspect / Person of Interest
        </button>
      )}
    </div>
  );
}
