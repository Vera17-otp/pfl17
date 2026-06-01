import React, { useState } from "react";
import { FaBed, FaWifi, FaUsers } from "react-icons/fa";

export default function Rooms() {
    const [rooms] = useState([
        { id: 1, type: "Presidential Suite", roomNo: "101", price: 1250, status: "Ready", capacity: 4, bed: "King" },
        { id: 2, type: "Executive King", roomNo: "305", price: 420, status: "Occupied", capacity: 2, bed: "King" },
        { id: 3, type: "Deluxe Family", roomNo: "212", price: 280, status: "Cleaning", capacity: 4, bed: "Queen + Single" },
        { id: 4, type: "Luxury Twin", roomNo: "408", price: 350, status: "Ready", capacity: 2, bed: "Twin" },
    ]);

    const getStatusClass = (status) => {
        if (status === 'Ready') return 'confirmed';
        if (status === 'Cleaning') return 'pending';
        return 'cancelled';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Room Assets</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage all hotel rooms and availability.</p>
                </div>
                <button className="btn-primary">+ Add Room</button>
            </div>

            <div className="dashboard-grid">
                {rooms.map((room) => (
                    <div key={room.id} style={{ gridColumn: 'span 3' }} className="table-card">
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(79, 70, 229, 0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="kpi-icon primary" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                    <FaBed />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600 }}>Room {room.roomNo}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{room.type}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>${room.price}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ night</span>
                                </div>
                                <span className={`status-badge ${getStatusClass(room.status)}`}>{room.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <FaUsers /> {room.capacity}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <FaBed /> {room.bed}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <FaWifi />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-primary" style={{ flex: 1, padding: '8px' }}>Book Now</button>
                                <button style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer' }}>Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}