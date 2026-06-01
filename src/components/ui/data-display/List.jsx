import React from 'react';

export default function List({ items, renderItem, as = 'ul', className = '', ...props }) {
    const Component = as;
    return (
        <Component 
            className={`ui-list ${className}`}
            style={{
                listStyle: as === 'ul' ? 'none' : 'decimal',
                padding: as === 'ul' ? 0 : '0 0 0 20px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
            {...props}
        >
            {items.map((item, idx) => (
                <li key={idx}>
                    {renderItem(item, idx)}
                </li>
            ))}
        </Component>
    );
}
