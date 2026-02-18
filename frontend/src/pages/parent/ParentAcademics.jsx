import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, AlertTriangle } from 'lucide-react';

const ParentAcademics = () => {
    // Mock Academic Data
    const subjects = [
        { name: 'Engineering Mathematics-I', code: 'FEC101', marks: 85, attendance: 92, status: 'pass' },
        { name: 'Engineering Physics-I', code: 'FEC102', marks: 78, attendance: 88, status: 'pass' },
        { name: 'Engineering Chemistry-I', code: 'FEC103', marks: 91, attendance: 95, status: 'pass' },
        { name: 'Engineering Mechanics', code: 'FEC104', marks: 65, attendance: 76, status: 'warning' },
        { name: 'Basic Electrical Engg', code: 'FEC105', marks: 72, attendance: 82, status: 'pass' },
    ];

    const overallAttendance = Math.round(subjects.reduce((acc, sub) => acc + sub.attendance, 0) / subjects.length);
    const sgpa = 8.7;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="w-24 h-24 text-indigo-400" />
                    </div>
                    <p className="text-indigo-300 text-sm font-medium uppercase tracking-wider">Current SGPA</p>
                    <h2 className="text-4xl font-bold text-white mt-1">{sgpa}</h2>
                    <p className="text-sm text-slate-400 mt-2">Semester 1 Result</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24 text-emerald-400" />
                    </div>
                    <p className="text-emerald-300 text-sm font-medium uppercase tracking-wider">Overall Attendance</p>
                    <h2 className="text-4xl font-bold text-white mt-1">{overallAttendance}%</h2>
                    <p className="text-sm text-slate-400 mt-2">Target: 75%+</p>
                </div>

                <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-24 h-24 text-amber-500" />
                    </div>
                    <p className="text-amber-300 text-sm font-medium uppercase tracking-wider">Defaulter Status</p>
                    <h2 className="text-2xl font-bold text-white mt-2">Safe Zone</h2>
                    <p className="text-sm text-slate-400 mt-2">No subjects below 75%</p>
                </div>
            </div>

            {/* Performance Chart / List */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    Subject-wise Performance
                </h2>

                <div className="space-y-4">
                    {subjects.map((sub, index) => (
                        <motion.div
                            key={sub.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-200">{sub.name}</h3>
                                        <span className="text-xs font-mono text-slate-500">{sub.code}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            <span className="text-slate-400">Score: <b className="text-white">{sub.marks}/100</b></span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${sub.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            <span className="text-slate-400">Attendance: <b className="text-white">{sub.attendance}%</b></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block w-32">
                                    <div className="text-xs text-right text-slate-400 mb-1">Marks</div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${sub.marks}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParentAcademics;
