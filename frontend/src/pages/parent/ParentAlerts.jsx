import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CreditCard, ShieldAlert, Award, Calendar } from 'lucide-react';

const ParentAlerts = () => {
    // Mock Alerts
    const alerts = [
        { id: 1, type: 'academic', title: 'Mid-Term Results Announced', desc: 'Semester 1 mid-term results are now available.', time: '2 hours ago', icon: <Award className="w-5 h-5 text-indigo-400" />, bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        { id: 2, type: 'financial', title: 'Fee Payment Reminder', desc: 'Semester 2 Tuition Fee is due by 15th March.', time: 'Yesterday', icon: <CreditCard className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { id: 3, type: 'security', title: 'Late Entry Recorded', desc: 'Entered campus at 10:30 PM (Permitted time: 10:00 PM).', time: '16 Feb', icon: <ShieldAlert className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 4, type: 'event', title: 'Annual Tech Fest', desc: 'Inviting all parents for the inauguration ceremony.', time: '10 Feb', icon: <Calendar className="w-5 h-5 text-teal-400" />, bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    ];

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                        <Bell className="w-6 h-6 text-teal-400" />
                    </div>
                    Notifications
                </h1>
                <button className="text-sm text-slate-400 hover:text-white transition-colors">Mark all as read</button>
            </div>

            <div className="space-y-4">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${alert.border} ${alert.bg} flex gap-4 hover:brightness-110 transition-all cursor-pointer`}
                    >
                        <div className="shrink-0 mt-1">
                            {alert.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-200">{alert.title}</h3>
                                <span className="text-xs text-slate-500 whitespace-nowrap">{alert.time}</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{alert.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center pt-8 text-slate-500 text-sm">
                No older notifications to display.
            </div>
        </div>
    );
};

export default ParentAlerts;
