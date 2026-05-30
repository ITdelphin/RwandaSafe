'use client';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     'bg-gray-500',
  UNDER_REVIEW: 'bg-blue-600',
  ASSIGNED:     'bg-purple-700',
  DISPATCHED:   'bg-orange-500',
  ON_SCENE:     'bg-orange-700',
  RESOLVED:     'bg-green-600',
  CLOSED:       'bg-slate-600',
  CANCELLED:    'bg-gray-400',
};

export function StatusTimeline({ history }: { history: any[] }) {
  return (
    <div className="space-y-3">
      {history.map((h, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[h.newStatus] ?? 'bg-gray-400'} mt-1`} />
            {i < history.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
          </div>
          <div className="pb-4">
            <p className="font-semibold text-gray-800">{h.newStatus.replace(/_/g, ' ')}</p>
            {h.note && <p className="text-sm text-gray-500">{h.note}</p>}
            <p className="text-xs text-gray-400 mt-1">{new Date(h.changedAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
