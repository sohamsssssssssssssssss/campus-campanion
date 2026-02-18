import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const QUESTIONNAIRE = [
    {
        id: "sleep_schedule",
        question: "When do you usually sleep? 🌙",
        options: [
            { value: "early_bird", label: "Before 11 PM (Early Bird)", emoji: "🌅" },
            { value: "moderate", label: "11 PM - 1 AM (Moderate)", emoji: "😴" },
            { value: "night_owl", label: "After 1 AM (Night Owl)", emoji: "🦉" }
        ]
    },
    {
        id: "cleanliness",
        question: "How clean do you keep your space? 🧹",
        options: [
            { value: "very_organized", label: "Very organized - clean daily", emoji: "✨" },
            { value: "moderate", label: "Moderately clean - weekly", emoji: "🧼" },
            { value: "relaxed", label: "Relaxed - when needed", emoji: "😌" }
        ]
    },
    {
        id: "study_time",
        question: "When do you prefer to study? 📚",
        options: [
            { value: "day", label: "During the day", emoji: "☀️" },
            { value: "night", label: "Late at night", emoji: "🌙" },
            { value: "flexible", label: "Whenever I find time", emoji: "⏳" }
        ]
    },
    {
        id: "social_energy",
        question: "How social are you? 👥",
        options: [
            { value: "introvert", label: "Introvert - prefer quiet time", emoji: "📖" },
            { value: "ambivert", label: "Ambivert - balanced", emoji: "⚖️" },
            { value: "extrovert", label: "Extrovert - love socializing", emoji: "🎉" }
        ]
    },
    {
        id: "noise_tolerance",
        question: "How's your noise tolerance? 🎧",
        options: [
            { value: "low", label: "Low - need it quiet", emoji: "🔇" },
            { value: "medium", label: "Medium - some noise okay", emoji: "🔉" },
            { value: "high", label: "High - can sleep through anything", emoji: "🔊" }
        ]
    },
    {
        id: "guest_frequency",
        question: "How often do you plan to have guests? 🤝",
        options: [
            { value: "rarely", label: "Rarely (Once a month)", emoji: "🔒" },
            { value: "sometimes", label: "Sometimes (Few times a month)", emoji: "🏠" },
            { value: "often", label: "Often (Weekly)", emoji: "🍕" }
        ]
    },
    {
        id: "morning_routine",
        question: "What's your morning routine like? ☀️",
        options: [
            { value: "productive", label: "Get up and go", emoji: "🏃" },
            { value: "slow", label: "Take it slow", emoji: "☕" },
            { value: "none", label: "I'm not a morning person", emoji: "😴" }
        ]
    },
    {
        id: "interests",
        question: "What are your interests? (Select at least 2) 🎨",
        type: "multi",
        options: [
            { value: "sports", label: "Sports", emoji: "⚽" },
            { value: "gaming", label: "Gaming", emoji: "🎮" },
            { value: "music", label: "Music", emoji: "🎵" },
            { value: "reading", label: "Reading", emoji: "📚" },
            { value: "coding", label: "Coding", emoji: "💻" },
            { value: "movies", label: "Movies/Series", emoji: "🎬" },
            { value: "travel", label: "Travel", emoji: "✈️" },
            { value: "art", label: "Art/Design", emoji: "🎨" }
        ]
    },
    {
        id: "temperature",
        question: "Ideal room temperature? 🌡️",
        options: [
            { value: "cold", label: "Love AC/Cold", emoji: "❄️" },
            { value: "warm", label: "Prefer it warm", emoji: "🔥" },
            { value: "flexible", label: "Doesn't matter", emoji: "🌡️" }
        ]
    },
    {
        id: "lifestyle",
        question: "Lifestyle choices (Select all that apply): 🚭",
        type: "multi",
        options: [
            { value: "smoking", label: "I Smoke", emoji: "🚬" },
            { value: "drinking", label: "I Drink", emoji: "🍺" },
            { value: "none", label: "None of these", emoji: "✅" }
        ],
        not_mandatory: true
    }
];

export default function RoommateQuestionnaire({ onComplete }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const currentQ = QUESTIONNAIRE[step];
    const isMulti = currentQ.type === 'multi';

    const handleSelect = (value) => {
        if (isMulti) {
            let currentAnswers = answers[currentQ.id] || [];

            if (value === 'none') {
                // If "None" is clicked, clear everything else and just set "none"
                currentAnswers = isSelected('none') ? [] : ['none'];
            } else {
                // If any other option is clicked, remove "none"
                currentAnswers = currentAnswers.filter(v => v !== 'none');
                if (currentAnswers.includes(value)) {
                    currentAnswers = currentAnswers.filter(v => v !== value);
                } else {
                    currentAnswers = [...currentAnswers, value];
                }
            }

            setAnswers({ ...answers, [currentQ.id]: currentAnswers });
        } else {
            setAnswers({ ...answers, [currentQ.id]: value });
            // Auto-next for single choice
            if (step < QUESTIONNAIRE.length - 1) {
                setTimeout(() => setStep(step + 1), 300);
            }
        }
    };

    const isSelected = (value) => {
        const current = answers[currentQ.id] || [];
        return isMulti ? current.includes(value) : answers[currentQ.id] === value;
    };

    const handleNext = () => {
        if (step < QUESTIONNAIRE.length - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const studentId = localStorage.getItem('cc_student_id') || 'demo_student';
        try {
            await studentApi.submitRoommatePreferences(answers, studentId);
            toast.success("Preferences saved!");
            onComplete();
        } catch (err) {
            toast.error("Failed to save preferences");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const progress = ((step + 1) / QUESTIONNAIRE.length) * 100;

    return (
        <div className="max-w-2xl mx-auto py-10 px-6">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-1.5 rounded-full text-accent font-bold text-xs mb-4">
                    <Sparkles size={14} /> ROOMMATE COMPATIBILITY TEST
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Finding Your Perfect Match</h1>
                <p className="text-content-muted">Answer a few questions to find students with similar lifestyle habits.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-content-muted tracking-widest uppercase">Question {step + 1} of {QUESTIONNAIRE.length}</span>
                    <span className="text-[10px] font-bold text-accent tracking-widest uppercase">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-1.5 bg-surface-card border border-line rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-accent"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <h2 className="text-xl font-bold mb-8">{currentQ.question}</h2>

                    <div className="grid grid-cols-1 gap-3">
                        {currentQ.options.map((opt) => {
                            const selected = isSelected(opt.value);

                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 text-left ${selected
                                        ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5'
                                        : 'bg-surface-card border-line hover:border-accent/40'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selected ? 'bg-accent/10' : 'bg-surface'
                                            }`}>
                                            {opt.emoji}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${selected ? 'text-accent' : ''}`}>{opt.label}</p>
                                        </div>
                                    </div>
                                    {selected && <CheckCircle2 size={20} className="text-accent" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between">
                <button
                    onClick={() => step > 0 && setStep(step - 1)}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-content-muted hover:bg-surface-hover disabled:opacity-0 transition-all"
                >
                    <ChevronLeft size={18} /> BACK
                </button>

                {(isMulti || step === QUESTIONNAIRE.length - 1) && (
                    <button
                        onClick={handleNext}
                        disabled={(isMulti && !currentQ.not_mandatory && (answers[currentQ.id] || []).length < 2) || submitting}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-accent/20 transition-all disabled:opacity-50"
                    >
                        {step === QUESTIONNAIRE.length - 1 ? (submitting ? 'FINDING MATCHES...' : 'FINISH') : 'NEXT'} <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
