import React from 'react';

export default function Input({ icon, className = '', ...props }) {
    return (
        <div 
            className={`ui-input-wrapper ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                border: '1px solid #F3F2F7',
                borderRadius: '8px',
                padding: '10px 16px',
                gap: '8px',
            }}
        >
            {icon && (
                <span style={{ color: '#A0AEC0', display: 'flex', alignItems: 'center' }}>
                    {icon}
                </span>
            )}
            <input 
                style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '14px',
                    color: '#2D3748'
                }}
                {...props} 
            />
        </div>
    );
}
