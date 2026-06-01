import React from 'react';

export default function Spinner({ size = 24, color = '#00B074', className = '', ...props }) {
    return (
        <svg 
            className={`ui-spinner ${className}`}
            style={{
                width: size,
                height: size,
                animation: 'spin 1s linear infinite',
                color: color,
            }}
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            {...props}
        >
            <style>
                {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
            </style>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
}
