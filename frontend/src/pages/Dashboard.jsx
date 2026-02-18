import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    FileUp,
    Users,
    GraduationCap,
    CheckCircle2,
    Circle,
    ArrowRight,
    Shield,
    IndianRupee,
    AlertTriangle,
    Calendar,
    Bell
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

import ActionItemsBanner from '../components/ActionItemsBanner';
import NudgeDrawer from '../components/NudgeDrawer';
import NudgeToast from '../components/NudgeToast';

const featureCards = [
    { path: '/chat', icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions about onboarding' },
    { path: '/documents', icon: FileUp, title: 'Documents', desc: 'Upload and verify documents' },
    { path: '/roommates', icon: Users, title: 'Roommates', desc: 'Find compatible roommates' },
    { path: '/safety', icon: Shield, title: 'Safety Hub', desc: 'SOS, support & reporting' },
    { path: '/payment', icon: IndianRupee, title: 'Fees & Payments', desc: 'Pay fees & download receipts' },
    { path: '/acad', icon: GraduationCap, title: 'AcademAI', desc: 'Lectures, quizzes & groups' },
];

const defaultSteps = [
    { name: 'Profile Setup', completed: true },
    { name: 'Document Verification', completed: false },
    { name: 'Fee Payment', completed: false },
    { name: 'Hostel Allocation', completed: false },
    { name: 'Course Registration', completed: false },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [steps, setSteps] = useState(defaultSteps);
    const [loading, setLoading] = useState(true);
    const [isCalendarSynced, setIsCalendarSynced] = useState(false);
    const [onboardingProgress, setOnboardingProgress] = useState(null);

    // Nudge State
    const [nudges, setNudges] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDrawer, setShowDrawer] = useState(false);
    const [currentToast, setCurrentToast] = useState(null);

    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

    const handleGoogleSync = async () => {
        toast('Google Calendar Sync coming soon!', {
            icon: '🚧',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const fetchNudges = async () => {
        try {
            const res = await axios.get(`${API_URL}/nudges/student/demo_student`);
            if (res.data.success) {
                setNudges(res.data.nudges);
                setUnreadCount(res.data.unread_count);

                // Show toast for the most recent unread nudge if it exists
                const recentUnread = res.data.nudges.find(n => !n.is_seen && !n.action_taken);
                if (recentUnread) {
                    // Only show if we haven't shown it this session (mock logic)
                    // For demo, we just show it after a small delay
                    setTimeout(() => setCurrentToast(recentUnread), 1500);
                }
            }
        } catch (error) {
            console.error("Failed to fetch nudges", error);
        }
    };

    const handleMarkRead = (nudgeId) => {
        setNudges(prev => prev.map(n => n.id === nudgeId ? { ...n, is_seen: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // API call to mark seen
        axios.post(`${API_URL}/nudges/seen`, { nudge_id: nudgeId }).catch(console.error);
    };

    const handleAction = (nudge) => {
        setCurrentToast(null);
        // Navigate based on nudge type (mock logic)
        if (nudge.message.includes("Fee")) navigate('/payment');
        else if (nudge.message.includes("Document")) navigate('/documents');
        else setShowDrawer(true);
    };

    useEffect(() => {
        // Fetch progress
        studentApi.getProgress('demo_student')
            .then(data => {
                if (data) {
                    if (data.progress_percentage !== undefined) {
                        setProgress(Math.round(data.progress_percentage));
                    }
                    if (data.completed_steps) {
                        const updatedSteps = defaultSteps.map(step => ({
                            ...step,
                            completed: data.completed_steps.includes(step.name) ||
                                (step.name === 'Profile Setup' && data.completed_steps.includes('Account Created'))
                        }));
                        setSteps(updatedSteps);
                    }
                }
            })
            .catch(err => {
                console.error("Failed to fetch progress:", err);
                setProgress(20);
            })
            .finally(() => setLoading(false));

        // Fetch nudges
        fetchNudges();
        // Poll every 60s
        const interval = setInterval(fetchNudges, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch onboarding progress
        axios.get(`${API_URL}/onboarding/student/demo_student`)
            .then(res => {
                if (res.data.success) {
                    setOnboardingProgress(res.data.progress);
                }
            })
            .catch(console.error);
    }, [API_URL]); // Added API_URL to dependency array

    const displayProgress = progress ?? 20;
    const completedCount = steps.filter(s => s.completed).length;

    return (
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-5xl mx-auto relative">
            <NudgeDrawer
                isOpen={showDrawer}
                onClose={() => setShowDrawer(false)}
                nudges={nudges}
                onMarkRead={handleMarkRead}
            />

            <NudgeToast
                nudge={currentToast}
                onClose={() => setCurrentToast(null)}
                onAction={handleAction}
            />

            {/* Header with Bell */}
            <div className="flex items-start justify-between mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold mb-1">Welcome, Student!</h1>
                    <p className="text-content-muted">Track your onboarding progress below.</p>
                </motion.div>

                <button
                    onClick={() => setShowDrawer(true)}
                    className="relative p-3 bg-surface-card border border-line rounded-xl hover:bg-surface-hover transition-colors group"
                >
                    <Bell className="w-6 h-6 text-content-muted group-hover:text-content transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-orange-500 border-2 border-surface-card rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* Onboarding Progress Widget */}
            {onboardingProgress && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-teal-900/40 to-indigo-900/40 border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Onboarding Progress</h2>
                                <p className="text-teal-200 text-sm">
                                    {onboardingProgress.completed} of {onboardingProgress.total} steps complete
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-teal-400">{onboardingProgress.percentage}%</div>
                                <div className="text-xs text-teal-200/70 font-mono">LEVEL {Math.floor(onboardingProgress.total_xp / 100) + 1}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6 relative z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${onboardingProgress.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-teal-400 to-indigo-400"
                            />
                        </div>

                        {/* Next Step Card */}
                        {onboardingProgress.current_step && (
                            <div className="bg-surface-card/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between relative z-10 group cursor-pointer hover:bg-surface-hover transition-all"
                                onClick={() => navigate('/dashboard/onboarding')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-orange-300 font-bold uppercase tracking-wider mb-0.5">Up Next</p>
                                        <h3 className="font-semibold text-white">{onboardingProgress.current_step.title}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                                    Continue <ArrowRight size={16} />
                                </div>
                            </div>
                        )}

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </div>
                </motion.div>
            )}

            {/* Action Items Banner */}
            <ActionItemsBanner nudges={nudges} />

            {/* Quick SOS Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-8 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-danger/20 rounded-full flex items-center justify-center text-danger">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-danger">Feeling unsafe?</p>
                        <p className="text-xs text-danger/80">TCET Campus Security: 022-6714-5000</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/safety')}
                    className="bg-danger text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-danger-hover transition-colors"
                >
                    GET HELP
                </button>
            </motion.div>

            {/* Fee Payment Alert */}
            {!steps.find(s => s.name === 'Fee Payment')?.completed && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-8 flex items-center justify-between group cursor-pointer hover:bg-indigo-500/20 transition-all"
                    onClick={() => navigate('/payment')}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-indigo-200">Pending Fees Detected</p>
                            <p className="text-sm text-indigo-400/80 italic">₹63,500 due for Academic Year 2024-25</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        PAY NOW
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.div>
            )}

            {/* Progress */}
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Onboarding Progress</h2>
                    <span className="text-accent font-bold text-lg">{displayProgress}%</span>
                </div>
                <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-accent rounded-full"
                    />
                </div>
                <p className="text-sm text-content-muted mt-2">
                    {completedCount} of {steps.length} steps completed
                </p>
            </div>

            {/* Timetable Widget */}
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-8 flex items-center justify-between group cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => navigate('/timetable')}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Class Timetable</h3>
                        <p className="text-sm text-content-muted">
                            View your weekly schedule for COMP-B
                        </p>
                    </div>
                </div>
                <button
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all"
                >
                    VIEW SCHEDULE
                </button>
            </div>

            {/* Steps */}
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-8">
                <h2 className="font-semibold mb-4">Steps</h2>
                <div className="space-y-3">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            {step.completed ? (
                                <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                            ) : (
                                <Circle size={20} className="text-content-muted/40 flex-shrink-0" />
                            )}
                            <span className={step.completed ? 'text-content' : 'text-content-muted'}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featureCards.map((card, i) => (
                    <motion.button
                        key={card.path}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        onClick={() => navigate(card.path)}
                        className="bg-surface-card border border-line rounded-xl p-5 text-left hover:border-accent/50 transition-colors group flex items-start gap-4"
                    >
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                            <card.icon size={20} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-0.5">{card.title}</h3>
                            <p className="text-sm text-content-muted">{card.desc}</p>
                        </div>
                        <ArrowRight size={16} className="text-content-muted/40 group-hover:text-accent mt-1 transition-colors" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
