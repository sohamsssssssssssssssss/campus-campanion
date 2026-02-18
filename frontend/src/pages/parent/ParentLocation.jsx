import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, ShieldCheck } from 'lucide-react';

const ParentLocation = () => {
    // Simulated Live Location
    const [location, setLocation] = useState({
        lat: 19.1136,
        lng: 72.8697,
        place: 'Library (Block B)',
        timestamp: 'Just now',
        status: 'Safe'
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            {/* Map Container */}
            <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl relative overflow-hidden group">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-slate-900">
                    <div className="w-full h-full opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(#2dd4bf 2px, transparent 2px)',
                            backgroundSize: '30px 30px'
                        }}>
                    </div>
                    {/* Zones */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-xs">Hostels</div>
                    <div className="absolute bottom-1/3 right-1/4 w-48 h-24 border-2 border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-xs">Main Building</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-teal-500/30 bg-teal-500/5 rounded-full animate-pulse"></div>

                    {/* User Pin */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                    >
                        <div className="relative">
                            <span className="absolute -inset-4 rounded-full bg-teal-500/20 animate-ping"></span>
                            <div className="w-8 h-8 bg-teal-500 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-slate-900 fill-current" />
                            </div>
                        </div>
                        <div className="bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 shadow-xl text-xs font-medium text-white whitespace-nowrap">
                            Demo Student
                        </div>
                    </motion.div>
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-2xl w-full md:w-auto min-w-[300px]">
                        <div className="flex items-start gap-4">
                            <div className="bg-teal-500/10 p-3 rounded-lg border border-teal-500/20">
                                <Navigation className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{location.place}</h3>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {location.timestamp}
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-400">
                                        <ShieldCheck className="w-3 h-3" /> {location.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl shadow-lg transition-colors text-slate-400 hover:text-white">
                            <Navigation className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentLocation;
