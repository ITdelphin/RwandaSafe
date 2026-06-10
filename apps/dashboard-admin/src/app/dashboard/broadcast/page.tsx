'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { formatDateTime, timeAgo } from '../../../lib/formatters';
import { Bell, Send, XCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITIES = ['INFO', 'WARNING', 'DANGER', 'CRITICAL'];
const SEVERITY_COLORS: Record<string, string> = {
  INFO: '#3B82F6', WARNING: '#F59E0B', DANGER: '#EF4444', CRITICAL: '#7C3AED',
};
const RWANDA_DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza',
  'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke',
  'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara', 'Huye', 'Kamonyi',
  'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro',
];

export default function BroadcastPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('INFO');
  const [district, setDistrict] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: () => adminApi.getBroadcasts().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => adminApi.sendBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast.success('Alert broadcast sent');
      setTitle(''); setMessage(''); setSeverity('INFO'); setDistrict(''); setExpiresAt('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to send alert'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast.success('Alert deactivated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to deactivate'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    sendMutation.mutate({ title: title.trim(), message: message.trim(), severity, district: district || undefined, expiresAt: expiresAt || undefined });
  };

  const SeverityIcon = ({ sev }: { sev: string }) => {
    if (sev === 'INFO') return <Info size={14} />;
    if (sev === 'WARNING') return <AlertTriangle size={14} />;
    if (sev === 'DANGER') return <AlertOctagon size={14} />;
    return <AlertTriangle size={14} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Send Alert Form */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Bell size={20} color="#0F4C75" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Send Broadcast Alert</h2>
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert title" style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Message *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Alert message content..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Severity</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SEVERITIES.map((s) => (
                  <button key={s} type="button" onClick={() => setSeverity(s)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '8px', border: `2px solid ${severity === s ? SEVERITY_COLORS[s] : '#E2E8F0'}`,
                      background: severity === s ? `${SEVERITY_COLORS[s]}15` : '#F8FAFC',
                      color: severity === s ? SEVERITY_COLORS[s] : '#64748B',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                  >
                    <SeverityIcon sev={s} /> {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>District (optional)</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} style={inputStyle}>
                <option value="">All Rwanda</option>
                {RWANDA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expires at (optional)</label>
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={sendMutation.isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                borderRadius: '10px', border: 'none',
                background: sendMutation.isPending ? '#CBD5E1' : '#0F4C75',
                color: '#fff', fontSize: '13px', fontWeight: 600, cursor: sendMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} />
              {sendMutation.isPending ? 'Sending...' : 'Send Alert'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Alerts */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#EF4444" />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Broadcast History ({alerts?.length ?? 0})
          </h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>District</th>
              <th style={thStyle}>Delivered</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts?.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No broadcast alerts sent yet</td></tr>
            ) : (
              alerts?.map((a: any) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: '#0F172A', fontSize: '13px' }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: `${SEVERITY_COLORS[a.severity] ?? '#94A3B8'}15`,
                      color: SEVERITY_COLORS[a.severity] ?? '#64748B',
                    }}>
                      {a.severity}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }}>{a.district ?? 'All Rwanda'}</td>
                  <td style={{ ...tdStyle, fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{a.deliveredCount ?? 0}</span>
                    <span style={{ color: '#94A3B8' }}> / {a.targetCount ?? 0}</span>
                  </td>
                  <td style={tdStyle}>
                    {a.isActive ? (
                      <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 600 }}>Active</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }} title={a.createdAt}>
                    {timeAgo(a.createdAt)}
                  </td>
                  <td style={tdStyle}>
                    {a.isActive && (
                      <button onClick={() => deactivateMutation.mutate(a.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        <XCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid #E2E8F0',
};
const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: '13px', color: '#475569',
};
