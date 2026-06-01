import React from 'react';

export default function Text({ children, variant = 'p', size = 'md', weight = 'normal', color = '#2D3748', className = '', ...props }) {
    const Component = variant;
    
    const sizes = {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
    };
    
    const weights = {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    };

    const style = {
        fontSize: sizes[size] || size,
        fontWeight: weights[weight] || weight,
        color: color,
        margin: variant === 'p' ? '0 0 8px 0' : '0 0 16px 0',
        lineHeight: 1.5,
    };

    return (
        <Component style={style} className={className} {...props}>
            {children}
        </Component>
    );
}
