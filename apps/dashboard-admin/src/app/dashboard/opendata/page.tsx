'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opendataApi } from '../../../lib/apiClient';
import { useMediaQuery, BREAKPOINTS } from '../../../hooks/useMediaQuery';
import { Database, Download, BarChart3, FileJson, FileText, TrendingUp, MapPin, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

function SummaryCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function OpenDataPage() {
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['opendata', 'summary'],
    queryFn: () => opendataApi.getSummary().then((r) => r.data.data),
    refetchInterval: 300000,
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await opendataApi.exportData({ from: dateFrom, to: dateTo, format });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rwanda-safe-opendata-${dateFrom.slice(0, 7)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Database size={22} color="#0F4C75" />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Open Data</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '180px'}, 1fr))`, gap: isMobile ? '10px' : '16px' }}>
        <SummaryCard label="Current Month" value={summary?.month ?? '—'} icon={<BarChart3 size={20} color="#3B82F6" />} color="#3B82F6" />
        <SummaryCard label="Total Incidents" value={summary?.totalIncidents ?? 0} icon={<Activity size={20} color="#EF4444" />} color="#EF4444" />
        <SummaryCard label="Most Common Type" value={summary?.mostCommonType?.replace(/_/g, ' ') ?? '—'} icon={<TrendingUp size={20} color="#F59E0B" />} color="#F59E0B" />
        <SummaryCard label="Top District" value={summary?.mostAffectedDistrict ?? '—'} icon={<MapPin size={20} color="#14B8A6" />} color="#14B8A6" />
        <SummaryCard label="Resolution Rate" value={`${summary?.resolutionRate ?? 0}%`} icon={<BarChart3 size={20} color="#8B5CF6" />} color="#8B5CF6" />
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', padding: isMobile ? '18px' : '24px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Export Anonymized Data</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Download anonymized incident data for research and analysis. All personal information is removed.
        </p>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : '160px' }}>
            <label style={labelStyle}>From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : '160px' }}>
            <label style={labelStyle}>To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : '120px' }}>
            <label style={labelStyle}>Format</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setFormat('csv')}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: '8px', border: `2px solid ${format === 'csv' ? '#0F4C75' : '#E2E8F0'}`,
                  background: format === 'csv' ? `${'#0F4C75'}10` : '#F8FAFC',
                  color: format === 'csv' ? '#0F4C75' : '#64748B',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                <FileText size={14} /> CSV
              </button>
              <button onClick={() => setFormat('json')}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: '8px', border: `2px solid ${format === 'json' ? '#0F4C75' : '#E2E8F0'}`,
                  background: format === 'json' ? `${'#0F4C75'}10` : '#F8FAFC',
                  color: format === 'json' ? '#0F4C75' : '#64748B',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                <FileJson size={14} /> JSON
              </button>
            </div>
          </div>
          <div>
            <button onClick={handleExport} disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                borderRadius: '10px', border: 'none',
                background: exporting ? '#CBD5E1' : '#0F4C75',
                color: '#fff', fontSize: '13px', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer',
                width: isMobile ? '100%' : undefined, justifyContent: 'center',
              }}>
              <Download size={16} /> {exporting ? 'Exporting...' : 'Download Data'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Monthly Statistics</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>Summary for {summary?.month ?? 'current month'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Total Incidents</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{summary?.totalIncidents ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Most Common Type</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {summary?.mostCommonType?.replace(/_/g, ' ') ?? '—'}
                {summary?.mostCommonTypePercentage != null && (
                  <span style={{ fontWeight: 400, color: '#94A3B8' }}> ({summary.mostCommonTypePercentage}%)</span>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Most Affected District</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                {summary?.mostAffectedDistrict ?? '—'}
                {summary?.mostAffectedDistrictPercentage != null && (
                  <span style={{ fontWeight: 400, color: '#94A3B8' }}> ({summary.mostAffectedDistrictPercentage}%)</span>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Resolution Rate</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: summary?.resolutionRate >= 70 ? '#22C55E' : '#F59E0B' }}>
                {summary?.resolutionRate ?? 0}%
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>Data Usage</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>Open data policy information</p>
          <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.7 }}>
            <p>This data is anonymized and aggregated for public transparency. All personal identifying information has been removed.</p>
            <p>Data is available in CSV and JSON formats for research, analysis, and application development.</p>
            <p style={{ marginTop: '8px' }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 600 }}>
                License: Creative Commons Attribution 4.0
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0',
  fontSize: '13px', outline: 'none', color: '#0F172A', background: '#F8FAFC', boxSizing: 'border-box',
};
