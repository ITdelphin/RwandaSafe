'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useMapData } from '../../hooks/useMapData';
import { SEVERITY_COLORS, INCIDENT_TYPES } from '../../constants/theme';

export function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const heatmapRef = useRef<any>(null);
  const [heatMode, setHeatMode] = useState(false);
  const [filters, setFilters] = useState({ incidents: true, officers: true });

  const { data: incidents = [] } = useMapData();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';
    if (!apiKey || apiKey === 'your_google_maps_key') return;

    const loader = new (Loader as any)({ apiKey, version: 'weekly', libraries: ['visualization'] });
    (loader as any).load().then(() => {
      const google = (window as any).google;
      if (!mapRef.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: -1.9441, lng: 30.0619 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !incidents.length) return;
    const google = (window as any).google;
    if (!google) return;

    // Remove old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current.clear();

    if (heatMode) {
      const points = incidents.map((inc: any) => ({
        location: new google.maps.LatLng(inc.latitude, inc.longitude),
        weight: inc.severity === 'CRITICAL' ? 4 : inc.severity === 'HIGH' ? 3 : inc.severity === 'MEDIUM' ? 2 : 1,
      }));
      if (heatmapRef.current) heatmapRef.current.setMap(null);
      heatmapRef.current = new (google.maps as any).visualization.HeatmapLayer({ data: points, map: mapInstance.current });
      return;
    }

    if (heatmapRef.current) { heatmapRef.current.setMap(null); heatmapRef.current = null; }

    incidents.forEach((inc: any) => {
      if (!filters.incidents) return;
      const color = SEVERITY_COLORS[inc.severity] ?? '#757575';
      const typeIcon = INCIDENT_TYPES.find(t => t.key === inc.type)?.icon ?? '❗';

      const marker = new google.maps.Marker({
        position: { lat: inc.latitude, lng: inc.longitude },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: inc.trackingCode,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:4px 0">
          <b style="font-size:13px;font-family:monospace">${inc.trackingCode}</b>
          <div style="font-size:12px;margin:4px 0">${typeIcon} ${inc.type.replace(/_/g,' ')}</div>
          <div style="font-size:11px;color:#64748b">${inc.status.replace(/_/g,' ')}</div>
          <a href="/dashboard/incidents" style="font-size:11px;color:#1B5E82">Open Case →</a>
        </div>`,
      });

      marker.addListener('click', () => infoWindow.open(mapInstance.current, marker));
      markersRef.current.set(inc.id, marker);
    });
  }, [incidents, heatMode, filters]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-4 w-52">
        <h3 className="text-xs font-bold text-gray-700 mb-3">Map Controls</h3>
        <label className="flex items-center gap-2 text-xs text-gray-600 mb-2 cursor-pointer">
          <input type="checkbox" checked={filters.incidents} onChange={e => setFilters(f => ({ ...f, incidents: e.target.checked }))} className="accent-blue-600" />
          Show incidents
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-600 mb-3 cursor-pointer">
          <input type="checkbox" checked={filters.officers} onChange={e => setFilters(f => ({ ...f, officers: e.target.checked }))} className="accent-blue-600" />
          Show officers
        </label>
        <button onClick={() => setHeatMode(h => !h)}
          className={`w-full text-xs py-1.5 rounded-lg font-medium transition-colors ${heatMode ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {heatMode ? '🌡️ Heat Map On' : '🌡️ Heat Map'}
        </button>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[11px] font-semibold text-gray-500 mb-2">Legend</div>
          {[['CRITICAL','#D32F2F'],['HIGH','#F57C00'],['MEDIUM','#1976D2'],['LOW','#757575']].map(([s,c]) => (
            <div key={s} className="flex items-center gap-2 text-[11px] text-gray-600 mb-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY === 'your_google_maps_key' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-sm text-gray-600 font-medium">Google Maps API key not configured</p>
            <p className="text-xs text-gray-400 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env.local</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
