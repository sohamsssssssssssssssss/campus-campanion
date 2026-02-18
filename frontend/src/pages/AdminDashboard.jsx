import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Users,
    Search,
    UserCheck,
    Layout,
    ShieldCheck,
    Zap,
    ArrowRight,
    Plus
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        department: 'Computer Engineering'
    });
    const [currentStudentId, setCurrentStudentId] = useState(localStorage.getItem('student_id') || 'demo_student');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await studentApi.getAllStudents();
            if (data.success) {
                setStudents(data.students);
            }
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const data = await studentApi.registerStudent(newStudent);
            if (data.success) {
                toast.success(`Success! Student ID: ${data.student_id}`);
                setShowRegisterModal(false);
                setNewStudent({ name: '', email: '', department: 'Computer Engineering' });
                fetchStudents();
            }
        } catch (err) {
            toast.error('Registration failed');
        }
    };

    const switchStudent = (id) => {
        localStorage.setItem('student_id', id);
        setCurrentStudentId(id);
        toast.success(`Switched to student: ${id}`, {
            icon: '🔄',
            style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' }
        });
        // Optional: reload to refresh all context/state across the app
        // window.location.reload(); 
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-8 pt-20 lg:pt-8">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 text-teal-400 mb-2"
                        >
                            <ShieldCheck size={20} />
                            <span className="text-sm font-semibold tracking-widest uppercase">Administrative Portal</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
                        >
                            Identity Management
                        </motion.h1>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowRegisterModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20"
                    >
                        <UserPlus size={20} />
                        Register Student
                    </motion.button>
                </div>

                {/* Stats & Current User */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
                                <UserCheck size={24} />
                            </div>
                            <span className="text-slate-400 font-medium">Active Session</span>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">{currentStudentId}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <Users size={24} />
                            </div>
                            <span className="text-slate-400 font-medium">Total Registered</span>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">{students.length} Students</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
                                <Zap size={24} />
                            </div>
                            <span className="text-slate-400 font-medium">System Mode</span>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">Development</div>
                    </motion.div>
                </div>

                {/* Student List Section */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Users className="text-teal-400" />
                            Student Directory
                        </h2>

                        <div className="relative group max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, ID or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-teal-500/50 transition-all text-slate-200 placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/20 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Department</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence>
                                    {filteredStudents.map((s, idx) => (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`hover:bg-teal-500/[0.02] transition-colors group ${s.id === currentStudentId ? 'bg-teal-500/[0.03]' : ''}`}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${s.id === currentStudentId ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-slate-400'
                                                        }`}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-teal-400 transition-colors">{s.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{s.id}</div>
                                                        <div className="text-xs text-slate-600 mt-0.5">{s.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                                                    {s.department || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {s.id === currentStudentId ? (
                                                    <span className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600 text-xs font-medium uppercase tracking-tighter">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {s.id !== currentStudentId ? (
                                                    <motion.button
                                                        whileHover={{ x: 3, backgroundColor: 'rgba(20, 184, 166, 0.1)' }}
                                                        onClick={() => switchStudent(s.id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-all text-sm font-bold"
                                                    >
                                                        Switch Session
                                                        <ArrowRight size={14} />
                                                    </motion.button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 text-teal-400 text-xs font-black italic">
                                                        CURRENT
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && !loading && (
                        <div className="p-20 text-center text-slate-500 italic">
                            No students matches your search criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Register Modal */}
            <AnimatePresence>
                {showRegisterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl shadow-teal-500/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-white">New Identity</h3>
                                <button
                                    onClick={() => setShowRegisterModal(false)}
                                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                                >
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        placeholder="e.g. Aryan Sharma"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-teal-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        placeholder="aryan@student.in"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-teal-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Department</label>
                                    <select
                                        value={newStudent.department}
                                        onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-teal-500 transition-all appearance-none"
                                    >
                                        <option value="Computer Engineering">Computer Engineering</option>
                                        <option value="IT Engineering">IT Engineering</option>
                                        <option value="Electronics & Telecomm">Electronics & Telecomm</option>
                                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                                        <option value="Civil Engineering">Civil Engineering</option>
                                    </select>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-4 bg-teal-500 text-slate-900 font-black rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all"
                                >
                                    CREATE IDENTITY
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
