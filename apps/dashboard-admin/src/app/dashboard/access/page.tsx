'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessApi } from '../../../../lib/apiClient';
import toast from 'react-hot-toast';
import {
    Shield, ShieldBan, ShieldCheck, User, Users, Search,
    ChevronDown, Zap, Lock, X, CheckCircle2, AlertCircle,
} from 'lucide-react';

const DEPT_DASHBOARDS = ['POLICE', 'HOSPITAL', 'FIRE', 'RIB'] as const;
type DeptDashboard = typeof DEPT_DASHBOARDS[number];

const DEPT_META: Record<DeptDashboard, { label: string; color: string; bg: string }> = {
    POLICE: { label: 'Police', color: '#1a73e8', bg: '#EFF6FF' },
    HOSPITAL: { label: 'Hospital', color: '#34A853', bg: '#F0FDF4' },
    FIRE: { label: 'Fire Brigade', color: '#E8710A', bg: '#FFF7ED' },
    RIB: { label: 'RIB', color: '#9334E6', bg: '#FAF5FF' },
};

const ROLE_LABEL: Record<string, string> = {
    CITIZEN: 'Citizen',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'Super Admin',
    POLICE_OFFICER: 'Police Officer',
    MEDICAL_RESPONDER: 'Medical Responder',
    FIRE_OFFICER: 'Fire Officer',
    RIB_INVESTIGATOR: 'RIB Investigator',
};

const ROLE_COLOR: Record<string, string> = {
    CITIZEN: '#64748B',
    ADMIN: '#0F4C75',
    SUPER_ADMIN: '#7C3AED',
    POLICE_OFFICER: '#1a73e8',
    MEDICAL_RESPONDER: '#34A853',
    FIRE_OFFICER: '#E8710A',
    RIB_INVESTIGATOR: '#9334E6',
};

function GrantModal({
    user,
    onClose,
    onGrant,
    isPending,
}: {
    user: any;
    onClose: () => void;
    onGrant: (dashboard: DeptDashboard) => void;
    isPending: boolean;
}) {
    const existingAccess = user.dashboardAccess.map((a: any) => a.dashboard);
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div style={{
                background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '460px',
                width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                            Grant Department Access
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                            Select a department for <strong>{user.name || user.email}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {DEPT_DASHBOARDS.map((dept) => {
                        const meta = DEPT_META[dept];
                        const hasAccess = existingAccess.includes(dept);
                        return (
                            <button
                                key={dept}
                                disabled={hasAccess || isPending}
                                onClick={() => onGrant(dept)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                                    borderRadius: '12px', border: `2px solid ${hasAccess ? meta.color : '#E2E8F0'}`,
                                    background: hasAccess ? meta.bg : '#fff',
                                    cursor: hasAccess ? 'default' : 'pointer',
                                    opacity: isPending ? 0.6 : 1,
                                    transition: 'all 0.15s',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => { if (!hasAccess) e.currentTarget.style.borderColor = meta.color; }}
                                onMouseLeave={(e) => { if (!hasAccess) e.currentTarget.style.borderColor = '#E2E8F0'; }}
                            >
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px', background: meta.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Shield size={18} color="white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{meta.label} Dashboard</div>
                                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                                        {hasAccess ? '✓ Access already granted' : `Grant access to ${meta.label} portal`}
                                    </div>
                                </div>
                                {hasAccess && <CheckCircle2 size={18} color={meta.color} />}
                            </button>
                        );
                    })}
                </div>

                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '16px 0 0', textAlign: 'center' }}>
                    This will promote the user to the appropriate role and grant department portal access.
                </p>
            </div>
        </div>
    );
}

