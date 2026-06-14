import React, { useState, useMemo } from 'react';
import { 
  FaBullhorn, 
  FaPaperPlane, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaWhatsapp, 
  FaSms, 
  FaGift, 
  FaArrowUp, 
  FaSearch, 
  FaPlus, 
  FaTimes, 
  FaCheckCircle, 
  FaUserCheck, 
  FaChartBar, 
  FaCoins, 
  FaRedoAlt 
} from 'react-icons/fa';

// Fallback data
import { reservations } from '../data/reservations';
import { guests } from '../data/guest';

// Indonesian constants
const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Helper formatting YYYY-MM-DD
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper rupiah
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

export default function Marketing() {
  const todayStr = "2026-06-14"; // Audit simulated date

  // 1. DATA INITIALIZATION (LOCAL STORAGE PERSISTENCE)
  const [resList] = useState(() => {
    const saved = localStorage.getItem("hotelify_reservations");
    let parsed = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat reservasi di marketing", e);
      }
    }
    
    if (!parsed || parsed.length === 0) {
      // Mapping fallback default reservations
      parsed = reservations.map((r, idx) => {
        let standardType = "Deluxe";
        if (r.roomType.includes("Single")) standardType = "Single";
        else if (r.roomType.includes("Suite")) standardType = "Suite";
        else if (r.roomType.includes("Double")) standardType = "Double";
        
        let checkIn = r.checkIn;
        let checkOut = r.checkOut;
        let status = r.status === "Check-in" ? "Check-in" : r.status === "Booked" ? "Menunggu Konfirmasi" : r.status === "Check-out" ? "Check-out" : "Dibatalkan";
        
        if (idx % 5 === 0) {
          checkIn = todayStr;
          checkOut = "2026-06-17";
          status = idx % 2 === 0 ? "Dikonfirmasi" : "Menunggu Konfirmasi";
        } else if (idx % 5 === 1) {
          checkIn = "2026-06-12";
          checkOut = todayStr;
          status = "Check-in";
        }
        return { ...r, roomType: standardType, status, checkIn, checkOut };
      });
    }

    // Pastikan ada booking checking-in pada H-3 (17 Juni 2026) untuk simulasi pre-arrival trigger
    const hasH3 = parsed.some(r => r.checkIn === "2026-06-17");
    if (!hasH3) {
      parsed.push({
        bookingId: "BOK-9999",
        guestName: "Elena Rodriguez",
        roomNumber: "203",
        roomType: "Deluxe",
        status: "Dikonfirmasi",
        checkIn: "2026-06-17",
        checkOut: "2026-06-20",
        totalPayment: 1350000,
        email: "elena@example.com",
        phone: "081298765437"
      });
    }
    localStorage.setItem("hotelify_reservations", JSON.stringify(parsed));
    return parsed;
  });

  // Load campaigns dari localStorage
  const [campaignsList, setCampaignsList] = useState(() => {
    const saved = localStorage.getItem("hotelify_campaigns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat kampanye", e);
      }
    }
    
    // Default Campaigns
    const defaults = [
      {
        id: "CMP-8001",
        name: "Kangen Menginap Promo",
        targetSegment: "Tamu yang belum menginap dalam 3 bulan terakhir",
        channel: "Email",
        startDate: "2026-06-01",
        endDate: "2026-06-15",
        message: "Halo Kak! Kami kangen kehadiran Kakak di HotelQu. Dapatkan diskon 15% untuk pemesanan berikutnya menggunakan kode voucher KANGEN15. Hubungi kami untuk reservasi!",
        voucher: "KANGEN15",
        sentCount: 24,
        bookingsCount: 3,
        revenue: 1650000,
        status: "Aktif"
      },
      {
        id: "CMP-8002",
        name: "VIP Gold Room Upgrade Offer",
        targetSegment: "Tamu VIP saja",
        channel: "WhatsApp",
        startDate: "2026-06-10",
        endDate: "2026-06-20",
        message: "Selamat siang Bapak/Ibu VIP Guest. Dapatkan penawaran upgrade kamar Suite dengan potongan harga 30% khusus untuk akhir pekan ini. Gunakan kode VIPUPGRADE.",
        voucher: "VIPUPGRADE",
        sentCount: 12,
        bookingsCount: 2,
        revenue: 3200000,
        status: "Aktif"
      },
      {
        id: "CMP-8003",
        name: "Birthday Bash June Discount",
        targetSegment: "Tamu ulang tahun bulan ini",
        channel: "SMS",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        message: "Selamat Ulang Tahun dari HotelQu! Nikmati voucher menginap Rp 100.000 dengan kode ultah HBDJUBL. Semoga hari Anda menyenangkan!",
        voucher: "HBDJUBL",
        sentCount: 8,
        bookingsCount: 1,
        revenue: 750000,
        status: "Aktif"
      }
    ];
    localStorage.setItem("hotelify_campaigns", JSON.stringify(defaults));
    return defaults;
  });

  // State log pengiriman notifikasi pemasaran
  const [notificationLogs, setNotificationLogs] = useState(() => {
    const saved = localStorage.getItem("hotelify_marketing_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. ACTIVE VIEW STATE
  const [activeTab, setActiveTab] = useState("campaigns"); // campaigns, auto-triggers, calendar
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form Kampanye Baru
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newTargetSegment, setNewTargetSegment] = useState("Semua Tamu");
  const [newChannel, setNewChannel] = useState("Email");
  const [newStartDate, setNewStartDate] = useState("2026-06-15");
  const [newEndDate, setNewEndDate] = useState("2026-06-22");
  const [newVoucher, setNewVoucher] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Trigger Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 3. INTEGRASI & SEGMENTASI PROFIL TAMU DINAMIS
  const guestsDatabase = useMemo(() => {
    // Agregasi persis dengan guest.jsx
    const guestMap = {};
    resList.forEach(res => {
      if (!guestMap[res.guestName]) {
        guestMap[res.guestName] = [];
      }
      guestMap[res.guestName].push(res);
    });

    return guests.map((g, idx) => {
      const bookings = guestMap[g.guestName] || [];
      const totalStays = g.totalStay + bookings.length;
      
      // Kunjungan terakhir
      let lastVisit = "2025-10-15"; // Fallback dormant > 3 bulan
      if (bookings.length > 0) {
        const sorted = [...bookings].sort((a,b) => new Date(b.checkIn) - new Date(a.checkIn));
        lastVisit = sorted[0].checkIn;
      }

      // Segmentasi Loyalitas
      let segment = "Tamu Baru";
      if (totalStays >= 10) segment = "VIP";
      else if (totalStays >= 3) segment = "Tamu Setia";

      // Tanggal lahir deterministik untuk simulasi ulang tahun Juni
      // index 3, 9, 15, 21, 27 lahir di bulan Juni (6)
      const birthMonth = (idx % 6 === 3) ? 6 : (idx % 12) + 1;
      const birthDay = (idx % 28) + 1;
      const birthDateStr = `${birthDay} ${INDONESIAN_MONTHS[birthMonth - 1]}`;

      return {
        ...g,
        totalStays,
        lastVisit,
        segment,
        birthMonth,
        birthDay,
        birthDateStr
      };
    });
  }, [resList]);

  // 4. METRIK STATISTIK AGREGASI (KPI CARDS)
  const stats = useMemo(() => {
    const totalCampaigns = campaignsList.length;
    const totalSent = campaignsList.reduce((sum, c) => sum + c.sentCount, 0);
    const totalBookings = campaignsList.reduce((sum, c) => sum + c.bookingsCount, 0);
    const totalRevenue = campaignsList.reduce((sum, c) => sum + c.revenue, 0);
    const conversionRate = totalSent > 0 ? (totalBookings / totalSent) * 100 : 0;

    return {
      totalCampaigns,
      totalSent,
      totalBookings,
      totalRevenue,
      conversionRate
    };
  }, [campaignsList]);

  // 5. PENYARINGAN SEGMENTASI UNTUK AUTO-TRIGGERS
  
  // A. Dormant Guests (Belum menginap dalam 3 bulan terakhir, lastVisit <= 2026-03-14)
  const dormantGuests = useMemo(() => {
    return guestsDatabase.filter(g => {
      const visitDate = new Date(g.lastVisit);
      const limitDate = new Date("2026-03-14");
      return visitDate <= limitDate;
    });
  }, [guestsDatabase]);

  // B. Birthday Guests (Ulang tahun bulan Juni)
  const birthdayGuests = useMemo(() => {
    return guestsDatabase.filter(g => g.birthMonth === 6); // Juni
  }, [guestsDatabase]);

  // C. Pre-Arrival H-3 (Check-in pada 2026-06-17)
  const preArrivalBookings = useMemo(() => {
    return resList.filter(res => {
      return res.checkIn === "2026-06-17" && ["Dikonfirmasi", "Booked", "Menunggu Konfirmasi"].includes(res.status);
    });
  }, [resList]);

  // 6. EVENT HANDLERS

  // Tambah Kampanye Baru
  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaignName || !newMessage) {
      triggerToast("Nama kampanye dan isi pesan wajib diisi!");
      return;
    }

    const newCampaign = {
      id: `CMP-${8000 + campaignsList.length + 1}`,
      name: newCampaignName,
      targetSegment: newTargetSegment,
      channel: newChannel,
      startDate: newStartDate,
      endDate: newEndDate,
      message: newMessage,
      voucher: newVoucher || "TIDAK ADA",
      sentCount: 0,
      bookingsCount: 0,
      revenue: 0,
      status: "Aktif"
    };

    const updated = [newCampaign, ...campaignsList];
    setCampaignsList(updated);
    localStorage.setItem("hotelify_campaigns", JSON.stringify(updated));
    setShowAddModal(false);
    
    // Reset Form
    setNewCampaignName("");
    setNewVoucher("");
    setNewMessage("");
    triggerToast(`Kampanye "${newCampaignName}" berhasil dijadwalkan!`);
  };

  // Kirim pemicu otomatis (Simulasi pengiriman pesan marketing)
  const handleExecuteTrigger = (triggerType, recipientCount) => {
    if (recipientCount === 0) {
      triggerToast("Tidak ada target penerima aktif untuk pemicu ini.");
      return;
    }

    // Simulasi penambahan konversi booking pasca pengiriman (untuk visual statistik)
    // 1 booking baru terbentuk dengan omzet acak
    const randomBookingRevenue = 450000 + (Math.floor(Math.random() * 3) * 150000);
    
    // Update data kampanye terdekat yang sesuai
    let targetCampaignId = "";
    if (triggerType === "dormant") targetCampaignId = "CMP-8001";
    else if (triggerType === "birthday") targetCampaignId = "CMP-8003";
    else if (triggerType === "pre-arrival") targetCampaignId = "CMP-8002";

    const updatedCampaigns = campaignsList.map(c => {
      if (c.id === targetCampaignId) {
        return {
          ...c,
          sentCount: c.sentCount + recipientCount,
          bookingsCount: c.bookingsCount + 1,
          revenue: c.revenue + randomBookingRevenue
        };
      }
      return c;
    });

    setCampaignsList(updatedCampaigns);
    localStorage.setItem("hotelify_campaigns", JSON.stringify(updatedCampaigns));

    // Catat ke log marketing notifications
    const newLog = {
      id: `LOG-${9000 + notificationLogs.length + 1}`,
      time: "14 Jun 2026, 23:21 WIB",
      type: triggerType === "dormant" ? "Re-engagement 3 Bulan" : triggerType === "birthday" ? "Ulang Tahun" : "Pre-Arrival Upgrade",
      channel: triggerType === "dormant" ? "Email" : triggerType === "birthday" ? "SMS" : "WhatsApp",
      recipients: recipientCount,
      revenueSimulation: randomBookingRevenue
    };
    const updatedLogs = [newLog, ...notificationLogs];
    setNotificationLogs(updatedLogs);
    localStorage.setItem("hotelify_marketing_logs", JSON.stringify(updatedLogs));

    triggerToast(`Berhasil mengirim pesan ke ${recipientCount} tamu! Terdeteksi 1 booking baru terbentuk (+${formatRupiah(randomBookingRevenue)}).`);
  };

  // 7. CALENDAR DATA PROJECTION (15 Juni 2026 - 14 Juli 2026)
  const calendarDays = useMemo(() => {
    const days = [];
    const startDate = new Date(2026, 5, 15); // 15 Juni
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days.map(date => {
      const dateStr = formatDate(date);
      
      // Cari kampanye yang aktif pada hari tersebut (startDate <= dateStr <= endDate)
      const activeCampaigns = campaignsList.filter(c => {
        return c.startDate <= dateStr && dateStr <= c.endDate;
      });

      return {
        date,
        dateStr,
        activeCampaigns
      };
    });
  }, [campaignsList]);

  // Filtering Kampanye
  const filteredCampaigns = useMemo(() => {
    return campaignsList.filter(c => {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             c.targetSegment.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [campaignsList, searchQuery]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1E293B',
          color: '#F8FAFC',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1100,
          borderLeft: '4px solid var(--primary-color)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <FaCheckCircle style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Header Halaman */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaBullhorn style={{ color: 'var(--primary-color)' }} /> Optimasi Pemasaran (Marketing CRM)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Kelola kampanye promosi tersegmen, picu pesan otomatis berbasis event tamu, dan analisis konversi pendapatan.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px'
        }}>
          <button 
            onClick={() => setActiveTab("campaigns")}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === "campaigns" ? 'var(--primary-color)' : 'transparent',
              color: activeTab === "campaigns" ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Manajemen Kampanye
          </button>
          <button 
            onClick={() => setActiveTab("auto-triggers")}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === "auto-triggers" ? 'var(--primary-color)' : 'transparent',
              color: activeTab === "auto-triggers" ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Pemicu Otomatis (Triggers)
          </button>
          <button 
            onClick={() => setActiveTab("calendar")}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === "calendar" ? 'var(--primary-color)' : 'transparent',
              color: activeTab === "calendar" ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Kalender Kampanye
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* KPI 1 */}
        <div className="kpi-card">
          <div className="kpi-icon primary">
            <FaBullhorn />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Kampanye Promosi</span>
            <span className="kpi-value">{stats.totalCampaigns}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Aktif & Riwayat Terjadwal
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card">
          <div className="kpi-icon info" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <FaPaperPlane />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Pesan Terkirim</span>
            <span className="kpi-value">{stats.totalSent} Pesan</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Email, WhatsApp, & SMS
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card">
          <div className="kpi-icon success">
            <FaUserCheck />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Konversi Booking Terbentuk</span>
            <span className="kpi-value">{stats.totalBookings} Booking</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Rasio Konversi: {stats.conversionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card">
          <div className="kpi-icon warning">
            <FaCoins />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pendapatan Pemasaran (CRM)</span>
            <span className="kpi-value" style={{ color: 'var(--secondary-color)' }}>
              {formatRupiah(stats.totalRevenue)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Diukur dari booking kode promo
            </span>
          </div>
        </div>

      </div>

      {/* TAB CONTENT 1: CAMPAIGN MANAGEMENT */}
      {activeTab === "campaigns" && (
        <div className="table-card">
          <div className="table-header">
            <div>
              <span className="table-title">Daftar Kampanye Promosi Hotel</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Buat dan pantau efektivitas kampanye promosi berdasarkan performa klik dan booking.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <input 
                  type="text" 
                  placeholder="Cari kampanye..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
                <FaSearch style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }} />
              </div>

              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '0.85rem'
                }}
              >
                <FaPlus /> Kampanye Baru
              </button>
            </div>
          </div>

          {/* Table list */}
          <div style={{ overflowX: 'auto' }}>
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Nama Kampanye</th>
                  <th>Segmen Sasaran</th>
                  <th>Channel</th>
                  <th>Periode</th>
                  <th>Pesan Dikirim</th>
                  <th>Booking Konversi</th>
                  <th>Total Omzet</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Belum ada kampanye promosi terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((camp, idx) => {
                    const rate = camp.sentCount > 0 ? (camp.bookingsCount / camp.sentCount) * 100 : 0;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{camp.name}</td>
                        <td>
                          <span style={{
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                            color: 'var(--primary-color)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)'
                          }}>
                            {camp.targetSegment}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            {camp.channel === "Email" && <FaEnvelope style={{ color: '#EF4444' }} />}
                            {camp.channel === "WhatsApp" && <FaWhatsapp style={{ color: '#10B981' }} />}
                            {camp.channel === "SMS" && <FaSms style={{ color: '#F59E0B' }} />}
                            <span>{camp.channel}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {camp.startDate} s/d {camp.endDate}
                        </td>
                        <td style={{ fontWeight: 600 }}>{camp.sentCount} Tamu</td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{camp.bookingsCount}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                            ({rate.toFixed(1)}%)
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{formatRupiah(camp.revenue)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => setSelectedCampaignDetail(camp)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'rgba(37,99,235,0.08)',
                              color: 'var(--primary-color)',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Lihat Pesan
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: AUTOMATED TRIGGERS */}
      {activeTab === "auto-triggers" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
          
          {/* List of Triggers (8 columns) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Trigger 1: Dormant Guests */}
            <div className="table-card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
              <div className="table-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaRedoAlt />
                  </div>
                  <div>
                    <span className="table-title" style={{ fontSize: '1rem' }}>Trigger Re-engagement: Dormant &gt; 3 Bulan</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mendeteksi tamu yang kunjungan terakhirnya sebelum 14 Maret 2026.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleExecuteTrigger("dormant", dormantGuests.length)}
                  className="btn-primary"
                  style={{
                    padding: '8px 14px', fontSize: '0.75rem', backgroundColor: 'var(--warning-color)'
                  }}
                >
                  Kirim Promo ({dormantGuests.length} Tamu)
                </button>
              </div>

              <div style={{ padding: '16px', maxHeight: '180px', overflowY: 'auto' }}>
                <table className="hotel-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Nama Tamu</th>
                      <th>Kontak</th>
                      <th>Kunjungan Terakhir</th>
                      <th>Dormant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dormantGuests.map((g, i) => {
                      const days = Math.floor((new Date(todayStr) - new Date(g.lastVisit)) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{g.guestName}</td>
                          <td>{g.email} / {g.phone}</td>
                          <td>{g.lastVisit}</td>
                          <td style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{days} Hari</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trigger 2: Birthday Guests */}
            <div className="table-card" style={{ borderLeft: '4px solid #EC4899' }}>
              <div className="table-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', 
                    backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#EC4899',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaGift />
                  </div>
                  <div>
                    <span className="table-title" style={{ fontSize: '1rem' }}>Trigger Ulang Tahun Bulan Ini (Juni)</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mendeteksi profil tamu yang lahir pada bulan Juni untuk dikirimi ucapan & voucher khusus.
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleExecuteTrigger("birthday", birthdayGuests.length)}
                  className="btn-primary"
                  style={{
                    padding: '8px 14px', fontSize: '0.75rem', backgroundColor: '#EC4899'
                  }}
                >
                  Kirim Voucher ({birthdayGuests.length} Tamu)
                </button>
              </div>

              <div style={{ padding: '16px', maxHeight: '180px', overflowY: 'auto' }}>
                <table className="hotel-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Nama Tamu</th>
                      <th>Kontak</th>
                      <th>Tanggal Lahir</th>
                      <th>Keanggotaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birthdayGuests.map((g, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{g.guestName}</td>
                        <td>{g.email} / {g.phone}</td>
                        <td style={{ fontWeight: 600, color: '#EC4899' }}>{g.birthDateStr}</td>
                        <td>{g.membership}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trigger 3: Pre-Arrival Check-in H-3 */}
            <div className="table-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <div className="table-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', 
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaArrowUp />
                  </div>
                  <div>
                    <span className="table-title" style={{ fontSize: '1rem' }}>Trigger Pre-Arrival Upgrade: Check-in H-3</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Mendeteksi reservasi terkonfirmasi yang masuk 3 hari lagi (17 Juni 2026).
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleExecuteTrigger("pre-arrival", preArrivalBookings.length)}
                  className="btn-primary"
                  style={{
                    padding: '8px 14px', fontSize: '0.75rem'
                  }}
                >
                  Kirim Penawaran Upgrade ({preArrivalBookings.length} Reservasi)
                </button>
              </div>

              <div style={{ padding: '16px', maxHeight: '180px', overflowY: 'auto' }}>
                <table className="hotel-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Nama Tamu</th>
                      <th>Room Type / No</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preArrivalBookings.map((res, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.guestName}</td>
                        <td>{res.roomType} (RM-{res.roomNumber})</td>
                        <td>{res.checkIn}</td>
                        <td>{res.checkOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Trigger Delivery Logs (4 columns) */}
          <div style={{ gridColumn: 'span 4' }}>
            <div className="table-card">
              <div className="table-header">
                <div>
                  <span className="table-title" style={{ fontSize: '1.05rem' }}>Log Pengiriman Promosi</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Riwayat eksekusi otomasi pemasaran terkini.
                  </p>
                </div>
              </div>
              
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {notificationLogs.length === 0 ? (
                  <div style={{
                    padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)'
                  }}>
                    Belum ada riwayat pengiriman notifikasi pemasaran hari ini.
                  </div>
                ) : (
                  notificationLogs.map((log, i) => (
                    <div 
                      key={i}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{log.type}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Penerima: {log.recipients} Tamu via {log.channel}</span>
                        <span style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>+{formatRupiah(log.revenueSimulation)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: CAMPAIGN CALENDAR */}
      {activeTab === "calendar" && (
        <div className="table-card">
          <div className="table-header">
            <div>
              <span className="table-title">Jadwal Kalender Kampanye (30 Hari)</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Periode kampanye yang berjalan aktif dari 15 Juni sampai 14 Juli 2026.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Calendar Grid Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              textTransform: 'uppercase'
            }}>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
              <div>Min</div>
            </div>

            {/* Calendar Days */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px'
            }}>
              {calendarDays.map((day, idx) => {
                return (
                  <div 
                    key={idx}
                    style={{
                      border: '1.5px solid var(--border-color)',
                      backgroundColor: 'var(--surface-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '95px',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Date label */}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {day.date.getDate()} {INDONESIAN_MONTHS[day.date.getMonth()].substring(0, 3)}
                    </span>

                    {/* Campaigns list inside the cell */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden', flex: 1, marginTop: '4px' }}>
                      {day.activeCampaigns.map((camp, cidx) => {
                        let color = 'var(--primary-color)';
                        let bg = 'rgba(37, 99, 235, 0.08)';
                        if (camp.id === "CMP-8002") {
                          color = '#10B981';
                          bg = 'rgba(16, 185, 129, 0.08)';
                        } else if (camp.id === "CMP-8003") {
                          color = '#EC4899';
                          bg = 'rgba(236, 72, 153, 0.08)';
                        }
                        
                        return (
                          <div 
                            key={cidx}
                            title={camp.name}
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: color,
                              backgroundColor: bg,
                              borderLeft: `2.5px solid ${color}`,
                              padding: '2px 4px',
                              borderRadius: '2px',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden'
                            }}
                          >
                            {camp.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: TAMBAH KAMPANYE BARU */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1050, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            border: '1px solid var(--border-color)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', color: 'var(--text-muted)'
              }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Jadwalkan Kampanye Promosi Baru
            </h3>

            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Nama Kampanye</label>
                <input 
                  type="text" 
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Contoh: HUT RI Room Upgrade Promo"
                  style={{
                    padding: '8px 12px', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target Segmen</label>
                  <select 
                    value={newTargetSegment}
                    onChange={(e) => setNewTargetSegment(e.target.value)}
                    style={{
                      padding: '8px 12px', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="Semua Tamu">Semua Tamu</option>
                    <option value="Tamu VIP saja">Tamu VIP saja</option>
                    <option value="Tamu yang belum menginap dalam 3 bulan terakhir">Dormant &gt; 3 Bulan</option>
                    <option value="Tamu ulang tahun bulan ini">Ulang Tahun Bulan Ini</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Channel Pengiriman</label>
                  <select 
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    style={{
                      padding: '8px 12px', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tanggal Mulai</label>
                  <input 
                    type="date" 
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    style={{
                      padding: '8px 12px', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tanggal Selesai</label>
                  <input 
                    type="date" 
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={{
                      padding: '8px 12px', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Kode Voucher / Diskon</label>
                <input 
                  type="text" 
                  value={newVoucher}
                  onChange={(e) => setNewVoucher(e.target.value)}
                  placeholder="Contoh: MERDEKA20"
                  style={{
                    padding: '8px 12px', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Isi Pesan Promosi</label>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Masukkan kalimat promosi yang menarik..."
                  rows="3"
                  style={{
                    padding: '8px 12px', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', fontSize: '0.85rem', outline: 'none', resize: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-color)', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{
                    padding: '8px 16px', fontSize: '0.85rem'
                  }}
                >
                  Jadwalkan Kampanye
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: DETAIL KAMPANYE (ISI PESAN) */}
      {selectedCampaignDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1050, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            border: '1px solid var(--border-color)'
          }}>
            <button 
              onClick={() => setSelectedCampaignDetail(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', color: 'var(--text-muted)'
              }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              {selectedCampaignDetail.name}
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {selectedCampaignDetail.targetSegment}
              </span>
              <span style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Voucher: {selectedCampaignDetail.voucher}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Isi Pesan Pemasaran ({selectedCampaignDetail.channel}):</span>
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--bg-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontStyle: 'italic'
              }}>
                "{selectedCampaignDetail.message}"
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pesan Dikirim</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedCampaignDetail.sentCount} Tamu
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Omzet Pemasaran</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary-color)', marginTop: '2px' }}>
                  {formatRupiah(selectedCampaignDetail.revenue)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setSelectedCampaignDetail(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary-color)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
