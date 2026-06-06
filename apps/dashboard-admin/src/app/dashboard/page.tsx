'use client';
import { useState } from 'react';
import {
    Users,
    FileText,
    ShieldCheck,
    AlertTriangle,
    Activity,
    LogOut,
    Settings,
    MoreVertical
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { label: 'Total Reports', value: '154', icon: <FileText className="text-blue-600" />, change: '+12% this week' },
        { label: 'Active Cases', value: '42', icon: <Activity className="text-orange-600" />, change: '7 assigned' },
        { label: 'Verified Users', value: '1,280', icon: <Users className="text-green-600" />, change: '+85 new' },
        { label: 'Critical Alerts', value: '3', icon: <AlertTriangle className="text-red-600" />, change: 'Immediate action' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Safe<span className="text-red-500">Rwanda</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Activity size={18} />
                        <span className="font-medium">Overview</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        <FileText size={18} />
                        <span className="font-medium">All Reports</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        <Users size={18} />
                        <span className="font-medium">Identity Registry</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        <Settings size={18} />
                        <span className="font-medium">System Settings</span>
                    </button>
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 mb-4">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold">A</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">Super Admin</p>
                            <p className="text-xs text-slate-500 truncate">admin@safe.gov.rw</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/30 transition-all">
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">System Administration</h1>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right">
                            <p className="text-sm font-semibold">Saturday, June 6</p>
                            <p className="text-xs text-gray-500">System Status: <span className="text-green-500 font-medium">Operational</span></p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            {stat.icon}
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">{stat.change}</p>
                                </div>
                            ))}
                        </div>

                        {/* Main Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Reports Table */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800">Live Audit Log</h3>
                                    <button className="text-xs text-blue-600 font-semibold hover:underline">Export CSV</button>
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Case ID</th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {[
                                                { id: 'RPT-8231', cat: 'Medical', prio: 'Critical', status: 'In Progress', color: 'bg-red-500' },
                                                { id: 'RPT-8230', cat: 'Fire', prio: 'High', status: 'Dispatched', color: 'bg-orange-500' },
                                                { id: 'RPT-8229', cat: 'Police', prio: 'Medium', status: 'Pending', color: 'bg-yellow-500' },
                                                { id: 'RPT-8228', cat: 'Police', prio: 'Low', status: 'Closed', color: 'bg-gray-400' },
                                            ].map((row, i) => (
                                                <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-bold text-blue-600 uppercase tracking-tight">{row.id}</td>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">{row.cat}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${row.color}`}>
                                                            {row.prio}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                            <span className="text-xs font-semibold text-gray-500">{row.status}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Identity Registry Info */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-6">Identity Registry</h3>
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs text-blue-800 font-bold uppercase mb-2">Connected Database</p>
                                        <p className="text-sm font-semibold text-blue-900 italic">Irembo National Identity Registry (Production)</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Verifications</h4>
                                        {[
                                            { name: 'Kamanzi Emmanuel', id: '1 1992 8 0123456 0 12', time: '2m ago' },
                                            { name: 'Mutesi Solange', id: '1 1995 7 0123456 1 45', time: '14m ago' },
                                            { name: 'Uwase Aline', id: '1 1988 8 0123456 0 88', time: '32m ago' },
                                        ].map((user, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">{user.name[0]}</div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-700">{user.name}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 tracking-wider">ID: {user.id}</p>
                                                </div>
                                                <span className="text-[10px] font-medium text-gray-500">{user.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
