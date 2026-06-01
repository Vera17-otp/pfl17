import React from 'react';

export default function Card({ children, padding = '24px', className = '', style = {}, ...props }) {
    return (
        <div 
            className={`ui-card ${className}`}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: padding,
                border: '1px solid #F3F2F7',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
}
