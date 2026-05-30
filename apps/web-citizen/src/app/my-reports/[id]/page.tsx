'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { incidentsApi } from '../../../lib/apiClient';
import { StatusTimeline } from '../../../components/StatusTimeline';
import { ChatBox } from '../../../components/ChatBox';
import { Navbar } from '../../../components/Navbar';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     'bg-gray-100 text-gray-600',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  ASSIGNED:     'bg-purple-100 text-purple-700',
  DISPATCHED:   'bg-orange-100 text-orange-700',
  ON_SCENE:     'bg-orange-200 text-orange-800',
  RESOLVED:     'bg-green-100 text-green-700',
  CLOSED:       'bg-slate-100 text-slate-600',
  CANCELLED:    'bg-gray-100 text-gray-400',
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      incidentsApi.getById(id).then((r) => r.data.data),
      incidentsApi.getNotes(id).then((r) => r.data.data),
    ])
      .then(([inc, nts]) => { setIncident(inc); setNotes(nts ?? []); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" /></div></div>
  );
  if (!incident) return null;

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') ?? '' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">TRACKING CODE</p>
              <p className="text-2xl font-bold text-blue-800 font-mono">{incident.trackingCode}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[incident.status] ?? ''}`}>
              {incident.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>{incident.type.replace(/_/g, ' ')}</span>
            {incident.district && <span>· {incident.district}</span>}
            <span>· {new Date(incident.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">Status Timeline</h2>
            <StatusTimeline history={incident.statusHistory ?? []} />
          </div>

          {/* Chat */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: 400 }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Messages</h2>
            </div>
            <div style={{ height: 400 }}>
              <ChatBox incidentId={id} initialNotes={notes} userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
