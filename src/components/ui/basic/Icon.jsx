import React from 'react';

export default function Icon({ children, color = 'inherit', size = 20, className = '', ...props }) {
    return (
        <span 
            className={`icon-wrapper ${className}`}
            style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: color,
                fontSize: size,
                width: size,
                height: size
            }}
            {...props}
        >
            {children}
        </span>
    );
}
