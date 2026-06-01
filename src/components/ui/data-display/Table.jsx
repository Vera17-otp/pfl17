import React from 'react';

export default function Table({ headers, data, renderRow, className = '', ...props }) {
    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table 
                className={`ui-table ${className}`}
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left'
                }}
                {...props}
            >
                <thead>
                    <tr style={{ borderBottom: '2px solid #F3F2F7', color: '#A0AEC0', fontSize: '13px' }}>
                        {headers.map((header, idx) => (
                            <th key={idx} style={{ padding: '16px 12px', fontWeight: 600 }}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F3F2F7' }}>
                            {renderRow(item, idx)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
