import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, CreditCard, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const ParentFees = () => {
    // Mock Fee Structure
    const fees = [
        { id: 1, type: 'Tuition Fee (Year 1)', amount: 125000, paid: 125000, status: 'paid', date: '15 Aug 2023' },
        { id: 2, type: 'Development Fee', amount: 15000, paid: 15000, status: 'paid', date: '15 Aug 2023' },
        { id: 3, type: 'Hostel Deposit', amount: 30000, paid: 30000, status: 'paid', date: '16 Feb 2024' },
        { id: 4, type: 'Semester 2 Tuition', amount: 45000, paid: 0, status: 'pending', date: 'Due: 15 Mar 2024' },
        { id: 5, type: 'Library Fine', amount: 150, paid: 0, status: 'pending', date: 'Due: Immediate' },
    ];

    const totalPaid = fees.reduce((acc, fee) => acc + fee.paid, 0);
    const totalDue = fees.reduce((acc, fee) => acc + (fee.amount - fee.paid), 0);

    const handleSendReminder = () => {
        toast.success("Payment reminder sent to student's WhatsApp!");
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard className="w-24 h-24 text-teal-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Paid</p>
                    <h2 className="text-3xl font-bold text-white mt-1">₹{totalPaid.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Up to date for Sem 1</span>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertCircle className="w-24 h-24 text-amber-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Due</p>
                    <h2 className="text-3xl font-bold text-white mt-1">₹{totalDue.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Due by 15 Mar 2024</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-900/40 to-slate-900/40 border border-teal-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <Bell className="w-10 h-10 text-teal-400 mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">Payment Reminder</h3>
                    <p className="text-sm text-slate-400 mb-4">Notify your ward about pending dues</p>
                    <button
                        onClick={handleSendReminder}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium transition-colors"
                    >
                        Send WhatsApp Alert
                    </button>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Fee Breakdown</h2>
                    <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                        Download Receipt
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium">Due Date / Paid On</th>
                                <th className="p-4 font-medium">Info</th>
                                <th className="p-4 font-medium text-right">Amount</th>
                                <th className="p-4 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm">
                            {fees.map((fee) => (
                                <motion.tr
                                    key={fee.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="p-4 font-medium text-white">{fee.type}</td>
                                    <td className="p-4 text-slate-400">{fee.date}</td>
                                    <td className="p-4 text-slate-500">-</td>
                                    <td className="p-4 text-right font-mono text-slate-300">₹{fee.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {fee.status.toUpperCase()}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParentFees;
