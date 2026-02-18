import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Check, X, Upload, RefreshCw, Edit3, Settings, Shield, CreditCard, BookOpen, Heart, Save, Phone, Mail, Briefcase, Calendar, Award, Zap, Copy, ExternalLink, ArrowRight, Download, Sparkles, CreditCard as IdIcon } from 'lucide-react';
import { studentApi } from '../services/api';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileStats from '../components/ProfileStats';
import IDCard from '../components/IDCard';
import IDCardModal from '../components/IDCardModal';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const studentId = localStorage.getItem('cc_student_id') || 'demo_student';
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailStep, setEmailStep] = useState('input'); // 'input' or 'verify'
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [tempPhone, setTempPhone] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    // ID Card state
    const [idCardGenerated, setIdCardGenerated] = useState(false);
    const [idCardData, setIdCardData] = useState(null);
    const [showIdCardModal, setShowIdCardModal] = useState(false);
    const idCardRef = useRef(null);

    useEffect(() => {
        loadProfile();
        loadIdCardStatus();
    }, []);

    const loadIdCardStatus = async () => {
        try {
            const res = await studentApi.getIdCard(studentId);
            if (res.generated) {
                setIdCardGenerated(true);
                setIdCardData(res.card_data);
            }
        } catch (err) {
            // silently ignore — card just hasn't been generated yet
        }
    };

    const handleDownloadCard = async () => {
        if (!idCardRef.current) return;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(idCardRef.current, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `TCET_ID_${studentId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('ID card downloaded!');
        } catch (err) {
            toast.error('Download failed. Please try again.');
        }
    };

    const handleNameSave = () => {
        if (!tempName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        localStorage.setItem('cc_student_name', tempName);
        setProfile({ ...profile, name: tempName });
        setIsEditingName(false);
        window.dispatchEvent(new Event('profile-updated'));
        toast.success("Name updated successfully!");
    };

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await studentApi.getProfile(studentId);
            setProfile(data);
            setTempBio(data.bio || 'Campus scout • Engineering student 🚀');
        } catch (err) {
            console.error("Profile load error:", err);
            toast.error("Failed to load profile. Using demo defaults.");
            // Fallback for demo
            setProfile({
                name: "Demo Student",
                department: "Computer Engineering",
                year: "FY 2024-25",
                email: "demo@tcet.edu",
                profile_type: 'photo'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB");
            return;
        }

        setUploading(true);
        try {
            await studentApi.uploadPhoto(studentId, file);
            toast.success("Photo uploaded successfully!");
            window.dispatchEvent(new Event('profile-updated')); // Sync globally
            loadProfile();
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };


    const handleBioSave = async () => {
        try {
            await studentApi.updateBio(studentId, tempBio);
            setProfile({ ...profile, bio: tempBio });
            setIsEditingBio(false);
            toast.success("Bio updated!");
        } catch (err) {
            toast.error("Failed to update bio");
        }
    };

    const toggleProfileType = async (type) => {
        if (!type) return;
        try {
            const res = await studentApi.switchProfileType(studentId, type);
            if (res.success) {
                window.dispatchEvent(new Event('profile-updated')); // Sync globally
                loadProfile();
            }
        } catch (err) {
            toast.error("Failed to switch profile type");
        }
    };

    const handleEmailUpdateInit = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error("Please enter a valid email");
            return;
        }
        setVerifying(true);
        try {
            await studentApi.updateEmail(newEmail);
            setEmailStep('verify');
            toast.success("Verification code sent to " + newEmail);
        } catch (err) {
            toast.error("Failed to initiate email update");
        } finally {
            setVerifying(false);
        }
    };

    const handleEmailVerify = async () => {
        if (verificationCode.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }
        setVerifying(true);
        try {
            await studentApi.verifyEmail(newEmail, verificationCode);
            setProfile({ ...profile, email: newEmail });
            setIsEmailModalOpen(false);
            setEmailStep('input');
            setNewEmail('');
            setVerificationCode('');
            toast.success("Email verified and updated!");
        } catch (err) {
            toast.error("Invalid verification code (Demo: 123456)");
        } finally {
            setVerifying(false);
        }
    };

    const handlePhoneSave = async () => {
        // Simple Indian phone validation
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = tempPhone.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            toast.error("Please enter a valid 10-digit Indian mobile number");
            return;
        }

        try {
            await studentApi.updatePhone(studentId, "+91-" + cleanPhone);
            setProfile({ ...profile, phone: "+91-" + cleanPhone });
            setIsEditingPhone(false);
            toast.success("Phone number updated!");
        } catch (err) {
            toast.error("Failed to update phone");
        }
    };

    if (loading && !profile) return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-content-muted font-bold tracking-widest uppercase text-xs">Syncing your profile...</p>
        </div>
    );

    if (!profile) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-black mb-4">Oops! Profile not found.</h2>
            <button onClick={loadProfile} className="bg-accent text-white px-6 py-2 rounded-xl">Try Again</button>
        </div>
    );

    const completeness = 85; // Mock completeness

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-[#0a1628] min-h-screen text-white">

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ID CARD SECTION — above all existing content           */}
            {/* ═══════════════════════════════════════════════════════ */}
            {idCardGenerated ? (
                <motion.section
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                            <IdIcon size={20} className="text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Your TCET ID Card</h2>
                            <p className="text-xs text-content-muted">Permanent · Verified · Scan QR to view details</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-8">
                        {/* The card itself */}
                        <div className="flex-shrink-0">
                            <IDCard ref={idCardRef} cardData={idCardData} />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={handleDownloadCard}
                                className="flex items-center gap-3 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-accent/20 transition-all"
                            >
                                <Download size={18} />
                                Download ID Card
                            </button>
                            <div className="text-xs text-content-muted bg-[#1e293b] rounded-xl p-4 border border-line max-w-xs">
                                <p className="font-bold text-white mb-1">🔒 Permanent ID</p>
                                <p className="leading-relaxed">This card is permanently tied to your account. Scan the QR code to verify your identity.</p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-gradient-to-r from-accent/10 to-indigo-500/10 border border-accent/30 rounded-2xl p-6 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <IdIcon size={24} className="text-accent" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Generate Your TCET ID Card</h3>
                            <p className="text-sm text-content-muted mt-0.5">One-time generation — permanent digital ID with QR code</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowIdCardModal(true)}
                        className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-accent/20 transition-all flex-shrink-0"
                    >
                        <Sparkles size={16} />
                        Generate
                    </button>
                </motion.div>
            )}

            {/* ID Card Generation Modal */}
            {showIdCardModal && (
                <IDCardModal
                    studentId={studentId}
                    profile={profile}
                    onClose={() => setShowIdCardModal(false)}
                    onSuccess={(cardData) => {
                        setIdCardGenerated(true);
                        setIdCardData(cardData);
                        setShowIdCardModal(false);
                    }}
                />
            )}

            {/* HER0 SECTION - Centered */}
            <header className="mb-12 flex flex-col items-center bg-[#1e293b] rounded-[2rem] p-12 border border-line shadow-2xl relative overflow-hidden">
                {/* Decorative background orb */}
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />

                <div className="relative group mb-6">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-[6px] border-[#0a1628] shadow-[0_0_40px_rgba(99,102,241,0.3)] ring-4 ring-accent/20">
                            <ProfileAvatar
                                studentId={studentId}
                                name={profile.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                            <Camera className="text-white" size={40} />
                        </div>
                    </motion.div>

                    <label className="absolute bottom-4 right-4 w-12 h-12 bg-accent hover:bg-accent-hover text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110 active:scale-95 border-4 border-[#1e293b]">
                        <Camera size={20} />
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            accept="image/*"
                        />
                    </label>
                </div>

                <div className="text-center z-10">
                    {isEditingName ? (
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <input
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="bg-[#0a1628] border border-accent rounded-xl px-4 py-2 text-2xl font-black text-white text-center w-full max-w-xs focus:outline-none"
                                autoFocus
                            />
                            <button onClick={handleNameSave} className="bg-success text-white p-2 rounded-lg hover:bg-success/80 transition-colors"><Check size={20} /></button>
                            <button onClick={() => setIsEditingName(false)} className="bg-line text-white p-2 rounded-lg hover:bg-line/80 transition-colors"><X size={20} /></button>
                        </div>
                    ) : (
                        <h1 className="text-4xl font-black mb-1 tracking-tight text-white flex items-center justify-center gap-3 group/name">
                            {profile.name}
                            <button
                                onClick={() => { setIsEditingName(true); setTempName(profile.name); }}
                                className="opacity-0 group-hover/name:opacity-100 text-content-muted hover:text-accent transition-all duration-300"
                            >
                                <Edit3 size={20} />
                            </button>
                        </h1>
                    )}
                    <p className="text-lg text-content-muted font-bold italic mb-3">"{profile.bio || tempBio}"</p>
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-content-muted uppercase tracking-widest mb-8">
                        <Calendar size={14} className="text-accent" /> {profile.year || 'FY 2024-25'}
                        <span className="w-1.5 h-1.5 rounded-full bg-line" />
                        <Briefcase size={14} className="text-accent" /> {profile.department}
                    </div>

                    <div className="w-full max-w-xl mx-auto bg-[#0a1628]/50 p-6 rounded-2xl border border-line/50">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[11px] font-black uppercase text-content-muted tracking-[0.2em]">Profile Completeness</span>
                            <span className="text-sm font-black text-accent">{completeness}%</span>
                        </div>
                        <div className="h-4 bg-[#0a1628] rounded-full overflow-hidden p-1 border border-line/30 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completeness}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-accent to-purple-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">

                {/* 1. CONTACT INFO CARD */}
                <section className="bg-[#1e293b] rounded-[1.5rem] border border-line p-8 shadow-xl transition-all hover:translate-y-[-4px] group">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-white">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                            <Mail size={20} />
                        </div>
                        Contact Info
                    </h2>

                    <div className="space-y-8">
                        {/* Email */}
                        <div className="relative">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="flex items-center justify-between bg-[#0a1628] p-4 rounded-xl border border-line/50 group-hover:border-accent/30 transition-colors">
                                <span className="text-sm font-bold text-white truncate max-w-[200px]">{profile.email}</span>
                                <button
                                    onClick={() => { setIsEmailModalOpen(true); setEmailStep('input'); setNewEmail(profile.email); }}
                                    className="text-[10px] font-black uppercase text-accent hover:text-white transition-colors bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 block">Phone Number</label>
                            {isEditingPhone ? (
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-content-muted">+91</span>
                                        <input
                                            value={tempPhone}
                                            onChange={(e) => setTempPhone(e.target.value)}
                                            placeholder="9876543210"
                                            className="w-full bg-[#0a1628] border border-accent rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                                            autoFocus
                                        />
                                    </div>
                                    <button onClick={handlePhoneSave} className="bg-success text-white px-4 rounded-xl hover:bg-success/80 transition-colors"><Check size={18} /></button>
                                    <button onClick={() => setIsEditingPhone(false)} className="bg-line text-white px-4 rounded-xl hover:bg-line/80 transition-colors"><X size={18} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-[#0a1628] p-4 rounded-xl border border-line/50 group-hover:border-accent/30 transition-colors">
                                    <span className="text-sm font-bold text-white uppercase">{profile.phone || '+Add Phone'}</span>
                                    <button
                                        onClick={() => { setIsEditingPhone(true); setTempPhone(profile.phone ? profile.phone.replace('+91-', '') : ''); }}
                                        className="text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                                    >
                                        {profile.phone ? 'Edit' : 'Add'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Campus ID */}
                        <div>
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 block">Campus Identity</label>
                            <div className="flex items-center justify-between bg-[#0a1628] p-4 rounded-xl border border-line/50 shadow-inner">
                                <span className="text-sm font-black text-accent tracking-[.2em]">{studentId.toUpperCase()}</span>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(studentId.toUpperCase()); toast.success('ID Copied!'); }}
                                    className="text-content-muted hover:text-accent transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. ROOMMATE PREFS CARD */}
                <section className="bg-[#1e293b] rounded-[1.5rem] border border-line p-8 shadow-xl transition-all hover:translate-y-[-4px] group">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400">
                                <Heart size={20} />
                            </div>
                            Roommates
                        </h2>
                        <button className="text-[10px] font-black uppercase bg-accent/10 border border-accent/20 px-4 py-2 rounded-full text-accent hover:bg-accent hover:text-white transition-all">Edit Quiz</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                            { label: 'Sleep', value: 'Night Owl', icon: '🦉', color: 'bg-indigo-500/10 text-indigo-400' },
                            { label: 'Clean', value: 'Organized', icon: '✨', color: 'bg-emerald-500/10 text-emerald-400' },
                            { label: 'Social', value: 'Introvert', icon: '🍿', color: 'bg-amber-500/10 text-amber-400' },
                            { label: 'Study', value: 'Library', icon: '📚', color: 'bg-blue-500/10 text-blue-400' },
                        ].map((pref, i) => (
                            <div key={i} className={`p-4 rounded-2xl border border-line/50 bg-[#0a1628]/50 flex flex-col items-center text-center transition-all group-hover:bg-[#0a1628] group-hover:border-accent/10`}>
                                <div className="text-2xl mb-2">{pref.icon}</div>
                                <div className="text-[9px] font-black text-content-muted uppercase tracking-widest mb-1">{pref.label}</div>
                                <div className="text-xs font-bold text-white">{pref.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {['Gamer', 'Music', 'Coding', 'Sports', 'Art'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-[#0a1628] text-indigo-300 text-[10px] font-bold rounded-full border border-line transition-all hover:border-accent/40 hover:text-accent">#{tag.toLowerCase()}</span>
                        ))}
                    </div>
                </section>

                {/* 3. YOUR STATS CARD */}
                <section className="bg-[#1e293b] rounded-[1.5rem] border border-line p-8 shadow-xl transition-all hover:translate-y-[-4px] group">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-white">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                            <Award size={20} />
                        </div>
                        Your Stats
                    </h2>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[
                            { label: 'Likes', val: profile.stats?.swipes || 0 },
                            { label: 'Match', val: profile.stats?.matches || 0 },
                            { label: 'Level', val: profile.stats?.level || 1 },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#0a1628] p-4 rounded-2xl border border-line/50 text-center relative overflow-hidden group/stat">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 rounded-full translate-x-4 -translate-y-4 transition-all group-hover/stat:scale-150" />
                                <div className="text-2xl font-black text-white mb-1">{stat.val}</div>
                                <div className="text-[9px] font-black text-content-muted uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-content-muted">Progress to Next Level</span>
                            <span className="text-accent">Level 2 (75%)</span>
                        </div>
                        <div className="h-2 bg-[#0a1628] rounded-full overflow-hidden border border-line/30">
                            <div className="h-full w-[75%] bg-accent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <div className="flex items-center gap-2 bg-[#0a1628] px-4 py-2 rounded-xl border border-line">
                            <span className="text-xl">🌟</span>
                            <span className="text-[10px] font-black uppercase text-white">Early Bird</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0a1628] px-4 py-2 rounded-xl border border-line">
                            <span className="text-xl">📜</span>
                            <span className="text-[10px] font-black uppercase text-white">Master</span>
                        </div>
                    </div>
                </section>

                {/* 4. QUICK ACTIONS CARD */}
                <section className="bg-[#1e293b] rounded-[1.5rem] border border-line p-8 shadow-xl transition-all hover:translate-y-[-4px] group">
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-white">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                            <Zap size={20} />
                        </div>
                        Quick Actions
                    </h2>

                    <div className="space-y-3">
                        {[
                            { label: 'Upload Documents', icon: <Upload size={16} />, path: '/onboarding' },
                            { label: 'Pay Fees', icon: <CreditCard size={16} />, path: '/payments' },
                            { label: 'Register Courses', icon: <BookOpen size={16} />, path: '/academics' },
                            { label: 'Choose Hostel', icon: <Settings size={16} />, path: '/hostel' },
                        ].map((action, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center justify-between p-4 bg-[#0a1628]/50 hover:bg-[#0a1628] border border-line/50 hover:border-accent/40 rounded-xl transition-all group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-content-muted group-hover/btn:text-accent transition-colors">{action.icon}</div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{action.label}</span>
                                </div>
                                <ArrowRight size={14} className="text-content-muted group-hover/btn:translate-x-1 transition-all group-hover/btn:text-accent" />
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* Email Verification Modal */}
            <AnimatePresence>
                {isEmailModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-[#1e293b] border border-line w-full max-w-md rounded-3xl shadow-3xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-line flex justify-between items-center relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
                                <h3 className="text-xl font-black text-white">
                                    {emailStep === 'input' ? 'Change Email Address' : 'Verify Email'}
                                </h3>
                                <button onClick={() => setIsEmailModalOpen(false)} className="text-content-muted hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                {emailStep === 'input' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-3 block">Current Email</label>
                                            <div className="text-sm font-bold text-content-muted bg-[#0a1628] p-4 rounded-xl border border-line/50">{profile.email}</div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-3 block">New Email Address</label>
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Enter new email..."
                                                className="w-full bg-[#0a1628] border border-line focus:border-accent rounded-xl px-5 py-4 text-sm font-bold text-white focus:outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-[11px] text-content-muted leading-relaxed">We'll send a 6-digit verification code to your new email to confirm it's yours.</p>
                                        <div className="flex gap-3">
                                            <button onClick={() => setIsEmailModalOpen(false)} className="flex-1 bg-line/20 hover:bg-line/40 text-white py-4 rounded-xl font-black text-xs transition-all uppercase">Cancel</button>
                                            <button
                                                onClick={handleEmailUpdateInit}
                                                disabled={verifying}
                                                className="flex-[2] bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-black text-xs transition-all uppercase disabled:opacity-50"
                                            >
                                                {verifying ? 'Updating...' : 'Send Code'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-4">
                                                <Shield size={32} />
                                            </div>
                                            <p className="text-sm font-bold text-white mb-1">Enter Verification Code</p>
                                            <p className="text-xs text-content-muted">Code sent to: <span className="text-accent">{newEmail}</span></p>
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                className="w-full bg-[#0a1628] border-2 border-accent text-center py-4 rounded-2xl text-2xl font-black tracking-[0.5em] focus:outline-none shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={handleEmailVerify}
                                                className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-black text-xs transition-all uppercase"
                                            >
                                                Verify Email Now
                                            </button>
                                            <button
                                                onClick={() => setEmailStep('input')}
                                                className="w-full text-[10px] font-black uppercase text-content-muted hover:text-accent transition-colors"
                                            >
                                                Didn't get it? Resend Code
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
