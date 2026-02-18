import React from 'react';
import { Target, Heart, Zap, Award } from 'lucide-react';

export default function ProfileStats({ stats }) {
    const statItems = [
        { label: 'Swipes', value: stats?.swipes || 0, icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Matches', value: stats?.matches || 0, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Level', value: stats?.level || 1, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    ];

    return (
        <div className="bg-surface-card border border-line rounded-3xl p-8">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <Award className="text-accent" /> Your Stats
            </h2>

            <div className="grid grid-cols-3 gap-4">
                {statItems.map((item, idx) => (
                    <div key={idx} className="bg-surface-hover rounded-2xl p-4 flex flex-col items-center text-center transition-transform hover:scale-105">
                        <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                            <item.icon size={20} />
                        </div>
                        <div className="text-2xl font-black">{item.value}</div>
                        <div className="text-[10px] font-black text-content-muted uppercase tracking-wider">{item.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <div className="text-[10px] font-black text-content-muted uppercase mb-2 flex justify-between">
                    <span>Next Reward: Level {(stats?.level || 1) + 1}</span>
                    <span>75%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <div className="px-3 py-1 bg-surface rounded-full text-[10px] font-bold text-accent border border-accent/20">🌟 Early Bird</div>
                <div className="px-3 py-1 bg-surface rounded-full text-[10px] font-bold text-content-muted border border-line">📝 Document Master</div>
            </div>
        </div>
    );
}
