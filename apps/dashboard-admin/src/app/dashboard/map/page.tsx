'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery, BREAKPOINTS } from '../../../hooks/useMediaQuery';
import { adminApi } from '../../../lib/apiClient';
import { timeAgo } from '../../../lib/formatters';
import { MapPin, Filter, X } from 'lucide-react';

const AGENCY_COLORS: Record<string, string> = {
  POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95',
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
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [showFilters, setShowFilters] = useState(!isMobile);
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

  const Toggle = ({ label, checked, color, onChange }: { label: string; checked: boolean; color?: string; onChange: () => void }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#64748B', padding: '3px 0' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: color ?? '#0F4C75' }} />
      <span style={{ fontWeight: checked ? 600 : 400, color: checked ? '#0F172A' : '#94A3B8' }}>{label}</span>
    </label>
  );

  const filterPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Visible: <strong style={{ color: '#0F172A' }}>{filtered.length}</strong> incidents
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
          Active: <strong style={{ color: '#0F172A' }}>{activeCount}</strong>
          {' | '}Critical: <strong style={{ color: '#EF4444' }}>{criticalCount}</strong>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agencies</h4>
        {Object.entries(AGENCY_COLORS).map(([key, color]) => (
          <Toggle key={key} label={key} checked={filterAgencies[key]} color={color} onChange={() => setFilterAgencies((p) => ({ ...p, [key]: !p[key] }))} />
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity</h4>
        {SEVERITY_ORDER.map((s) => (
          <Toggle key={s} label={s} checked={filterSeverity[s]} onChange={() => setFilterSeverity((p) => ({ ...p, [s]: !p[s] }))} />
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>District</h4>
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#0F172A', background: '#F8FAFC', outline: 'none' }}>
          <option value="">All Districts</option>
          {RWANDA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </div>
  );

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Loading map data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px', height: isMobile ? 'auto' : 'calc(100vh - 110px)' }}>
      {/* Mobile filter toggle */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
            borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff',
            color: '#0F4C75', fontSize: '12px', fontWeight: 600, cursor: 'pointer', width: 'fit-content',
          }}
        >
          <Filter size={14} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      )}

      {/* Filters panel */}
      {(!isMobile || showFilters) && (
        <div style={{
          width: isMobile ? '100%' : '260px', flexShrink: 0,
          display: isMobile ? 'block' : 'flex', flexDirection: 'column', gap: '12px',
          maxHeight: isMobile ? 'none' : '100%', overflowY: 'auto',
          position: 'relative',
        }}>
          {isMobile && (
            <button onClick={() => setShowFilters(false)} style={{ position: 'absolute', top: '0', right: '0', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', zIndex: 1 }}>
              <X size={16} />
            </button>
          )}
          {filterPanel}
        </div>
      )}

      {/* Map Area */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        minHeight: isMobile ? '400px' : 'auto',
      }}>
        <div style={{
          flex: 1, background: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>
            <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748B' }}>Interactive Map</p>
            <p style={{ fontSize: '12px' }}>Google Maps integration</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>
              <strong>{filtered.length}</strong> incidents loaded — Add your Google Maps API key to display
            </p>
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #E2E8F0', fontSize: '11px', color: '#94A3B8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>Auto-refreshes every 30s</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
