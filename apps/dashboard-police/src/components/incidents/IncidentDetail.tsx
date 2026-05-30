'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../../lib/apiClient';
import { SeverityBadge } from '../shared/SeverityBadge';
import { StatusBadge } from '../shared/StatusBadge';
import { TypeIcon } from '../shared/TypeIcon';
import { SLATimer } from './SLATimer';
import { AssignModal } from './AssignModal';
import { StatusUpdateModal } from './StatusUpdateModal';
import { ForwardModal } from './ForwardModal';
import { formatDate, timeAgo } from '../../lib/formatters';

interface Props { incidentId: string; onClose: () => void; }

export function IncidentDetail({ incidentId, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'notes' | 'chat'>('notes');
  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentsApi.getById(incidentId).then(r => r.data.data),
    enabled: !!incidentId,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['incident', incidentId] });

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await incidentsApi.addNote(incidentId, { note: newNote, isInternal: tab === 'notes' });
      setNewNote('');
      refresh();
    } finally { setAddingNote(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            {isLoading ? (
              <div className="h-6 w-40 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <div className="font-mono text-base font-bold text-gray-900">{incident?.trackingCode}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <TypeIcon type={incident?.type} showLabel />
                  <SeverityBadge severity={incident?.severity} />
                  <StatusBadge status={incident?.status} />
                </div>
                <div className="mt-2">
                  <SLATimer createdAt={incident?.createdAt} status={incident?.status} />
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {!isLoading && incident && (
            <>
              {/* Info */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</h3>
                <p className="text-sm text-gray-700">{incident.description}</p>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Location</h3>
                <p className="text-sm text-gray-700">{incident.address || '—'}, {incident.district || '—'}</p>
                <a href={`https://maps.google.com/?q=${incident.latitude},${incident.longitude}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block">Open in Maps ↗</a>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Reported</div>
                  <div className="text-xs text-gray-700">{formatDate(incident.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Reporter</div>
                  <div className="text-xs text-gray-700">
                    {incident.isAnonymous ? 'Anonymous' : (incident.reporter?.name ?? incident.reporter?.phone ?? '—')}
                  </div>
                </div>
              </section>

              {/* Media */}
              {incident.media?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Evidence ({incident.media.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.media.map((m: any) => (
                      <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                        <img src={m.url} alt="evidence" className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Actions */}
              <section className="flex flex-wrap gap-2">
                <button onClick={() => setShowStatus(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Update Status
                </button>
                <button onClick={() => setShowAssign(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                  Assign Officer
                </button>
                <button onClick={() => setShowForward(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                  Forward
                </button>
              </section>

              {/* Notes/Chat */}
              <section>
                <div className="flex gap-2 mb-3">
                  {(['notes', 'chat'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${tab === t ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {t === 'notes' ? '🔒 Internal Notes' : '💬 Citizen Messages'}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {(incident.notes ?? []).filter((n: any) => tab === 'notes' ? n.isInternal : !n.isInternal).map((n: any) => (
                    <div key={n.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{n.author?.name ?? 'Officer'} · {timeAgo(n.createdAt)}</div>
                      <p className="text-xs text-gray-700">{n.note}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder={tab === 'notes' ? 'Add internal note...' : 'Send message to citizen...'}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
                  <button onClick={handleAddNote} disabled={addingNote || !newNote.trim()}
                    className="px-3 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40">
                    Send
                  </button>
                </div>
              </section>

              {/* Status History */}
              {incident.statusHistory?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Status History</h3>
                  <div className="space-y-2">
                    {incident.statusHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-gray-400">{timeAgo(h.changedAt)}</span>
                        <span>→</span>
                        <StatusBadge status={h.newStatus} />
                        {h.note && <span className="text-gray-500 truncate max-w-[140px]">{h.note}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </aside>

      {showAssign && <AssignModal incidentId={incidentId} trackingCode={incident?.trackingCode ?? ''} onClose={() => setShowAssign(false)} onSuccess={refresh} />}
      {showStatus && <StatusUpdateModal incidentId={incidentId} currentStatus={incident?.status ?? ''} onClose={() => setShowStatus(false)} onSuccess={refresh} />}
      {showForward && <ForwardModal incidentId={incidentId} onClose={() => setShowForward(false)} onSuccess={refresh} />}
    </>
  );
}
