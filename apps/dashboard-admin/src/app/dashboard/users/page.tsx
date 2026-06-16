'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '../../../lib/apiClient';
import { formatDateTime, timeAgo } from '../../../lib/formatters';
import { useMediaQuery, BREAKPOINTS } from '../../../hooks/useMediaQuery';
import {
  Users, Search, Shield, UserPlus, AlertCircle, CheckCircle, XCircle, ChevronRight, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: '⭐ Administrator' },
  { value: 'POLICE_OFFICER', label: 'Police Officer' },
  { value: 'MEDICAL_RESPONDER', label: 'Medical Responder' },
  { value: 'FIRE_OFFICER', label: 'Fire Officer' },
  { value: 'RIB_INVESTIGATOR', label: 'RIB Investigator' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(BREAKPOINTS.md);
  const [tab, setTab] = useState<'all' | 'citizens' | 'officers'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [promoteUserId, setPromoteUserId] = useState<string | null>(null);
  const [promotionData, setPromotionData] = useState({
    role: 'POLICE_OFFICER',
    agencyId: '',
    badgeNumber: '',
    rank: '',
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, tab],
    queryFn: () => adminApi.listUsers({ page, limit: 20, search: search || undefined }).then((r) => r.data),
  });

  const { data: agenciesData } = useQuery({
    queryKey: ['admin', 'agencies', 'list'],
    queryFn: () => adminApi.getScorecard().then(r => r.data.data), // Reuse scorecard to get agency list
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User suspended');
      setSuspendUserId(null);
      setSuspendReason('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to suspend'),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User reactivated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to reactivate'),
  });

  const promoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.promoteToOfficer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User promoted to staff');
      setPromoteUserId(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to promote'),
  });

  const users = usersData?.users ?? [];
  const total = usersData?.total ?? 0;
  const totalPages = usersData?.totalPages ?? 0;

  const filteredUsers = tab === 'all' ? users : users.filter((u: any) =>
    tab === 'citizens' ? u.role === 'CITIZEN' : u.role !== 'CITIZEN'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>User Management</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Manage citizens and professional staff</p>
        </div>
        <Link href="/dashboard/users/new"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            background: '#0F4C75', color: '#fff', borderRadius: '10px', textDecoration: 'none',
            fontSize: '13px', fontWeight: 600,
          }}>
          <UserPlus size={16} /> Create Officer Account
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
          {(['all', 'citizens', 'officers'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0F172A' : '#64748B',
                fontWeight: tab === t ? 700 : 500, fontSize: '13px', cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 14px', flex: isMobile ? 1 : undefined }}>
          <Search size={14} color="#94A3B8" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone, email..."
            style={{ border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#0F172A', width: isMobile ? '100%' : '240px' }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={thStyle}>User</th>
              {!isMobile && <th style={thStyle}>Contact</th>}
              <th style={thStyle}>Role</th>
              {!isMobile && <th style={thStyle}>Status</th>}
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>{isLoading ? 'Loading...' : 'No users found'}</td></tr>
            ) : (
              filteredUsers.map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: '#475569'
                      }}>
                        {u.name?.[0] ?? u.phone?.[0] ?? '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>{u.name ?? 'Anonymous Citizen'}</div>
                        {isMobile && <div style={{ fontSize: '11px', color: '#64748B' }}>{u.phone}</div>}
                      </div>
                    </div>
                  </td>
                  {!isMobile && (
                    <td style={tdStyle}>
                      <div style={{ fontSize: '13px', color: '#0F172A' }}>{u.phone}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{u.email ?? '—'}</div>
                    </td>
                  )}
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '20px',
                      background: u.role === 'CITIZEN' ? '#F1F5F9' : '#E0F2FE',
                      color: u.role === 'CITIZEN' ? '#64748B' : '#0369A1',
                      textTransform: 'uppercase'
                    }}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  {!isMobile && (
                    <td style={tdStyle}>
                      {u.isActive ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 600, fontSize: '12px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} /> Active
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: 600, fontSize: '12px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} /> Suspended
                        </div>
                      )}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {u.role === 'CITIZEN' && (
                        <button
                          onClick={() => setPromoteUserId(u.id)}
                          style={{
                            padding: '6px 12px', borderRadius: '8px', border: '1px solid #0F4C75',
                            background: '#F0F9FF', color: '#0F4C75', fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          PROMOTE
                        </button>
                      )}
                      {u.isActive ? (
                        <button onClick={() => setSuspendUserId(u.id)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          SUSPEND
                        </button>
                      ) : (
                        <button onClick={() => reactivateMutation.mutate(u.id)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #BBF7D0', background: '#fff', color: '#16A34A', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          ACTIVATE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{
                  minWidth: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: p === page ? '#0F4C75' : '#fff',
                  color: p === page ? '#fff' : '#64748B',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      {promoteUserId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '460px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0F4C75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Shield size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Promote User</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Grant staff or admin access to this account</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Assign Role</label>
                <select
                  style={inputStyle}
                  value={promotionData.role}
                  onChange={e => setPromotionData({ ...promotionData, role: e.target.value })}
                >
                  {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {promotionData.role !== 'ADMIN' && (
                <>
                  <div>
                    <label style={labelStyle}>Assigned Agency</label>
                    <select
                      style={inputStyle}
                      value={promotionData.agencyId}
                      onChange={e => setPromotionData({ ...promotionData, agencyId: e.target.value })}
                    >
                      <option value="">Select Agency...</option>
                      {agenciesData?.map((a: any) => (
                        <option key={a.agency} value={a.agency}>{a.agency} - Performance: {a.performanceScore}%</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Badge Number</label>
                      <input
                        style={inputStyle}
                        placeholder="Optional"
                        value={promotionData.badgeNumber}
                        onChange={e => setPromotionData({ ...promotionData, badgeNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Officer Rank</label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Sergeant"
                        value={promotionData.rank}
                        onChange={e => setPromotionData({ ...promotionData, rank: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {promotionData.role === 'ADMIN' && (
                <div style={{ padding: '12px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <p style={{ fontSize: '12px', color: '#1D4ED8', margin: 0, fontWeight: 600 }}>⭐ Admin Access</p>
                  <p style={{ fontSize: '11px', color: '#3B82F6', margin: '4px 0 0' }}>This user will gain full admin dashboard access to manage incidents, users, and system settings.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setPromoteUserId(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => promoteMutation.mutate({ id: promoteUserId, data: promotionData })}
                disabled={(promotionData.role !== 'ADMIN' && !promotionData.agencyId) || promoteMutation.isPending}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: (promotionData.role !== 'ADMIN' && !promotionData.agencyId) ? '#CBD5E1' : '#0F4C75',
                  color: '#fff', fontWeight: 700, cursor: (promotionData.role === 'ADMIN' || promotionData.agencyId) ? 'pointer' : 'not-allowed',
                  opacity: promoteMutation.isPending ? 0.7 : 1
                }}
              >
                {promoteMutation.isPending ? 'Promoting...' : 'Promote User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal (Reason UI) */}
      {suspendUserId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '400px', maxWidth: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Suspend Account</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Enter a justification for account suspension.</p>
            <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Violation of terms, inactive post, etc..." rows={3}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'none',
                background: '#F8FAFC'
              }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setSuspendUserId(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => suspendMutation.mutate({ id: suspendUserId, reason: suspendReason })}
                disabled={!suspendReason.trim() || suspendMutation.isPending}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: !suspendReason.trim() ? '#CBD5E1' : '#DC2626',
                  color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: 700,
  color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px',
  borderBottom: '1px solid #E2E8F0',
};

const tdStyle: React.CSSProperties = {
  padding: '16px', fontSize: '13px', color: '#475569',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B',
  textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0',
  fontSize: '14px', outline: 'none', background: '#F8FAFC', color: '#0F172A',
  boxSizing: 'border-box'
};
