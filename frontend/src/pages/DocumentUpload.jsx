import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, CheckCircle2, AlertCircle,
    Loader2, X, Camera, RefreshCw, ChevronRight,
    Search, Info, ShieldCheck, Download
} from 'lucide-react';
import { studentApi } from '../services/api';
import toast from 'react-hot-toast';

const REQUIRED_DOCS = [
    { id: "10th_marksheet", name: "10th SSC Marksheet", icon_text: "SSC" },
    { id: "12th_marksheet", name: "12th HSC Marksheet", icon_text: "HSC" },
    { id: "aadhar_card", name: "Aadhar Card", icon_text: "UID" },
    { id: "passport_photo", name: "Passport Size Photo", icon_text: "IMG" },
    { id: "domicile_certificate", name: "Domicile Certificate", icon_text: "DOM" },
    { id: "caste_certificate", name: "Caste Certificate", icon_text: "CST", optional: true },
];

export default function DocumentUpload() {
    const [progress, setProgress] = useState({ completed: 0, total: 6, percentage: 0, pending: [] });
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Camera refs
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        fetchProgress();
        fetchDocs();
    }, []);

    const fetchProgress = async () => {
        try {
            const data = await studentApi.getDocumentProgress('demo_student');
            setProgress(data);
        } catch (err) {
            console.error("Failed to fetch progress", err);
        }
    };

    const fetchDocs = async () => {
        try {
            const data = await studentApi.getDocuments('demo_student');
            setDocs(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch documents", err);
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setIsCameraOpen(true);
        } catch (err) {
            toast.error("Camera access denied or unavailable.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            const file = new File([blob], `${selectedDoc.id}.jpg`, { type: 'image/jpeg' });
            handleUpload(file, selectedDoc.id);
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const handleFileUpload = (e, docId) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file, docId);
    };

    const handleUpload = async (file, docId) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docId);
        formData.append('student_id', 'demo_student');

        try {
            const result = await studentApi.uploadDocument(formData);
            if (result.status === 'validated') {
                toast.success(result.message || 'Verified!');
            } else {
                toast(result.message || 'Uploaded for review', { icon: '⚠️' });
            }
            fetchProgress();
            fetchDocs();
        } catch (err) {
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
            setSelectedDoc(null);
        }
    };

    const getDocStatus = (id) => {
        const doc = docs.find(d => d.doc_type === id);
        if (!doc) return 'pending';
        return doc.status;
    };

    return (
        <div className="p-6 lg:p-10 pt-24 lg:pt-10 max-w-6xl mx-auto min-h-screen">
            <header className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Digital Onboarding
                        </h1>
                        <p className="text-content-muted">TCET Document Verification Center</p>
                    </div>

                    {/* Progress Widget */}
                    <div className="bg-surface-card/40 backdrop-blur-xl border border-line rounded-2xl p-5 min-w-[300px]">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-content-muted">Completion</span>
                            <span className="text-sm font-bold text-accent">{progress.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percentage}%` }}
                                className="h-full bg-gradient-to-r from-accent to-accent-hover shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                        <p className="text-[11px] text-content-muted mt-3 flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-success" />
                            {progress.completed}/{progress.total} required documents verified
                        </p>
                    </div>
                </div>
            </header>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {REQUIRED_DOCS.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        doc={doc}
                        status={getDocStatus(doc.id)}
                        onAction={() => setSelectedDoc(doc)}
                        docData={docs.find(d => d.doc_type === doc.id)}
                    />
                ))}
            </div>

            {/* Upload Selector Modal */}
            <AnimatePresence>
                {selectedDoc && !isCameraOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedDoc(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-surface-card border border-line rounded-3xl p-8 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-surface rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <p className="text-accent font-bold text-xs tracking-widest uppercase mb-2">Upload Required</p>
                                <h2 className="text-2xl font-bold">{selectedDoc.name}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={startCamera}
                                    className="flex flex-col items-center justify-center gap-4 p-8 bg-surface border border-line rounded-2xl hover:border-accent/50 hover:bg-accent/5 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="text-accent" />
                                    </div>
                                    <span className="text-sm font-medium">Camera</span>
                                </button>

                                <label className="flex flex-col items-center justify-center gap-4 p-8 bg-surface border border-line rounded-2xl hover:border-accent/50 hover:bg-accent/5 transition-all group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="text-accent" />
                                    </div>
                                    <span className="text-sm font-medium">Browse</span>
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, selectedDoc.id)} />
                                </label>
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                    <Loader2 size={40} className="text-accent animate-spin" />
                                    <p className="font-medium animate-pulse">Running AI Validation...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Camera Overlay */}
            <AnimatePresence>
                {isCameraOpen && (
                    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />

                        {/* Camera UI */}
                        <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                            <div className="flex justify-between items-center pointer-events-auto">
                                <h3 className="text-white font-medium drop-shadow-lg">Capture {selectedDoc?.name}</h3>
                                <button onClick={stopCamera} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                                    <X />
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-6 pb-4 pointer-events-auto">
                                <p className="text-white/60 text-sm drop-shadow-lg">Align document within frame</p>
                                <button
                                    onClick={capturePhoto}
                                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1"
                                >
                                    <div className="w-full h-full bg-white rounded-full" />
                                </button>
                            </div>
                        </div>

                        {/* Frame helper overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[85%] aspect-[1.6] border-2 border-dashed border-white/40 rounded-2xl" />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DocumentCard({ doc, status, onAction, docData }) {
    const isVerified = status === 'verified' || status === 'validated';
    const isError = status === 'rejected' || status === 'error';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden bg-surface-card border rounded-2xl p-5 transition-all duration-300 ${isVerified ? 'border-success/20' : isError ? 'border-danger/20' : 'border-line hover:border-accent/40'
                }`}
        >
            <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-surface border border-line flex items-center justify-center text-[10px] font-black tracking-tighter text-accent">
                    {doc.icon_text}
                </div>

                {isVerified ? (
                    <div className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> VERIFIED
                    </div>
                ) : isError ? (
                    <div className="bg-danger/10 text-danger text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle size={10} /> REJECTED
                    </div>
                ) : (
                    <div className="bg-surface text-content-muted text-[10px] font-bold px-2 py-1 rounded-full border border-line">
                        PENDING
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-sm mb-1">{doc.name}</h3>
                <p className="text-xs text-content-muted">
                    {isVerified ? 'AI validated with 98% confidence' : 'Click to scan or upload file'}
                </p>
            </div>

            <div className="pt-4 border-t border-line/50 flex items-center justify-between">
                {isVerified ? (
                    <span className="text-[11px] text-content-muted flex items-center gap-1.5 italic">
                        {docData?.data?.data?.name || 'Verified Content'}
                    </span>
                ) : (
                    <button
                        onClick={onAction}
                        className="text-accent text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        {isError ? 'RETRY SCAN' : 'START UPLOAD'} <ChevronRight size={14} />
                    </button>
                )}

                {isVerified && (
                    <button className="p-1.5 hover:bg-surface rounded-lg transition-colors text-content-muted">
                        <Search size={14} />
                    </button>
                )}
            </div>

            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-5 transition-colors ${isVerified ? 'bg-success' : isError ? 'bg-danger' : 'bg-accent'
                }`} />
        </motion.div>
    );
}
