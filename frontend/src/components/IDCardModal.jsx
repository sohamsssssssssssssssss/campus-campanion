import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Camera } from 'lucide-react';
import IDCard from './IDCard';
import toast from 'react-hot-toast';
import { studentApi } from '../services/api';

/**
 * IDCardModal — confirmation modal before generating the permanent ID card.
 * Shows current profile photo, warns the user this is a one-time action.
 * On confirm: calls backend, shows confetti, calls onSuccess(cardData).
 */
export default function IDCardModal({ studentId, profile, onClose, onSuccess }) {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await studentApi.generateIdCard(studentId);
            if (res.success) {
                // Trigger confetti
                launchConfetti();
                onSuccess(res.card_data);
                toast.success('🎉 Your ID card has been generated permanently!', { duration: 5000 });
            }
        } catch (err) {
            // 403 = already generated (shouldn't happen from modal, but guard anyway)
            if (err?.response?.status === 403) {
                toast.error('ID card already generated.');
                onClose();
            } else {
                toast.error('Failed to generate ID card. Please try again.');
            }
        } finally {
            setGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-[#1e293b] rounded-3xl border border-line shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-line">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                                <Sparkles size={20} className="text-accent" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Generate ID Card</h2>
                                <p className="text-xs text-content-muted">One-time action — permanent</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-content-muted hover:text-white transition-colors p-2 rounded-xl hover:bg-surface">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* Warning */}
                        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                            <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-300 mb-1">This is permanent</p>
                                <p className="text-xs text-amber-200/70 leading-relaxed">
                                    Once generated, your ID card <strong>cannot be changed or regenerated</strong>.
                                    Make sure your profile photo and name are correct before confirming.
                                </p>
                            </div>
                        </div>

                        {/* Photo preview */}
                        <div className="text-center">
                            <p className="text-xs font-bold text-content-muted uppercase tracking-widest mb-3">Your photo on the card</p>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/40 mx-auto bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center">
                                {profile?.profile_photo_url ? (
                                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-white">
                                        {(profile?.name || 'S').trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-white mt-3">{profile?.name}</p>
                            <p className="text-xs text-content-muted">{profile?.department}</p>
                            <p className="text-[10px] text-content-muted mt-1 flex items-center justify-center gap-1">
                                <Camera size={10} />
                                Not happy with your photo? Close and update it first.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-line text-content-muted font-bold text-sm hover:bg-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-black text-sm shadow-xl shadow-accent/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Confirm & Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Simple canvas confetti burst
function launchConfetti() {
    const colors = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: -10,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        alpha: 1,
    }));

    let frame = 0;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.alpha -= 0.008;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        frame++;
        if (frame < 150) requestAnimationFrame(animate);
        else document.body.removeChild(canvas);
    };
    animate();
}
