import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    ChevronRight,
    AlertCircle,
    Sparkles,
    Phone,
    Fingerprint,
    Mic,
    ChevronDown,
    MapPin,
    GraduationCap,
    Calendar,
    Users,
    Activity,
    ShieldCheck,
    Globe,
    Award,
    Star,
    Camera,
    Info,
    Layout,
    Cpu,
    Zap,
    History,
    Dribbble
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import toast from 'react-hot-toast';

const CAMPUS_IMAGES = [
    { url: 'https://www.tcetmumbai.in/images/sliders/slider-1.webp', title: 'Main Facade', desc: 'The architectural heart of TCET Mumbai' },
    { url: 'https://www.tcetmumbai.in/images/sliders/slider-6.webp', title: 'Campus View', desc: 'Modern infrastructure in a lush setting' },
    { url: 'https://images.shiksha.com/mediadata/images/1650988046phpwyCVs1.jpeg', title: 'Auditorium', desc: 'State-of-the-art Seminar Hall' },
    { url: 'https://www.tcetmumbai.in/images/L-1.jpg', title: 'Eng. Labs', desc: 'Hands-on learning with advanced tools' },
    { url: 'https://www.tcetmumbai.in/images/L-7.jpg', title: 'Library', desc: 'Extensive digital and physical archives' },
    { url: 'https://www.tcetmumbai.in/images/sliders/slider-3.webp', title: 'Entrance', desc: 'Gateway to technical excellence' }
];

const MILESTONES = [
    { year: '2001', title: 'Inception', desc: 'TCET was established to provide quality technical education.' },
    { year: '2012', title: 'Quality Recognition', desc: 'Received IMC Ramkrishna Bajaj National Quality Commendation.' },
    { year: '2015', title: 'Performance Excellence', desc: 'Won the IMC Ramkrishna Bajaj National Quality Award.' },
    { year: '2016', title: 'APQA Honor', desc: 'Awarded "Best in Class" Asia Pacific Quality Award.' },
    { year: '2019', title: 'NIRF Ranking', desc: 'Ranked 193 nationally among Engineering Institutes.' }
];

const FEATURES = [
    { icon: Mic, title: 'Voice Interface', desc: 'Navigate the portal using natural voice commands.' },
    { icon: Zap, title: 'AI Assistant', desc: 'Get instant answers for admissions and campus life.' },
    { icon: Layout, title: 'Smart Timetable', desc: 'Personalized schedules synced with your device.' },
    { icon: Cpu, title: 'Edge Analytics', desc: 'Real-time monitoring of academic performance.' },
    { icon: ShieldCheck, title: 'Zero Trust Auth', desc: 'Military-grade encryption for all user data.' },
    { icon: Dribbble, title: 'Campus Social', desc: 'Connect with clubs, sports, and technical fests.' }
];

