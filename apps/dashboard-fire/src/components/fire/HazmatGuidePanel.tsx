'use client';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../lib/apiClient';
import { HAZMAT_COLORS } from '../../constants/theme';

interface Props {
  chemicalName?: string;
}

export function HazmatGuidePanel({ chemicalName }: Props) {
  const { data: chemicals, isLoading } = useQuery({
    queryKey: ['chemicals', chemicalName],
    queryFn: () => fireApi.searchChemical(chemicalName!).then(r => (r.data as any).data),
    enabled: !!chemicalName && chemicalName.trim().length > 0,
  });

  if (!chemicalName) return null;

  if (isLoading) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-48 bg-amber-200 rounded mb-3" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-amber-100 rounded" />)}
        </div>
      </div>
    );
  }

  const chemical = Array.isArray(chemicals) ? chemicals[0] : chemicals;
  if (!chemical) return null;

  const hazmatColor = HAZMAT_COLORS[chemical.hazmatLevel] ?? '#64748B';

  const handleShareWithCrew = () => {
    const text = [
      `HAZMAT GUIDE: ${chemical.name}`,
      `Hazard Class: ${chemical.hazardClass ?? 'Unknown'}`,
      `Hazmat Level: ${chemical.hazmatLevel ?? 'Unknown'}`,
      `Fire Response: ${chemical.fireResponse ?? 'N/A'}`,
      `Evacuation Radius: ${chemical.evacuationRadius ?? 'N/A'} meters`,
      `Water Reactive: ${chemical.waterReactive ? 'YES — DO NOT USE WATER' : 'No'}`,
      `Protective Equipment: ${(chemical.protectiveEquipment ?? []).join(', ')}`,
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Hazmat Guide</h4>
        <button
          onClick={handleShareWithCrew}
          className="text-xs px-2 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Share with Crew
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">{chemical.name}</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: hazmatColor }}
          >
            {chemical.hazmatLevel ?? 'Unknown Level'}
          </span>
        </div>

        {chemical.hazardClass && (
          <div>
            <span className="text-xs text-gray-500">Hazard Class: </span>
            <span className="text-xs font-medium text-gray-800">{chemical.hazardClass}</span>
          </div>
        )}

        {chemical.waterReactive && (
          <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-2">
            <span className="text-xs font-bold text-red-700">WATER REACTIVE — Do NOT use water on this fire</span>
          </div>
        )}

        {chemical.fireResponse && (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Fire Response</div>
            <p className="text-xs text-gray-700 bg-white rounded-lg p-2 border border-amber-100">
              {chemical.fireResponse}
            </p>
          </div>
        )}

        {chemical.evacuationRadius != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Evacuation Radius:</span>
            <span className="text-xs font-bold text-orange-700">{chemical.evacuationRadius}m</span>
          </div>
        )}

        {chemical.protectiveEquipment?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Protective Equipment</div>
            <div className="flex flex-wrap gap-1">
              {chemical.protectiveEquipment.map((eq: string, i: number) => (
                <span key={i} className="text-[11px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