export default function AccessManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'citizens' | 'staff'>('all');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ['access', 'users', search],
        queryFn: () => accessApi.listAllUsers(search ? { search } : undefined).then(r => r.data.data),
    });

    const promoteAndGrantMutation = useMutation({
        mutationFn: ({ userId, dashboard }: { userId: string; dashboard: string }) =>
            accessApi.promoteAndGrant({ userId, dashboard }),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['access', 'users'] });
            toast.success(`${vars.dashboard} access granted successfully!`);
            setSelectedUser(null);
        },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to grant access'),
    });

    const revokeMutation = useMutation({
        mutationFn: ({ userId, dashboard }: { userId: string; dashboard: string }) =>
            accessApi.revokeAccess({ userId, dashboard }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['access', 'users'] });
            toast.success('Access revoked');
        },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to revoke access'),
    });

    const filteredUsers = Array.isArray(users) ? users.filter((u: any) => {
        if (filter === 'citizens') return u.role === 'CITIZEN';
        if (filter === 'staff') return u.role !== 'CITIZEN';
        return true;
    }) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedUser && (
                <GrantModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onGrant={(dashboard) => promoteAndGrantMutation.mutate({ userId: selectedUser.id, dashboard })}
                    isPending={promoteAndGrantMutation.isPending}
                />
            )}

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={20} color="white" />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Department Access Control</h1>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                    Citizens who create accounts appear here. Grant them department access to activate their staff portal login.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    {(['all', 'citizens', 'staff'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                background: filter === f ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                                color: filter === f ? '#0F172A' : '#94A3B8',
                                transition: 'all 0.15s',
                            }}
                        >
                            {f === 'all' ? '👥 All Users' : f === 'citizens' ? '🙋 Citizens' : '🏛️ Staff'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#EA580C" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ fontSize: '13px', color: '#92400E' }}>
                    <strong>How it works:</strong> When a citizen creates an account on any department portal, they appear in this list.
                    Click <strong>"Grant Access"</strong> to assign them to a department — this promotes their account and enables their staff portal login.
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    style={{
                        width: '100%', boxSizing: 'border-box', padding: '10px 14px 10px 38px',
                        border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px',
                        outline: 'none', background: '#fff',
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#0F4C75" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                        {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#0F4C75', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading users...
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        <User size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p>No users found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B' }}>User</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B' }}>Role</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B' }}>Dashboard Access</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#64748B' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u: any) => {
                                    const grantedDashboards: string[] = u.dashboardAccess.map((a: any) => a.dashboard);
                                    const isCitizen = u.role === 'CITIZEN';
                                    return (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px', height: '34px', borderRadius: '9px',
                                                        background: isCitizen ? '#F1F5F9' : '#EFF6FF',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '13px', color: isCitizen ? '#64748B' : '#0F4C75', flexShrink: 0,
                                                    }}>
                                                        {(u.name || u.email || '?')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{u.name || 'No name'}</div>
                                                        <div style={{ color: '#94A3B8', fontSize: '11px' }}>{u.email || u.phone || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                                    background: `${ROLE_COLOR[u.role] ?? '#64748B'}15`,
                                                    color: ROLE_COLOR[u.role] ?? '#64748B',
                                                }}>
                                                    {ROLE_LABEL[u.role] ?? u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {grantedDashboards.length === 0 ? (
                                                    <span style={{ color: '#CBD5E1', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Lock size={12} /> No access
                                                    </span>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {grantedDashboards.map((d) => {
                                                            const meta = DEPT_META[d as DeptDashboard];
                                                            return (
                                                                <span
                                                                    key={d}
                                                                    style={{
                                                                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                                                        background: meta?.bg ?? '#F1F5F9', color: meta?.color ?? '#64748B',
                                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                                    }}
                                                                >
                                                                    <ShieldCheck size={11} />
                                                                    {meta?.label ?? d}
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm(`Revoke ${d} access?`)) revokeMutation.mutate({ userId: u.id, dashboard: d });
                                                                        }}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: 'inherit', opacity: 0.6, display: 'flex', alignItems: 'center' }}
                                                                        title={`Revoke ${d} access`}
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                {u.role !== 'SUPER_ADMIN' && (
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                            background: isCitizen ? '#0F4C75' : '#EFF6FF', color: isCitizen ? '#fff' : '#0F4C75',
                                                            fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                                    >
                                                        <Zap size={13} />
                                                        {isCitizen ? 'Grant Access' : 'Manage Access'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
