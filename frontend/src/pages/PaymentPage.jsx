import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, CheckCircle, AlertCircle, Calendar,
    Download, ShieldCheck, ChevronRight, IndianRupee
} from 'lucide-react';
import { studentApi } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import MockPaymentGateway from '../components/MockPaymentGateway';
import { SHARED_FEES } from '../data/feeData';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const PaymentPage = () => {
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed
    const [showMockGateway, setShowMockGateway] = useState(false);
    const [mockOrderDetails, setMockOrderDetails] = useState(null);
    const studentId = 'demo_student'; // In real app, get from auth context

    // Use shared fee data — same as parent portal
    const feeBreakdown = SHARED_FEES.map(f => ({
        name: f.type,
        amount: f.amount,
        description: f.description,
        status: f.status,
    }));

    // Only show pending fees in "Outstanding Dues"
    const pendingFees = feeBreakdown.filter(f => f.status === 'pending');
    const totalAmount = SHARED_FEES.reduce((acc, f) => acc + (f.amount - f.paid), 0);

    // Robust Razorpay Loader
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const student_id = localStorage.getItem('cc_student_id') || 'demo_student';

        try {
            setLoading(true);
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 1. Create Order in Backend
            const orderRes = await axios.post(`${API_URL}/payments/create-order`, {
                student_id: student_id,
                amount: totalAmount * 100 // Convert to paise
            });

            if (!orderRes.data.success) {
                throw new Error("Failed to create order");
            }

            const { order_id, amount, currency, key, demo } = orderRes.data;

            if (demo) {
                // Open Mock Gateway for realistic experience without real keys
                setMockOrderDetails({ order_id, student_id });
                setShowMockGateway(true);
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Checkout Modal (Real Mode)
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: "CampusCompanion AI",
                description: "Academic Fee Payment",
                order_id: order_id,
                handler: async function (response) {
                    try {
                        toast.loading('Verifying payment...', { id: 'verify' });
                        // 3. Verify Payment in Backend
                        const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            student_id: student_id
                        });

                        if (verifyRes.data.success) {
                            toast.success('🎉 Payment successful!', { id: 'verify' });
                            setPaymentStatus('success');
                        } else {
                            setPaymentStatus('failed');
                            toast.error('Payment verification failed.', { id: 'verify' });
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        setPaymentStatus('failed');
                        toast.error('Something went wrong during verification.', { id: 'verify' });
                    }
                },
                prefill: {
                    name: "Demo Student",
                    email: "student@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4f46e5"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            toast.error('Payment failed to initialize', { id: 'payment' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMockSuccess = async () => {
        if (!mockOrderDetails) return;

        try {
            toast.loading('Verifying payment...', { id: 'verify' });
            setShowMockGateway(false);

            const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
                razorpay_order_id: mockOrderDetails.order_id,
                razorpay_payment_id: `pay_demo_${Date.now()}`,
                razorpay_signature: 'demo_signature',
                student_id: mockOrderDetails.student_id
            });

            if (verifyRes.data.success) {
                toast.success('🎉 Payment successful!', { id: 'verify' });
                setPaymentStatus('success');
            }
        } catch (err) {
            toast.error('Demo verification failed');
            setPaymentStatus('failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 pt-24">
            <AnimatePresence>
                {showMockGateway && (
                    <MockPaymentGateway
                        isOpen={showMockGateway}
                        onClose={() => { setShowMockGateway(false); setLoading(false); }}
                        amount={totalAmount}
                        onSuccess={handleMockSuccess}
                    />
                )}
            </AnimatePresence>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <IndianRupee className="w-8 h-8 text-indigo-400" />
                        Fee Payment Portal
                    </h1>
                    <p className="text-slate-400">Complete your academic payments securely via Razorpay.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Fee Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-2 space-y-4"
                    >
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-400" />
                                Outstanding Dues
                            </h2>

                            <div className="space-y-4">
                                {pendingFees.map((fee, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-indigo-500/30 transition-colors group">
                                        <div>
                                            <p className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">{fee.name}</p>
                                            <p className="text-xs text-slate-500">{fee.description}</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-100">₹{fee.amount.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold text-slate-300">Total Amount</p>
                                    <p className="text-3xl font-black text-indigo-400">₹{totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p className="text-sm text-indigo-200">
                                All transactions are secured with 256-bit encryption. Payment processing by Razorpay.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column: Status & Action */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <AnimatePresence mode="wait">
                            {paymentStatus === 'pending' && (
                                <motion.div
                                    key="pending"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Ready to Pay?</h3>
                                        <p className="text-sm text-slate-400 mb-6">
                                            Upon clicking "Pay Fees", a secure Razorpay window will open for payment.
                                        </p>

                                        <div className="space-y-4 mb-6 text-sm">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                Multiple Payment Options
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                Instant Digitized Receipt
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                Automatic Progress Update
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-600/20 group"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Pay Fees Now
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {paymentStatus === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-xl text-center"
                                >
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">Payment Successful!</h3>
                                    <p className="text-slate-400 mb-8 text-sm">
                                        Thank you! Your fees state has been updated, and onboarding progress recorded.
                                    </p>

                                    <div className="space-y-3">
                                        <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
                                            <Download className="w-4 h-4" />
                                            Download Receipt (PDF)
                                        </button>
                                        <button
                                            onClick={() => window.location.href = '/dashboard'}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-medium text-sm"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {paymentStatus === 'failed' && (
                                <motion.div
                                    key="failed"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 backdrop-blur-xl text-center"
                                >
                                    <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="w-12 h-12 text-rose-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-rose-400 mb-2">Payment Failed</h3>
                                    <p className="text-slate-400 mb-8 text-sm">
                                        Something went wrong during the checkout process. No money was deducted from your account.
                                    </p>

                                    <button
                                        onClick={() => setPaymentStatus('pending')}
                                        className="w-full bg-rose-600 hover:bg-rose-500 py-3 rounded-xl font-medium text-sm"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
