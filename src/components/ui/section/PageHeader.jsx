import React from 'react';
import Text from '../basic/Text';
import Icon from '../basic/Icon';

export default function PageHeader({ title, subtitle, className = '', ...props }) {
    return (
        <div 
            className={`ui-page-header ${className}`}
            style={{
                marginBottom: '24px',
            }}
            {...props}
        >
            <Text variant="h1" size="xl" weight="bold" color="#2D3748" style={{ marginBottom: '4px' }}>
                {title}
            </Text>
            {subtitle && (
                <Text variant="p" size="sm" color="#A0AEC0">
                    {subtitle}
                </Text>
            )}
        </div>
    );
}
