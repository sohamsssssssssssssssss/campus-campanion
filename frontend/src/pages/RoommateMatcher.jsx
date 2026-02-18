import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Star, Moon, Sun, Volume2, VolumeX, Wind, Snowflake,
    Sparkles, Info, CheckCircle2, GraduationCap, MessageSquare, RefreshCw
} from 'lucide-react';
import { studentApi } from '../services/api';
import RoommateQuestionnaire from './RoommateQuestionnaire';
import toast from 'react-hot-toast';

// --- Helpers ---

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
};

const getGradient = (name = '') => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 50) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 65%, 55%), hsl(${hue2}, 65%, 45%))`;
};

const CompatibilityBar = ({ value }) => {
    const color = value >= 80 ? '#14b8a6' : value >= 60 ? '#6366f1' : '#f97316';
    return (
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    );
};

// --- Match Card ---

function MatchCard({ match, index }) {
    const [expanded, setExpanded] = useState(false);

    const habits = [
        match.sleep_schedule === 'Night Owl'
            ? { icon: Moon, text: 'Night Owl', color: 'text-indigo-400 bg-indigo-500/10' }
            : { icon: Sun, text: 'Early Bird', color: 'text-amber-400 bg-amber-500/10' },
        match.music_preference === 'Silent'
            ? { icon: VolumeX, text: 'Silent Studier', color: 'text-emerald-400 bg-emerald-500/10' }
            : { icon: Volume2, text: 'Music Fan', color: 'text-rose-400 bg-rose-500/10' },
        match.ac_preference === 'AC'
            ? { icon: Snowflake, text: 'AC Lover', color: 'text-cyan-400 bg-cyan-500/10' }
            : { icon: Wind, text: 'Fan Person', color: 'text-slate-400 bg-slate-500/10' },
        match.cleanliness > 7
            ? { icon: Sparkles, text: 'Very Neat', color: 'text-teal-400 bg-teal-500/10' }
            : { icon: Sparkles, text: 'Relaxed', color: 'text-orange-400 bg-orange-500/10' },
    ];

    const score = match.compatibility ?? 0;
    const scoreColor = score >= 80 ? 'text-teal-400' : score >= 60 ? 'text-indigo-400' : 'text-orange-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/70 transition-colors"
        >
            {/* Main Row */}
            <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div
                    className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-xl shadow-lg"
                    style={{ background: getGradient(match.name) }}
                >
                    {getInitials(match.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-100 truncate">{match.name}</h3>
                        <span className={`text-lg font-black flex-shrink-0 ${scoreColor}`}>
                            {score}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        <GraduationCap size={11} className="text-indigo-400" />
                        {match.department}
                    </p>
                    <CompatibilityBar value={score} />
                </div>
            </div>

            {/* AI Summary — shown by default */}
            {match.ai_summary && (
                <div className="mx-4 mb-3 bg-teal-500/5 border border-teal-500/15 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> AI Insight
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{match.ai_summary}</p>
                </div>
            )}

            {/* Shared Interests Tags */}
            {match.shared_interests?.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                    {match.shared_interests.slice(0, 4).map((interest, i) => (
                        <span
                            key={i}
                            className="text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                            <Star size={8} fill="currentColor" /> {interest}
                        </span>
                    ))}
                </div>
            )}

            {/* Expand / Collapse */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-300 py-2 border-t border-slate-700/40 transition-colors"
            >
                {expanded ? '▲ Less details' : '▼ More details'}
            </button>

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 space-y-3"
                >
                    {/* Habits */}
                    <div className="flex flex-wrap gap-2">
                        {habits.map((h, i) => (
                            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${h.color}`}>
                                <h.icon size={11} />
                                {h.text}
                            </div>
                        ))}
                    </div>

                    {/* Strengths */}
                    {match.strengths?.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Why you match
                            </p>
                            <ul className="space-y-1">
                                {match.strengths.slice(0, 2).map((s, i) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">•</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Conflict Risk */}
                    {match.challenges?.length > 0 && (
                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <Info size={11} /> Conflict Risk
                            </p>
                            <p className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">•</span> {match.challenges[0]}
                            </p>
                        </div>
                    )}

                    {/* Tip */}
                    {match.tips?.length > 0 && (
                        <p className="text-xs text-slate-500 italic border-l-2 border-slate-600 pl-3">
                            "{match.tips[0]}"
                        </p>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}

// --- Main Page ---

export default function RoommateMatcher() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const studentId = localStorage.getItem('cc_student_id') || 'demo_student';
            const res = await studentApi.getRoommateMatches(studentId);

            if (res.success && !res.note?.includes('Demo mode')) {
                setMatches(res.matches || []);
                setNeedsQuestionnaire(false);
            } else {
                setNeedsQuestionnaire(true);
            }
        } catch {
            setNeedsQuestionnaire(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMatches(); }, []);

    // --- Loading ---
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Finding your best matches…</p>
            </div>
        );
    }

    // --- Needs Survey ---
    if (needsQuestionnaire) {
        return <RoommateQuestionnaire onComplete={fetchMatches} />;
    }

    // --- No Matches ---
    if (matches.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center text-center px-6 gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Users size={28} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-200">No matches yet</h2>
                <p className="text-slate-500 text-sm max-w-xs">
                    No one with similar preferences has joined yet. Check back later!
                </p>
                <button
                    onClick={fetchMatches}
                    className="mt-2 flex items-center gap-2 text-teal-400 font-bold text-sm hover:underline"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>
        );
    }

    // --- Match List ---
    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200 pt-20 pb-10 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black flex items-center gap-2 mb-1">
                        <Users size={22} className="text-teal-400" />
                        Compatible Roommates
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {matches.length} people matched based on your survey preferences
                    </p>
                </div>

                {/* Sort hint */}
                <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4 font-bold">
                    Sorted by compatibility ↓
                </p>

                {/* List */}
                <div className="space-y-3">
                    {matches
                        .slice()
                        .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
                        .map((match, i) => (
                            <MatchCard key={match.id} match={match} index={i} />
                        ))}
                </div>

                {/* Retake survey */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setNeedsQuestionnaire(true)}
                        className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
                    >
                        Retake survey to update preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
