import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, MessageSquare, Mail, Bell } from 'lucide-react';
import axios from 'axios';

const NudgeDrawer = ({ isOpen, onClose, nudges, onMarkRead }) => {
    const [activeTab, setActiveTab] = useState('unread'); // unread, all

    const filteredNudges = activeTab === 'unread'
        ? nudges.filter(n => !n.is_seen)
        : nudges;

    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

    const handleMarkDone = async (nudgeId) => {
        try {
            await axios.post(`${API_URL}/nudges/done`, { nudge_id: nudgeId });
            onMarkRead(nudgeId); // Simple local update
        } catch (error) {
            console.error("Failed to mark done", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f172a] border-l border-slate-800 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Bell className="w-5 h-5 text-teal-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-100">Notifications</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'unread' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                Unread
                                {activeTab === 'unread' && (
                                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                History
                                {activeTab === 'all' && (
                                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400" />
                                )}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {filteredNudges.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No new notifications</p>
                                </div>
                            ) : (
                                filteredNudges.map((nudge) => (
                                    <div
                                        key={nudge.id}
                                        className={`bg-slate-900 border ${nudge.is_seen ? 'border-slate-800' : 'border-teal-500/30 bg-teal-500/5'} rounded-xl p-4 transition-all`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-2">
                                                {/* Channel Icons */}
                                                {nudge.channels && nudge.channels.includes('whatsapp') && (
                                                    <MessageSquare className="w-3.5 h-3.5 text-green-400" />
                                                )}
                                                {nudge.channels && nudge.channels.includes('email') && (
                                                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                                                )}
                                                <span className="text-xs text-slate-500">
                                                    {new Date(nudge.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {!nudge.action_taken && (
                                                <button
                                                    onClick={() => handleMarkDone(nudge.id)}
                                                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {nudge.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NudgeDrawer;
