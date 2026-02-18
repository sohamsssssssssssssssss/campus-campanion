import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Phone, Video } from 'lucide-react';

const MentorPage = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'mentor', text: 'Hello! I am Prof. Mehta, your faculty mentor.', time: '10:00 AM' },
        { id: 2, sender: 'mentor', text: 'How are your studies going? Let me know if you need help with any subject.', time: '10:01 AM' },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = { id: Date.now(), sender: 'student', text: input, time: 'Just now' };
        setMessages([...messages, newMessage]);
        setInput('');

        // Simulate Mentor Reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'mentor',
                text: "Thanks for reaching out. Let's schedule a meeting during my office hours.",
                time: 'Just now'
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-[#1e293b] border border-line rounded-2xl overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="p-4 bg-[#0f172a] border-b border-line flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                        <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">Prof. Mehta</h2>
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-content-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-content-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a1628]">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'student'
                                ? 'bg-accent text-white rounded-br-none shadow-lg'
                                : 'bg-[#1e293b] text-white border border-line rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-[10px] block mt-1 opacity-70 ${msg.sender === 'student' ? 'text-white' : 'text-content-muted'}`}>
                                    {msg.time}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-[#0f172a] border-t border-line flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message your mentor..."
                    className="flex-1 bg-[#1e293b] border border-line text-white rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-content-muted"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg hover:shadow-accent/20"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default MentorPage;
