'use client';
import { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    ShieldCheck,
    AlertTriangle,
    Activity,
    LogOut,
    Settings,
    MoreVertical,
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Bell,
    ChevronDown,
    ChevronRight,
    Map,
    Database,
    Shield,
    Zap,
    Globe,
} from 'lucide-react';

type TabId = 'overview' | 'reports' | 'identity' | 'settings';

const REPORTS = [
    { id: 'RPT-8231', cat: 'Medical Emergency', district: 'Nyarugenge', reporter: 'Kamanzi E.', prio: 'Critical', status: 'In Progress', time: '2m ago', color: 'bg-red-500', assigned: 'SAMU Unit 4' },
    { id: 'RPT-8230', cat: 'Fire & Hazard', district: 'Gasabo', reporter: 'Anonymous', prio: 'High', status: 'Dispatched', time: '11m ago', color: 'bg-orange-500', assigned: 'Fire Brigade B' },
    { id: 'RPT-8229', cat: 'Crime', district: 'Kicukiro', reporter: 'Mutesi S.', prio: 'Medium', status: 'Pending', time: '28m ago', color: 'bg-yellow-500', assigned: 'Unassigned' },
    { id: 'RPT-8228', cat: 'Road Accident', district: 'Nyarugenge', reporter: 'Uwase A.', prio: 'High', status: 'Dispatched', time: '45m ago', color: 'bg-orange-500', assigned: 'RNP Kigali' },
    { id: 'RPT-8227', cat: 'Missing Person', district: 'Musanze', reporter: 'Habimana J.', prio: 'Medium', status: 'Under Investigation', time: '1h ago', color: 'bg-yellow-500', assigned: 'RIB District' },
    { id: 'RPT-8226', cat: 'Medical Emergency', district: 'Rubavu', reporter: 'Nziza K.', prio: 'Critical', status: 'Resolved', time: '2h ago', color: 'bg-red-500', assigned: 'SAMU Unit 2' },
    { id: 'RPT-8225', cat: 'Crime', district: 'Huye', reporter: 'Anonymous', prio: 'Low', status: 'Closed', time: '3h ago', color: 'bg-gray-400', assigned: 'RNP South' },
    { id: 'RPT-8224', cat: 'GBV', district: 'Nyagatare', reporter: 'Anonymous', prio: 'High', status: 'Closed', time: '4h ago', color: 'bg-orange-500', assigned: 'RNP East' },
];

const VERIFICATIONS = [
    { name: 'Kamanzi Emmanuel', id: '1 1992 8 0123456 0 12', district: 'Nyarugenge', time: '2m ago', status: 'Verified' },
    { name: 'Mutesi Solange', id: '1 1995 7 0123456 1 45', district: 'Gasabo', time: '14m ago', status: 'Verified' },
    { name: 'Uwase Aline', id: '1 1988 8 0123456 0 88', district: 'Kicukiro', time: '32m ago', status: 'Verified' },
    { name: 'Habimana Jean', id: '1 2001 7 0456789 0 33', district: 'Musanze', time: '1h ago', status: 'Pending' },
    { name: 'Nziza Kevin', id: '1 1990 8 0789012 1 77', district: 'Rubavu', time: '2h ago', status: 'Failed' },
];

