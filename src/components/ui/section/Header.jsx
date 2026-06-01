import React from 'react';
import Input from '../form/Input';
import Avatar from '../basic/Avatar';
import Icon from '../basic/Icon';
import { FaSearch, FaBell, FaCommentAlt, FaGift, FaCog } from 'react-icons/fa';

export default function Header({ user = { name: "Samantha", role: "Admin" }, className = '', ...props }) {
    return (
        <header 
            className={`ui-header ${className}`}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 32px',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #F3F2F7',
            }}
            {...props}
        >
            <div style={{ width: '400px' }}>
                <Input 
                    placeholder="Search here" 
                    icon={<FaSearch />}
                    style={{ backgroundColor: '#F9FAFB', border: 'none' }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', color: '#A0AEC0' }}>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#338DF5', backgroundColor: '#E5F0FF', padding: '8px', borderRadius: '8px' }}>
                        <FaBell />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#FF5B5B', borderRadius: '50%' }}></span>
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#338DF5', backgroundColor: '#E5F0FF', padding: '8px', borderRadius: '8px' }}>
                        <FaCommentAlt />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#FF5B5B', borderRadius: '50%' }}></span>
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#FF5B5B', backgroundColor: '#FEEAEA', padding: '8px', borderRadius: '8px' }}>
                        <FaGift />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#FF5B5B', borderRadius: '50%' }}></span>
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#FF9F43', backgroundColor: '#FFF5E6', padding: '8px', borderRadius: '8px' }}>
                        <FaCog />
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#FF5B5B', borderRadius: '50%' }}></span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #F3F2F7', paddingLeft: '24px' }}>
                    <span style={{ fontSize: '14px', color: '#4A5568' }}>
                        Hello, <strong>{user.name}</strong>
                    </span>
                    <Avatar 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" 
                        size={40} 
                    />
                </div>
            </div>
        </header>
    );
}
