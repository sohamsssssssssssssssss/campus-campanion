import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, User } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

export default function CalendarPage() {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await axios.get(`${API_URL}/calendar/timetable`);
                if (res.data.success) {
                    setTimetable(res.data.timetable);
                }
            } catch (err) {
                console.error("Failed to fetch timetable", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    // Filter events for selected day and sort by time
    const daysEvents = Array.isArray(timetable)
        ? timetable
            .filter(event => event.day === selectedDay)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
        : [];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 pt-24 pb-24">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 z-10 relative">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-indigo-400" />
                            Class Timetable
                        </h1>
                        <p className="text-slate-400">Your weekly schedule for COMP-B</p>
                    </div>

                    <div className="bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 flex overflow-x-auto">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedDay === day
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Timeline View */}
                        <div className="lg:col-span-3 space-y-4">
                            {daysEvents.length > 0 ? (
                                daysEvents.map((event, idx) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm transition-all hover:bg-slate-800/60"
                                    >
                                        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${event.type === 'lab' ? 'bg-emerald-500' :
                                            event.type === 'tutorial' ? 'bg-orange-500' : 'bg-indigo-500'
                                            }`} />

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col items-center min-w-[80px]">
                                                    <span className="text-lg font-bold text-white">{event.startTime}</span>
                                                    <span className="text-xs text-slate-500 font-medium my-1">to</span>
                                                    <span className="text-sm font-medium text-slate-400">{event.endTime}</span>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${event.type === 'lab' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            event.type === 'tutorial' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                            }`}>
                                                            {event.type}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={14} /> {event.room}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {event.type === 'lecture' && (
                                                <button className="px-4 py-2 bg-slate-700/50 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-medium transition-all text-slate-300 border border-slate-600/50 hover:border-indigo-500/50">
                                                    View Resources
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
                                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-400">No classes scheduled</h3>
                                    <p className="text-slate-600">Enjoy your free time!</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-2xl p-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    Today's Overview
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Total Classes</span>
                                        <span className="text-white font-bold">{daysEvents.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Labs</span>
                                        <span className="text-white font-bold">{daysEvents.filter(e => e.type === 'lab').length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Lectures</span>
                                        <span className="text-white font-bold">{daysEvents.filter(e => e.type === 'lecture').length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                                <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-slate-500">
                                    Upcoming Holidays
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-rose-500/10 text-rose-400 text-center min-w-[50px] rounded-lg p-1">
                                            <span className="block text-xs font-bold uppercase">Mar</span>
                                            <span className="block text-xl font-bold">04</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm">Holi</p>
                                            <p className="text-xs text-slate-500">Public Holiday</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-amber-500/10 text-amber-400 text-center min-w-[50px] rounded-lg p-1">
                                            <span className="block text-xs font-bold uppercase">Mar</span>
                                            <span className="block text-xl font-bold">19</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm">Gudi Padwa</p>
                                            <p className="text-xs text-slate-500">Maharashtra New Year</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-emerald-500/10 text-emerald-400 text-center min-w-[50px] rounded-lg p-1">
                                            <span className="block text-xs font-bold uppercase">Apr</span>
                                            <span className="block text-xl font-bold">03</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm">Good Friday</p>
                                            <p className="text-xs text-slate-500">Public Holiday</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
