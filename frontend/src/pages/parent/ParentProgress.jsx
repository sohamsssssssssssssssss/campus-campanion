import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react';

const ParentProgress = () => {
    // Mock Data for Onboarding Steps
    const steps = [
        { id: 1, title: 'Account Created', date: '10 Feb 2024', status: 'completed' },
        { id: 2, title: 'Personal Details Verified', date: '12 Feb 2024', status: 'completed' },
        { id: 3, title: 'Documents Uploaded', date: '14 Feb 2024', status: 'completed' },
        { id: 4, title: 'Document Verification', date: '15 Feb 2024', status: 'completed' },
        { id: 5, title: 'Fee Payment', date: '16 Feb 2024', status: 'completed' },
        { id: 6, title: 'Course Registration', date: '17 Feb 2024', status: 'completed' },
        { id: 7, title: 'ID Card Generation', date: 'Today', status: 'in-progress' },
        { id: 8, title: 'Hostel Allocation', date: 'Pending', status: 'pending' },
        { id: 9, title: 'Library Access', date: 'Pending', status: 'pending' },
        { id: 10, title: 'Final Orientation', date: '20 Feb 2024', status: 'pending' },
    ];

    const completedCount = steps.filter(s => s.status === 'completed').length;
    const progressPercentage = (completedCount / steps.length) * 100;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Onboarding Progress</h1>
                        <p className="text-slate-400">Track your child's admission journey step-by-step</p>
                    </div>
                    <div className="bg-teal-500/10 border border-teal-500/20 px-6 py-3 rounded-xl">
                        <span className="block text-sm text-teal-400 uppercase font-bold tracking-wider mb-1">Status</span>
                        <span className="text-2xl font-bold text-white max-w-[150px] truncate">
                            {steps.find(s => s.status === 'in-progress')?.title || 'In Progress'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-2">
                    <div className="flex mb-2 items-center justify-between">
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-teal-400">
                                {progressPercentage}% Complete
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-700/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-teal-500 to-emerald-400"
                        ></motion.div>
                    </div>
                </div>
            </div>

            {/* Timeline Steps */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            {/* Icon Indicator */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f172a] bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {step.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : step.status === 'in-progress' ? (
                                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-600" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold ${step.status === 'completed' ? 'text-slate-200' :
                                            step.status === 'in-progress' ? 'text-teal-400' : 'text-slate-500'
                                        }`}>
                                        {step.title}
                                    </h3>
                                    <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                        {step.date}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    {step.status === 'completed' ? 'Successfully verified.' :
                                        step.status === 'in-progress' ? 'Currently be processed by admin.' :
                                            'Waiting for previous steps.'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParentProgress;
