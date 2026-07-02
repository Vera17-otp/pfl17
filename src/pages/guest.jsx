/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaHistory, 
  FaPlus, 
  FaNotesMedical, 
  FaUserCheck,
  FaStar,
  FaCalendarAlt,
  FaBed,
  FaUsers,
  FaFilter,
  FaTimes
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

// Import data asli
import { reservations } from "../data/reservations";
import { guests } from "../data/guest";

// Helper rupiah formatter
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

export default function Guests() {
  const navigate = useNavigate();

  // 1. STATE UTAMA
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  
  // Filter states
  const [filterSegment, setFilterSegment] = useState("Semua");
  const [filterLastVisitStart, setFilterLastVisitStart] = useState("");
  const [filterLastVisitEnd, setFilterLastVisitEnd] = useState("");

  // State Catatan Staf - Diambil dari LocalStorage agar persisten saat berpindah halaman
  const [staffNotes, setStaffNotes] = useState(() => {
    const saved = localStorage.getItem("hotelify_guest_notes");
    return saved ? JSON.parse(saved) : {};
  });

  const [currentNoteText, setCurrentNoteText] = useState("");

  // 2. AGREGASI DATA TAMU SECARA DINAMIS DARI DATABASE (Supabase Integration)
  const [guestsList, setGuestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*, member_tiers(*)")
        .eq("role", "member");
      if (profileError) throw profileError;

      const { data: dbRes, error: resError } = await supabase
        .from("reservations")
        .select("*, rooms(*)");
      if (resError) throw resError;

      const mapped = profiles.map((p, idx) => {
        const bookings = dbRes.filter(res => res.guest_id === p.id);
        const totalStays = bookings.length;
        
        const sortedBookings = [...bookings].sort((a, b) => {
          return new Date(b.check_in) - new Date(a.check_in);
        });
        const lastVisit = sortedBookings[0]?.check_in || "N/A";

        const roomCounts = {};
        bookings.forEach(b => {
          if (b.rooms?.room_type) {
            roomCounts[b.rooms.room_type] = (roomCounts[b.rooms.room_type] || 0) + 1;
          }
        });
        let preferredRoom = "Standard Room";
        let maxCount = 0;
        Object.keys(roomCounts).forEach(type => {
          if (roomCounts[type] > maxCount) {
            maxCount = roomCounts[type];
            preferredRoom = type;
          }
        });

        let loyalty = p.member_tiers?.name || "Silver";

        return {
          guestId: p.id,
          guestName: p.full_name || "Tamu",
          email: p.email || "",
          phone: p.phone || "",
          origin: "Indonesia",
          identityNumber: `327305${(p.phone || "000").replace(/\D/g, '').substring(0, 6)}000${idx + 1}`.substring(0, 16),
          totalVisits: totalStays,
          lastVisitDate: lastVisit,
          loyaltyLabel: loyalty,
          roomPreference: preferredRoom,
          bookings: bookings.map(res => ({
            bookingId: res.id,
            roomNumber: res.rooms?.room_number || "",
            roomType: res.rooms?.room_type || "",
            checkIn: res.check_in,
            checkOut: res.check_out,
            status: res.status === "checked_in" ? "Check-in" : res.status === "checked_out" ? "Check-out" : res.status === "confirmed" ? "Dikonfirmasi" : res.status === "pending" ? "Menunggu Konfirmasi" : "Dibatalkan",
            totalPayment: Number(res.total_price),
            additionalServiceFee: 0
          }))
        };
      });

      setGuestsList(mapped);
    } catch (err) {
      console.error("Error loading guests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const aggregatedGuests = guestsList;

  // 3. STATISTIK TAMU PER SEGMEN (KPI cards)
  const segmentStats = useMemo(() => {
    const total = aggregatedGuests.length;
    let baru = 0;
    let setia = 0;
    let vip = 0;

    aggregatedGuests.forEach(g => {
      if (g.loyaltyLabel === "Tamu Baru") baru++;
      else if (g.loyaltyLabel === "Tamu Setia") setia++;
      else if (g.loyaltyLabel === "VIP") vip++;
    });

    const baruPct = total > 0 ? Math.round((baru / total) * 100) : 0;
    const setiaPct = total > 0 ? Math.round((setia / total) * 100) : 0;
    const vipPct = total > 0 ? Math.round((vip / total) * 100) : 0;

    return { total, baru, baruPct, setia, setiaPct, vip, vipPct };
  }, [aggregatedGuests]);

  // 4. SINKRONISASI PEMILIHAN TAMU PERTAMA KALI
  const activeGuestId = selectedGuestId || (aggregatedGuests[0]?.guestId || "");

  // 5. PENYARINGAN TAMU BERDASARKAN PENCARIAN (NAMA / EMAIL / HP) & FILTER LAIN
  const filteredGuests = useMemo(() => {
    return aggregatedGuests.filter(g => {
      // A. Search Query (Nama, Email, atau HP)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.guestName.toLowerCase().includes(q);
        const matchEmail = g.email.toLowerCase().includes(q);
        const matchPhone = g.phone.includes(q);
        const matchNIK = g.identityNumber.includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchNIK) return false;
      }

      // B. Filter Segmen
      if (filterSegment !== "Semua" && g.loyaltyLabel !== filterSegment) return false;

      // C. Filter Kunjungan Terakhir
      if (g.lastVisitDate === "N/A") {
        if (filterLastVisitStart || filterLastVisitEnd) return false;
      } else {
        const lastVisitTime = new Date(g.lastVisitDate).getTime();
        if (filterLastVisitStart) {
          const startTime = new Date(filterLastVisitStart).getTime();
          if (lastVisitTime < startTime) return false;
        }
        if (filterLastVisitEnd) {
          const endTime = new Date(filterLastVisitEnd).getTime();
          if (lastVisitTime > endTime) return false;
        }
      }

      return true;
    });
  }, [aggregatedGuests, searchQuery, filterSegment, filterLastVisitStart, filterLastVisitEnd]);

  // Tamu aktif yang sedang ditampilkan profilnya
  const activeGuest = useMemo(() => {
    const found = aggregatedGuests.find(g => g.guestId === activeGuestId);
    return found || filteredGuests[0] || null;
  }, [aggregatedGuests, activeGuestId, filteredGuests]);

  // Load catatan tamu saat tamu aktif berubah
  React.useEffect(() => {
    if (activeGuest) {
      setCurrentNoteText(staffNotes[activeGuest.guestId] || "");
    }
  }, [activeGuest, staffNotes]);

  // 6. HANDLER SIMPAN CATATAN STAF
  const handleSaveNote = () => {
    if (!activeGuest) return;
    const updatedNotes = { ...staffNotes, [activeGuest.guestId]: currentNoteText };
    setStaffNotes(updatedNotes);
    localStorage.setItem("hotelify_guest_notes", JSON.stringify(updatedNotes));
    
    setAlertMessage(`Catatan untuk ${activeGuest.guestName} berhasil disimpan!`);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  // 7. HANDLER BUAT RESERVASI INSTAN (Prefilled Booking Redirect)
  const handleNewReservation = () => {
    if (!activeGuest) return;
    
    // Simpan prefill info ke localStorage
    localStorage.setItem("hotelify_prefill_booking_guest", JSON.stringify({
      guestName: activeGuest.guestName,
      phone: activeGuest.phone,
      email: activeGuest.email,
      identityNumber: activeGuest.identityNumber
    }));

    // Tampilkan notifikasi lalu alihkan
    setAlertMessage(`Membuka form booking terintegrasi untuk ${activeGuest.guestName}...`);
    setTimeout(() => {
      setAlertMessage("");
      navigate("/reservations");
    }, 1500);
  };

  const getLoyaltyBadgeStyle = (label) => {
    switch (label) {
      case 'VIP':
        return { 
          bg: '#1E3A8A', 
          color: '#FFFFFF', 
          border: '1px solid #F59E0B', 
          icon: <FaStar style={{ color: '#F59E0B', marginRight: '4px' }} /> 
        };
      case 'Tamu Setia':
        return { 
          bg: 'rgba(37, 99, 235, 0.1)', 
          color: '#2563EB', 
          border: '1px solid rgba(37, 99, 235, 0.2)',
          icon: <FaStar style={{ color: '#3B82F6', marginRight: '4px' }} />
        };
      default:
        return { 
          bg: 'rgba(100, 116, 139, 0.1)', 
          color: '#64748B', 
          border: '1px solid rgba(100, 116, 139, 0.2)',
          icon: null
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Alert Notification Toast */}
      {alertMessage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '24px', 
            right: '24px', 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
            color: '#FFFFFF', 
            padding: '16px 24px', 
            borderRadius: '12px', 
            zIndex: 10000, 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            fontWeight: 600,
            animation: 'slideIn 0.3s ease'
          }}
        >
          <FaUserCheck size={18} />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* HEADER UTAMA */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUsers style={{ color: 'var(--primary-color)' }} /> Profil & Segmentasi Tamu
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          Melacak segmentasi loyalitas pelanggan, preferensi kamar, log riwayat kunjungan tamu, dan manajemen catatan staff khusus.
        </p>
      </div>

      {/* STATISTIK RINGKAS SEGMEN (Top KPI Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUsers size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL DATABASE TAMU</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{segmentStats.total} Tamu</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #64748B' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(100,116,139,0.08)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaStar size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>TAMU BARU (1-2 STAYS)</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#64748B', marginTop: '2px' }}>{segmentStats.baru} Tamu ({segmentStats.baruPct}%)</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaStar size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>TAMU SETIA (3-9 STAYS)</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px' }}>{segmentStats.setia} Tamu ({segmentStats.setiaPct}%)</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.08)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaStar size={18} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>VIP GUEST (10+ STAYS)</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>{segmentStats.vip} Tamu ({segmentStats.vipPct}%)</h3>
          </div>
        </div>
      </div>

      {/* TATA LETAK MASTER-DETAIL (Dua Kolom) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* KOLOM KIRI: DAFTAR TAMU (MASTER LIST & FILTER PANEL) */}
        <div className="table-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '740px' }}>
          
          {/* Panel Pencarian & Filter */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(37, 99, 235, 0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Cari nama, email, atau HP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '9px 12px 9px 36px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  outline: 'none',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-main)'
                }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} size={13} />
            </div>

            {/* Filter Segmen */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Filter Segmen:</label>
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--surface-color)',
                  cursor: 'pointer'
                }}
              >
                <option value="Semua">Semua Segmen</option>
                <option value="Tamu Baru">Tamu Baru (1-2 Kunjungan)</option>
                <option value="Tamu Setia">Tamu Setia (3-9 Kunjungan)</option>
                <option value="VIP">VIP (10+ Kunjungan)</option>
              </select>
            </div>

            {/* Filter Tanggal Kunjungan Terakhir */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Kunjungan Terakhir:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="date"
                  value={filterLastVisitStart}
                  onChange={(e) => setFilterLastVisitStart(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--surface-color)'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>s/d</span>
                <input 
                  type="date"
                  value={filterLastVisitEnd}
                  onChange={(e) => setFilterLastVisitEnd(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--surface-color)'
                  }}
                />
              </div>
            </div>

            {/* Reset Button */}
            {(searchQuery || filterSegment !== "Semua" || filterLastVisitStart || filterLastVisitEnd) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSegment("Semua");
                  setFilterLastVisitStart("");
                  setFilterLastVisitEnd("");
                }}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--danger-color)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Filter
              </button>
            )}

          </div>

          {/* Daftar Scrollable Tamu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', maxHeight: '500px' }}>
            {filteredGuests.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: '40px' }}>
                Tamu tidak ditemukan
              </div>
            ) : (
              filteredGuests.map((g) => {
                const isActive = activeGuest && activeGuest.guestId === g.guestId;
                const badgeStyle = getLoyaltyBadgeStyle(g.loyaltyLabel);

                return (
                  <div 
                    key={g.guestId}
                    onClick={() => setSelectedGuestId(g.guestId)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--primary-color)' : '1px solid transparent',
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {g.guestName}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '0.62rem', 
                          fontWeight: 700, 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: badgeStyle.border
                        }}
                      >
                        {g.loyaltyLabel}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Stay: {g.totalVisits}x</span>
                      <span>Last: {g.lastVisitDate}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL PROFIL & OPERASIONAL (DETAIL VIEW) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeGuest ? (
            <>
              {/* KARTU PROFIL UTAMA */}
              <div className="table-card" style={{ padding: '24px' }}>
                
                {/* Header Profil */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.4rem' }}>
                      {activeGuest.guestName.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {activeGuest.guestName}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FaIdCard /> NIK: {activeGuest.identityNumber}
                      </span>
                    </div>
                  </div>

                  {/* Badge & Tombol Inisiasi Reservasi */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        padding: '6px 14px', 
                        borderRadius: '6px',
                        backgroundColor: getLoyaltyBadgeStyle(activeGuest.loyaltyLabel).bg,
                        color: getLoyaltyBadgeStyle(activeGuest.loyaltyLabel).color,
                        border: getLoyaltyBadgeStyle(activeGuest.loyaltyLabel).border,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      {getLoyaltyBadgeStyle(activeGuest.loyaltyLabel).icon}
                      Status: {activeGuest.loyaltyLabel}
                    </span>
                    
                    <button 
                      onClick={handleNewReservation}
                      className="btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      <FaPlus /> Buat Reservasi Baru
                    </button>
                  </div>
                </div>

                {/* Grid Rincian Kontak */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px', backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <FaPhone /> TELEPON / WA
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                      {activeGuest.phone}
                    </div>
                  </div>
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <FaEnvelope /> EMAIL RESMI
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>
                      {activeGuest.email}
                    </div>
                  </div>
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <FaMapMarkerAlt /> KOTA ASAL
                    </span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                      {activeGuest.origin}
                    </div>
                  </div>
                </div>

                {/* Metrik Loyalitas Pelanggan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  {/* Total Kunjungan */}
                  <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL KUNJUNGAN</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '6px' }}>
                      {activeGuest.totalVisits} Kali
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Masa menginap terakumulasi</span>
                  </div>

                  {/* Kunjungan Terakhir */}
                  <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>KUNJUNGAN TERAKHIR</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '10px' }}>
                      {activeGuest.lastVisitDate}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Check-in paling terakhir</span>
                  </div>

                  {/* Preferensi Kamar */}
                  <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PREFERENSI KAMAR</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981', marginTop: '10px' }}>
                      {activeGuest.roomPreference}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Tipe paling sering dipesan</span>
                  </div>
                </div>

              </div>

              {/* DUA PANEL: CATATAN STAF & RIWAYAT RESERVASI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
                
                {/* Panel Catatan Staf (Notes) */}
                <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <FaNotesMedical style={{ color: 'var(--primary-color)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Catatan Staf (CRM Notes)</span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                    Tulis informasi khusus mengenai tamu (misalnya preferensi bantal, alergi makanan, layanan khusus) untuk dibaca staf hotel.
                  </p>

                  <textarea 
                    placeholder="Tulis catatan penting di sini (contoh: Alergi udang, Minta kamar lantai tinggi...)"
                    value={currentNoteText}
                    onChange={(e) => setCurrentNoteText(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '140px', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.8rem',
                      fontFamily: 'inherit',
                      resize: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)'
                    }}
                  />

                  <button 
                    onClick={handleSaveNote}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    Simpan Catatan Staf
                  </button>
                </div>

                {/* Panel Riwayat Reservasi Tamu */}
                <div className="table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="table-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaHistory style={{ color: 'var(--primary-color)' }} />
                      <span className="table-title" style={{ fontSize: '0.95rem' }}>Riwayat Kunjungan & Transaksi</span>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', flex: 1, maxHeight: '270px' }}>
                    <table className="hotel-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ fontSize: '11px' }}>
                          <th style={{ padding: '10px 14px' }}>No. Booking</th>
                          <th style={{ padding: '10px 14px' }}>Kamar</th>
                          <th style={{ padding: '10px 14px' }}>Check-in</th>
                          <th style={{ padding: '10px 14px' }}>Total Bayar</th>
                          <th style={{ padding: '10px 14px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeGuest.bookings.map((booking) => (
                          <tr key={booking.bookingId}>
                            <td style={{ fontWeight: 600, color: 'var(--primary-color)', padding: '10px 14px' }}>
                              {booking.bookingId}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Room {booking.roomNumber}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{booking.roomType}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)', padding: '10px 14px' }}>{booking.checkIn}</td>
                            <td style={{ fontWeight: 700, color: 'var(--text-main)', padding: '10px 14px' }}>
                              {formatRupiah(booking.totalPayment)}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span 
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  backgroundColor: booking.status === 'Check-in' ? 'rgba(16,185,129,0.1)' :
                                                   booking.status === 'Booked' ? 'rgba(245,158,11,0.1)' :
                                                   booking.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(37,99,235,0.1)',
                                  color: booking.status === 'Check-in' ? '#10B981' :
                                         booking.status === 'Booked' ? '#F59E0B' :
                                         booking.status === 'Cancelled' ? '#EF4444' : '#2563EB'
                                }}
                              >
                                {booking.status === 'Booked' ? 'Dipesan' :
                                 booking.status === 'Check-out' ? 'Selesai' :
                                 booking.status === 'Cancelled' ? 'Dibatalkan' : booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="table-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Silakan pilih tamu di panel kiri untuk memuat profil lengkap.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}