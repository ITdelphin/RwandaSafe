'use client';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../../../lib/apiClient';
import { formatDateTime } from '../../../lib/formatters';
import { useMediaQuery, BREAKPOINTS } from '../../../hooks/useMediaQuery';
import { ScrollText, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';

const RESOURCE_TYPES = ['User', 'Incident', 'Assignment', 'Officer', 'Agency', 'SlaConfig', 'SystemConfig', 'BroadcastAlert', 'MedicalCase', 'FireReport', 'Investigation'];
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'SUSPEND', 'REACTIVATE', 'LOGIN', 'EXPORT', 'BROADCAST', 'ASSIGN', 'RESOLVE'];

export default function AuditPage() {
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', page, actorId, resourceType, action, dateFrom, dateTo],
    queryFn: () => adminApi.getAuditLog({
      page, limit: 25,
      actorId: actorId || undefined,
      resourceType: resourceType || undefined,
      action: action || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });

  const logs = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 0;
  const hasActiveFilters = actorId || resourceType || action || dateFrom || dateTo;

  const activeFilterCount = [actorId, resourceType, action, dateFrom, dateTo].filter(Boolean).length;

  const ActionBadge = ({ action: act }: { action: string }) => {
    const isDestructive = act === 'DELETE' || act === 'SUSPEND';
    const isCreate = act === 'CREATE';
    return (
      <span style={{
        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
        background: isDestructive ? '#FEF2F2' : isCreate ? '#F0FDF4' : '#EFF6FF',
        color: isDestructive ? '#DC2626' : isCreate ? '#16A34A' : '#2563EB',
      }}>
        {act}
      </span>
    );
  };

  const clearFilters = () => {
    setActorId(''); setResourceType(''); setAction(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <ScrollText size={22} color="#0F4C75" />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Audit Log</h2>
        <span style={{ fontSize: '13px', color: '#94A3B8' }}>{total} total entries</span>
        {hasActiveFilters && (
          <button onClick={clearFilters}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}>
            <X size={12} /> Clear ({activeFilterCount})
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', padding: isMobile ? '14px' : '16px 20px', border: '1px solid #E2E8F0' }}>
        {isMobile ? (
          <>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              <Filter size={14} color="#64748B" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8' }}>{showFilters ? 'Hide' : 'Show'}</span>
            </button>
            {showFilters && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div>
                  <label style={filterLabelStyle}>Actor ID</label>
                  <input value={actorId} onChange={(e) => { setActorId(e.target.value); setPage(1); }} placeholder="User ID" style={filterInputStyle} />
                </div>
                <div>
                  <label style={filterLabelStyle}>Resource Type</label>
                  <select value={resourceType} onChange={(e) => { setResourceType(e.target.value); setPage(1); }} style={filterInputStyle}>
                    <option value="">All</option>
                    {RESOURCE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={filterLabelStyle}>Action</label>
                    <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} style={filterInputStyle}>
                      <option value="">All</option>
                      {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={filterLabelStyle}>From</label>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={filterInputStyle} />
                  </div>
                  <div>
                    <label style={filterLabelStyle}>To</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={filterInputStyle} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Filter size={14} color="#64748B" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Filters</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={filterLabelStyle}>Actor ID</label>
                <input value={actorId} onChange={(e) => { setActorId(e.target.value); setPage(1); }} placeholder="User ID" style={filterInputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={filterLabelStyle}>Resource Type</label>
                <select value={resourceType} onChange={(e) => { setResourceType(e.target.value); setPage(1); }} style={filterInputStyle}>
                  <option value="">All</option>
                  {RESOURCE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={filterLabelStyle}>Action</label>
                <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} style={filterInputStyle}>
                  <option value="">All</option>
                  {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={filterLabelStyle}>From</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={filterInputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={filterLabelStyle}>To</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={filterInputStyle} />
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
        {isMobile ? (
          <div style={{ padding: '12px' }}>
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>Loading audit log...</p>
            ) : logs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No audit entries found</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <ActionBadge action={log.action} />
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{formatDateTime(log.createdAt)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                    <div>Actor: <strong style={{ color: '#0F4C75', fontSize: '11px' }}>{log.actorRole ?? '—'}</strong></div>
                    <div>Resource: <strong style={{ color: '#0F172A' }}>{log.resourceType}</strong></div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94A3B8' }}>
                      ID: {log.resourceId ? `${log.resourceId.slice(0, 8)}...` : '—'}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94A3B8' }}>
                      IP: {log.ipAddress ?? '—'}
                    </div>
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <details style={{ fontSize: '11px', marginTop: '8px' }}>
                      <summary style={{ color: '#0F4C75', cursor: 'pointer', fontWeight: 500 }}>View changes</summary>
                      <div style={{ marginTop: '4px', background: '#fff', padding: '8px', borderRadius: '6px', fontSize: '10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '120px', overflow: 'auto' }}>
                        {log.oldValue && <><strong style={{ color: '#DC2626' }}>Old:</strong> {JSON.stringify(log.oldValue, null, 2)}</>}
                        {log.newValue && <><strong style={{ color: '#16A34A' }}>New:</strong> {JSON.stringify(log.newValue, null, 2)}</>}
                      </div>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Actor</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Resource</th>
                <th style={thStyle}>Resource ID</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>Loading audit log...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>No audit entries found</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#0F4C75' }}>{log.actorRole ?? '—'}</span>
                      <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {log.actorId ? `${log.actorId.slice(0, 8)}...` : '—'}
                      </div>
                    </td>
                    <td style={tdStyle}><ActionBadge action={log.action} /></td>
                    <td style={{ ...tdStyle, fontSize: '12px', fontWeight: 500, color: '#475569' }}>{log.resourceType}</td>
                    <td style={{ ...tdStyle, fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                      {log.resourceId ? `${log.resourceId.slice(0, 8)}...` : '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8' }}>
                      {log.ipAddress ?? '—'}
                    </td>
                    <td style={tdStyle}>
                      {(log.oldValue || log.newValue) ? (
                        <details style={{ fontSize: '11px' }}>
                          <summary style={{ color: '#0F4C75', cursor: 'pointer', fontWeight: 500 }}>View</summary>
                          <div style={{ marginTop: '4px', background: '#F8FAFC', padding: '8px', borderRadius: '6px', fontSize: '10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '120px', overflow: 'auto' }}>
                            {log.oldValue && <><strong style={{ color: '#DC2626' }}>Old:</strong> {JSON.stringify(log.oldValue, null, 2)}</>}
                            {log.newValue && <><strong style={{ color: '#16A34A' }}>New:</strong> {JSON.stringify(log.newValue, null, 2)}</>}
                          </div>
                        </details>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: page === 1 ? '#F8FAFC' : '#fff', color: page === 1 ? '#CBD5E1' : '#64748B', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: page === totalPages ? '#F8FAFC' : '#fff', color: page === totalPages ? '#CBD5E1' : '#64748B', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const filterLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px',
};
const filterInputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0',
  fontSize: '12px', outline: 'none', color: '#0F172A', background: '#F8FAFC', boxSizing: 'border-box',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px',
  borderBottom: '1px solid #E2E8F0',
};
const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: '13px', color: '#475569',
};
