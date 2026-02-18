import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    AlertCircle,
    MessageSquare,
    Phone,
    Heart,
    Flag,
    ExternalLink,
    ChevronRight,
    Search,
    Send,
    Ambulance,
    Home,
    Gavel,
    UserCheck,
    X,
    Sparkles,
    CheckCircle2,
    Info
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const contactIcons = {
    Shield: Shield,
    Ambulance: Ambulance,
    Heart: Heart,
    Home: Home,
    Gavel: Gavel,
    UserCheck: UserCheck
};

export default function SafetyPage() {
    const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'chat', 'report'
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sosConfirm, setSosConfirm] = useState(false);
    const [sosLoading, setSosLoading] = useState(false);

    // Anonymous Reporting State
    const [reportCategory, setReportCategory] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [submittedId, setSubmittedId] = useState(null);

    // Mental Health Chat State
    const [mhMessages, setMhMessages] = useState([
        { role: 'ai', content: "Hello. I'm your anonymous support companion. I'm here to listen if you're feeling stressed, overwhelmed, or just need someone to talk to. Everything we discuss here is private." }
    ]);
    const [mhInput, setMhInput] = useState('');
    const [mhLoading, setMhLoading] = useState(false);
    const [sessionId] = useState(crypto.randomUUID());
    const [crisisModal, setCrisisModal] = useState(false);
    const [helplines, setHelplines] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mhMessages]);

    const fetchResources = async () => {
        try {
            const [contactsRes, helplinesRes] = await Promise.all([
                studentApi.getEmergencyContacts(),
                studentApi.getHelplines()
            ]);
            setContacts(contactsRes.contacts);
            setHelplines(helplinesRes.helplines);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSOS = async () => {
        setSosLoading(true);
        const studentId = localStorage.getItem('cc_student_id') || 'demo_student';

        // Try to get geolocation
        let location = { lat: 19.2275, lng: 72.8561 }; // TCET Default
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
            console.warn("Location permission denied, using default campus location.");
        }

        try {
            const res = await studentApi.triggerSOS({
                student_id: studentId,
                location: location,
                message: "EMERGENCY: SOS Button Pressed from Dashboard"
            });
            if (res.success) {
                toast.success("HELP IS ON THE WAY!", {
                    duration: 10000,
                    style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
                });
                setSosConfirm(false);
            }
        } catch (err) {
            toast.error("Failed to trigger SOS. Call security immediately.");
        } finally {
            setSosLoading(false);
        }
    };

    const handleMhChat = async (e) => {
        e.preventDefault();
        if (!mhInput.trim() || mhLoading) return;

        const userMsg = mhInput;
        setMhInput('');
        setMhMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setMhLoading(true);

        try {
            const res = await studentApi.mentalHealthChat(userMsg, sessionId);
            setMhMessages(prev => [...prev, { role: 'ai', content: res.response }]);
            if (res.crisis_detected) {
                setCrisisModal(true);
            }
        } catch (err) {
            setMhMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I'm having trouble responding right now. Please remember you're not alone. If you're in crisis, please use the helpline numbers." }]);
        } finally {
            setMhLoading(false);
        }
    };

    const handleReport = async (e) => {
        e.preventDefault();
        if (!reportCategory || !reportDescription.trim()) return;
        setReportSubmitting(true);

        try {
            const res = await studentApi.submitAnonymousReport({
                category: reportCategory,
                description: reportDescription
            });
            if (res.success) {
                setSubmittedId(res.report_id);
                setReportDescription('');
                setReportCategory('');
                toast.success("Report Submitted Anonymously");
            }
        } catch (err) {
            toast.error("Failed to submit report");
        } finally {
            setReportSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 px-6 max-w-5xl mx-auto pt-6">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 bg-danger/10 px-4 py-1.5 rounded-full text-danger font-bold text-xs mb-4">
                    <Shield size={14} /> CAMPUS SAFETY HUB
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-3">Your Safety is Our Priority</h1>
                <p className="text-content-muted max-w-xl mx-auto">Access 24/7 emergency support, mental health care, and anonymous reporting in one secure space.</p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex bg-surface-card p-1 rounded-2xl border border-line mb-10 shadow-sm max-w-2xl mx-auto">
                {[
                    { id: 'sos', label: 'Emergency SOS', icon: AlertCircle },
                    { id: 'chat', label: 'Support Bot', icon: MessageSquare },
                    { id: 'report', label: 'Anonymous Report', icon: Flag }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-accent text-white shadow-lg shadow-accent/20'
                            : 'text-content-muted hover:bg-surface-hover hover:text-content'}`}
                    >
                        <tab.icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <main>
                <AnimatePresence mode="wait">
                    {activeTab === 'sos' && (
                        <motion.div
                            key="sos"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* SOS Button Section */}
                            <div className="bg-surface-card border-2 border-danger/20 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/0 via-danger/40 to-danger/0" />

                                <div className="relative z-10">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-black mb-2 text-danger">Immediate Emergency?</h2>
                                        <p className="text-content-muted">Pressing this button alerts campus security with your exact location.</p>
                                    </div>

                                    <div className="flex justify-center mb-10">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSosConfirm(true)}
                                            className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-danger flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] group overflow-hidden"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-white/20 rounded-full"
                                            />
                                            <Shield size={48} className="mb-2 relative z-10" />
                                            <span className="font-black text-xl relative z-10">SOS</span>
                                            <span className="text-[10px] font-bold tracking-widest relative z-10 opacity-80 uppercase">Press to Trigger</span>
                                        </motion.button>
                                    </div>

                                    <div className="text-content-muted text-sm font-medium">
                                        Locked for accidental press. Requires confirmation.
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contacts Grid */}
                            <div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Phone size={20} className="text-accent" /> Essential Contacts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {contacts.map((contact) => {
                                        const Icon = contactIcons[contact.icon] || Shield;
                                        return (
                                            <a
                                                key={contact.id}
                                                href={`tel:${contact.phone}`}
                                                className="bg-surface-card border border-line p-5 rounded-2xl flex items-center gap-4 transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/5 group"
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contact.color === 'danger' ? 'bg-danger/10 text-danger' :
                                                    contact.color === 'warning' ? 'bg-warning/10 text-warning' :
                                                        'bg-accent/10 text-accent'
                                                    }`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{contact.name}</h4>
                                                    <p className="text-lg font-black">{contact.phone}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider">{contact.hours}</span>
                                                        <ChevronRight size={14} className="text-content-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-surface-card border border-line rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-xl"
                        >
                            <div className="bg-surface p-4 border-b border-line flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Wellbeing Support Bot</h3>
                                        <p className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Always Listening
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="bg-surface-card px-3 py-1 rounded-full text-[10px] font-bold border border-line text-content-muted">ANONYMOUS</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl text-center mb-4">
                                    <p className="text-xs text-warning-strong font-medium">
                                        <Info size={14} className="inline mr-1" /> This is an AI-based support tool, not a replacement for professional therapy or clinical care.
                                    </p>
                                </div>
                                {mhMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-accent text-white rounded-br-none shadow-md'
                                            : 'bg-surface border border-line rounded-bl-none'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {mhLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-surface border border-line p-4 rounded-2xl rounded-bl-none flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-content-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleMhChat} className="p-4 bg-surface border-t border-line">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={mhInput}
                                        onChange={(e) => setMhInput(e.target.value)}
                                        placeholder="Speak your mind..."
                                        className="flex-1 bg-surface-card border border-line rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!mhInput.trim() || mhLoading}
                                        className="bg-accent text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'report' && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-surface-card border border-line rounded-[2.5rem] p-10 max-w-2xl mx-auto shadow-sm"
                        >
                            <div className="mb-8">
                                <h3 className="text-2xl font-black mb-2">Anonymous Incident Report</h3>
                                <p className="text-content-muted">Safely report harassment, bullying, or safety concerns. Your identity will not be shared.</p>
                            </div>

                            {submittedId ? (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Report Submitted Successfully</h4>
                                    <p className="text-content-muted mb-8">Thank you for helping keep the campus safe.</p>
                                    <div className="bg-surface border border-line p-4 rounded-xl mb-8">
                                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-1">Reference ID</p>
                                        <p className="text-2xl font-black text-accent font-mono">#{submittedId}</p>
                                    </div>
                                    <button
                                        onClick={() => setSubmittedId(null)}
                                        className="text-accent font-bold hover:underline"
                                    >
                                        Submit another report
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleReport} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-content-muted uppercase tracking-widest">Incident Category</label>
                                        <select
                                            value={reportCategory}
                                            onChange={(e) => setReportCategory(e.target.value)}
                                            required
                                            className="w-full bg-surface-card border border-line rounded-xl px-5 py-4 focus:outline-none focus:border-accent appearance-none"
                                        >
                                            <option value="">Select a category...</option>
                                            <option value="harassment">Harassment</option>
                                            <option value="bullying">Bullying / Ragging</option>
                                            <option value="theft">Theft / Damage</option>
                                            <option value="health">Safety Concern / Medical</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-content-muted uppercase tracking-widest">Details of the incident</label>
                                        <textarea
                                            value={reportDescription}
                                            onChange={(e) => setReportDescription(e.target.value)}
                                            required
                                            maxLength={500}
                                            rows={5}
                                            placeholder="Please describe what happened, where, and when. Do not include your personal details if you wish to remain anonymous."
                                            className="w-full bg-surface-card border border-line rounded-xl px-5 py-4 focus:outline-none focus:border-accent resize-none"
                                        />
                                        <div className="text-right text-[10px] font-bold text-content-muted">
                                            {reportDescription.length} / 500 characters
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={reportSubmitting || !reportCategory || !reportDescription.trim()}
                                        className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl font-bold shadow-xl shadow-accent/20 transition-all disabled:opacity-50"
                                    >
                                        {reportSubmitting ? 'SUBMITTING...' : 'SUBMIT ANONYMOUS REPORT'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* SOS Confirmation Modal */}
            <AnimatePresence>
                {sosConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSosConfirm(false)}
                            className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface-card border-2 border-danger/30 w-full max-w-md rounded-[2rem] p-8 relative z-10 shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center text-danger mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-center mb-2">Confirm SOS Alert?</h3>
                            <p className="text-content-muted text-center mb-8">
                                This will immediately alert campus security of your current location. Do not use this for non-emergencies.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSOS}
                                    disabled={sosLoading}
                                    className="w-full bg-danger text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-danger/20 hover:bg-danger-hover transition-all disabled:opacity-50"
                                >
                                    {sosLoading ? 'TRIGGERING...' : 'YES, ALERT SECURITY'}
                                </button>
                                <button
                                    onClick={() => setSosConfirm(false)}
                                    className="w-full py-4 rounded-xl font-bold text-content-muted hover:bg-surface-hover transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Crisis Modal */}
            <AnimatePresence>
                {crisisModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-surface/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface-card border-2 border-accent/30 w-full max-w-2xl rounded-[3rem] p-10 relative z-10 shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setCrisisModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-surface-hover rounded-full text-content-muted"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-accent mx-auto mb-8">
                                <Sparkles size={40} />
                            </div>

                            <h2 className="text-3xl font-black mb-4">You're Not Alone</h2>
                            <p className="text-content-muted text-lg mb-10 max-w-md mx-auto">
                                We've detected that you may be going through a very difficult time. Please reach out to one of these support services right now.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                {helplines.map((line, i) => (
                                    <div key={i} className="bg-surface border border-line p-5 rounded-2xl text-left">
                                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{line.org}</p>
                                        <h4 className="font-bold text-sm mb-2">{line.name}</h4>
                                        <a
                                            href={`tel:${line.number}`}
                                            className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-bold text-sm"
                                        >
                                            <Phone size={14} /> CALL {line.number}
                                        </a>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium text-accent">Help is available 24/7. Your life matters.</p>
                                <button
                                    onClick={() => setCrisisModal(false)}
                                    className="bg-surface-hover px-8 py-3 rounded-xl font-bold text-sm transition-all"
                                >
                                    BACK TO CHAT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
