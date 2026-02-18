import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Lock,
    Upload,
    CreditCard,
    BookOpen,
    Home,
    Calendar,
    MonitorPlay,
    UserCheck,
    Award,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Step Icons Mapping
const stepIcons = {
    1: Upload,
    2: CreditCard,
    3: BookOpen,
    4: Home,
    5: Calendar,
    6: MonitorPlay,
    7: UserCheck,
    8: UserCheck, // ID Card
    9: Shield,
    10: Award
};

const OnboardingPage = () => {
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await axios.get(`${API_URL}/onboarding/student/demo_student`);
            if (res.data.success) {
                setSteps(res.data.steps);
                // Set current step to the first unlocked or in-progress step
                const active = res.data.steps.find(s => s.status === 'unlocked') || res.data.steps[res.data.steps.length - 1];
                setCurrentStep(active);
            }
        } catch (error) {
            console.error("Failed to fetch progress", error);
            toast.error("Failed to load onboarding progress");
        } finally {
            setLoading(false);
        }
    };

    const handleStepComplete = async (stepId) => {
        try {
            // Optimistic update
            const res = await axios.post(`${API_URL}/onboarding/step/complete`, { step_id: stepId });

            if (res.data.success) {
                toast.success(`Step Completed! +${res.data.xp_awarded} XP`);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);

                await fetchProgress(); // Refresh to get next unlocked step
            }
        } catch (error) {
            console.error("Failed to complete step", error);
            toast.error("Failed to complete step. Please try again.");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading onboarding journey...</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0f172a] text-slate-200">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            {/* Left: Vertical Stepper */}
            <div className="w-1/3 max-w-md border-r border-slate-800 bg-[#0f172a] overflow-y-auto p-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />

                <h1 className="text-2xl font-bold text-white mb-2">Onboarding Journey</h1>
                <p className="text-slate-400 text-sm mb-8">Complete all 10 steps to unlock your full student account.</p>

                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-800" />

                    {steps.map((step, index) => {
                        const Icon = stepIcons[step.id] || Circle;
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.id === currentStep?.id;
                        const isLocked = step.status === 'locked';

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${isCurrent ? 'bg-slate-800/50 border border-slate-700 shadow-lg' : 'hover:bg-slate-900/50'
                                    }`}
                                onClick={() => !isLocked && setCurrentStep(step)}
                            >
                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 bg-[#0f172a] ${isCompleted ? 'border-teal-500 text-teal-500' :
                                        isCurrent ? 'border-orange-500 text-orange-500' :
                                            'border-slate-700 text-slate-600'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 size={20} /> :
                                        isLocked ? <Lock size={18} /> :
                                            <Icon size={20} />}

                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-20" />
                                    )}
                                </div>

                                <div className="flex-1 pt-1">
                                    <h3 className={`font-semibold text-sm ${isCurrent ? 'text-white' :
                                            isCompleted ? 'text-slate-300' : 'text-slate-500'
                                        }`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{step.description}</p>

                                    {isCurrent && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                                                In Progress
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                ~{step.minutes} mins
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-900/50 p-10 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <AnimatePresence mode='wait'>
                    {currentStep && (
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-teal-400 font-mono text-sm">STEP {currentStep.id} OF 10</span>
                                        {currentStep.status === 'completed' && (
                                            <span className="bg-teal-500/10 text-teal-400 text-xs px-2 py-0.5 rounded-full border border-teal-500/20">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{currentStep.title}</h2>
                                    <p className="text-slate-400 text-lg">{currentStep.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-400">+{currentStep.xp} XP</div>
                                    <div className="text-sm text-slate-500">Reward</div>
                                </div>
                            </div>

                            {/* Dynamic Step Content Placeholder */}
                            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-8 min-h-[400px] shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {renderStepContent(currentStep, handleStepComplete)}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Helper to render content based on step ID
const renderStepContent = (step, onComplete) => {
    // This would ideally be separate components imported
    const isCompleted = step.status === 'completed';

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 relative z-10">
            {isCompleted ? (
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Step Completed!</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        You have successfully completed this step. You can proceed to the next task in your journey.
                    </p>
                </div>
            ) : (
                <>
                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 max-w-lg w-full">
                        <h4 className="font-semibold text-white mb-4">Action Required</h4>
                        <p className="text-sm text-slate-400 mb-6">
                            This is a placeholder action for <strong>{step.title}</strong>.
                            In the full implementation, this would contain the specific form, upload widget, or payment gateway for this step.
                        </p>

                        <button
                            onClick={() => onComplete(step.id)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                        >
                            <Sparkles size={18} className="group-hover:animate-spin" />
                            Simulate Completion & Award XP
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

import { Shield } from 'lucide-react'; // Import Shield separately as it wasn't in the main import list originally

export default OnboardingPage;
