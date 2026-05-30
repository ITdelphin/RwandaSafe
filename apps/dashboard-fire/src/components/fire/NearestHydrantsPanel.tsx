'use client';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../lib/apiClient';

interface Props {
  incidentId: string;
}

export function NearestHydrantsPanel({ incidentId }: Props) {
  const { data: hydrants, isLoading } = useQuery({
    queryKey: ['hydrants', incidentId],
    queryFn: () => fireApi.getHydrants(incidentId).then(r => (r.data as any).data),
    enabled: !!incidentId,
  });

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-40 bg-blue-200 rounded mb-3" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-blue-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (!hydrants || hydrants.length === 0) return null;

  const list = hydrants.slice(0, 5);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-3">
        Nearest Hydrants ({list.length})
      </h4>
      <div className="space-y-2">
        {list.map((h: any, i: number) => (
          <div key={h.id ?? i} className="bg-white rounded-lg px-3 py-2.5 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-800">{h.address ?? 'Unknown address'}</div>
              <div className="text-[11px] text-gray-500">{h.district ?? '—'}</div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-blue-700">{h.distance != null ? `${h.distance}m` : '—'}</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  h.operational ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {h.operational ? 'Operational' : 'Out of service'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
