'use client';
import { AMBULANCE_COLORS } from '../../constants/theme';
import { timeAgo } from '../../lib/formatters';

interface Props { ambulances: any[]; onSelect?: (a: any) => void; }

export function AmbulanceFleetPanel({ ambulances, onSelect }: Props) {
  const available = ambulances.filter(a => a.status === 'AVAILABLE').length;
  const dispatched = ambulances.filter(a => a.status === 'DISPATCHED').length;
  const onScene = ambulances.filter(a => a.status === 'ON_SCENE').length;
  const transporting = ambulances.filter(a => a.status === 'TRANSPORTING').length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Ticker */}
      <div className="flex gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium">
        <span className="text-green-600">🟢 Available: {available}</span>
        <span className="text-yellow-600">🟡 Dispatched: {dispatched}</span>
        <span className="text-red-600">🔴 On Scene: {onScene}</span>
        <span className="text-purple-600">🟣 Transporting: {transporting}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {ambulances.map(a => {
          const color = AMBULANCE_COLORS[a.status] ?? '#94A3B8';
          return (
            <div key={a.id} onClick={() => onSelect?.(a)}
              className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-800">{a.callSign}</div>
                <div className="text-xs text-gray-500">
                  {a.status.replace(/_/g,' ')} · {timeAgo(a.lastUpdated ?? a.createdAt)}
                </div>
              </div>
              <div className="flex gap-2 text-xs text-gray-400">
                {a.hasDefibrillator && <span>⚡</span>}
                {a.hasOxygen && <span>💨</span>}
              </div>
            </div>
          );
        })}
        {ambulances.length === 0 && (
          <div className="py-8 text-center text-gray-400 text-sm">No ambulances found</div>
        )}
      </div>
    </div>
  );
}
