import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function ProfileAvatar({ studentId, name = 'Student', size = 'medium', className = '' }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!studentId) return;
            try {
                const res = await fetch(`http://localhost:8000/api/profile/${studentId}?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile avatar:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        const handleUpdate = () => {
            setTimeout(fetchProfile, 100); // Small delay to ensure DB commit
        };

        window.addEventListener('profile-updated', handleUpdate);
        return () => window.removeEventListener('profile-updated', handleUpdate);
    }, [studentId]);

    const sizeClasses = {
        xs: 'w-8 h-8',
        small: 'w-10 h-10',
        medium: 'w-16 h-16',
        large: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    if (loading) {
        return <div className={`${sizeClasses[size]} rounded-full bg-surface-hover animate-pulse ${className}`} />;
    }

    const displayName = profile?.name || name;

    if (profile?.profile_type === 'photo' && profile?.photo_url) {
        return (
            <img
                src={`http://localhost:8000${profile.photo_url}?t=${Date.now()}`}
                alt={displayName}
                className={`rounded-full object-cover border border-line ${sizeClasses[size]} ${className}`}
            />
        );
    }

    // Default fallback icon
    return (
        <div className={`rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent ${sizeClasses[size]} ${className}`}>
            <User size={size === 'xl' ? 80 : 32} />
        </div>
    );
}
