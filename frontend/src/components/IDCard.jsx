import React, { forwardRef } from 'react';

/**
 * IDCard — renders a TCET-styled college ID card as a DOM element.
 * Pass a ref to capture it with html2canvas for download.
 */
const IDCard = forwardRef(function IDCard({ cardData }, ref) {
    const {
        name = 'Student Name',
        department = 'Engineering',
        roll_no = 'TCET/CS/2024/042',
        prn = '2024016400123456',
        blood_group = 'B+',
        valid_until = 'June 2028',
        year = '2024–28',
        photo_url = null,
        qr_base64 = null,
        ai_tagline = '',
    } = cardData || {};

    const initials = name.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div
            ref={ref}
            style={{
                width: '340px',
                background: 'linear-gradient(160deg, #0a0f1e 0%, #0f172a 100%)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(13,148,136,0.3)',
                transform: 'rotate(1.5deg)',
                fontFamily: "'Inter', sans-serif",
                color: 'white',
                flexShrink: 0,
            }}
        >
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                {/* TCET Logo placeholder */}
                <div style={{
                    width: '44px', height: '44px',
                    background: 'white',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '900', color: '#0d9488',
                    textAlign: 'center', lineHeight: '1.1',
                    flexShrink: 0,
                }}>
                    TCET
                </div>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                        THAKUR COLLEGE OF
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                        ENGINEERING & TECHNOLOGY
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>
                        Kandivali (E), Mumbai — Autonomous Institute
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 18px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        border: '3px solid #0d9488',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #0d9488, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: '900', color: 'white',
                    }}>
                        {photo_url ? (
                            <img src={photo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', marginBottom: '2px', lineHeight: '1.2' }}>
                        {name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#0d9488', fontWeight: '700', marginBottom: ai_tagline ? '6px' : '10px' }}>
                        {department}
                    </div>

                    {ai_tagline && (
                        <div style={{
                            fontSize: '9px',
                            color: '#94a3b8',
                            fontStyle: 'italic',
                            marginBottom: '10px',
                            lineHeight: '1.4',
                            borderLeft: '2px solid #0d9488',
                            paddingLeft: '6px',
                        }}>
                            ✦ {ai_tagline}
                        </div>
                    )}

                    {[
                        ['Roll No', roll_no],
                        ['PRN', prn],
                        ['Year', year],
                        ['Blood Grp', blood_group],
                        ['Valid Till', valid_until],
                    ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', width: '52px', flexShrink: 0 }}>
                                {label}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#e2e8f0' }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QR + Footer */}
            <div style={{
                borderTop: '1px solid rgba(13,148,136,0.2)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        STUDENT ID CARD
                    </div>
                    <div style={{ fontSize: '8px', color: '#0d9488', marginTop: '2px' }}>
                        ✓ Verified by CampusCompanion
                    </div>
                </div>
                {qr_base64 && (
                    <div style={{
                        background: 'white',
                        padding: '4px',
                        borderRadius: '6px',
                        width: '56px', height: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img
                            src={`data:image/png;base64,${qr_base64}`}
                            alt="QR Code"
                            style={{ width: '48px', height: '48px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

export default IDCard;