function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="flex flex-col text-right">
            <p className="text-sm font-bold text-gray-800">
                {time.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500">
                {time.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                <span className="text-green-500 font-semibold">● Operational</span>
            </p>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
        Dispatched: 'bg-orange-100 text-orange-700 border-orange-200',
        Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Resolved: 'bg-green-100 text-green-700 border-green-200',
        Closed: 'bg-gray-100 text-gray-600 border-gray-200',
        'Under Investigation': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

function StatCard({ label, value, icon, change, trend }: { label: string; value: string; icon: React.ReactNode; change: string; trend?: 'up' | 'down' | 'neutral' }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                    {icon}
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                <p className="text-xs text-gray-400 font-medium">{change}</p>
            </div>
        </div>
    );
}

function OverviewTab() {
    const stats = [
        { label: 'Total Reports', value: '1,847', icon: <FileText className="text-blue-600" size={20} />, change: '+23 this week', trend: 'up' as const },
        { label: 'Active Cases', value: '42', icon: <Activity className="text-orange-600" size={20} />, change: '7 newly assigned', trend: 'up' as const },
        { label: 'Verified Citizens', value: '12,840', icon: <Users className="text-green-600" size={20} />, change: '+185 this month', trend: 'up' as const },
        { label: 'Critical Alerts', value: '3', icon: <AlertTriangle className="text-red-600" size={20} />, change: 'Requires attention', trend: 'neutral' as const },
    ];

    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Main area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Bell size={16} className="text-blue-600" /> Live Activity Feed</h3>
                        <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {REPORTS.slice(0, 5).map((r, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.color}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{r.cat} — {r.district}</p>
                                    <p className="text-xs text-gray-400">{r.id} · Assigned to {r.assigned}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <StatusPill status={r.status} />
                                    <span className="text-xs text-gray-400">{r.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> System Health</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'API Gateway', status: true, latency: '32ms' },
                                { label: 'Supabase DB', status: true, latency: '8ms' },
                                { label: 'SMS Gateway', status: true, latency: '120ms' },
                                { label: 'Redis Cache', status: false, latency: 'N/A' },
                                { label: 'File Storage', status: true, latency: '45ms' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {s.status
                                            ? <CheckCircle size={14} className="text-green-500" />
                                            : <XCircle size={14} className="text-red-500" />}
                                        <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{s.latency}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white">
                        <h4 className="font-bold text-sm mb-1 text-slate-300 uppercase tracking-widest">Active Deployments</h4>
                        <p className="text-3xl font-black text-white mt-2">28</p>
                        <p className="text-slate-400 text-xs mt-1">across 5 districts</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-green-400 font-semibold">All units nominal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportsTab() {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const STATUSES = ['All', 'Pending', 'Dispatched', 'In Progress', 'Resolved', 'Closed'];
    const filtered = REPORTS.filter(r =>
        (filter === 'All' || r.status === filter) &&
        (search === '' || r.id.toLowerCase().includes(search.toLowerCase()) || r.cat.toLowerCase().includes(search.toLowerCase()) || r.district.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h3 className="font-bold text-gray-800">All Incident Reports</h3>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                        <Search size={14} className="text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search reports..."
                            className="text-sm bg-transparent outline-none w-36 placeholder-gray-400"
                        />
                    </div>
                    <button className="flex items-center gap-1 bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors">
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Status Filters */}
            <div className="px-6 py-3 flex gap-2 flex-wrap border-b border-gray-50">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filter === s ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/60">
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Case ID</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">District</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned To</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="py-4 px-6"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No reports match your filter</td></tr>
                        ) : filtered.map((row, i) => (
                            <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="py-4 px-6 text-sm font-bold text-blue-700 font-mono">{row.id}</td>
                                <td className="py-4 px-6 text-sm font-medium text-gray-700">{row.cat}</td>
                                <td className="py-4 px-6 text-sm text-gray-500">{row.district}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${row.color}`}>{row.prio}</span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">{row.assigned}</td>
                                <td className="py-4 px-6"><StatusPill status={row.status} /></td>
                                <td className="py-4 px-6 text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{row.time}</td>
                                <td className="py-4 px-6">
                                    <button className="opacity-0 group-hover:opacity-100 text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1 transition-opacity">
                                        <Eye size={12} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-50 text-xs text-gray-400 text-right">
                Showing {filtered.length} of {REPORTS.length} reports
            </div>
        </div>
    );
}

function IdentityTab() {
    const [search, setSearch] = useState('');
    const filtered = VERIFICATIONS.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) || v.id.includes(search)
    );
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-2xl p-6 flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl"><Database size={24} /></div>
                <div>
                    <p className="text-xs text-blue-200 uppercase tracking-widest font-bold mb-0.5">Connected Identity Source</p>
                    <p className="text-lg font-extrabold">Irembo National Identity Registry</p>
                    <p className="text-blue-300 text-xs mt-0.5">Production · MINABARE Authorized · TLS 1.3 Encrypted</p>
                </div>
                <div className="ml-auto text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-semibold text-green-300">Live</span>
                    </div>
                    <p className="text-xs text-blue-300 mt-1">Last sync: just now</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
                    <h3 className="font-bold text-gray-800">Verification Log</h3>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                        <Search size={14} className="text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="text-sm bg-transparent outline-none w-44 placeholder-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/60">
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">National ID</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">District</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Verified</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((v, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">{v.name[0]}</div>
                                            <span className="text-sm font-semibold text-gray-800">{v.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-xs text-gray-500 tracking-wider">{v.id}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{v.district}</td>
                                    <td className="py-4 px-6 text-xs text-gray-400">{v.time}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${v.status === 'Verified' ? 'bg-green-100 text-green-700 border-green-200' : v.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SettingsTab() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 800);
    };
    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Globe size={16} className="text-blue-600" /> System Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { label: 'Platform Name', value: 'Rwanda Safe Emergency System' },
                        { label: 'Government Entity', value: 'Ministry of Internal Security' },
                        { label: 'Admin Email', value: 'admin@safe.gov.rw' },
                        { label: 'Support Hotline', value: '112' },
                    ].map((f, i) => (
                        <div key={i}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                            <input defaultValue={f.value} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Shield size={16} className="text-green-600" /> Security & Access</h3>
                {[
                    { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', enabled: true },
                    { label: 'Audit Logging', desc: 'Log all admin actions for compliance', enabled: true },
                    { label: 'Anonymous Reports', desc: 'Allow citizens to report without identity', enabled: true },
                    { label: 'SMS Notifications', desc: 'Send SMS alerts to assigned officers', enabled: false },
                ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                        </div>
                        <button
                            className={`relative w-12 h-6 rounded-full transition-colors ${s.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center gap-2">
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
                    {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button className="px-8 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:border-gray-300 transition-colors">Cancel</button>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const NAV: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
        { id: 'reports', label: 'All Reports', icon: <FileText size={18} /> },
        { id: 'identity', label: 'Identity Registry', icon: <Users size={18} /> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block">Safe<span className="text-red-400">Rwanda</span></span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-widest">Admin Console</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === item.id
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800/60 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-sm">A</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">Super Admin</p>
                                <p className="text-xs text-slate-500 truncate">admin@safe.gov.rw</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-950/30 transition-all text-sm font-medium">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">
                            {NAV.find(n => n.id === activeTab)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LiveClock />
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'reports' && <ReportsTab />}
                        {activeTab === 'identity' && <IdentityTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </div>
                </main>
            </div>
        </div>
    );
}
