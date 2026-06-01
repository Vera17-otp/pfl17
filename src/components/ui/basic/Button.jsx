import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        outline: 'none',
    };

    const variants = {
        primary: {
            backgroundColor: '#00B074',
            color: 'white',
        },
        secondary: {
            backgroundColor: '#F3F2F7',
            color: '#2D3748',
        },
        outline: {
            backgroundColor: 'transparent',
            border: '1px solid #E2E8F0',
            color: '#00B074',
        },
        text: {
            backgroundColor: 'transparent',
            color: '#718096',
            padding: 0,
        }
    };

    const sizes = {
        sm: { padding: '6px 12px', fontSize: '12px' },
        md: { padding: '10px 16px', fontSize: '14px' },
        lg: { padding: '14px 24px', fontSize: '16px' },
    };

    const style = {
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button style={style} className={className} {...props}>
            {children}
        </button>
    );
}
