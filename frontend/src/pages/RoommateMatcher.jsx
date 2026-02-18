import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Heart, X, MessageSquare, Info, Star, CheckCircle2, Users } from 'lucide-react';
import { studentApi } from '../services/api';
import RoommateQuestionnaire from './RoommateQuestionnaire';
import toast from 'react-hot-toast';

function MatchCard({ match, onSwipe }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const heartOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) onSwipe(match.id, 'right');
        else if (info.offset.x < -100) onSwipe(match.id, 'left');
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
            className="absolute inset-0 bg-surface-card border border-line rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
            {/* Header / Image Area */}
            <div className="relative h-1/2 bg-gradient-to-b from-accent/20 to-surface">
                <img
                    src={match.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`}
                    alt={match.name}
                    className="w-full h-full object-cover"
                />

                {/* Swipe Overlays */}
                <motion.div style={{ opacity: heartOpacity }} className="absolute top-10 right-10 border-4 border-success text-success font-black text-4xl px-4 py-2 rounded-xl rotate-12 pointer-events-none">
                    LIKE
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 left-10 border-4 border-danger text-danger font-black text-4xl px-4 py-2 rounded-xl -rotate-12 pointer-events-none">
                    NOPE
                </motion.div>

                {/* Score Tag */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xl font-black text-white">{match.compatibility}%</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-black">{match.name}</h2>
                        <p className="text-content-muted font-medium">{match.department}</p>
                    </div>
                </div>

                {/* Compatibility Breakdown */}
                <div className="space-y-4 mb-4">
                    {match.strengths?.length > 0 && (
                        <div className="bg-success/5 border border-success/10 rounded-xl p-3">
                            <div className="text-[10px] font-bold text-success uppercase mb-1 flex items-center gap-1.5">
                                <Sparkles size={10} /> Strengths
                            </div>
                            <ul className="text-xs space-y-1">
                                {match.strengths.slice(0, 2).map((s, i) => (
                                    <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                                        <div className="w-1 h-1 rounded-full bg-success mt-1.5 flex-shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {match.tips?.length > 0 && (
                        <div className="bg-accent/5 border border-accent/10 rounded-xl p-3">
                            <div className="text-[10px] font-bold text-accent uppercase mb-1 flex items-center gap-1.5">
                                <Info size={10} /> Roommate Tip
                            </div>
                            <p className="text-[10px] italic text-content-muted">
                                "{match.tips[0]}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {match.shared_interests?.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[8px] font-bold bg-surface border border-line px-2 py-1 rounded-full flex items-center gap-1 uppercase">
                            <Star size={8} className="text-warning fill-warning" /> {f}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function MatchCelebration({ match, onDismiss }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full text-center"
            >
                <div className="mb-8 relative">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                        className="text-8xl mb-4"
                    >
                        🎉
                    </motion.div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400 mb-2">
                        IT'S A MATCH!
                    </h1>
                    <p className="text-white/60">You and {match.name} have similar vibes!</p>
                </div>

                <div className="flex items-center justify-center gap-6 mb-12">
                    <div className="relative">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo_student" className="w-32 h-32 rounded-full border-4 border-accent shadow-2xl shadow-accent/20" />
                        <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-full border-4 border-black">
                            <Heart size={20} fill="currentColor" />
                        </div>
                    </div>
                    <div className="text-4xl animate-bounce">❤️</div>
                    <div className="relative">
                        <img src={match.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`} className="w-32 h-32 rounded-full border-4 border-accent shadow-2xl shadow-accent/20" />
                        <div className="absolute -bottom-2 -left-2 bg-accent text-white p-2 rounded-full border-4 border-black">
                            <Heart size={20} fill="currentColor" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.href = '/chat'}
                        className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-2xl font-black text-lg transition-all"
                    >
                        SEND MESSAGE 💬
                    </button>
                    <button
                        onClick={onDismiss}
                        className="w-full text-white/40 hover:text-white font-bold text-sm"
                    >
                        KEEP SWIPING
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function RoommateMatcher() {
    const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [celebrationMatch, setCelebrationMatch] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        const studentId = localStorage.getItem('cc_student_id') || 'demo_student';
        try {
            const res = await studentApi.getRoommateMatches(studentId);
            if (res.success) {
                // If the backend says "Demo mode", it means NO ONE has filled prefs yet (including this user)
                if (res.note?.includes("Demo mode")) {
                    setNeedsQuestionnaire(true);
                } else {
                    // User has preferences, but maybe 0 matches found for them specifically
                    setMatches(res.matches || []);
                    setNeedsQuestionnaire(false);
                }
            } else {
                setNeedsQuestionnaire(true);
            }
        } catch (err) {
            setNeedsQuestionnaire(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (targetId, direction) => {
        const studentId = localStorage.getItem('cc_student_id') || 'demo_student';
        if (direction === 'right') {
            try {
                const res = await studentApi.swipeRoommate({
                    student_id: studentId,
                    target_id: targetId,
                    action: 'like'
                });
                if (res.status === 'match') {
                    setCelebrationMatch(matches[currentIndex]);
                } else {
                    toast.success("Liked!");
                }
            } catch (err) {
                toast.error("Error recording swipe");
            }
        }

        // Move to next card
        setCurrentIndex(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-surface">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-content-muted font-bold tracking-widest uppercase text-xs">AI Matching Algorithm in progress...</p>
            </div>
        );
    }

    if (needsQuestionnaire) {
        return <RoommateQuestionnaire onComplete={fetchMatches} />;
    }

    if (currentIndex >= matches.length) {
        return (
            <div className="flex flex-col items-center justify-center h-screen max-w-md mx-auto text-center px-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6">
                    <Users size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2">No More Matches!</h2>
                <p className="text-content-muted mb-8">We've shown you all the best compatible students for now. Check back later as more students join!</p>
                <button
                    onClick={() => setCurrentIndex(0)}
                    className="bg-accent text-white px-8 py-3 rounded-xl font-bold"
                >
                    REFRESH LIST
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen py-10 px-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-sm flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                        <Users size={20} />
                    </div>
                    <span className="font-black text-xl tracking-tight">Discover</span>
                </div>
                <button
                    onClick={() => setNeedsQuestionnaire(true)}
                    className="p-2 text-content-muted hover:text-content"
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Card Stack */}
            <div className="relative w-full max-w-sm flex-1 mb-10">
                <AnimatePresence>
                    {matches.slice(currentIndex, currentIndex + 2).reverse().map((match, idx) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            onSwipe={handleSwipe}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full max-w-sm flex justify-center items-center gap-8 mb-4">
                <button
                    onClick={() => handleSwipe(matches[currentIndex].id, 'left')}
                    className="w-16 h-16 rounded-full bg-surface-card border border-line flex items-center justify-center shadow-lg hover:border-danger/40 text-danger transition-all active:scale-95"
                >
                    <X size={28} strokeWidth={3} />
                </button>
                <button
                    onClick={() => handleSwipe(matches[currentIndex].id, 'right')}
                    className="w-16 h-16 rounded-full bg-surface-card border border-line flex items-center justify-center shadow-lg hover:border-success/40 text-success transition-all active:scale-95"
                >
                    <Heart size={28} strokeWidth={3} fill="currentColor" />
                </button>
            </div>

            <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em]">Swipe right to like, left to pass</p>

            {celebrationMatch && (
                <MatchCelebration
                    match={celebrationMatch}
                    onDismiss={() => setCelebrationMatch(null)}
                />
            )}
        </div>
    );
}
