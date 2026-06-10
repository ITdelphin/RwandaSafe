'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { timeAgo } from '../../../lib/formatters';
import { Shield, MapPin } from 'lucide-react';

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1B5E82',
  HOSPITAL: '#C62828',
  FIRE: '#EA580C',
  RIB: '#4C1D95',
};

const SEVERITY_SHAPES: Record<string, string> = {
  CRITICAL: 'star',
  HIGH: 'diamond',
  MEDIUM: 'circle',
  LOW: 'circle',
};

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const RWANDA_DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza',
  'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke',
  'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara', 'Huye', 'Kamonyi',
  'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro',
];

export default function AdminMapPage() {
  const [filterAgencies, setFilterAgencies] = useState<Record<string, boolean>>({
    POLICE: true, HOSPITAL: true, FIRE: true, RIB: true,
  });
  const [filterSeverity, setFilterSeverity] = useState<Record<string, boolean>>({
    CRITICAL: true, HIGH: true, MEDIUM: true, LOW: true,
  });
  const [filterStatus, setFilterStatus] = useState<Record<string, boolean>>({
    RECEIVED: true, UNDER_REVIEW: true, ASSIGNED: true, DISPATCHED: true, ON_SCENE: true,
  });
  const [filterDistrict, setFilterDistrict] = useState('');

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['admin', 'map'],
    queryFn: () => adminApi.getMapData().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const filtered = useMemo(() => {
    if (!incidents) return [];
    return incidents.filter((inc: any) => {
      if (!filterAgencies[inc.targetAgency ?? 'POLICE']) return false;
      if (!filterSeverity[inc.severity]) return false;
      if (!filterStatus[inc.status]) return false;
      if (filterDistrict && inc.district !== filterDistrict) return false;
      return true;
    });
  }, [incidents, filterAgencies, filterSeverity, filterStatus, filterDistrict]);

  const activeCount = filtered.filter((i: any) => i.status !== 'CLOSED' && i.status !== 'CANCELLED').length;
  const criticalCount = filtered.filter((i: any) => i.severity === 'CRITICAL').length;

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading map data...</div>;
  }

  const Toggle = ({ label, checked, color, onChange }: { label: string; checked: boolean; color?: string; onChange: () => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#64748B', padding: '4px 0' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: color ?? '#0F4C75' }} />
      <span style={{ fontWeight: checked ? 600 : 400, color: checked ? '#0F172A' : '#94A3B8' }}>{label}</span>
    </label>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left Panel */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        {/* Stats strip */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Visible: <strong style={{ color: '#0F172A' }}>{filtered.length}</strong> incidents
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Active: <strong style={{ color: '#0F172A' }}>{activeCount}</strong>
            {' | '}Critical: <strong style={{ color: '#EF4444' }}>{criticalCount}</strong>
          </div>
        </div>

        {/* Agency filter */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agencies</h4>
          {Object.entries(AGENCY_COLORS).map(([key, color]) => (
            <Toggle key={key} label={key} checked={filterAgencies[key]} color={color} onChange={() => setFilterAgencies((p) => ({ ...p, [key]: !p[key] }))} />
          ))}
        </div>

        {/* Severity filter */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</h4>
          {SEVERITY_ORDER.map((s) => (
            <Toggle key={s} label={s} checked={filterSeverity[s]} onChange={() => setFilterSeverity((p) => ({ ...p, [s]: !p[s] }))} />
          ))}
        </div>

        {/* District filter */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>District</h4>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0',
              fontSize: '12px', color: '#0F172A', background: '#F8FAFC', outline: 'none',
            }}
          >
            <option value="">All Districts</option>
            {RWANDA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Map placeholder */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center', color: '#94A3B8' }}>
            <MapPin size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748B' }}>Interactive Map</p>
            <p style={{ fontSize: '13px' }}>Google Maps integration</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              <strong>{filtered.length}</strong> incidents loaded — Add your Google Maps API key to display
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B', display: 'flex', gap: '20px' }}>
          <span>Auto-refreshes every 30s</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
