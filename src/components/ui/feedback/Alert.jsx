import React from 'react';

export default function Alert({ title, message, variant = 'info', className = '', ...props }) {
    const variants = {
        info: { bg: '#EBF8FF', color: '#3182CE', border: '#90CDF4' },
        success: { bg: '#F0FFF4', color: '#38A169', border: '#9AE6B4' },
        warning: { bg: '#FFFFF0', color: '#D69E2E', border: '#FAF089' },
        danger: { bg: '#FFF5F5', color: '#E53E3E', border: '#FEB2B2' },
    };

    const style = {
        padding: '16px',
        backgroundColor: variants[variant]?.bg,
        borderLeft: `4px solid ${variants[variant]?.color}`,
        borderRadius: '4px',
        marginBottom: '16px',
    };

    return (
        <div style={style} className={`ui-alert ${className}`} role="alert" {...props}>
            {title && (
                <div style={{ fontWeight: 600, color: variants[variant]?.color, marginBottom: '4px' }}>
                    {title}
                </div>
            )}
            <div style={{ fontSize: '14px', color: '#4A5568' }}>
                {message}
            </div>
        </div>
    );
}
