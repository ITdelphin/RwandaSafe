'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { incidentsApi } from '../../../src/lib/apiClient';
import { StatusTimeline } from '../../../src/components/StatusTimeline';
import { Navbar } from '../../../src/components/Navbar';

const STATUS_STEPS = ['RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED'];

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

export default function TrackDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    incidentsApi.track(code)
      .then((r) => setIncident(r.data.data))
      .catch(() => setError('Report not found. Check your tracking code.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" /></div></div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-lg mx-auto px-6 py-16 text-center"><p className="text-red-500 text-lg">{error}</p></div></div>
  );

  const stepIndex = STATUS_STEPS.indexOf(incident?.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
          <p className="text-xs text-gray-400 mb-1">TRACKING CODE</p>
          <p className="text-3xl font-bold text-blue-800 font-mono mb-3">{incident.trackingCode}</p>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[incident.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {incident.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${i <= stepIndex ? 'bg-blue-800' : 'bg-gray-200'}`} />
                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-1 ${i < stepIndex ? 'bg-blue-800' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_STEPS.map((step) => (
              <span key={step} className="text-xs text-gray-400 text-center flex-1">{step.replace(/_/g, '\n')}</span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Status Timeline</h2>
          <StatusTimeline history={incident.statusHistory ?? []} />
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-700">
            <a href="/my-reports" className="font-semibold underline">Sign in</a> to view full details and chat with responders.
          </p>
        </div>
      </div>
    </div>
  );
}
