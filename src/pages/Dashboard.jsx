import React, { useState, useMemo } from 'react';
import { 
  FaBed, 
  FaCalendarCheck, 
  FaChartLine, 
  FaCoins, 
  FaChevronRight, 
  FaPlus, 
  FaFileInvoice, 
  FaHandSparkles,
  FaEllipsisV,
  FaDoorOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from 'react-icons/fa';

// Import data asli & fallback
import { rooms } from '../data/rooms';
import { reservations } from '../data/reservations';

const formatIndonesianDate = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const d = new Date();
  const dayName = days[d.getDay()];
  const date = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${date} ${monthName} ${year}`;
};

// Helper rupiah formatter
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

export default function Dashboard() {
  const todayStr = "2026-06-14"; // Hari audit simulasi sistem CRM

  // State untuk interaksi grafik
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [currentDate] = useState(() => formatIndonesianDate());

  // 1. LOAD DATA KAMAR & RESERVASI (LocalStorage Integration)
  const [roomsList] = useState(() => {
    const saved = localStorage.getItem("hotelify_rooms");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat data kamar di dashboard", e);
      }
    }
    return rooms;
  });

  const [resList] = useState(() => {
    const saved = localStorage.getItem("hotelify_reservations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat data reservasi di dashboard", e);
      }
    }
    return reservations;
  });

  // 2. KALKULASI STAT METRIK KPI
  const stats = useMemo(() => {
    // A. Kamar Tersedia Hari Ini
    const availableRooms = roomsList.filter(rm => rm.status === "Available").length;
    const totalRooms = roomsList.length || 20;

    // B. Tamu Aktif (Check-in)
    const activeGuests = resList.filter(res => res.status === "Check-in").length;
    
    // Check-in & Check-out hari ini (14 Juni 2026)
    const checkInsToday = resList.filter(res => res.checkIn === todayStr && (res.status === "Check-in" || res.status === "Dikonfirmasi")).length;
    const checkOutsToday = resList.filter(res => res.checkOut === todayStr && (res.status === "Check-out" || res.status === "Check-in")).length;

    // C. Tingkat Okupansi (%)
    const occupiedRooms = roomsList.filter(rm => rm.status === "Occupied").length;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0.0";

    // D. Total Pendapatan Bulan Ini (Juni 2026)
    const revenueThisMonth = resList
      .filter(res => res.checkIn.startsWith("2026-06") && res.status !== "Cancelled" && res.status !== "Dibatalkan")
      .reduce((sum, res) => sum + (res.totalPayment || 0), 0);

    return [
      { 
        label: 'Kamar Tersedia Hari Ini', 
        value: `${availableRooms} Kamar`, 
        subtext: `Dari total ${totalRooms} kamar hotel`,
        icon: <FaBed />, 
        bgColor: 'rgba(37, 99, 235, 0.1)',
        textColor: 'text-blue-600'
      },
      { 
        label: 'Reservasi Aktif (Tamu In-House)', 
        value: `${activeGuests} Tamu`, 
        subtext: `${checkInsToday} check-in hari ini, ${checkOutsToday} check-out`,
        icon: <FaCalendarCheck />, 
        bgColor: 'rgba(16, 185, 129, 0.1)',
        textColor: 'text-emerald-600'
      },
      { 
        label: 'Tingkat Okupansi Kamar', 
        value: `${occupancyRate}%`, 
        subtext: `Kamar sedang terisi: ${occupiedRooms} kamar`,
        icon: <FaChartLine />, 
        bgColor: 'rgba(14, 165, 233, 0.1)',
        textColor: 'text-cyan-600'
      },
      { 
        label: 'Total Pendapatan (Bulan Ini)', 
        value: formatRupiah(revenueThisMonth), 
        subtext: `Bulan: Juni 2026 (Okupansi Aktif)`,
        icon: <FaCoins />, 
        bgColor: 'rgba(79, 70, 229, 0.1)',
        textColor: 'text-indigo-600'
      },
    ];
  }, [roomsList, resList]);

  // 3. DATA GRAFIK BATANG: RESERVASI 7 HARI TERAKHIR (8 Juni s/d 14 Juni 2026)
  const barChartData = useMemo(() => {
    const daysName = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const dates = [];
    
    // Bentuk rentang 7 hari terakhir (ending 14 Jun 2026)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 5, 14 - i);
      const dayNum = 14 - i;
      const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
      
      // Seed base count agar tampilan grafik seimbang, digabungkan dengan data reservasi riil
      const mockBases = [2, 4, 3, 5, 4, 7, 0];
      
      dates.push({
        dateStr,
        dayLabel: daysName[d.getDay()],
        fullName: d.toLocaleDateString("id-ID", { weekday: 'long' }),
        base: mockBases[6 - i]
      });
    }

    return dates.map(dt => {
      const actualCount = resList.filter(res => res.checkIn === dt.dateStr).length;
      return {
        day: dt.dayLabel,
        count: actualCount + dt.base,
        label: dt.fullName
      };
    });
  }, [resList]);

  // 4. DATA GRAFIK DONUT: PROPORSI TIPE KAMAR DIPESAN
  const donutChartData = useMemo(() => {
    const counts = { Standard: 0, Deluxe: 0, Suite: 0, Family: 0 };
    
    resList.forEach(res => {
      let type = "Standard";
      if (res.roomType.includes("Deluxe")) type = "Deluxe";
      else if (res.roomType.includes("Suite") || res.roomType.includes("Penthouse")) type = "Suite";
      else if (res.roomType.includes("Family") || res.roomType.includes("Double")) type = "Family";
      
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const types = ["Standard", "Deluxe", "Suite", "Family"];
    const colors = ["#2563EB", "#0EA5E9", "#1E3A8A", "#93C5FD"];
    
    let currentOffset = 0;
    const circ = 314.16;

    return types.map((name, idx) => {
      const count = counts[name] || 0;
      const percentage = Math.round((count / total) * 100);
      const share = (percentage / 100) * circ;
      const offset = currentOffset;
      
      currentOffset -= share;

      return {
        name,
        percentage,
        count,
        color: colors[idx],
        offset,
        share
      };
    });
  }, [resList]);

  // Total pesanan kamar dari grafik donut
  const totalRoomsBooked = useMemo(() => {
    return donutChartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [donutChartData]);

  // 5. DATA TABEL 5 RESERVASI TERBARU (Mengambil 5 teratas)
  const recentReservationsList = useMemo(() => {
    return resList.slice(0, 5).map(res => {
      const initials = res.guestName
        .split(" ")
        .map(n => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      
      let statusLabel = "Menunggu";
      if (res.status === "Check-in") statusLabel = "Selesai";
      else if (res.status === "Check-out") statusLabel = "Selesai";
      else if (res.status === "Dikonfirmasi") statusLabel = "Terkonfirmasi";
      else if (res.status === "Cancelled" || res.status === "Dibatalkan") statusLabel = "Dibatalkan";

      return {
        id: res.bookingId,
        guest: res.guestName,
        type: `${res.roomType} (Room ${res.roomNumber})`,
        checkIn: res.checkIn,
        checkOut: res.checkOut,
        status: statusLabel,
        avatar: initials
      };
    });
  }, [resList]);

  // 6. DINAMISASI LOG AKTIVITAS TERBARU (Menggunakan status check-in/check-out aktif)
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Cari reservasi check-in hari ini
    resList.forEach((res, idx) => {
      if (res.checkIn === todayStr && res.status === "Check-in") {
        activities.push({
          id: `act-${idx}-in`,
          title: "Tamu Check-in",
          desc: `${res.guestName} telah check-in di Room ${res.roomNumber} (${res.roomType})`,
          time: `${5 + (idx % 4) * 12} mnt yang lalu`,
          status: "Check-in"
        });
      }
      if (res.checkOut === todayStr && res.status === "Check-out") {
        activities.push({
          id: `act-${idx}-out`,
          title: "Tamu Check-out",
          desc: `${res.guestName} menyelesaikan check-out dari Room ${res.roomNumber}`,
          time: `Hari ini, 12:00 WIB`,
          status: "Check-out"
        });
      }
    });

    // Fallback default jika aktivitas kosong
    if (activities.length === 0) {
      return [
        { id: 1, title: "Tamu Check-in", desc: "Siti Aminah telah check-in di Kamar 102", time: "10 mnt yang lalu", status: "Check-in" },
        { id: 2, title: "Reservasi Baru", desc: "Budi Santoso memesan Deluxe Room (Kamar 104)", time: "30 mnt yang lalu", status: "Booked" },
        { id: 3, title: "Tagihan Outstanding", desc: "Pembayaran Robert Davis (Kamar 103) belum lunas", time: "2 jam yang lalu", status: "Booked" }
      ];
    }

    return activities.slice(0, 5);
  }, [resList]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Terkonfirmasi':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'Selesai':
        return { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' };
      case 'Menunggu':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'Dibatalkan':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HEADER UTAMA (Hotel, Tanggal, GM Info) */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px 32px', 
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Grand Vera Hotel & Resort
          </h1>
          <p style={{ color: '#E0E7FF', fontSize: '0.95rem', marginTop: '6px', opacity: 0.9 }}>
            Sistem CRM Manajemen Hotel Utama • Pusat Kendali Manajemen
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '16px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93C5FD', fontWeight: 600 }}>Tanggal Hari Ini</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>{currentDate}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>Vera Zakia</div>
              <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 500 }}>General Manager</div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFFFFF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
              VZ
            </div>
          </div>
        </div>
      </div>
 
      {/* 2. STAT CARDS (Metrik Ringkasan) */}
      <div className="dashboard-grid">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="kpi-card" 
            style={{ 
              gridColumn: 'span 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{stat.value}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.subtext}</span>
            </div>
            <div 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: stat.bgColor, 
                color: 'var(--primary-color)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.3rem' 
              }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 3. ROW GRAFIK (Batang & Donut) */}
      <div className="dashboard-grid" style={{ marginBottom: '0px' }}>
        
        {/* Grafik Batang - 7 Hari Terakhir */}
        <div style={{ gridColumn: 'span 7' }} className="table-card">
          <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="table-title">Tren Reservasi (7 Hari Terakhir)</span>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>Jumlah reservasi baru yang masuk per hari</div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', padding: '6px 12px', background: 'rgba(37, 99, 235, 0.08)', borderRadius: 'var(--radius-md)' }}>
              Live Update
            </span>
          </div>

          <div style={{ padding: '24px', position: 'relative' }}>
            {/* Tooltip Dinamis */}
            {hoveredBar !== null && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: `${45 + hoveredBar * 60}px`,
                  transform: 'translateX(-30%)',
                  background: 'var(--text-main)', 
                  color: 'var(--surface-color)', 
                  padding: '6px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>{barChartData[hoveredBar].label}</span>
                <span style={{ color: '#93C5FD' }}>{barChartData[hoveredBar].count} Reservasi</span>
              </div>
            )}

            {/* Custom SVG Bar Chart */}
            <svg viewBox="0 0 500 240" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              <defs>
                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="barBlueHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>

              {/* Grid Lines Horizontal */}
              {[0, 5, 10, 15, 20].map((val, idx) => {
                const y = 180 - (val / 22) * 150;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="480" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="18" y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end" fontWeight="500">{val}</text>
                  </g>
                );
              })}

              {/* Batang / Bars */}
              {barChartData.map((d, idx) => {
                const maxVal = 22;
                const barHeight = (d.count / maxVal) * 150;
                const x = 50 + idx * 62;
                const y = 180 - barHeight;
                const isHovered = hoveredBar === idx;

                return (
                  <g 
                    key={idx}
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Shadow / Background track */}
                    <rect x={x} y="30" width="30" height="150" fill="rgba(37, 99, 235, 0.02)" rx="4" />
                    {/* Active Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width="30" 
                      height={barHeight} 
                      fill={isHovered ? "url(#barBlueHover)" : "url(#barBlue)"} 
                      rx="4" 
                      style={{ transition: 'all 0.2s ease-in-out' }}
                    />
                    {/* Teks Angka di atas batang */}
                    <text 
                      x={x + 15} 
                      y={y - 8} 
                      fill={isHovered ? "var(--primary-color)" : "var(--text-muted)"} 
                      fontSize="10" 
                      fontWeight="700" 
                      textAnchor="middle"
                    >
                      {d.count}
                    </text>
                    {/* Label Hari di sumbu X */}
                    <text x={x + 15} y="198" fill="var(--text-main)" fontSize="11" fontWeight="600" textAnchor="middle">{d.day}</text>
                  </g>
                );
              })}
              {/* Garis Dasar Sumbu X */}
              <line x1="30" y1="180" x2="480" y2="180" stroke="var(--border-color)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Grafik Lingkaran (Donut) - Tipe Kamar */}
        <div style={{ gridColumn: 'span 5' }} className="table-card">
          <div className="table-header">
            <div>
              <span className="table-title">Proporsi Tipe Kamar</span>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>Berdasarkan pesanan aktif bulan ini</div>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            {/* Container Donut SVG */}
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                {/* Background circle */}
                <circle cx="75" cy="75" r="50" fill="transparent" stroke="var(--border-color)" strokeWidth="12" />
                
                {/* Segments */}
                {donutChartData.map((slice, idx) => {
                  const r = 50;
                  const circ = 314.16;
                  const strokeDash = (slice.percentage / 100) * circ;
                  const strokeOffset = (slice.offset / 314.16) * circ;
                  const isHovered = hoveredSlice === idx;

                  return (
                    <circle 
                      key={idx}
                      cx="75" 
                      cy="75" 
                      r={r} 
                      fill="transparent" 
                      stroke={slice.color} 
                      strokeWidth={isHovered ? 16 : 12}
                      strokeDasharray={`${strokeDash} strokeDash`}
                      style={{ 
                        transition: 'all 0.2s ease', 
                        cursor: 'pointer',
                        transformOrigin: 'center',
                        strokeDasharray: `${strokeDash} ${circ}`,
                        strokeDashoffset: strokeOffset
                      }}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Teks di tengah Donut */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  textAlign: 'center',
                  width: '90px',
                  pointerEvents: 'none'
                }}
              >
                {hoveredSlice === null ? (
                  <>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '2px 0' }}>{totalRoomsBooked}</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Reservasi</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.75rem', color: donutChartData[hoveredSlice].color, fontWeight: 700 }}>
                      {donutChartData[hoveredSlice].name}
                    </span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '2px 0' }}>
                      {donutChartData[hoveredSlice].percentage}%
                    </h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {donutChartData[hoveredSlice].count} Kamar
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legenda Grafik */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', fontSize: '0.85rem' }}>
              {donutChartData.map((slice, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '6px 8px',
                    borderRadius: '6px',
                    backgroundColor: hoveredSlice === idx ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: slice.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 500, flex: 1, color: 'var(--text-main)' }}>{slice.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{slice.percentage}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* 4. ROW TABEL & AKSI CEPAT */}
      <div className="dashboard-grid">
        
        {/* Tabel 5 Reservasi Terbaru */}
        <div style={{ gridColumn: 'span 8' }} className="table-card">
          <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="table-title">Reservasi Terbaru (Real-Time)</span>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>Daftar 5 aktivitas reservasi hotel teratas</div>
            </div>
            <button className="icon-btn"><FaEllipsisV /></button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Tamu</th>
                  <th>Kamar & Tipe</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservationsList.map((res) => {
                  const statusStyle = getStatusStyle(res.status);
                  return (
                    <tr key={res.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{ 
                              width: '34px', 
                              height: '34px', 
                              borderRadius: '50%', 
                              backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                              color: 'var(--primary-color)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {res.avatar}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{res.guest}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>{res.type}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.checkIn}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.checkOut}</td>
                      <td>
                        <span 
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            display: 'inline-block'
                          }}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan (Aktivitas & Aksi Cepat) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Panel Aktivitas Terbaru */}
          <div className="table-card">
            <div className="table-header">
              <div>
                <span className="table-title">Aktivitas Operasional</span>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>Log aktivitas check-in dan check-out terbaru</div>
              </div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto' }}>
              {recentActivities.map((act) => {
                const getStatusColor = (status) => {
                  if (status === 'Check-in') return '#10B981'; // hijau
                  if (status === 'Booked') return '#F59E0B'; // kuning
                  if (status === 'Cancelled') return '#EF4444'; // merah
                  return '#94A3B8'; // abu-abu (Check-out)
                };

                return (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', paddingTop: '4px' }}>
                      <span 
                        style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: getStatusColor(act.status), 
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${getStatusColor(act.status)}`
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{act.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.time}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Aksi Cepat */}
          <div className="table-card">
            <div className="table-header">
              <div>
                <span className="table-title">Aksi Cepat Staf</span>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.85rem' }}>Pintasan tugas operasional hotel</div>
              </div>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href="/reservations" 
                className="btn-primary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaPlus />
                  <span>Proses Reservasi</span>
                </div>
                <FaChevronRight size={12} />
              </a>

              <a 
                href="/payments"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaFileInvoice />
                  <span>Cetak Invoice Desk</span>
                </div>
                <FaChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a 
                href="/rooms"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaHandSparkles />
                  <span>Status Housekeeping</span>
                </div>
                <FaChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
