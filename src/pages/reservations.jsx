import React, { useState } from "react";
import { FaEllipsisH } from "react-icons/fa";

export default function Reservations() {
    const reservations = [
        { bookingId: "BK-1021", guestName: "John Doe", checkIn: "Oct 24, 2023", status: "Check-in", totalPayment: 1500 },
        { bookingId: "BK-1022", guestName: "Jane Smith", checkIn: "Oct 25, 2023", status: "Booked", totalPayment: 850 },
        { bookingId: "BK-1023", guestName: "Alice Johnson", checkIn: "Oct 26, 2023", status: "Check-out", totalPayment: 2100 },
    ];

    const getStatusClass = (status) => {
        if (status === 'Check-in') return 'confirmed';
        if (status === 'Booked') return 'pending';
        return 'cancelled';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Reservations</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage all current and upcoming reservations.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)', cursor: 'pointer', fontWeight: 500 }}>Export</button>
                    <button className="btn-primary">+ Create Order</button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span className="table-title">All Reservations</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="hotel-table">
                        <thead>
                            <tr>
                                <th>Order Ref</th>
                                <th>Client Name</th>
                                <th>Check In</th>
                                <th>Status</th>
                                <th>Revenue</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res) => (
                                <tr key={res.bookingId}>
                                    <td style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{res.bookingId}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                {res.guestName.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{res.guestName}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{res.checkIn}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(res.status)}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>${res.totalPayment}</td>
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