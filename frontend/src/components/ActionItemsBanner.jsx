import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const ActionItemsBanner = ({ nudges }) => {
    // Filter for urgent nudges (e.g., sent within last 3 days or containing "Urgent")
    // For MVP, just show the top unseen nudge
    const urgentNudge = nudges.find(n => !n.action_taken && !n.is_seen);

    if (!urgentNudge) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />

                <div className="bg-orange-500/20 p-3 rounded-xl text-orange-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                </div>

                <div className="flex-1 z-10">
                    <h3 className="text-lg font-bold text-orange-100 mb-1">Action Required</h3>
                    <p className="text-orange-200/80 text-sm leading-relaxed">
                        {urgentNudge.message}
                    </p>
                </div>

                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 whitespace-nowrap z-10">
                    Take Action
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default ActionItemsBanner;
