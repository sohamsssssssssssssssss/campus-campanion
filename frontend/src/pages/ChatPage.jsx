import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, ThumbsUp, ThumbsDown, Trash2, Globe, ChevronDown } from 'lucide-react';
import { studentApi } from '../services/api';
import ProfileAvatar from '../components/ProfileAvatar';
import { Link } from 'react-router-dom';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const quickReplies = [
    'Documents needed',
    'Fee payment',
    'Hostel info',
    'Course registration',
    'Campus facilities',
];

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'ai',
            text: "Hi! 👋 I'm your CampusCompanion. I can help with documents, fees, courses, hostel, and more. What would you like to know?",
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('en');
    const [langOpen, setLangOpen] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState({});
    const bottomRef = useRef(null);
    const langRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close language dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const userMsg = {
            id: `u_${Date.now()}`,
            role: 'user',
            text: msg,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await studentApi.chat(msg, 'demo_student', language);
            const aiMsg = {
                id: data?.message_id || `ai_${Date.now()}`,
                role: 'ai',
                text: data?.response || 'Sorry, I could not process that.',
                sources: data?.sources || [],
                intent: data?.intent,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `err_${Date.now()}`,
                    role: 'ai',
                    text: 'Could not reach the server. Make sure the backend is running.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await studentApi.clearChat('demo_student');
        } catch {
            /* ignore */
        }
        setMessages([
            {
                id: 'welcome',
                role: 'ai',
                text: "Chat cleared! 👋 How can I help you?",
            },
        ]);
        setFeedbackGiven({});
    };

    const handleFeedback = async (messageId, rating) => {
        if (feedbackGiven[messageId]) return;
        try {
            await studentApi.submitFeedback('demo_student', messageId, rating);
            setFeedbackGiven((prev) => ({ ...prev, [messageId]: rating }));
        } catch {
            /* silent fail */
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="border-b border-line px-6 py-4 bg-surface-card flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Chat</h1>
                    <p className="text-sm text-content-muted">AI-powered onboarding assistant • RAG-enhanced</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Language selector */}
                    <div className="relative" ref={langRef}>
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-2 text-sm border border-line rounded-lg px-3 py-2 text-content-muted hover:text-content hover:border-accent/40 transition-colors"
                        >
                            <Globe size={15} />
                            <span>{currentLang.label}</span>
                            <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {langOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-surface-card border border-line rounded-lg shadow-xl z-50 py-1 min-w-[140px] max-h-60 overflow-y-auto">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${language === l.code
                                            ? 'text-accent bg-accent/10'
                                            : 'text-content-muted hover:text-content hover:bg-surface-hover'
                                            }`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Profile Link */}
                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ProfileAvatar studentId="demo_student" size="xs" />
                    </Link>
                    {/* Clear chat */}
                    <button
                        onClick={clearChat}
                        title="Clear chat"
                        className="p-2 text-content-muted hover:text-danger transition-colors rounded-lg hover:bg-surface-hover"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot size={16} className="text-accent" />
                                </div>
                            )}
                            <div className="max-w-lg">
                                <div
                                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-accent text-white rounded-br-md'
                                        : 'bg-surface-card border border-line text-content rounded-bl-md'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {/* Timestamp (Fix #7) */}
                                {msg.timestamp && (
                                    <div className={`text-[10px] text-content-muted/60 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </div>
                                )}
                                {/* Sources badge */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                        {msg.sources.map((s) => (
                                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Feedback buttons */}
                                {msg.role === 'ai' && msg.id !== 'welcome' && (
                                    <div className="flex gap-1 mt-1.5">
                                        <button
                                            onClick={() => handleFeedback(msg.id, 5)}
                                            disabled={!!feedbackGiven[msg.id]}
                                            className={`p-1 rounded transition-colors ${feedbackGiven[msg.id] === 5
                                                ? 'text-success'
                                                : 'text-content-muted/40 hover:text-success'
                                                } disabled:cursor-default`}
                                            title="Helpful"
                                        >
                                            <ThumbsUp size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(msg.id, 1)}
                                            disabled={!!feedbackGiven[msg.id]}
                                            className={`p-1 rounded transition-colors ${feedbackGiven[msg.id] === 1
                                                ? 'text-danger'
                                                : 'text-content-muted/40 hover:text-danger'
                                                } disabled:cursor-default`}
                                            title="Not helpful"
                                        >
                                            <ThumbsDown size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 mt-0.5">
                                    <ProfileAvatar studentId="demo_student" size="xs" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot size={16} className="text-accent" />
                        </div>
                        <div className="bg-surface-card border border-line rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5 items-center h-5">
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-6 pb-2 flex gap-2 flex-wrap">
                {quickReplies.map((q) => (
                    <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        disabled={loading}
                        className="text-xs border border-line rounded-full px-3 py-1.5 text-content-muted hover:text-content hover:border-accent/40 transition-colors disabled:opacity-40"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="border-t border-line px-6 py-4 bg-surface-card">
                <div className="flex gap-3 items-end max-w-3xl mx-auto">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="flex-1 bg-surface border border-line rounded-xl px-4 py-3 text-sm text-content placeholder:text-content-muted/50 focus:border-accent transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white p-3 rounded-xl transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
