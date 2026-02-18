import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, CheckSquare, Wallet, GraduationCap,
    MapPin, Bell, User, LogOut, Globe, PhoneCall, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const ParentLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const parent = JSON.parse(localStorage.getItem('cc_parent') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('cc_parent_token');
        localStorage.removeItem('cc_parent');
        navigate('/parent-login');
    };

    const handleSOS = async () => {
        const confirmSOS = window.confirm("🚨 EMERGENCY: Are you sure you want to trigger an SOS alert?");
        if (!confirmSOS) return;

        try {
            toast.loading('Sending Emergency Alert...', { id: 'sos' });
            await axios.post(`${API_URL}/parent/sos`, {
                student_id: parent.student_id || 'unknown',
                location: 'Triggered via Parent App'
            });
            toast.success('🚨 SOS Alert Sent to Security!', { id: 'sos', duration: 5000 });
        } catch (error) {
            toast.error('Failed to send SOS', { id: 'sos' });
        }
    };

    const navItems = [
        { path: '/parent/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/parent/progress', label: 'Onboarding', icon: CheckSquare },
        { path: '/parent/fees', label: 'Fees & Dues', icon: Wallet },
        { path: '/parent/academics', label: 'Academics', icon: GraduationCap },
        { path: '/parent/location', label: 'Location', icon: MapPin },
        { path: '/parent/alerts', label: 'Alerts', icon: Bell },
        { path: '/parent/mentor', label: 'Mentor', icon: User },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-[#0f172a] sticky top-0 h-screen z-20 shrink-0">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                        Parent Portal
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-3">
                    <button
                        onClick={handleSOS}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors animate-pulse"
                    >
                        <PhoneCall className="w-5 h-5" />
                        <span className="font-bold">SOS Emergency</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 px-4 py-2 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800 z-30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-200">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                    <span className="font-bold text-teal-400">Parent Portal</span>
                </div>
                <button onClick={handleSOS} className="p-2 bg-red-500/20 text-red-400 rounded-full animate-pulse">
                    <PhoneCall className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute left-0 top-16 bottom-0 w-64 bg-[#0f172a] border-r border-slate-800 p-4" onClick={e => e.stopPropagation()}>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 w-full text-left mt-8 border-t border-slate-800 pt-4">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
                <div className="flex justify-end mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
                        <Globe className="w-3 h-3" />
                        <span>English (EN)</span>
                    </div>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default ParentLayout;
