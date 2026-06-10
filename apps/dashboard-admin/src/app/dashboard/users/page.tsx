'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '../../../lib/apiClient';
import { formatDateTime, timeAgo } from '../../../lib/formatters';
import {
  Users, Search, Shield, UserPlus, AlertCircle, CheckCircle, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'all' | 'citizens' | 'officers'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, tab],
    queryFn: () => adminApi.listUsers({ page, limit: 20, search: search || undefined }).then((r) => r.data),
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

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const filtered = tab === 'all' ? users : users.filter((u: any) =>
    tab === 'citizens' ? u.role === 'CITIZEN' : u.role !== 'CITIZEN',
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>User Management</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{total} total users</p>
        </div>
        <Link
          href="/dashboard/users/new"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            background: '#0F4C75', color: '#fff', borderRadius: '10px', textDecoration: 'none',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          <UserPlus size={16} />
          Create Officer Account
        </Link>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
          {(['all', 'citizens', 'officers'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#0F172A' : '#64748B',
                fontWeight: tab === t ? 600 : 400, fontSize: '13px', cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '8px 14px' }}>
          <Search size={14} color="#94A3B8" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, phone, badge..."
            style={{ border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#0F172A', width: '240px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Verified</th>
              <th style={thStyle}>Reports</th>
              <th style={thStyle}>Last Login</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                        {u.name?.[0] ?? '?'}
                      </div>
                      <span style={{ fontWeight: 500, color: '#0F172A', fontSize: '13px' }}>{u.name ?? '—'}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{u.phone}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: u.role === 'CITIZEN' ? '#64748B' : '#0F4C75' }}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {u.isActive ? (
                      <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 600 }}>Active</span>
                    ) : (
                      <span style={{ color: '#EF4444', fontSize: '12px', fontWeight: 600 }}>Suspended</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {u.isVerified ? (
                      <CheckCircle size={14} color="#22C55E" />
                    ) : (
                      <XCircle size={14} color="#94A3B8" />
                    )}
                  </td>
                  <td style={tdStyle}>{u._count?.incidents ?? 0}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#64748B' }}>
                    {u.lastLoginAt ? timeAgo(u.lastLoginAt) : '—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {u.isActive ? (
                        <button
                          onClick={() => setSuspendUserId(u.id)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateMutation.mutate(u.id)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#16A34A', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: p === page ? '#0F4C75' : '#F1F5F9',
                  color: p === page ? '#fff' : '#64748B',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendUserId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Suspend User</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Enter the reason for suspension:</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              rows={3}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => { setSuspendUserId(null); setSuspendReason(''); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => suspendMutation.mutate({ id: suspendUserId, reason: suspendReason })}
                disabled={!suspendReason.trim()}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: !suspendReason.trim() ? '#CBD5E1' : '#DC2626',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: !suspendReason.trim() ? 'not-allowed' : 'pointer',
                }}>
                Confirm Suspension
              </button>
            </div>
          </div>
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
