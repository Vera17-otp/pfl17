import React from 'react';

export default function Select({ options, value, onChange, className = '', ...props }) {
    return (
        <select
            className={`ui-select ${className}`}
            value={value}
            onChange={onChange}
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 32px 10px 16px',
                fontSize: '14px',
                color: '#2D3748',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                background: `url('data:image/svg+xml;utf8,<svg fill="%23A0AEC0" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>') no-repeat right 8px center`,
                backgroundSize: '20px'
            }}
            {...props}
        >
            {options.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
