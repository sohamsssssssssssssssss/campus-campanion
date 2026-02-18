import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    FileUp,
    Users,
    GraduationCap,
    Sparkles,
    Menu,
    X,
    Shield,
    CreditCard
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/documents', icon: FileUp, label: 'Documents' },
    { path: '/roommates', icon: Users, label: 'Roommates' },
    { path: '/safety', icon: Shield, label: 'Safety & Help' },
    { path: '/payment', icon: CreditCard, label: 'Fees & Payments' },
    { path: '/acad', icon: GraduationCap, label: 'AcademAI' },
];

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface-card border-b border-line flex items-center px-4 z-50">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-content-muted hover:text-content">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="flex items-center gap-2 ml-3">
                    <Sparkles size={18} className="text-accent" />
                    <span className="font-semibold text-sm">CampusCompanion</span>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="lg:hidden fixed top-14 left-0 right-0 bg-surface-card border-b border-line z-40 py-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-6 py-3 text-sm ${location.pathname === item.path
                                ? 'text-accent bg-accent/10'
                                : 'text-content-muted hover:text-content hover:bg-surface-hover'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-surface-card border-r border-line flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-line">
                    <div className="flex items-center gap-2.5">
                        <Sparkles size={22} className="text-accent" />
                        <span className="font-bold text-lg">CampusCompanion</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-1 transition-colors ${location.pathname === item.path
                                ? 'text-white bg-accent'
                                : 'text-content-muted hover:text-content hover:bg-surface-hover'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-line">
                    <p className="text-xs text-content-muted">TCET Mumbai • 2024-28</p>
                </div>
            </aside>
        </>
    );
}
