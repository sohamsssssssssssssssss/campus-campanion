import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (!error.response) {
            toast.error('Backend offline — start with: python3 main.py', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            });
        } else {
            const message = error.response?.data?.detail || error.message || 'Something went wrong';
            toast.error(message, {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            });
        }
        return Promise.reject(error);
    }
);

export const studentApi = {
    getProgress: (studentId) => api.get(`/student/${studentId}/progress`),
    chat: (message, studentId, language = 'en') =>
        api.post('/chat', { message, student_id: studentId, language }),
    clearChat: (studentId) =>
        api.post(`/chat/clear?student_id=${studentId}`),
    getChatHistory: (studentId) =>
        api.get(`/chat/history/${studentId}`),
    submitFeedback: (studentId, messageId, rating, comment = null) =>
        api.post('/chat/feedback', {
            student_id: studentId,
            message_id: messageId,
            rating,
            comment,
        }),
    uploadDocument: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getDocumentProgress: (studentId) => api.get(`/documents/progress/${studentId}`),
    getDocuments: (studentId) => api.get(`/documents/${studentId}`),
    // Roommate Matching
    submitRoommatePreferences: (data, studentId) => api.post(`/roommates/preferences?student_id=${studentId || 'demo_student'}`, data),
    getRoommateMatches: (studentId) => api.get(`/roommates/matches/${studentId}`),
    swipeRoommate: (data) => api.post('/roommate/swipe', data),
    getMutualMatches: (studentId) => api.get(`/roommate/mutual-matches/${studentId}`),
    getLectures: (payload) => api.post('/acad/lectures', payload),
    generateQuiz: (payload) => api.post('/acad/quiz', payload),
    getStudyGroups: (params) => api.get('/acad/groups', { params }),
    // Safety & Emergency
    triggerSOS: (data) => api.post('/safety/sos', data),
    getEmergencyContacts: () => api.get('/safety/contacts'),
    submitAnonymousReport: (data) => api.post('/safety/report', data),
    mentalHealthChat: (message, sessionId) => api.post('/safety/mental-health-chat', { message, session_id: sessionId }),
    getHelplines: () => api.get('/safety/helplines'),
    // Payments
    createPaymentOrder: (studentId, amount) => api.post('/payments/create-order', { student_id: studentId, amount }),
    verifyPayment: (data) => api.post('/payments/verify', data),
    // Google Integration
    getGoogleAuthUrl: (studentId) => api.get(`/integrations/google/auth?student_id=${studentId}`),
    // Profile APIs
    getProfile: (studentId) => api.get(`/profile/${studentId}`),
    uploadPhoto: (studentId, file) => {
        const formData = new FormData();
        formData.append('student_id', studentId);
        formData.append('photo', file);
        return api.post('/profile/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateBio: (studentId, bio) => api.put(`/profile/${studentId}/bio`, { bio }),
    updateEmail: (email) => api.post('/profile/email/update', { new_email: email }),
    verifyEmail: (email, code) => api.post('/profile/email/verify', { email, code }),
    updatePhone: (studentId, phone) => api.put(`/profile/${studentId}/phone`, { phone }),
    // ID Card
    getIdCard: (studentId) => api.get(`/student/id-card/${studentId}`),
    generateIdCard: (studentId) => api.post('/student/generate-id-card', { student_id: studentId }),
    // Administrative
    registerStudent: (data) => api.post('/student/create', data),
    getAllStudents: () => api.get('/admin/all-students'),
};

export default api;
