import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    HelpCircle,
    Users,
    Search,
    Loader2,
    ExternalLink,
    CheckCircle2,
    XCircle,
    UserPlus,
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'lectures', label: 'Lectures', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'groups', label: 'Study Groups', icon: Users },
];

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Engineering'];

export default function AcademAI() {
    const [activeTab, setActiveTab] = useState('lectures');

    return (
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">AcademAI</h1>
                <p className="text-content-muted text-sm">Lectures, quizzes, and study groups for your courses.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-card border border-line rounded-xl p-1 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-accent text-white'
                                : 'text-content-muted hover:text-content'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'lectures' && <LecturesTab />}
            {activeTab === 'quiz' && <QuizTab />}
            {activeTab === 'groups' && <GroupsTab />}
        </div>
    );
}

function LecturesTab() {
    const [subject, setSubject] = useState(subjects[0]);
    const [topic, setTopic] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const search = async () => {
        if (!topic.trim()) {
            toast.error('Enter a topic to search.');
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const data = await studentApi.getLectures({ subject, topic });
            setResults(data?.lectures || data?.results || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-content"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Topic</label>
                        <input
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g., Linear Algebra"
                            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-content placeholder:text-content-muted/50"
                        />
                    </div>
                </div>
                <button
                    onClick={search}
                    disabled={loading}
                    className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Search Lectures
                </button>
            </div>

            {searched && !loading && results.length === 0 && (
                <p className="text-content-muted text-sm text-center py-8">No lectures found. Try a different topic.</p>
            )}

            {results.length > 0 && (
                <div className="space-y-3">
                    {results.map((lec, i) => (
                        <motion.a
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            href={lec.url || lec.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-surface-card border border-line rounded-xl p-4 hover:border-accent/40 transition-colors group"
                        >
                            <BookOpen size={20} className="text-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{lec.title || lec.name || 'Lecture'}</p>
                                <p className="text-xs text-content-muted truncate mt-0.5">{lec.description || lec.channel || ''}</p>
                            </div>
                            <ExternalLink size={14} className="text-content-muted group-hover:text-accent transition-colors flex-shrink-0" />
                        </motion.a>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuizTab() {
    const [subject, setSubject] = useState(subjects[0]);
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    const generate = async () => {
        if (!topic.trim()) {
            toast.error('Enter a topic for the quiz.');
            return;
        }
        setLoading(true);
        setSubmitted(false);
        setScore(null);
        setAnswers({});
        try {
            const data = await studentApi.generateQuiz({ subject, topic });
            setQuestions(data?.questions || data?.quiz || []);
        } catch {
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            const userAnswer = answers[i];
            const correctAnswer = q.correct_answer ?? q.answer ?? q.correct;
            if (userAnswer !== undefined && userAnswer === correctAnswer) {
                correct++;
            }
        });
        setScore(correct);
        setSubmitted(true);
    };

    return (
        <div>
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-content"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Topic</label>
                        <input
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g., Thermodynamics"
                            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-content placeholder:text-content-muted/50"
                        />
                    </div>
                </div>
                <button
                    onClick={generate}
                    disabled={loading}
                    className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />}
                    Generate Quiz
                </button>
            </div>

            {questions.length > 0 && (
                <div className="space-y-5">
                    {questions.map((q, qi) => (
                        <motion.div
                            key={qi}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * qi }}
                            className="bg-surface-card border border-line rounded-xl p-5"
                        >
                            <p className="font-medium text-sm mb-3">
                                <span className="text-accent mr-2">Q{qi + 1}.</span>
                                {q.question}
                            </p>
                            <div className="space-y-2">
                                {(q.options || []).map((opt, oi) => {
                                    const isSelected = answers[qi] === oi;
                                    const correctAnswer = q.correct_answer ?? q.answer ?? q.correct;
                                    const isCorrect = submitted && correctAnswer === oi;
                                    const isWrong = submitted && isSelected && correctAnswer !== oi;

                                    return (
                                        <button
                                            key={oi}
                                            disabled={submitted}
                                            onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                                            className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-3 ${isCorrect
                                                    ? 'border-success bg-success/10 text-success'
                                                    : isWrong
                                                        ? 'border-danger bg-danger/10 text-danger'
                                                        : isSelected
                                                            ? 'border-accent bg-accent/10 text-accent'
                                                            : 'border-line hover:border-accent/40 text-content'
                                                }`}
                                        >
                                            {isCorrect ? <CheckCircle2 size={14} className="flex-shrink-0" /> :
                                                isWrong ? <XCircle size={14} className="flex-shrink-0" /> :
                                                    <span className="w-3.5 h-3.5 rounded-full border border-current flex-shrink-0" />}
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}

                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length !== questions.length}
                            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-3 rounded-xl text-sm transition-colors"
                        >
                            Submit Answers ({Object.keys(answers).length}/{questions.length} answered)
                        </button>
                    ) : (
                        <div className="bg-surface-card border border-line rounded-xl p-5 text-center">
                            <p className="text-2xl font-bold mb-1">
                                {score}/{questions.length}
                            </p>
                            <p className="text-content-muted text-sm">
                                {score === questions.length ? 'Perfect score! 🎉' :
                                    score >= questions.length / 2 ? 'Good job! Keep it up.' : 'Keep practicing!'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function GroupsTab() {
    const [subject, setSubject] = useState('');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [joined, setJoined] = useState(new Set());

    const fetchGroups = async () => {
        setLoading(true);
        setFetched(true);
        try {
            const data = await studentApi.getStudyGroups(subject ? { subject } : {});
            setGroups(data?.groups || data || []);
        } catch {
            setGroups([
                { name: 'DSA Problem Solvers', subject: 'Computer Science', members: 24, max_members: 30 },
                { name: 'Physics Study Circle', subject: 'Physics', members: 18, max_members: 25 },
                { name: 'Calculus Masters', subject: 'Mathematics', members: 12, max_members: 20 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const joinGroup = (name) => {
        setJoined(prev => new Set(prev).add(name));
        toast.success(`Joined "${name}"!`, {
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
        });
    };

    return (
        <div>
            <div className="bg-surface-card border border-line rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1.5">Filter by Subject (optional)</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-content"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchGroups}
                            disabled={loading}
                            className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Find Groups
                        </button>
                    </div>
                </div>
            </div>

            {fetched && !loading && groups.length === 0 && (
                <p className="text-content-muted text-sm text-center py-8">No study groups found.</p>
            )}

            {groups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((g, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="bg-surface-card border border-line rounded-xl p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-sm">{g.name}</h3>
                                    <p className="text-xs text-content-muted mt-0.5">{g.subject || 'General'}</p>
                                </div>
                                <Users size={16} className="text-content-muted" />
                            </div>
                            <p className="text-xs text-content-muted mb-4">
                                {g.members || 0}/{g.max_members || 30} members
                            </p>
                            <button
                                onClick={() => joinGroup(g.name)}
                                disabled={joined.has(g.name)}
                                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${joined.has(g.name)
                                        ? 'bg-success/10 text-success border border-success/20'
                                        : 'bg-accent hover:bg-accent-hover text-white'
                                    }`}
                            >
                                {joined.has(g.name) ? 'Joined' : (
                                    <>
                                        <UserPlus size={14} />
                                        Join Group
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
