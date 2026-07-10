import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch, FaComments, FaTimes, FaCalendarAlt, FaBed, FaCoins, FaCheck, FaSignOutAlt } from "react-icons/fa";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../hooks/useAuth";
import Input from "./ui/form/Input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Import data reservasi aktual
import { reservations } from "../data/reservations";

// Helper rupiah formatter
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

// Helper hitung lama menginap
const getStayNights = (inStr, outStr) => {
  if (!inStr || !outStr) return 0;
  const partsIn = inStr.split('-');
  const partsOut = outStr.split('-');
  const inDate = new Date(partsIn[0], partsIn[1]-1, partsIn[2]);
  const outDate = new Date(partsOut[0], partsOut[1]-1, partsOut[2]);
  return Math.ceil(Math.abs(outDate - inDate) / (1000 * 60 * 60 * 24));
};

export default function Header({ searchTerm, setSearchTerm }) {
  // Chat panel context
  const { totalUnread, setPanelOpen, panelOpen } = useChat();
  
  // Auth hooks
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // 1. STATE NOTIFIKASI & PROFILE DROPDOWN
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null); // Menyimpan data reservasi aktif untuk modal
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Gagal logout: " + error.message);
    }
  };
  
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      bookingId: "BOK-5001", // John Doe, Booked
      title: "Reservasi Baru Masuk",
      message: "John Doe memesan kamar Suite Room (#BOK-5001)",
      time: "10 mnt yang lalu",
      status: "Booked",
      read: false
    },
    {
      id: "notif-2",
      bookingId: "BOK-5000", // Vera Zakia, Check-in
      title: "Check-in Berhasil",
      message: "Vera Zakia sudah check-in di Kamar 100",
      time: "25 mnt yang lalu",
      status: "Check-in",
      read: false
    },
    {
      id: "notif-3",
      bookingId: "BOK-5004", // Budi Santoso, Outstanding (Check-in)
      title: "Pembayaran Outstanding",
      message: "Tagihan Budi Santoso (#BOK-5004) belum lunas",
      time: "1 jam yang lalu",
      status: "Check-in",
      read: false
    },
    {
      id: "notif-4",
      bookingId: "BOK-5002", // Siti Aminah, Check-out
      title: "Check-out Dijadwalkan",
      message: "Siti Aminah (#BOK-5002) dijadwalkan check-out hari ini",
      time: "Hari ini, 12:00",
      status: "Check-out",
      read: false
    },
    {
      id: "notif-5",
      bookingId: "BOK-5003", // Michael Chen, Cancelled
      title: "Reservasi Dibatalkan",
      message: "Michael Chen membatalkan reservasi Kamar 103",
      time: "Kemarin",
      status: "Cancelled",
      read: true
    }
  ]);

  // Hitung jumlah belum dibaca
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handler klik notifikasi
  const handleNotificationClick = (notif) => {
    // 1. Tandai sudah dibaca
    setNotifications(prev => 
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    
    // 2. Cari data reservasi aktual dari reservations.js
    const actualRes = reservations.find(r => r.bookingId === notif.bookingId);
    if (actualRes) {
      setSelectedRes(actualRes);
    } else {
      // Fallback jika tidak ditemukan
      setSelectedRes({
        bookingId: notif.bookingId,
        guestName: notif.title === "Reservasi Baru Masuk" ? "John Doe" : "Tamu Hotel",
        roomNumber: "N/A",
        roomType: "Unknown Room Type",
        checkIn: "N/A",
        checkOut: "N/A",
        status: notif.status,
        totalPayment: 0
      });
    }
    
    // 3. Tutup dropdown
    setShowDropdown(false);
  };

  // Status colors: hijau = sudah check-in, kuning = menunggu konfirmasi, merah = dibatalkan, abu-abu = selesai
  const getStatusColor = (status) => {
    if (status === 'Check-in') return '#10B981'; // hijau
    if (status === 'Booked') return '#F59E0B'; // kuning
    if (status === 'Cancelled') return '#EF4444'; // merah
    return '#94A3B8'; // abu-abu (Check-out)
  };

  const getStatusLabel = (status) => {
    if (status === 'Check-in') return 'Sudah Check-in';
    if (status === 'Booked') return 'Menunggu Konfirmasi';
    if (status === 'Cancelled') return 'Dibatalkan';
    return 'Selesai';
  };

  return (
    <header className="hotelify-header" style={{ position: 'relative' }}>
      
      {/* Kolom Pencarian */}
      <div style={{ width: '350px' }}>
        <Input 
          icon={<FaSearch />}
          type="text" 
          placeholder="Cari pemesanan, tamu, atau kamar..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          style={{ backgroundColor: 'transparent', border: 'none', width: '100%', outline: 'none' }}
        />
      </div>

      {/* Bagian Kanan Header */}
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Ikon Chat Internal */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setPanelOpen(!panelOpen)}
            title="Komunikasi Internal"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: panelOpen ? 'var(--primary-color)' : undefined }}
          >
            <FaComments />
            {totalUnread > 0 && (
              <span className="badge" style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}>
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>
        
        {/* Lonceng Notifikasi */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="badge" style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN MENU NOTIFIKASI MELAYANG */}
          {showDropdown && (
            <div 
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                width: '320px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  padding: '14px 16px', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(37, 99, 235, 0.03)'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Notifikasi Masuk</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                  {unreadCount} Belum Dibaca
                </span>
              </div>
              
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.05)'}
                  >
                    {/* Dot Indikator Status */}
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '4px' }}>
                      <span 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: getStatusColor(notif.status),
                          display: 'inline-block' 
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{notif.title}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setShowDropdown(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil User */}
        <div className="user-profile" style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              marginRight: '-12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)' }
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div className="user-info" style={{ textAlign: 'right' }}>
              <span className="user-name" style={{ color: 'var(--text-main)' }}>Vera Zakia</span>
              <span className="user-role">General Manager</span>
            </div>
            <Avatar>
              <AvatarFallback>VZ</AvatarFallback>
            </Avatar>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                width: '200px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                overflow: 'hidden'
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#EF4444',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid var(--border-color)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY MODAL DETAIL RESERVASI */}
      {selectedRes && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000 // Sangat tinggi agar di atas semua layout
          }}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '520px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* Header Modal */}
            <div 
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(37, 99, 235, 0.03)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Detail Audit Reservasi</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>ID: {selectedRes.bookingId}</span>
              </div>
              <button 
                onClick={() => setSelectedRes(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Content Modal */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Nama Tamu */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                  {selectedRes.guestName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{selectedRes.guestName}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reservasi Terdaftar</span>
                </div>
              </div>

              {/* Rincian Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
                
                {/* Kamar */}
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <FaBed /> NOMOR & TIPE KAMAR
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    Room {selectedRes.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedRes.roomType}</div>
                </div>

                {/* Status */}
                <div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <FaCheck /> STATUS RESERVASI
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <span 
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        backgroundColor: getStatusColor(selectedRes.status) + '15', // 10% opacity
                        color: getStatusColor(selectedRes.status),
                        border: `1px solid ${getStatusColor(selectedRes.status)}30`,
                        display: 'inline-block'
                      }}
                    >
                      {getStatusLabel(selectedRes.status)}
                    </span>
                  </div>
                </div>

                {/* Periode */}
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <FaCalendarAlt /> PERIODE MENGINAP
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                    {selectedRes.checkIn} s/d {selectedRes.checkOut}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Durasi: {getStayNights(selectedRes.checkIn, selectedRes.checkOut)} Malam
                  </div>
                </div>

                {/* Total Bayar */}
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <FaCoins /> RENCANA PEMBAYARAN (TOTAL)
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>
                    {formatRupiah(selectedRes.totalPayment)}
                  </div>
                </div>

              </div>

            </div>

            {/* Footer Modal */}
            <div 
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.01)'
              }}
            >
              <button 
                onClick={() => setSelectedRes(null)}
                className="btn-primary"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}