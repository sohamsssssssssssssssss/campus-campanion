import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, MapPin, Clock, Calendar, CheckCircle, AlertTriangle,
    TrendingUp, Award, Phone, Shield
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const ParentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const parent = JSON.parse(localStorage.getItem('cc_parent') || '{}');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, use the student_id from the parent object
                const studentId = parent.student_id || 'demo_student';
                const res = await axios.get(`${API_URL}/parent/student/${studentId}/overview`);
                setStudentData(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast.error("Could not load student data");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!studentData) return null;

    const { student, stats, notifications } = studentData;

    return (
        <div className="space-y-6">
            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="w-48 h-48 text-teal-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-teal-500/50 flex items-center justify-center text-2xl font-bold text-teal-400">
                        {student.name.charAt(0)}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{student.name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-teal-500" />
                                {student.branch} • Year 1
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="w-4 h-4 text-indigo-400" />
                                Roll No: {student.roll_no}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Good</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-3xl font-bold text-white">{stats.attendance}</span>
                        <p className="text-sm text-slate-400">Overall Attendance</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full">Due Soon</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-3xl font-bold text-white">{stats.fees_due}</span>
                        <p className="text-sm text-slate-400">Pending Fees</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <MapPin className="w-6 h-6 text-indigo-500" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full">Live</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-lg font-bold text-white truncate">{stats.location}</span>
                        <p className="text-sm text-slate-400">Current Location • {stats.last_active}</p>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activities & Notifications */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                        Recent Updates
                    </h3>
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.type === 'alert' ? 'bg-red-500' :
                                        notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                    }`} />
                                <div>
                                    <p className="text-slate-200 text-sm font-medium">{notif.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">{notif.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-teal-400" />
                        Contact Mentor
                    </h3>
                    <div className="bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Dr. Anjali Gupta</p>
                            <p className="text-xs text-slate-400">Class Mentor • IT Dept</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors">
                            <Phone className="w-4 h-4" />
                            Call Now
                        </button>
                        <button
                            onClick={() => window.open('https://wa.me/', '_blank')}
                            className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white transition-colors"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
