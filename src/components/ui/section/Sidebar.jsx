import React from 'react';
import Text from '../basic/Text';
import { FaHome, FaList, FaFileAlt, FaUser, FaChartBar, FaStar, FaHamburger, FaCalendarAlt } from 'react-icons/fa';

export default function Sidebar({ activeItem = 'Dashboard', className = '', ...props }) {
    const menuItems = [
        { name: 'Dashboard', icon: <FaHome /> },
        { name: 'Order List', icon: <FaList /> },
        { name: 'Order Detail', icon: <FaFileAlt /> },
        { name: 'Customer', icon: <FaUser /> },
        { name: 'Analytics', icon: <FaChartBar /> },
        { name: 'Reviews', icon: <FaStar /> },
        { name: 'Foods', icon: <FaHamburger /> },
        { name: 'Food Detail', icon: <FaFileAlt /> },
        { name: 'Customer Detail', icon: <FaUser /> },
        { name: 'Calendar', icon: <FaCalendarAlt /> },
    ];

    return (
        <aside 
            className={`ui-sidebar ${className}`}
            style={{
                width: '260px',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #F3F2F7',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
            }}
            {...props}
        >
            <div style={{ padding: '32px 24px', marginBottom: '16px' }}>
                <Text variant="h2" size="xl" weight="bold" color="#2D3748" style={{ margin: 0 }}>
                    Sedap<span style={{ color: '#00B074' }}>.</span>
                </Text>
                <Text variant="p" size="xs" color="#A0AEC0" style={{ marginTop: '4px' }}>
                    Modern Admin Dashboard
                </Text>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
                {menuItems.map((item, idx) => {
                    const isActive = item.name === activeItem;
                    return (
                        <a 
                            key={idx}
                            href="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: isActive ? '#00B074' : '#718096',
                                backgroundColor: isActive ? '#E6F7ED' : 'transparent',
                                fontWeight: isActive ? '600' : '500',
                                fontSize: '14px',
                                marginBottom: '4px',
                            }}
                        >
                            <span style={{ fontSize: '18px', display: 'flex' }}>
                                {item.icon}
                            </span>
                            {item.name}
                        </a>
                    );
                })}
            </nav>
            
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Text variant="p" size="xs" color="#A0AEC0">
                    Sedap Dashboard © 2026<br/>
                    All Rights Reserved
                </Text>
            </div>
        </aside>
    );
}
