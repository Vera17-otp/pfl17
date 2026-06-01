import React, { useState } from "react";
import { FaUserPlus, FaEllipsisH } from "react-icons/fa";

export default function Guests() {
    const guests = [
        { guestId: "G-1021", guestName: "John Doe", email: "john.doe@example.com", phone: "+1 234 567 890", membership: "Platinum", stays: 14 },
        { guestId: "G-1022", guestName: "Jane Smith", email: "jane.smith@example.com", phone: "+1 987 654 321", membership: "Gold", stays: 5 },
        { guestId: "G-1023", guestName: "Alice Johnson", email: "alice.j@example.com", phone: "+1 555 123 456", membership: "Silver", stays: 2 },
    ];

    const getMembershipClass = (membership) => {
        if (membership === 'Platinum') return 'confirmed';
        if (membership === 'Gold') return 'pending';
        if (membership === 'Silver') return 'cancelled';
        return '';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Guest Directory</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage guest profiles and preferences.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', cursor: 'pointer', fontWeight: 500 }}>Filter</button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaUserPlus /> Add Guest</button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span className="table-title">All Guests</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="hotel-table">
                        <thead>
                            <tr>
                                <th>Guest ID</th>
                                <th>Guest Name</th>
                                <th>Contact Info</th>
                                <th>Membership</th>
                                <th>Total Stays</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guests.map((g) => (
                                <tr key={g.guestId}>
                                    <td style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{g.guestId}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                {g.guestName.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{g.guestName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{g.email}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getMembershipClass(g.membership)}`}>
                                            {g.membership}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{g.stays} nights</td>
                                    <td>
                                        <button className="icon-btn"><FaEllipsisH /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}