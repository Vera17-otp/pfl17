import React from 'react';

export default function Badge({ children, variant = 'success', className = '', ...props }) {
    const variants = {
        success: { bg: '#E6F7ED', color: '#00B074' },
        danger: { bg: '#FEEAEA', color: '#FF5B5B' },
        warning: { bg: '#FFF5E6', color: '#FF9F43' },
        info: { bg: '#E5F0FF', color: '#338DF5' },
        neutral: { bg: '#F3F2F7', color: '#718096' },
    };

    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: variants[variant]?.bg || variants.neutral.bg,
        color: variants[variant]?.color || variants.neutral.color,
    };

    return (
        <span style={style} className={className} {...props}>
            {children}
        </span>
    );
}
