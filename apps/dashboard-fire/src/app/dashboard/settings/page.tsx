'use client';
import { useState } from 'react';
import { Settings, User, Bell, Shield, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

const ACCENT = '#EA580C';

export default function FireSettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [showOldPw, setShowOldPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        badgeNumber: '',
        station: 'Kigali Central Fire Station',
    });

    const [notifSettings, setNotifSettings] = useState({
        newIncident: true,
        dispatchAlert: true,
        hazmatAlert: true,
        dailyReport: false,
        smsNotifications: true,
    });

    const [secForm, setSecForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const saveProfile = () => toast.success('Profile updated successfully');
    const saveNotif = () => toast.success('Notification preferences saved');
    const savePassword = () => {
        if (!secForm.oldPassword || !secForm.newPassword) return toast.error('Please fill all fields');
        if (secForm.newPassword !== secForm.confirmPassword) return toast.error('Passwords do not match');
        if (secForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
        toast.success('Password changed successfully');
        setSecForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #C2410C)` }}>
                    <Settings size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Settings</h2>
                    <p className="text-sm text-slate-500">Manage your profile and preferences</p>
                </div>
            </div>

            <div className="flex gap-5 flex-wrap">
                {/* Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-2 h-fit min-w-[180px]">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all"
                                style={{ background: active ? '#FFF7ED' : 'transparent', color: active ? ACCENT : '#64748B', fontWeight: active ? 700 : 500 }}
                            >
                                <Icon size={15} />{label}
                            </button>
                        );
                    })}
                </div>

                {/* Panel */}
                <div className="flex-1 min-w-[300px]">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 mb-5">Profile Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Full Name', key: 'name' },
                                    { label: 'Email Address', key: 'email' },
                                    { label: 'Phone Number', key: 'phone' },
                                    { label: 'Badge Number', key: 'badgeNumber' },
                                    { label: 'Station', key: 'station' },
                                ].map((f) => (
                                    <div key={f.key} style={{ gridColumn: f.key === 'station' ? 'span 2' : undefined }}>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                                        <input
                                            value={(profileForm as any)[f.key]}
                                            onChange={(e) => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 text-slate-900 outline-none focus:border-orange-400"
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={saveProfile} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg, ${ACCENT}, #C2410C)` }}>
                                <Save size={14} /> Save Profile
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 mb-5">Notification Preferences</h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    { key: 'newIncident', label: 'New Incident Alert', desc: 'Get notified on new fire incidents' },
                                    { key: 'dispatchAlert', label: 'Dispatch Alerts', desc: 'Receive dispatch and team assignment alerts' },
                                    { key: 'hazmatAlert', label: 'Hazmat Warnings', desc: 'Immediate alert for hazardous material incidents' },
                                    { key: 'dailyReport', label: 'Daily Summary', desc: 'Receive daily incident summary report' },
                                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive critical alerts via SMS' },
                                ].map((item) => (
                                    <div key={item.key} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                                        <div>
                                            <div className="text-[13px] font-semibold text-slate-900">{item.label}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                                            style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: (notifSettings as any)[item.key] ? ACCENT : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                                        >
                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', transition: 'left 0.2s', left: (notifSettings as any)[item.key] ? '23px' : '3px' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={saveNotif} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg, ${ACCENT}, #C2410C)` }}>
                                <Save size={14} /> Save Preferences
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 mb-5">Change Password</h3>
                            <div className="flex flex-col gap-4 max-w-sm">
                                {[
                                    { key: 'oldPassword', label: 'Current Password', show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                                    { key: 'newPassword', label: 'New Password', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                                    { key: 'confirmPassword', label: 'Confirm New Password', show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={field.show ? 'text' : 'password'}
                                                value={(secForm as any)[field.key]}
                                                onChange={(e) => setSecForm({ ...secForm, [field.key]: e.target.value })}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-[13px] bg-slate-50 text-slate-900 outline-none focus:border-orange-400"
                                            />
                                            <button onClick={field.toggle} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                                {field.show ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <AlertCircle size={14} color="#EA580C" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    <p className="text-[11px] text-orange-700 m-0">Minimum 8 characters with letters and numbers.</p>
                                </div>
                            </div>
                            <button onClick={savePassword} className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold" style={{ background: `linear-gradient(135deg, ${ACCENT}, #C2410C)` }}>
                                <Shield size={14} /> Update Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
