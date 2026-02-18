import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ArrowRight } from 'lucide-react';

const NudgeToast = ({ nudge, onClose, onAction }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 8000); // Auto dismiss after 8 seconds
        return () => clearTimeout(timer);
    }, [nudge, onClose]);

    if (!nudge) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
            >
                <div className="bg-[#0f172a] border border-orange-500/50 rounded-xl shadow-2xl p-4 flex items-start gap-4 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    <div className="bg-orange-500/20 p-2.5 rounded-lg text-orange-400 shrink-0">
                        <Bell className="w-6 h-6" />
                        {/* Pulse Dot */}
                        <span className="absolute top-4 left-9 w-2.5 h-2.5 bg-orange-500 border-2 border-[#0f172a] rounded-full animate-pulse" />
                    </div>

                    <div className="flex-1 z-10">
                        <h4 className="font-bold text-slate-100 text-sm mb-1">Action Required</h4>
                        <p className="text-slate-400 text-sm leading-snug mb-3">
                            {nudge.message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onAction(nudge)}
                                className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            >
                                Take Action <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs font-medium text-slate-500 hover:text-slate-300 py-1.5 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NudgeToast;
