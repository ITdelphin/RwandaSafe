'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../../../lib/apiClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'POLICE_OFFICER', label: 'Police Officer' },
  { value: 'MEDICAL_RESPONDER', label: 'Medical Responder' },
  { value: 'FIRE_OFFICER', label: 'Fire Officer' },
  { value: 'RIB_INVESTIGATOR', label: 'RIB Investigator' },
];

const RANKS = ['Constable', 'Corporal', 'Sergeant', 'Inspector', 'Superintendent', 'Commissioner'];

export default function CreateOfficerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: '',
    name: '',
    email: '',
    role: 'POLICE_OFFICER',
    agencyId: '',
    badgeNumber: '',
    rank: '',
    sendSms: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createOfficer(data),
    onSuccess: () => {
      toast.success('Officer account created successfully');
      router.push('/dashboard/users');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to create officer'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const set = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div style={{ maxWidth: '640px' }}>
      <Link
        href="/dashboard/users"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0F4C75', textDecoration: 'none', fontWeight: 500, marginBottom: '20px' }}
      >
        <ArrowLeft size={14} />
        Back to Users
      </Link>

      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '20px' }}>Create Officer Account</h2>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1 */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Phone number *</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+2507XXXXXXXX"
                style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Officer name"
                style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@domain.com"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role *</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)} style={inputStyle}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Agency Assignment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Badge number</label>
              <input value={form.badgeNumber} onChange={(e) => set('badgeNumber', e.target.value)} placeholder="e.g. RNP-042"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Rank</label>
              <select value={form.rank} onChange={(e) => set('rank', e.target.value)} style={inputStyle}>
                <option value="">Select rank</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px' }}>Notification</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.sendSms} onChange={(e) => set('sendSms', e.target.checked)}
              style={{ accentColor: '#0F4C75' }} />
            Send welcome SMS to officer with login instructions
          </label>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/users"
            style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Cancel
          </Link>
          <button type="submit" disabled={createMutation.isPending}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: createMutation.isPending ? '#CBD5E1' : '#0F4C75',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
            }}>
            {createMutation.isPending ? 'Creating...' : 'Create Officer Account'}
          </button>
        </div>
      </form>
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
