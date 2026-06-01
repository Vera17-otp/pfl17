import React from 'react';

export default function Container({ children, maxWidth = '1200px', padding = '24px', className = '', ...props }) {
    return (
        <div 
            className={`ui-container ${className}`}
            style={{
                width: '100%',
                maxWidth: maxWidth,
                margin: '0 auto',
                padding: padding,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
