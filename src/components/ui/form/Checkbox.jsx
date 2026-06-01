import React from 'react';

export default function Checkbox({ label, checked, onChange, className = '', ...props }) {
    return (
        <label 
            className={`ui-checkbox ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#4A5568'
            }}
        >
            <input 
                type="checkbox" 
                checked={checked}
                onChange={onChange}
                style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: '#00B074'
                }}
                {...props}
            />
            {label}
        </label>
    );
}
