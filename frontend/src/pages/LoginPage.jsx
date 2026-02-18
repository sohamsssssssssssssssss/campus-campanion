import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            if (email === 'demo@student.com' && password === 'demo123') {
                localStorage.setItem('studentToken', 'mock-jwt-token');
                localStorage.setItem('studentId', 'demo_student');
                toast.success(`Welcome back, Demo Student!`);
                navigate('/dashboard');
            } else if (email && password) {
                // Allow any login for demo purposes if specific credentials arent used
                localStorage.setItem('studentToken', 'mock-jwt-token-generic');
                localStorage.setItem('studentId', 'demo_student');
                toast.success(`Welcome to CampusCompanion!`);
                navigate('/dashboard');
            } else {
                toast.error('Please enter valid credentials.');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 mb-4 shadow-lg shadow-teal-500/20"
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">Sign in to continue your journey</p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl shadow-xl"
                >
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="demo@student.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-teal-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <button className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                                Apply Now
                            </button>
                        </p>
                    </div>
                </motion.div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>Protected by CampusCompanion Security</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
