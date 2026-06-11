import React from 'react';
import { FaCalendarCheck, FaBed, FaDollarSign, FaUserClock, FaEllipsisH } from 'react-icons/fa';
import Card from '../components/ui/data-display/Card';
import Badge from '../components/ui/data-display/Badge';
import Button from '../components/ui/basic/Button';
import Table from '../components/ui/data-display/Table';
import Text from '../components/ui/basic/Text';
import Avatar from '../components/ui/basic/Avatar';
import { ButtonGroup } from '../components/ui/button-group';
import { Button as ShadcnButton } from '../components/ui/button';

const Dashboard = () => {
  const kpis = [
    { label: 'Total Bookings', value: '256', icon: <FaCalendarCheck />, type: 'primary' },
    { label: 'Available Rooms', value: '42', icon: <FaBed />, type: 'success' },
    { label: 'Revenue (Monthly)', value: '$45,230', icon: <FaDollarSign />, type: 'primary' },
    { label: 'Pending Arrivals', value: '18', icon: <FaUserClock />, type: 'warning' },
  ];

  const recentBookings = [
    { id: '#BK-0932', guest: 'Sarah Jenkins', room: 'Deluxe Suite', checkIn: 'Oct 24, 2023', checkOut: 'Oct 28, 2023', status: 'Confirmed', amount: '$850' },
    { id: '#BK-0933', guest: 'Michael Chen', room: 'Standard King', checkIn: 'Oct 25, 2023', checkOut: 'Oct 27, 2023', status: 'Pending', amount: '$320' },
    { id: '#BK-0934', guest: 'Emma Watson', room: 'Ocean View', checkIn: 'Oct 25, 2023', checkOut: 'Oct 30, 2023', status: 'Confirmed', amount: '$1,200' },
    { id: '#BK-0935', guest: 'James Wilson', room: 'Presidential Suite', checkIn: 'Oct 26, 2023', checkOut: 'Oct 29, 2023', status: 'Cancelled', amount: '$2,400' },
    { id: '#BK-0936', guest: 'Olivia Davis', room: 'Standard Double', checkIn: 'Oct 26, 2023', checkOut: 'Oct 28, 2023', status: 'Confirmed', amount: '$280' },
  ];

  const getStatusVariant = (status) => {
    if (status === 'Confirmed') return 'success';
    if (status === 'Pending') return 'warning';
    return 'danger';
  };

  return (
    <div>
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <Text variant="h1" size="xl" weight="bold" style={{ marginBottom: '8px' }}>Dashboard Overview</Text>
          <Text variant="p" size="sm" color="var(--text-muted)">Welcome back, Vera. Here's a quick look at your hotel activity and performance.</Text>
        </div>

        <div className="dashboard-hero-actions">
          <Button variant="primary" size="lg">+ New Booking</Button>
          <div className="dashboard-hero-chip">Live dashboard</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="kpi-card" style={{ gridColumn: 'span 3' }}>
            <div className={`kpi-icon ${kpi.type}`}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{kpi.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 0 }}>
        <div style={{ gridColumn: 'span 8' }}>
          <Card className="table-card" padding="0">
            <div className="table-header">
              <div>
                <span className="table-title">Recent Bookings</span>
                <div style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.95rem' }}>Latest reservations and room status for the week.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ButtonGroup>
                  <ShadcnButton variant="outline" size="sm">Today</ShadcnButton>
                  <ShadcnButton variant="outline" size="sm">7 Days</ShadcnButton>
                  <ShadcnButton variant="outline" size="sm">30 Days</ShadcnButton>
                </ButtonGroup>
                <button className="icon-btn"><FaEllipsisH /></button>
              </div>
            </div>
            <Table
              className="hotel-table"
              headers={['Booking ID', 'Guest Name', 'Room Type', 'Check In', 'Check Out', 'Status', 'Amount']}
              data={recentBookings}
              renderRow={(booking, idx) => (
                <>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{booking.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar fallback={booking.guest.charAt(0)} size={34} />
                      <span style={{ fontWeight: 600 }}>{booking.guest}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{booking.room}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{booking.checkIn}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{booking.checkOut}</td>
                  <td>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  </td>
                  <td style={{ fontWeight: 700 }}>{booking.amount}</td>
                </>
              )}
            />
          </Card>
        </div>

        <div style={{ gridColumn: 'span 4', display: 'grid', gap: '24px' }}>
          <Card className="table-card">
            <Text variant="h3" size="lg" weight="bold" style={{ marginBottom: '18px' }}>Room Occupancy</Text>
            <div className="occupancy-chart">
              <div className="occupancy-donut">
                <div className="occupancy-donut-label">
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}><strong>75%</strong></span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.08em', marginTop: '4px' }}>Occupied</div>
                </div>
              </div>
            </div>
            <div className="occupancy-metrics">
              <div className="occupancy-metric">
                <div>
                  <span className="occupancy-dot occupied" />
                  <Text variant="span" size="sm" color="var(--text-muted)" style={{ margin: 0 }}>Occupied Rooms</Text>
                </div>
                <span style={{ fontWeight: 700 }}>124</span>
              </div>
              <div className="occupancy-metric">
                <div>
                  <span className="occupancy-dot available" />
                  <Text variant="span" size="sm" color="var(--text-muted)" style={{ margin: 0 }}>Available Rooms</Text>
                </div>
                <span style={{ fontWeight: 700 }}>42</span>
              </div>
            </div>
          </Card>

          <Card className="table-card" style={{ flex: 1 }}>
            <Text variant="h3" size="lg" weight="bold" style={{ marginBottom: '18px' }}>Quick Actions</Text>
            <div className="quick-actions-group">
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Create Invoice</span>
                <span>→</span>
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Manage Housekeeping</span>
                <span>→</span>
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>Generate Report</span>
                <span>→</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
