"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/context/AuthContext';
import { adminService, AuditLog } from '@/src/services/admin.service';
import { Loader2, LogOut, ShieldAlert, Activity, Users, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardClient() {
    const { user, logout } = useAuth();

    // Fetch Audit Logs
    const { data: auditData, isLoading: isLoadingLogs } = useQuery({
        queryKey: ['admin-audit-logs'],
        queryFn: async () => adminService.getAuditLogs(),
    });

    // Fetch Stats (Optional but good for dashboard)
    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => adminService.getStats(),
    });

    if (isLoadingLogs) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">Admin Access</span>
                            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors border border-transparent hover:border-gray-200"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon={FileText} />
                    <StatCard title="Active Patients" value={stats?.totalPatients || 0} icon={Users} />
                    <StatCard title="Active Doctors" value={stats?.totalDoctors || 0} icon={Activity} />
                    <StatCard title="System Events" value={auditData?.total || 0} icon={ShieldAlert} />
                </div>

                {/* Audit Logs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">System Audit Logs</h2>
                            <p className="text-sm text-gray-500">Track all security and operational events across the platform.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {auditData?.logs?.map((log: AuditLog) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action.includes('LOGIN') ? 'bg-green-100 text-green-800' :
                                                    log.action.includes('ERROR') ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.user?.email || 'System'}
                                            <span className="block text-xs text-gray-400 font-normal">{log.user?.role || ''}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))}
                                {(!auditData?.logs || auditData.logs.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd>
                                <div className="text-lg font-bold text-gray-900">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
