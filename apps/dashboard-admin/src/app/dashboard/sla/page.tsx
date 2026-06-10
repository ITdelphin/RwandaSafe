'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, slaApi } from '../../../lib/apiClient';
import { formatDateTime } from '../../../lib/formatters';
import { Gauge, Edit3, Save, X, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SLAPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'config' | 'breaches'>('config');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState(0);
  const [editWarning, setEditWarning] = useState(0);

  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['sla', 'configs'],
    queryFn: () => slaApi.getConfigs().then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: breaches, isLoading: breachesLoading } = useQuery({
    queryKey: ['sla', 'breaches'],
    queryFn: () => slaApi.getBreaches({}).then((r) => r.data.data),
    refetchInterval: 60000,
    enabled: tab === 'breaches',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, targetMinutes, warningMinutes }: { id: string; targetMinutes: number; warningMinutes: number }) =>
      slaApi.updateConfig(id, { targetMinutes, warningMinutes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla', 'configs'] });
      toast.success('SLA config updated');
      setEditingId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to update'),
  });

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditTarget(c.targetMinutes);
    setEditWarning(c.warningMinutes);
  };

  const handleSave = (id: string) => {
    if (editTarget < 1 || editWarning < 1) {
      toast.error('Values must be positive');
      return;
    }
    updateMutation.mutate({ id, targetMinutes: editTarget, warningMinutes: editWarning });
  };

  const agencyColors: Record<string, string> = {
    POLICE: '#1B5E82', HOSPITAL: '#C62828', FIRE: '#EA580C', RIB: '#4C1D95',
  };

  const severityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Gauge size={22} color="#0F4C75" />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>SLA Configuration</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {(['config', 'breaches'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#0F172A' : '#64748B',
              fontWeight: tab === t ? 600 : 400, fontSize: '13px', cursor: 'pointer',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
            {t === 'config' ? 'Configuration' : 'Breach Report'}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={thStyle}>Agency</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Target (min)</th>
                <th style={thStyle}>Warning (min)</th>
                <th style={thStyle}>Last Updated</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No SLA configurations found</td></tr>
              ) : (
                configs?.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
                        background: `${agencyColors[c.agencyType] ?? '#64748B'}15`,
                        color: agencyColors[c.agencyType] ?? '#64748B',
                        fontSize: '12px', fontWeight: 600,
                      }}>
                        {c.agencyType}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', fontWeight: 600, color: c.severity === 'CRITICAL' ? '#EF4444' : c.severity === 'HIGH' ? '#F59E0B' : '#64748B' }}>
                      {c.severity}
                    </td>
                    <td style={tdStyle}>
                      {editingId === c.id ? (
                        <input type="number" value={editTarget} onChange={(e) => setEditTarget(parseInt(e.target.value) || 0)}
                          style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', textAlign: 'center' }} />
                      ) : (
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{c.targetMinutes}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {editingId === c.id ? (
                        <input type="number" value={editWarning} onChange={(e) => setEditWarning(parseInt(e.target.value) || 0)}
                          style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', textAlign: 'center' }} />
                      ) : (
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{c.warningMinutes}</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }}>
                      {formatDateTime(c.updatedAt)}
                    </td>
                    <td style={tdStyle}>
                      {editingId === c.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleSave(c.id)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <Save size={12} style={{ verticalAlign: 'middle' }} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(c)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F4C75', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          <Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'breaches' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#EF4444" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>SLA Breach Report</span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>(last 30 days)</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={thStyle}>Tracking Code</th>
                <th style={thStyle}>Agency</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Response Time</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Responded</th>
              </tr>
            </thead>
            <tbody>
              {breaches?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No SLA breaches in the selected period</td></tr>
              ) : (
                breaches?.map((b: any) => (
                  <tr key={b.assignmentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{b.trackingCode}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        background: `${agencyColors[b.agency] ?? '#64748B'}15`,
                        color: agencyColors[b.agency] ?? '#64748B',
                      }}>{b.agency}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', fontWeight: 600, color: b.severity === 'CRITICAL' ? '#EF4444' : b.severity === 'HIGH' ? '#F59E0B' : '#64748B' }}>
                      {b.severity}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: b.timeToRespond > 30 ? '#EF4444' : '#22C55E' }}>
                        <Clock size={12} />
                        {b.timeToRespond} min
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }}>{formatDateTime(b.createdAt)}</td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }}>{formatDateTime(b.respondedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid #E2E8F0',
};
const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: '13px', color: '#475569',
};
