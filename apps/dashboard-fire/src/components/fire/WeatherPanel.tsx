'use client';
import { useQuery } from '@tanstack/react-query';
import { fireApi } from '../../lib/apiClient';

interface Props {
  incidentId: string;
}

export function WeatherPanel({ incidentId }: Props) {
  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather', incidentId],
    queryFn: () => fireApi.getWeather(incidentId).then(r => (r.data as any).data),
    enabled: !!incidentId,
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-32 bg-sky-200 rounded mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-sky-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const windDeg = weather.windDirection ?? 0;
  const windSpeed = weather.windSpeed ?? 0;
  const isHighWind = windSpeed > 30;

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-sky-800 uppercase tracking-wide">Weather Conditions</h4>
        <span className="text-xs text-sky-600">{weather.conditions ?? 'Unknown'}</span>
      </div>

      {isHighWind && (
        <div className="mb-3 bg-red-100 border border-red-300 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <span className="text-xs font-semibold text-red-700">HIGH WIND WARNING — Fire spread risk elevated</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-sky-100">
          <div className="text-xs text-gray-500 mb-1">Temperature</div>
          <div className="text-base font-bold text-gray-800">{weather.temperature ?? '—'}°C</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-sky-100">
          <div className="text-xs text-gray-500 mb-1">Humidity</div>
          <div className="text-base font-bold text-gray-800">{weather.humidity ?? '—'}%</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-sky-100">
          <div className="text-xs text-gray-500 mb-1">Wind Speed</div>
          <div className={`text-base font-bold ${isHighWind ? 'text-red-600' : 'text-gray-800'}`}>
            {windSpeed} km/h
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-sky-100">
          <div className="text-xs text-gray-500 mb-1">Wind Direction</div>
          <div className="flex items-center gap-2">
            <span
              className="text-base inline-block transition-transform"
              style={{ transform: `rotate(${windDeg}deg)` }}
            >
              ↑
            </span>
            <span className="text-sm font-bold text-gray-800">{windDeg}°</span>
          </div>
        </div>
      </div>

      {weather.visibility != null && (
        <div className="mt-2 text-xs text-sky-600">
          Visibility: {weather.visibility} km
        </div>
      )}
    </div>
  );
}
