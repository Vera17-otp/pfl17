import React from 'react';

export default function Grid({ children, columns = 1, gap = '20px', className = '', ...props }) {
    return (
        <div 
            className={`ui-grid ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: gap,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
