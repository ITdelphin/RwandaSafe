'use client';
import { useState } from 'react';
import {
    Settings, User, Bell, Shield, Globe, Palette, Save,
    Eye, EyeOff, Check, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Globe },
];

export default function AdminSettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        title: 'Super Administrator',
        department: 'Ministry of Internal Security',
    });

    const [notifSettings, setNotifSettings] = useState({
        emailAlerts: true,
        smsAlerts: true,
        criticalOnly: false,
        dailyDigest: true,
        newIncident: true,
        slaBreached: true,
        agencyUpload: false,
    });

    const [secForm, setSecForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const [systemSettings, setSystemSettings] = useState({
        language: 'en',
        timezone: 'Africa/Kigali',
        dateFormat: 'DD/MM/YYYY',
        autoRefresh: '60',
        maintenanceMode: false,
    });

    const saveProfile = () => toast.success('Profile updated successfully');
    const saveNotif = () => toast.success('Notification preferences saved');
    const savePassword = () => {
        if (!secForm.oldPassword || !secForm.newPassword) return toast.error('Please fill all fields');
        if (secForm.newPassword !== secForm.confirmPassword) return toast.error('Passwords do not match');
        if (secForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
        toast.success('Password changed successfully');
        setSecForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };
    const saveSystem = () => toast.success('System settings saved');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0F4C75, #1E3A5F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Settings size={22} color="white" />
                </div>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Settings</h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Manage your account and system preferences</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Sidebar Tabs */}
                <div style={{
                    background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
                    padding: '8px', minWidth: '200px', height: 'fit-content',
                }}>
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', borderRadius: '10px', border: 'none',
                                    background: active ? '#EFF6FF' : 'transparent',
                                    color: active ? '#0F4C75' : '#64748B',
                                    fontWeight: active ? 700 : 500, fontSize: '13px', cursor: 'pointer',
                                    marginBottom: '2px', transition: 'all 0.15s',
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Panel */}
                <div style={{ flex: 1, minWidth: '320px' }}>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>Profile Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: 'Full Name', key: 'name', placeholder: 'Your full name' },
                                    { label: 'Email Address', key: 'email', placeholder: 'admin@example.com' },
                                    { label: 'Phone Number', key: 'phone', placeholder: '+250 7XX XXX XXX' },
                                    { label: 'Job Title', key: 'title', placeholder: 'Super Administrator' },
                                    { label: 'Department', key: 'department', placeholder: 'Ministry of Internal Security' },
                                ].map((field) => (
                                    <div key={field.key} style={{ gridColumn: field.key === 'department' ? 'span 2' : undefined }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{field.label}</label>
                                        <input
                                            value={(profileForm as any)[field.key]}
                                            onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', background: '#F8FAFC', color: '#0F172A', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={saveProfile}
                                style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#0F4C75', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Save size={14} /> Save Profile
                            </button>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>Notification Preferences</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                                    { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive critical alerts via SMS' },
                                    { key: 'criticalOnly', label: 'Critical Incidents Only', desc: 'Only notify for high-severity incidents' },
                                    { key: 'dailyDigest', label: 'Daily Summary Report', desc: 'Receive a daily digest of system activity' },
                                    { key: 'newIncident', label: 'New Incident Created', desc: 'Alert when a new incident is reported' },
                                    { key: 'slaBreached', label: 'SLA Breach Alerts', desc: 'Notify when an SLA threshold is exceeded' },
                                    { key: 'agencyUpload', label: 'Agency Data Updates', desc: 'Notify when agencies update their data' },
                                ].map((item) => (
                                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#F8FAFC', borderRadius: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                                            style={{
                                                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                                background: (notifSettings as any)[item.key] ? '#0F4C75' : '#CBD5E1',
                                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                                                position: 'absolute', top: '3px', transition: 'left 0.2s',
                                                left: (notifSettings as any)[item.key] ? '23px' : '3px',
                                            }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={saveNotif}
                                style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#0F4C75', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Save size={14} /> Save Preferences
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>Change Password</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                                {[
                                    { key: 'oldPassword', label: 'Current Password', show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                                    { key: 'newPassword', label: 'New Password', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                                    { key: 'confirmPassword', label: 'Confirm New Password', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{field.label}</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={field.show ? 'text' : 'password'}
                                                value={(secForm as any)[field.key]}
                                                onChange={(e) => setSecForm({ ...secForm, [field.key]: e.target.value })}
                                                style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', background: '#F8FAFC', color: '#0F172A', boxSizing: 'border-box' }}
                                            />
                                            <button onClick={field.toggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                                {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '16px', padding: '12px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA', display: 'flex', gap: '8px', maxWidth: '400px' }}>
                                <AlertCircle size={14} color="#EA580C" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontSize: '11px', color: '#9A3412', margin: 0 }}>Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
                            </div>
                            <button
                                onClick={savePassword}
                                style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#0F4C75', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Shield size={14} /> Update Password
                            </button>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>System Configuration</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: 'Language', key: 'language', options: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'French' }, { value: 'rw', label: 'Kinyarwanda' }] },
                                    { label: 'Timezone', key: 'timezone', options: [{ value: 'Africa/Kigali', label: 'Africa/Kigali (UTC+2)' }, { value: 'UTC', label: 'UTC' }] },
                                    { label: 'Date Format', key: 'dateFormat', options: [{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }] },
                                    { label: 'Auto-Refresh Interval', key: 'autoRefresh', options: [{ value: '30', label: '30 seconds' }, { value: '60', label: '1 minute' }, { value: '300', label: '5 minutes' }] },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{field.label}</label>
                                        <select
                                            value={(systemSettings as any)[field.key]}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, [field.key]: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', background: '#F8FAFC', color: '#0F172A', boxSizing: 'border-box' }}
                                        >
                                            {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', padding: '14px', background: '#F8FAFC', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Maintenance Mode</div>
                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Temporarily disable public access for maintenance</div>
                                </div>
                                <button
                                    onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                                    style={{
                                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                        background: systemSettings.maintenanceMode ? '#EF4444' : '#CBD5E1',
                                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                                        position: 'absolute', top: '3px', transition: 'left 0.2s',
                                        left: systemSettings.maintenanceMode ? '23px' : '3px',
                                    }} />
                                </button>
                            </div>
                            <button
                                onClick={saveSystem}
                                style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#0F4C75', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <Save size={14} /> Save System Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
