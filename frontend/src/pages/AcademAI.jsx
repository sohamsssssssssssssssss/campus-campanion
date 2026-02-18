import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Search,
    Loader2,
    ExternalLink,
    Bookmark,
    Trash2,
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'lectures', label: 'Lectures', icon: BookOpen },
    { id: 'saved', label: 'Saved', icon: Bookmark },
];

const subjectGroups = {
    "Semester 1-2": ["Mathematics I", "Mathematics II", "Applied Physics", "Applied Chemistry", "Engineering Mechanics", "Programming Basics", "Engineering Graphics"],
    "Semester 3-4 (CS/IT)": ["Data Structures", "Discrete Maths", "Digital Logic", "Computer Organization", "OOP with Java", "Database Management"],
    "Semester 5-6 (CS)": ["Operating Systems", "Computer Networks", "Theory of Computation", "Software Engineering", "Web Technology", "Machine Learning"],
    "Semester 7-8 (CS)": ["Deep Learning", "Cloud Computing", "Cybersecurity", "Big Data Analytics", "Project Management", "Blockchain"]
};

const subjects = Object.values(subjectGroups).flat();

export default function AcademAI() {
    const [activeTab, setActiveTab] = useState('lectures');
    const [savedLectures, setSavedLectures] = useState(() => {
        const saved = localStorage.getItem('saved_lectures');
        return saved ? JSON.parse(saved) : [];
    });

    const toggleSave = (lecture) => {
        setSavedLectures(prev => {
            const isSaved = prev.some(l => l.url === lecture.url);
            let updated;
            if (isSaved) {
                updated = prev.filter(l => l.url !== lecture.url);
                toast.success('Removed from saved');
            } else {
                updated = [...prev, lecture];
                toast.success('Saved for later!');
            }
            localStorage.setItem('saved_lectures', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="p-6 lg:p-10 pt-20 lg:pt-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">AcademAI</h1>
                <p className="text-content-muted text-sm">YouTube Lectures for your courses.</p>
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

            {activeTab === 'lectures' && <LecturesTab toggleSave={toggleSave} savedLectures={savedLectures} />}
            {activeTab === 'saved' && <SavedTab savedLectures={savedLectures} toggleSave={toggleSave} />}
        </div>
    );
}

function SavedTab({ savedLectures, toggleSave }) {
    if (savedLectures.length === 0) {
        return (
            <div className="text-center py-20 bg-surface-card border border-line rounded-2xl">
                <Bookmark size={48} className="mx-auto text-content-muted/20 mb-4" />
                <h3 className="text-lg font-semibold">No saved lectures</h3>
                <p className="text-content-muted text-sm mt-1">Bookmarked lectures will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bookmark size={18} className="text-accent" />
                Your Bookmarks ({savedLectures.length})
            </h2>
            <div className="space-y-3">
                {savedLectures.map((lec, i) => (
                    <LectureCard key={i} lec={lec} isSaved={true} onToggleSave={() => toggleSave(lec)} delay={i * 0.05} />
                ))}
            </div>
        </div>
    );
}

function LecturesTab({ toggleSave, savedLectures }) {
    const [subject, setSubject] = useState(subjects[0]);
    const [topic, setTopic] = useState('');
    const [nptel, setNptel] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recent_searches');
        return saved ? JSON.parse(saved) : [];
    });

    const search = async (overrideTopic) => {
        const searchTopic = overrideTopic || topic;
        if (!searchTopic.trim()) {
            toast.error('Enter a topic to search.');
            return;
        }

        // Save to recent searches
        const newSearch = { topic: searchTopic, subject };
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.topic !== searchTopic);
            const updated = [newSearch, ...filtered].slice(0, 5);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
            return updated;
        });

        setLoading(true);
        setSearched(true);
        try {
            const data = await studentApi.getLectures({ subject, topic: searchTopic, nptel });
            setResults(data?.lectures || []);
            if (data?.note) toast(data.note, { icon: 'ℹ️' });
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
                            {Object.entries(subjectGroups).map(([group, subjs]) => (
                                <optgroup key={group} label={group}>
                                    {subjs.map(s => <option key={s} value={s}>{s}</option>)}
                                </optgroup>
                            ))}
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

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={nptel}
                                onChange={e => setNptel(e.target.checked)}
                            />
                            <div className="w-10 h-5 bg-line rounded-full peer peer-checked:bg-accent transition-colors"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-sm font-medium text-content-muted group-hover:text-content transition-colors">Prefer NPTEL Lectures</span>
                    </label>

                    <button
                        onClick={() => search()}
                        disabled={loading}
                        className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Search Lectures
                    </button>
                </div>

                {recentSearches.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-line">
                        <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Recently Searched</p>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setTopic(s.topic);
                                        setSubject(s.subject);
                                        search(s.topic);
                                    }}
                                    className="bg-surface border border-line hover:border-accent/40 px-3 py-1.5 rounded-full text-xs text-content-muted hover:text-content transition-all flex items-center gap-2"
                                >
                                    <Search size={10} />
                                    {s.topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-surface-card border border-line rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : searched && results.length === 0 ? (
                <p className="text-content-muted text-sm text-center py-8">No lectures found. Try a different topic.</p>
            ) : (
                <div className="space-y-3">
                    {results.map((lec, i) => (
                        <LectureCard
                            key={i}
                            lec={lec}
                            isSaved={savedLectures.some(l => l.url === lec.url)}
                            onToggleSave={() => toggleSave(lec)}
                            delay={i * 0.05}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LectureCard({ lec, isSaved, onToggleSave, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex flex-col sm:flex-row gap-4 bg-surface-card border border-line rounded-xl p-4 hover:border-accent/40 transition-colors group relative"
        >
            <div className="w-full sm:w-40 h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src={lec.thumbnail} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                {lec.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {lec.duration}
                    </span>
                )}
            </div>

            <div className="flex-1 min-w-0 py-1">
                <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {lec.title}
                </h3>
                <p className="text-xs text-content-muted mt-2 flex items-center gap-2">
                    {lec.channel}
                    {lec.views && <span>• {lec.views} views</span>}
                </p>
                <div className="flex items-center gap-3 mt-3">
                    <a
                        href={lec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent/10 hover:bg-accent text-accent hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
                    >
                        Watch Video <ExternalLink size={12} />
                    </a>
                    <button
                        onClick={onToggleSave}
                        className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-accent bg-accent/10' : 'text-content-muted hover:text-content bg-line/5'
                            }`}
                        title={isSaved ? "Remove from bookmarks" : "Save for later"}
                    >
                        <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}


