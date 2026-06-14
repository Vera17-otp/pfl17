import React from "react";
import { FaPlus, FaCog } from "react-icons/fa";

export default function Details() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Settings</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Configure your hotel dashboard settings.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaCog /> Save Changes</button>
            </div>

            <div className="dashboard-grid">
                <div style={{ gridColumn: 'span 8' }} className="table-card">
                    <div className="table-header">
                        <span className="table-title">General Settings</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Hotel Name</label>
                            <input type="text" defaultValue="Hotelify Grand" style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Contact Email</label>
                            <input type="email" defaultValue="admin@hotelify.com" style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Timezone</label>
                            <select style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--surface-color)', color: 'var(--text-main)' }}>
                                <option>UTC -8:00 (Pacific Time)</option>
                                <option>UTC +0:00 (GMT)</option>
                                <option>UTC +7:00 (WIB)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ gridColumn: 'span 4' }} className="table-card">
                    <div className="table-header">
                        <span className="table-title">Profile</span>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', marginBottom: '16px' }}>VZ</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Vera Zakia</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>General Manager</p>
                        
                        <button style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500 }}>Upload New Photo</button>
                    </div>
                </div>
            </div>
        </div>
    );
}