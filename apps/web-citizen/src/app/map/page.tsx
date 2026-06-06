'use client';
import { useEffect, useRef, useState } from 'react';
import { Shield, Ambulance, Flame, Search, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';

const AGENCIES = [
  { short: 'RNP', name: 'Rwanda National Police', hotline: '112', color: '#1A237E', icon: <Shield size={16} /> },
  { short: 'SAMU', name: 'SAMU Ambulance', hotline: '912', color: '#B71C1C', icon: <Ambulance size={16} /> },
  { short: 'Fire', name: 'Rwanda Fire Brigade', hotline: '111', color: '#BF360C', icon: <Flame size={16} /> },
];

const LOCATIONS = [
  { name: 'Kigali Police HQ', type: 'RNP', lat: -1.9441, lng: 30.0619, district: 'Nyarugenge' },
  { name: 'SAMU Kigali Central', type: 'SAMU', lat: -1.9521, lng: 30.0574, district: 'Kicukiro' },
  { name: 'Kigali Fire Station', type: 'Fire', lat: -1.9480, lng: 30.0640, district: 'Gasabo' },
  { name: 'Gasabo Police Station', type: 'RNP', lat: -1.9312, lng: 30.0874, district: 'Gasabo' },
  { name: 'King Faisal Hospital', type: 'SAMU', lat: -1.9413, lng: 30.0583, district: 'Nyarugenge' },
  { name: 'Musanze Police', type: 'RNP', lat: -1.5017, lng: 29.6348, district: 'Musanze' },
  { name: 'Rubavu Fire Station', type: 'Fire', lat: -1.6829, lng: 29.2588, district: 'Rubavu' },
  { name: 'Huye Police Station', type: 'RNP', lat: -2.5956, lng: 29.7395, district: 'Huye' },
];

const TYPE_COLORS: Record<string, string> = {
  RNP: '#1A237E',
  SAMU: '#B71C1C',
  Fire: '#BF360C',
};

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selected, setSelected] = useState<(typeof LOCATIONS)[0] | null>(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (!mapRef.current) return;
      const L = (window as any).L;

      const map = L.map(mapRef.current, {
        center: [-1.9441, 30.0619],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      LOCATIONS.forEach((loc) => {
        const color = TYPE_COLORS[loc.type] ?? '#333';
        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: 10,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:sans-serif;padding:4px 2px">
                        <p style="font-weight:700;font-size:14px;margin:0 0 2px">${loc.name}</p>
                        <p style="font-size:11px;color:#666;margin:0 0 6px">${loc.district} District</p>
                        <a href="tel:${AGENCIES.find(a => a.short === loc.type)?.hotline}" style="background:${color};color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none">
                            📞 Call ${AGENCIES.find(a => a.short === loc.type)?.hotline}
                        </a>
                    </div>`,
          { maxWidth: 200 }
        );
      });

      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const visibleLocations = filter === 'All' ? LOCATIONS : LOCATIONS.filter(l => l.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Emergency Hotline Banner */}
      <div className="bg-slate-900 text-white py-3 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6">
          {AGENCIES.map(a => (
            <a key={a.short} href={`tel:${a.hotline}`} className="flex items-center gap-2 text-sm font-bold hover:text-blue-300 transition-colors">
              <span style={{ color: a.color as string }}>{a.icon}</span>
              {a.name}: <span className="text-white">{a.hotline}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blue-700" /> Emergency Stations</h2>
            <div className="flex gap-2 flex-wrap">
              {['All', 'RNP', 'SAMU', 'Fire'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'All' ? 'All' : f === 'RNP' ? '🛡 Police' : f === 'SAMU' ? '🚑 Ambulance' : '🔥 Fire'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {visibleLocations.map((loc, i) => {
              const agency = AGENCIES.find(a => a.short === loc.type);
              return (
                <div key={i} onClick={() => setSelected(loc)}
                  className={`p-4 cursor-pointer hover:bg-blue-50/40 transition-colors flex items-center gap-3 ${selected?.name === loc.name ? 'bg-blue-50 border-l-4 border-blue-700' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: TYPE_COLORS[loc.type] }}>
                    {loc.type === 'RNP' ? '🛡' : loc.type === 'SAMU' ? '🚑' : '🔥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{loc.name}</p>
                    <p className="text-xs text-gray-400">{loc.district} District</p>
                  </div>
                  {agency && (
                    <a href={`tel:${agency.hotline}`} onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs font-bold text-white px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: TYPE_COLORS[loc.type] }}>
                      <Phone size={10} /> {agency.hotline}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Loading map…</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
