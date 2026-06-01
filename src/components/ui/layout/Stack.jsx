import React from 'react';

export default function Stack({ children, direction = 'column', align = 'stretch', justify = 'flex-start', gap = '16px', className = '', wrap = 'nowrap', ...props }) {
    return (
        <div 
            className={`ui-stack ${className}`}
            style={{
                display: 'flex',
                flexDirection: direction,
                alignItems: align,
                justifyContent: justify,
                gap: gap,
                flexWrap: wrap,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
