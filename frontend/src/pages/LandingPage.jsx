import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileUp, Users, GraduationCap, ArrowRight } from 'lucide-react';

const features = [
    { icon: MessageSquare, title: 'AI Chat', desc: 'Get instant answers about admissions, fees, and campus life.' },
    { icon: FileUp, title: 'Document Upload', desc: 'Upload and verify your documents with AI-powered extraction.' },
    { icon: Users, title: 'Roommate Matching', desc: 'Find compatible roommates based on habits and interests.' },
    { icon: GraduationCap, title: 'AcademAI', desc: 'Access lectures, quizzes, and study groups for your courses.' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        CampusCompanion <span className="text-accent">AI</span>
                    </h1>
                    <p className="text-lg text-content-muted mb-10">
                        Smart Student Onboarding for TCET Mumbai
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
                    >
                        Get Started
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            </section>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-6 pb-24 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i, duration: 0.4 }}
                            className="bg-surface-card border border-line rounded-xl p-6 hover:border-accent/40 transition-colors"
                        >
                            <f.icon size={28} className="text-accent mb-3" />
                            <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                            <p className="text-sm text-content-muted leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
