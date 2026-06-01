import React from 'react';
import { FaCalendarCheck, FaBed, FaDollarSign, FaUserClock, FaEllipsisH } from 'react-icons/fa';
import Grid from '../components/ui/layout/Grid';
import Card from '../components/ui/data-display/Card';
import Badge from '../components/ui/data-display/Badge';
import Button from '../components/ui/basic/Button';
import Table from '../components/ui/data-display/Table';
import Text from '../components/ui/basic/Text';
import Avatar from '../components/ui/basic/Avatar';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Text variant="h1" size="xl" weight="bold" style={{ marginBottom: '4px' }}>Dashboard Overview</Text>
          <Text variant="p" size="sm" color="var(--text-muted)">Welcome back, Vera. Here's what's happening at your hotel today.</Text>
        </div>
        <Button variant="primary">+ New Booking</Button>
      </div>

      <Grid columns={4} gap="24px" style={{ marginBottom: '32px' }}>
        {kpis.map((kpi, idx) => (
          <Card key={idx} style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className={`kpi-icon ${kpi.type}`}>
              {kpi.icon}
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{kpi.value}</span>
            </div>
          </Card>
        ))}
      </Grid>

      <Grid columns={3} gap="24px" style={{ marginBottom: 0 }}>
        {/* Main Table Area */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card padding="0">
            <div className="table-header">
              <span className="table-title">Recent Bookings</span>
              <button className="icon-btn"><FaEllipsisH /></button>
            </div>
            <Table 
                headers={['Booking ID', 'Guest Name', 'Room Type', 'Check In', 'Status', 'Amount']}
                data={recentBookings}
                renderRow={(booking, idx) => (
                    <>
                        <td style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{booking.id}</td>
                        <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar fallback={booking.guest.charAt(0)} size={32} />
                                <span style={{ fontWeight: 500 }}>{booking.guest}</span>
                            </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{booking.room}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{booking.checkIn}</td>
                        <td>
                            <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                        </td>
                        <td style={{ fontWeight: 600 }}>{booking.amount}</td>
                    </>
                )}
            />
          </Card>
        </div>

        {/* Analytics/Sidebar Area */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card padding="24px">
            <Text variant="h3" size="lg" weight="bold" style={{ marginBottom: '20px' }}>Room Occupancy</Text>
            
            {/* Simple CSS-based Donut Chart visualization */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ 
                position: 'relative', width: '150px', height: '150px', 
                borderRadius: '50%', background: 'conic-gradient(var(--primary-color) 0% 75%, var(--border-color) 75% 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ 
                  width: '110px', height: '110px', backgroundColor: 'var(--surface-color)', 
                  borderRadius: '50%', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center' 
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>75%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupied</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }}></div>
                  <Text variant="span" size="sm" color="var(--text-muted)" style={{ margin: 0 }}>Occupied Rooms</Text>
                </div>
                <span style={{ fontWeight: 600 }}>124</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--border-color)' }}></div>
                  <Text variant="span" size="sm" color="var(--text-muted)" style={{ margin: 0 }}>Available Rooms</Text>
                </div>
                <span style={{ fontWeight: 600 }}>42</span>
              </div>
            </div>
          </Card>

          <Card padding="24px" style={{ flex: 1 }}>
            <Text variant="h3" size="lg" weight="bold" style={{ marginBottom: '20px' }}>Quick Actions</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                <span>Create Invoice</span> <span>→</span>
              </Button>
              <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                <span>Manage Housekeeping</span> <span>→</span>
              </Button>
              <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                <span>Generate Report</span> <span>→</span>
              </Button>
            </div>
          </Card>
        </div>
      </Grid>
    </div>
  );
};

export default Dashboard;