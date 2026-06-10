'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { formatDateTime, timeAgo } from '../../../lib/formatters';
import { useMediaQuery, BREAKPOINTS } from '../../../hooks/useMediaQuery';
import {
  Server, Database, Activity, HardDrive, CheckCircle, XCircle,
  Edit3, Save, X, Clock, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HEALTH_ICONS: Record<string, React.ReactNode> = {
  api: <Server size={22} />,
  database: <Database size={22} />,
  redis: <Activity size={22} />,
  storage: <HardDrive size={22} />,
};

const HEALTH_LABELS: Record<string, string> = {
  api: 'API Server',
  database: 'Database',
  redis: 'Redis Cache',
  storage: 'File Storage',
};

export default function SystemPage() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => adminApi.getSystemHealth().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['admin', 'configs'],
    queryFn: () => adminApi.getSystemConfigs().then((r) => r.data.data),
    refetchInterval: 120000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminApi.updateSystemConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'configs'] });
      toast.success('Config updated');
      setEditingKey(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to update config'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Server size={22} color="#0F4C75" />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>System Health</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '200px'}, 1fr))`, gap: isMobile ? '10px' : '16px' }}>
        {['api', 'database', 'redis', 'storage'].map((service) => {
          const status = health?.statuses?.[service] ?? 'UNKNOWN';
          const isUp = status === 'UP';
          return (
            <div key={service} style={{
              background: '#fff', borderRadius: '14px', padding: isMobile ? '16px' : '20px',
              border: `1px solid ${isUp ? '#BBF7D0' : '#FECACA'}`,
              borderLeft: `4px solid ${isUp ? '#22C55E' : '#EF4444'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '12px',
                  background: isUp ? '#F0FDF4' : '#FEF2F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {HEALTH_ICONS[service]}
                </div>
                {isUp ? <CheckCircle size={isMobile ? 16 : 20} color="#22C55E" /> : <XCircle size={isMobile ? 16 : 20} color="#EF4444" />}
              </div>
              <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                {HEALTH_LABELS[service]}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: isUp ? '#22C55E' : '#EF4444' }}>
                {isUp ? 'Operational' : 'Down'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: '#fff', borderRadius: '14px', padding: isMobile ? '14px' : '20px',
        border: '1px solid #E2E8F0', display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '10px' : '16px',
      }}>
        <Clock size={18} color="#64748B" />
        <div>
          <span style={{ fontSize: '13px', color: '#64748B' }}>Last Incident: </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
            {health?.lastIncidentTrackingCode ?? '—'}
          </span>
          {health?.lastActivity && (
            <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '8px' }}>
              ({timeAgo(health.lastActivity)})
            </span>
          )}
        </div>
        <div style={{ marginLeft: isMobile ? 0 : 'auto', fontSize: '12px', color: '#94A3B8' }}>
          Last checked: {health?.timestamp ? formatDateTime(health.timestamp) : '—'}
        </div>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'health'] })}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
            border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            width: isMobile ? '100%' : undefined, justifyContent: 'center',
          }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>System Configuration</h3>
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
          {isMobile ? (
            <div style={{ padding: '12px' }}>
              {configsLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>Loading configuration...</p>
              ) : configs?.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No configuration entries found</p>
              ) : (
                configs?.map((c: any) => (
                  <div key={c.id} style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{c.key}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: '#64748B', fontSize: '10px', fontWeight: 600 }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>{c.label}</div>
                    <div style={{ marginBottom: '8px' }}>
                      {editingKey === c.key ? (
                        <input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                      ) : (
                        <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0F172A', fontWeight: 500, background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{c.value}</code>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Updated {timeAgo(c.updatedAt)}</span>
                      {editingKey === c.key ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => updateMutation.mutate({ key: c.key, value: editValue })}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <Save size={12} />
                          </button>
                          <button onClick={() => setEditingKey(null)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingKey(c.key); setEditValue(c.value); }}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F4C75', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          <Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={thStyle}>Key</th>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Value</th>
                  <th style={thStyle}>Updated</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configsLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>Loading configuration...</td></tr>
                ) : configs?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No configuration entries found</td></tr>
                ) : (
                  configs?.map((c: any) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{c.key}</td>
                      <td style={{ ...tdStyle, fontSize: '13px', color: '#475569' }}>{c.label}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#F1F5F9', color: '#64748B' }}>
                          {c.category}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {editingKey === c.key ? (
                          <input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            style={{ width: '200px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: 'monospace' }} />
                        ) : (
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0F172A', fontWeight: 500 }}>{c.value}</span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '11px', color: '#94A3B8' }}>{timeAgo(c.updatedAt)}</td>
                      <td style={tdStyle}>
                        {editingKey === c.key ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => updateMutation.mutate({ key: c.key, value: editValue })}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: '#22C55E', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                              <Save size={12} />
                            </button>
                            <button onClick={() => setEditingKey(null)}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingKey(c.key); setEditValue(c.value); }}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F4C75', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            <Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
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