const LoginPage = () => {
    const [loginMode, setLoginMode] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Particle effect generation
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 20,
        size: 2 + Math.random() * 4
    }));

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            if (loginMode === 'student') {
                localStorage.setItem('studentId', 'demo_student');
                toast.success('Signed in as Student');
                navigate('/dashboard');
            } else {
                toast.success('Parent Login Verified!');
                navigate('/parent/dashboard');
            }
        }, 1500);
    };

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#020617] text-white custom-scrollbar scroll-smooth selection:bg-accent/30 selection:text-white"
        >
            {/* GLOBAL DECORATIVE BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Real Campus Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://www.tcetmumbai.in/images/sliders/slider-1.webp"
                        alt="TCET Campus"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-[2px]" />
                </div>

                {/* Mesh Gradient Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-jungle-800/20 rounded-full blur-[120px] animate-flow mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-ocean-600/10 rounded-full blur-[150px] animate-flow mix-blend-screen" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />

                {/* Particles */}
                <div className="absolute inset-0 opacity-20">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="absolute bg-accent rounded-full"
                            style={{
                                left: p.left,
                                bottom: '-20px',
                                width: p.size,
                                height: p.size,
                                animation: `bubble ${p.duration}s linear infinite`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>

                {/* Tropical Palm Leaves (Blurry edges) */}
                <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] opacity-[0.08] rotate-45 animate-float">
                    <div className="w-full h-full bg-jungle-900 rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" />
                </div>
                <div className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] opacity-[0.05] -rotate-12 animate-float" style={{ animationDelay: '3s' }}>
                    <div className="w-full h-full bg-ocean-500 rounded-[50%_50%_20%_80%/25%_80%_20%_75%]" />
                </div>
            </div>

            {/* SECTION 1: THE PORTAL */}
            <section className="h-screen snap-start relative z-10 flex flex-col lg:flex-row overflow-hidden">
                {/* Branding Column */}
                <div className="w-full lg:w-3/5 flex flex-col justify-center px-8 lg:px-24 py-12 lg:py-0">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-4 mb-4">
                            <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <GraduationCap size={48} className="text-accent relative z-10" />
                            </div>
                            <div className="h-12 w-px bg-white/10 mx-2" />
                            <div>
                                <h1 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">
                                    CAMPUS<br />
                                    <span className="text-accent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">COMPANION</span>
                                </h1>
                            </div>
                        </div>

                        <p className="text-ocean-500 font-black tracking-[.25em] text-xs lg:text-sm uppercase mb-8 ml-1">
                            TCET Mumbai • Autonomous • ISO Certified
                        </p>

                        <div className="grid grid-cols-2 gap-6 max-w-lg mb-12">
                            {[
                                { icon: Globe, label: 'A Grade', sub: 'NAAC 3.22 CGPA' },
                                { icon: Award, label: 'NBA', sub: 'Accredited Programs' },
                                { icon: Star, label: 'Top 200', sub: 'NIRF Ranking' },
                                { icon: History, label: '23 Years', sub: 'Legacy of Excellence' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <stat.icon size={20} className="text-accent" />
                                    <div>
                                        <p className="text-xs font-black uppercase text-white leading-none mb-1">{stat.label}</p>
                                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">{stat.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-content-muted mb-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(v => <div key={v} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-surface-card flex items-center justify-center text-[10px] font-black">{v}</div>)}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest">Connect with 5000+ Students</p>
                        </div>
                    </motion.div>
                </div>

                {/* Login Column */}
                <div className="w-full lg:w-2/5 flex items-center justify-center p-6 lg:p-12 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 lg:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-20"
                    >
                        {/* Tab Toggle */}
                        <div className="relative flex p-1.5 bg-black/40 rounded-2xl mb-10 border border-white/5">
                            <motion.div
                                className="absolute top-1.5 bottom-1.5 rounded-xl"
                                animate={{
                                    left: loginMode === 'student' ? '6px' : 'calc(50% + 3px)',
                                    right: loginMode === 'student' ? 'calc(50% + 3px)' : '6px',
                                    background: loginMode === 'student' ? 'linear-gradient(135deg, var(--color-jungle-800), var(--color-accent))' : 'linear-gradient(135deg, var(--color-sand-600), var(--color-sand-500))'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => setLoginMode('student')}
                                className={`flex-1 py-3 text-xs font-black tracking-widest transition-colors relative z-10 ${loginMode === 'student' ? 'text-white' : 'text-content-muted'}`}
                            >
                                STUDENT
                            </button>
                            <button
                                onClick={() => setLoginMode('parent')}
                                className={`flex-1 py-3 text-xs font-black tracking-widest transition-colors relative z-10 ${loginMode === 'parent' ? 'text-white' : 'text-content-muted'}`}
                            >
                                PARENT
                            </button>
                        </div>

                        <div className="mb-8 text-center">
                            <h3 className="text-3xl font-black text-white italic mb-1 uppercase tracking-tight">
                                {loginMode === 'student' ? 'Entry Portal' : 'Shield View'}
                            </h3>
                            <div className="h-1 w-12 bg-accent mx-auto rounded-full mb-4" />
                            <p className="text-content-muted text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">
                                {loginMode === 'student' ? 'Access your academic core' : 'Monitor student excellence'}
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {loginMode === 'student' ? (
                                    <motion.div
                                        key="stud"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-5"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1 opacity-60">Credentials ID</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-accent transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    placeholder="demo@student.com"
                                                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/40 focus:bg-black/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1 opacity-60">Security Key</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-accent transition-colors" size={18} />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/40 focus:bg-black/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="par"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1 opacity-60">Registered Phone</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-sand-500 transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    placeholder="+91 ••••• •••••"
                                                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-sand-500/40 focus:bg-black/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1 opacity-60">Ward Roll Index</label>
                                            <div className="relative group">
                                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-sand-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={rollNo}
                                                    onChange={e => setRollNo(e.target.value)}
                                                    placeholder="e.g. 101"
                                                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-sand-500/40 focus:bg-black/50 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`relative w-full py-5 rounded-2xl font-black text-white text-xs lg:text-sm tracking-[0.3em] uppercase transition-all transform hover:scale-[1.03] active:scale-95 shadow-2xl flex items-center justify-center gap-3 overflow-hidden group disabled:opacity-50 ${loginMode === 'student' ? 'bg-accent shadow-accent/20' : 'bg-sand-500 shadow-sand-500/20'}`}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        INITIALIZE {loginMode}
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between px-2 pt-2">
                                <button type="button" className="text-[10px] font-black text-content-muted hover:text-white transition-colors uppercase tracking-widest">Forgot Pass?</button>
                                <button type="button" className="flex items-center gap-2 text-[10px] font-black text-accent hover:text-white transition-colors uppercase tracking-widest">
                                    <Mic size={14} /> VOICE ACCESS
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Bottom Wave Decorative Footer */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20">
                        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
                            <path fill="var(--color-accent)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Scroll Prompt */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col items-center"
                    >
                        <p className="text-[9px] font-black tracking-[0.5em] text-accent mb-3 uppercase animate-pulse">DISCOVER TCET</p>
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-5 h-8 border-2 border-accent/30 rounded-full flex justify-center p-1 backdrop-blur-sm"
                        >
                            <div className="w-1 h-2 bg-accent rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: CAMPUS GALLERY */}
            <section className="h-screen snap-start relative z-10 bg-[#040d21] flex flex-col justify-center px-8 lg:px-24">
                <div className="mb-12">
                    <p className="text-accent font-black tracking-[0.4em] text-[10px] uppercase mb-2">Immersive Experience</p>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Campus <span className="text-accent">Gallery</span></h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {CAMPUS_IMAGES.map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl cursor-pointer"
                        >
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-xs font-black text-accent uppercase tracking-widest mb-1">{img.title}</p>
                                <p className="text-[10px] font-bold text-white/70 uppercase leading-none opacity-0 group-hover:opacity-100 transition-opacity">{img.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SECTION 3: HISTORY TIMELINE */}
            <section className="h-screen snap-start relative z-10 bg-[#020617] flex flex-col justify-center px-8 lg:px-24 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] pointer-events-none opacity-5">
                    <h2 className="text-[20vw] font-black uppercase tracking-[0.1em] select-none text-white whitespace-nowrap">HISTORY HISTORY HISTORY</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="w-full lg:w-1/3">
                        <p className="text-accent font-black tracking-[0.4em] text-[10px] uppercase mb-2">Legacy & Evolution</p>
                        <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-6">Our <span className="text-accent">Timeline</span></h2>
                        <p className="text-content-muted font-bold text-xs lg:text-sm uppercase leading-relaxed tracking-wider">
                            Over two decades of shaping technical minds and setting benchmarks in engineering education in Mumbai.
                        </p>
                    </div>

                    <div className="w-full lg:w-2/3 relative py-12">
                        {/* Timeline Line */}
                        <div className="absolute left-[39px] lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />

                        <div className="space-y-12 lg:space-y-0">
                            {MILESTONES.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ margin: "-100px" }}
                                    className={`relative flex items-center lg:justify-center ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
                                >
                                    {/* Year Pin */}
                                    <div className="absolute left-[30px] lg:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#020617] border-4 border-accent z-10 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />

                                    <div className={`w-full lg:w-[45%] pl-20 lg:pl-0 ${i % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                                        <p className="text-2xl lg:text-4xl font-black text-accent mb-1 italic">{m.year}</p>
                                        <h4 className="text-sm lg:text-lg font-black uppercase tracking-widest text-white mb-2">{m.title}</h4>
                                        <p className="text-[10px] lg:text-xs font-bold text-content-muted uppercase leading-relaxed tracking-wider max-w-sm ml-auto mr-auto lg:ml-0 lg:mr-0">{m.desc}</p>
                                    </div>
                                    <div className="hidden lg:block w-[45%]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: FEATURES GRID */}
            <section className="h-screen snap-start relative z-10 bg-[#050f26] flex flex-col justify-center px-8 lg:px-24">
                <div className="text-center mb-16">
                    <p className="text-accent font-black tracking-[0.4em] text-[10px] uppercase mb-2">Modern Capabilities</p>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Portal <span className="text-accent">Features</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-150 transition-all duration-500">
                                <f.icon size={120} />
                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 relative group-hover:bg-accent group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                                <f.icon size={24} className="text-accent group-hover:text-white" />
                            </div>

                            <h4 className="text-lg lg:text-xl font-black uppercase italic tracking-tight text-white mb-3">{f.title}</h4>
                            <p className="text-xs lg:text-sm font-bold text-content-muted uppercase leading-relaxed tracking-wider">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* FINAL FOOTER */}
                <div className="absolute bottom-12 left-0 right-0 text-center">
                    <div className="flex items-center justify-center gap-6 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-widest">© 2026 CampusCompanion</p>
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Privacy Protocol 4.0</p>
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Secured by T-Shield</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;
