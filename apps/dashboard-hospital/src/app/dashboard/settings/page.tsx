'use client';
import { useState } from 'react';
import { Settings, User, Bell, Shield, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

export default function SharedSettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    const [notifSettings, setNotifSettings] = useState({
        emailAlerts: true,
        smsAlerts: true,
    });

    const saveNotif = () => toast.success('Notification preferences saved');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-slate-800 flex items-center justify-center">
                    <Settings size={22} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 m-0">Settings</h2>
                    <p className="text-sm text-slate-500 m-0">Manage your account and preferences</p>
                </div>
            </div>

            <div className="flex gap-5 flex-wrap">
                <div className="bg-white rounded-xl border border-slate-200 p-2 min-w-[200px] h-fit">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-none text-sm font-medium transition-all mb-1 cursor-pointer ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1 min-w-[320px]">
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 m-0 mb-5">Profile Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                                    <div className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
                                        {user?.name || 'Unknown Officer'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
                                    <div className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
                                        {user?.role?.replace(/_/g, ' ') || 'Staff'}
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contact Method</label>
                                    <div className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
                                        {user?.phone || user?.email || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2">
                                <AlertCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 m-0 leading-relaxed">
                                    Your profile information is managed by your base agency. Contact a Super Admin to update these details.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 m-0 mb-5">Notification Preferences</h3>
                            <div className="flex flex-col gap-4">
                                {[
                                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive alerts via email' },
                                    { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive critical alerts via SMS' },
                                ].map((item) => (
                                    <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !(notifSettings as any)[item.key] })}
                                            className={`w-11 h-6 rounded-full border-none cursor-pointer relative transition-colors flex-shrink-0 ${(notifSettings as any)[item.key] ? 'bg-blue-700' : 'bg-slate-300'
                                                }`}
                                        >
                                            <div className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-all ${(notifSettings as any)[item.key] ? 'left-[22px]' : 'left-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={saveNotif}
                                className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl border-none bg-blue-700 text-white text-sm font-bold cursor-pointer hover:bg-blue-800 transition-colors"
                            >
                                <Save size={14} /> Save Preferences
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-7">
                            <h3 className="text-base font-bold text-slate-900 m-0 mb-5">Password & Security</h3>
                            <div className="mt-2 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 max-w-md">
                                <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 m-0 mb-1">Password Management Restricted</h4>
                                    <p className="text-xs text-amber-800 m-0 leading-relaxed">
                                        As a security protocol, passwords must be rotated and managed by an administrator. Please contact your agency's Super Admin to reset your password.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
