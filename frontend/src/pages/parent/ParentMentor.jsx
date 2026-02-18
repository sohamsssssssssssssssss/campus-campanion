import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Phone, Video } from 'lucide-react';

const ParentMentor = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'mentor', text: 'Hello Mr. Sharma. I am Prof. Mehta, the faculty mentor for your ward.', time: '10:00 AM' },
        { id: 2, sender: 'mentor', text: 'Just wanted to update you that he is doing well in academics but needs to improve attendance in Mechanics.', time: '10:01 AM' },
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

        const newMessage = { id: Date.now(), sender: 'parent', text: input, time: 'Just now' };
        setMessages([...messages, newMessage]);
        setInput('');

        // Simulate Mentor Reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'mentor',
                text: "Thank you for your response. I will schedule a meeting with you next week to discuss this further.",
                time: 'Just now'
            }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                        <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">Prof. Mehta</h2>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'parent'
                                    ? 'bg-teal-600 text-white rounded-br-none'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-[10px] block mt-1 opacity-70 ${msg.sender === 'parent' ? 'text-teal-200' : 'text-slate-400'}`}>
                                    {msg.time}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message to the mentor..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-500"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ParentMentor;
