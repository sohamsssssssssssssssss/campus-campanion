import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, CreditCard, AlertCircle, CheckCircle,
    Bell, X, Smartphone, Building2, Loader2, IndianRupee, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SHARED_FEES } from '../../data/feeData';

const PAYMENT_TABS = [
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Bank of Baroda'];

export default function ParentFees() {
    const [fees, setFees] = useState(SHARED_FEES);
    const [payingFee, setPayingFee] = useState(null);
    const [payTab, setPayTab] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [cardNo, setCardNo] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [paying, setPaying] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    const totalPaid = fees.reduce((acc, f) => acc + f.paid, 0);
    const totalDue = fees.reduce((acc, f) => acc + (f.amount - f.paid), 0);

    const handleSendReminder = () => toast.success("Payment reminder sent to student's WhatsApp!");

    const openPayModal = (fee) => {
        setPayingFee(fee);
        setPayTab('upi');
        setUpiId('');
        setCardNo('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
        setSelectedBank('');
        setPaySuccess(false);
    };

    const closePayModal = () => {
        setPayingFee(null);
        setPaySuccess(false);
        setPaying(false);
    };

    const handlePay = async () => {
        if (payTab === 'upi' && !upiId.includes('@')) {
            toast.error('Enter a valid UPI ID (e.g. name@upi)'); return;
        }
        if (payTab === 'card' && (cardNo.replace(/\s/g, '').length < 16 || !cardExpiry || !cardCvv || !cardName)) {
            toast.error('Please fill all card details'); return;
        }
        if (payTab === 'netbanking' && !selectedBank) {
            toast.error('Please select a bank'); return;
        }

        setPaying(true);
        await new Promise(r => setTimeout(r, 2200));
        setPaying(false);
        setPaySuccess(true);

        setFees(prev => prev.map(f =>
            f.id === payingFee.id
                ? { ...f, status: 'paid', paid: f.amount, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
                : f
        ));

        toast.success(`₹${payingFee.amount.toLocaleString()} paid successfully!`, { duration: 5000 });
    };

    const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const formatExpiry = (val) => val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

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
                        <span>{totalDue > 0 ? 'Due by 15 Mar 2024' : 'All dues cleared ✓'}</span>
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
                                <th className="p-4 font-medium text-right">Amount</th>
                                <th className="p-4 font-medium text-center">Status</th>
                                <th className="p-4 font-medium text-center">Action</th>
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
                                    <td className="p-4 text-right font-mono text-slate-300">₹{fee.amount.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'paid'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                            {fee.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {fee.status === 'pending' ? (
                                            <button
                                                onClick={() => openPayModal(fee)}
                                                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-lg shadow-teal-900/30"
                                            >
                                                <IndianRupee size={12} />
                                                Pay Now
                                            </button>
                                        ) : (
                                            <span className="text-slate-600 text-xs">—</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {payingFee && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closePayModal}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-teal-900/60 to-slate-900 px-6 py-5 flex items-center justify-between border-b border-slate-700/50">
                                <div>
                                    <p className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-0.5">TCET Fee Payment</p>
                                    <h3 className="text-lg font-black text-white">{payingFee.type}</h3>
                                </div>
                                <button onClick={closePayModal} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {paySuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-10 text-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-2">Payment Successful!</h4>
                                    <p className="text-slate-400 mb-1">₹{payingFee.amount.toLocaleString()} paid</p>
                                    <p className="text-slate-500 text-sm mb-8">Ref: TCET{Date.now().toString().slice(-8)}</p>
                                    <button
                                        onClick={closePayModal}
                                        className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="p-6 space-y-5">
                                    <div className="bg-slate-800/60 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">Amount to Pay</span>
                                        <span className="text-2xl font-black text-white">₹{payingFee.amount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
                                        {PAYMENT_TABS.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setPayTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${payTab === tab.id
                                                    ? 'bg-teal-600 text-white shadow-lg'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <tab.icon size={14} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {payTab === 'upi' && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">UPI ID</label>
                                            <input
                                                value={upiId}
                                                onChange={e => setUpiId(e.target.value)}
                                                placeholder="yourname@upi"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                                            />
                                            <p className="text-xs text-slate-500">Supports GPay, PhonePe, Paytm, BHIM</p>
                                        </div>
                                    )}

                                    {payTab === 'card' && (
                                        <div className="space-y-3">
                                            <input
                                                value={cardNo}
                                                onChange={e => setCardNo(formatCard(e.target.value))}
                                                placeholder="Card Number"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors font-mono tracking-widest"
                                            />
                                            <input
                                                value={cardName}
                                                onChange={e => setCardName(e.target.value)}
                                                placeholder="Name on Card"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                                            />
                                            <div className="flex gap-3">
                                                <input
                                                    value={cardExpiry}
                                                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                                    placeholder="MM/YY"
                                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                                                />
                                                <input
                                                    value={cardCvv}
                                                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                    placeholder="CVV"
                                                    type="password"
                                                    className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {payTab === 'netbanking' && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Bank</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {BANKS.map(bank => (
                                                    <button
                                                        key={bank}
                                                        type="button"
                                                        onClick={() => setSelectedBank(bank)}
                                                        className={`text-left px-3 py-2.5 rounded-xl text-sm border transition-all ${selectedBank === bank
                                                            ? 'border-teal-500 bg-teal-500/10 text-teal-300 font-bold'
                                                            : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                                                            }`}
                                                    >
                                                        {bank}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePay}
                                        disabled={paying}
                                        className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-teal-900/40"
                                    >
                                        {paying ? (
                                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                        ) : (
                                            <><Lock size={14} /> Pay ₹{payingFee.amount.toLocaleString()} Securely</>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1">
                                        <Lock size={10} /> 256-bit SSL encrypted · Powered by Razorpay
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
