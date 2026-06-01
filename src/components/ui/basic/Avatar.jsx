import React from 'react';

export default function Avatar({ src, alt = 'Avatar', size = 40, fallback = '?', className = '', ...props }) {
    const style = {
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        backgroundColor: '#E2E8F0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4A5568',
        fontWeight: '600',
        fontSize: size * 0.4,
    };

    if (!src) {
        return (
            <div style={style} className={className} {...props}>
                {fallback}
            </div>
        );
    }

    return (
        <img src={src} alt={alt} style={style} className={className} {...props} />
    );
}
