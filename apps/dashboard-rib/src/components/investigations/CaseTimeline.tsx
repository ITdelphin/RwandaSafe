'use client';
import { useState } from 'react';
import { investigationApi } from '../../lib/apiClient';
import { INVESTIGATION_STATUS_COLORS } from '../../constants/theme';
import { formatDate } from '../../lib/formatters';

interface Props {
  investigation: any;
  onRefresh?: () => void;
}

export function CaseTimeline({ investigation, onRefresh }: Props) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    setError('');
    try {
      await investigationApi.updateStatus(investigation.id, { note, status: investigation.status });
      setNote('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onRefresh?.();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = INVESTIGATION_STATUS_COLORS[investigation.status] ?? '#6B7280';

  const timelineEvents = [
    {
      label: 'Case Opened',
      date: investigation.openedAt ?? investigation.createdAt,
      detail: `Status: ${investigation.status?.replace(/_/g, ' ')}`,
      color: '#3B82F6',
    },
    ...(investigation.statusHistory ?? []).map((h: any) => ({
      label: `Status → ${h.newStatus?.replace(/_/g, ' ')}`,
      date: h.changedAt,
      detail: h.note ?? '',
      color: INVESTIGATION_STATUS_COLORS[h.newStatus] ?? '#6B7280',
    })),
    ...(investigation.closedAt ? [{
      label: 'Case Closed',
      date: investigation.closedAt,
      detail: investigation.closeReason ?? '',
      color: INVESTIGATION_STATUS_COLORS[investigation.status] ?? '#6B7280',
    }] : []),
  ].filter(e => e.date);

  return (
    <div className="space-y-6">
      {/* Case Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-700">{investigation.suspects?.length ?? 0}</div>
          <div className="text-xs text-gray-500">Suspects</div>
        </div>
        <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-700">{investigation.evidence?.length ?? 0}</div>
          <div className="text-xs text-gray-500">Evidence Items</div>
        </div>
        <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-700">
            {investigation.linkedIncidents?.length ?? investigation.incidentIds?.length ?? 0}
          </div>
          <div className="text-xs text-gray-500">Linked Incidents</div>
        </div>
        <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
          <span
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: statusColor + '20', color: statusColor }}
          >
            {investigation.status?.replace(/_/g, ' ')}
          </span>
          <div className="text-xs text-gray-500 mt-1">Current Status</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-purple-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Investigation Timeline</h3>
        {timelineEvents.length === 0 ? (
          <p className="text-xs text-gray-400">No timeline events yet</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-100" />
            <div className="space-y-4">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4 relative pl-8">
                  <div
                    className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{event.label}</div>
                    <div className="text-xs text-gray-400">{event.date ? formatDate(event.date) : '—'}</div>
                    {event.detail && <div className="text-xs text-gray-500 mt-0.5">{event.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Note */}
      <div className="bg-white border border-purple-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Case Note</h3>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Add an investigative note or update..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none mb-2"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        {success && <p className="text-xs text-green-600 mb-2">Note added successfully</p>}
        <button
          onClick={handleAddNote}
          disabled={saving || !note.trim()}
          className="px-4 py-2 text-xs text-white rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#4C1D95' }}
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>
    </div>
  );
}
