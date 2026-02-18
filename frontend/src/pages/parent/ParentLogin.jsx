import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const ParentLogin = () => {
    const [step, setStep] = useState('phone'); // phone, otp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/parent/send-otp`, { phone });
            setLoading(false);
            setStep('otp');
            toast.success('OTP sent to your number!');
        } catch (error) {
            setLoading(false);
            toast.error('Failed to send OTP. Try again.');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length < 6) return;

        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/parent/verify-otp`, { phone, otp });

            localStorage.setItem('cc_parent_token', res.data.token);
            localStorage.setItem('cc_parent', JSON.stringify(res.data.parent));

            toast.success(`Welcome back, ${res.data.parent.name}!`);
            navigate('/parent/dashboard');
        } catch (error) {
            setLoading(false);
            toast.error('Invalid OTP. Please check and try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        Parent Portal
                    </h1>
                    <p className="text-slate-400">Secure access to your child's progress</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
                    <AnimatePresence mode="wait">
                        {step === 'phone' && (
                            <motion.form
                                key="phone"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSendOTP}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="tel"
                                            placeholder="+91 99999 99999"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.form>
                        )}

                        {step === 'otp' && (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOTP}
                                className="space-y-4"
                            >
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 mb-2">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-slate-400">Enter the 6-digit code sent to<br /> <span className="text-slate-200 font-medium">{phone}</span></p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">OTP Code</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-colors text-center tracking-widest text-lg"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('phone')}
                                    className="w-full text-slate-500 text-sm hover:text-slate-300"
                                >
                                    Change Phone Number
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>Having trouble? Contact College Admin</p>
                </div>
            </div>
        </div>
    );
};

export default ParentLogin;
