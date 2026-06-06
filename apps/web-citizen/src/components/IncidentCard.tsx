import Link from 'next/link';
import { Car, HeartPulse, AlertOctagon, Flame, AlertTriangle, ClipboardList, Search, Wind, AlertCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     'bg-gray-100 text-gray-600',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  ASSIGNED:     'bg-purple-100 text-purple-700',
  DISPATCHED:   'bg-orange-100 text-orange-700',
  ON_SCENE:     'bg-orange-200 text-orange-800',
  RESOLVED:     'bg-green-100 text-green-700',
  CLOSED:       'bg-slate-100 text-slate-600',
  CANCELLED:    'bg-gray-100 text-gray-500',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ACCIDENT:          <Car size={24} />,
  MEDICAL_EMERGENCY: <HeartPulse size={24} />,
  CRIME:             <AlertOctagon size={24} />,
  FIRE:              <Flame size={24} />,
  GBV:               <AlertTriangle size={24} />,
  CORRUPTION:        <ClipboardList size={24} />,
  MISSING_PERSON:    <Search size={24} />,
  NATURAL_DISASTER:  <Wind size={24} />,
  OTHER:             <AlertCircle size={24} />,
};

export function IncidentCard({ incident }: { incident: any }) {
  return (
    <Link href={`/my-reports/${incident.id}`}>
      <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <span className="text-gray-600">{TYPE_ICONS[incident.type] ?? <AlertCircle size={24} />}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">{incident.trackingCode}</p>
            <p className="text-gray-500 text-xs mt-0.5">{incident.type.replace(/_/g, ' ')} {incident.district ? `· ${incident.district}` : ''}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[incident.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {incident.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-400">{new Date(incident.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
