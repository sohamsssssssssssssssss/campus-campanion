import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CreditCard, Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MockPaymentGateway({ isOpen, onClose, amount, onSuccess }) {
    const [method, setMethod] = useState('qr'); // 'qr', 'card', 'upi'
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePay = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            onSuccess();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]"
            >
                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-700 text-lg">Payment Methods</h3>
                            <p className="text-xs text-slate-500">Select how you want to pay</p>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setMethod('qr')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${method === 'qr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-200 text-slate-600'
                                    }`}
                            >
                                <QrCode size={18} /> UPI QR
                            </button>
                            <button
                                onClick={() => setMethod('card')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${method === 'card' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-200 text-slate-600'
                                    }`}
                            >
                                <CreditCard size={18} /> Card
                            </button>
                            <button
                                onClick={() => setMethod('upi')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${method === 'upi' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-slate-200 text-slate-600'
                                    }`}
                            >
                                <Smartphone size={18} /> UPI ID
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-400 font-medium mb-1">Total Payable</p>
                        <p className="text-2xl font-black text-slate-800">₹{amount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 relative flex flex-col">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">RC</div>
                        <span className="font-bold text-slate-700">Razorpay Secure (Demo)</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        {method === 'qr' && (
                            <div className="text-center">
                                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-indigo-200 mb-4 inline-block shadow-sm">
                                    {/* Deterministic QR code based on amount */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=demo@razorpay&pn=CampusCompanion&am=${amount}&cu=INR`}
                                        alt="UPI QR"
                                        className="w-40 h-40 opacity-90"
                                    />
                                </div>
                                <p className="text-sm font-bold text-slate-700 mb-1">Scan with any UPI App</p>
                                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, etc.</p>
                            </div>
                        )}

                        {method === 'card' && (
                            <div className="w-full max-w-sm space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">CVV</label>
                                        <input
                                            type="password"
                                            placeholder="123"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    Test Mode: Enter any details to proceed
                                </div>
                            </div>
                        )}

                        {method === 'upi' && (
                            <div className="w-full max-w-sm">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">UPI ID / VPA</label>
                                <div className="relative mb-2">
                                    <input
                                        type="text"
                                        placeholder="username@upi"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                                <div className="text-center text-xs text-slate-400">
                                    A collect request will be sent to your UPI app
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handlePay}
                            disabled={processing}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all shadow-xl shadow-indigo-600/20 ${processing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.02]'
                                }`}
                        >
                            {processing ? (
                                <>Processing...</>
                            ) : (
                                <>Pay ₹{amount.toLocaleString()}</>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
