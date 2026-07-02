import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, 
  FaCoins, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaSearch, 
  FaFilter, 
  FaArrowRight, 
  FaPercentage, 
  FaPlus, 
  FaTimes,
  FaDoorOpen
} from 'react-icons/fa';

import { supabase } from '../lib/supabase';

// Indonesian naming constants
const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Helper to format date into YYYY-MM-DD
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to format currency to IDR
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

// Logika Historical Baseline berdasarkan Pola Hari (Weekday vs Weekend) + Varians Deterministik
const getHistoricalBaseline = (dateObj, totalRooms) => {
  const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const dateNum = dateObj.getDate();
  const isWeekend = day === 5 || day === 6; // Jumat, Sabtu
  
  // Weekend baseline: 45%, Weekday: 20%
  const basePercent = isWeekend ? 0.45 : 0.20;
  
  // Tambah varians kecil deterministik agar visual kalender dan grafik tampak alami/dinamis
  const variance = ((dateNum % 3) - 1) * 0.05; // -5%, 0%, +5%
  return Math.round(totalRooms * (basePercent + variance));
};

export default function Forecasting() {
  const navigate = useNavigate();
  const todayStr = "2026-06-14"; // Hari audit simulasi sistem CRM

  // 1. INTEGRASI SUPABASE (ROOMS & RESERVATIONS)
  const [roomsList, setRoomsList] = useState([]);
  const [resList, setResList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rmData, error: rmError } = await supabase.from('rooms').select('*');
        if (rmError) throw rmError;
        setRoomsList(rmData || []);

        const { data: resData, error: resError } = await supabase.from('reservations').select('*');
        if (resError) throw resError;
        
        // Map Supabase fields to the format expected by forecasting component
        const mappedRes = (resData || []).map(r => ({
          ...r,
          status: r.status === 'confirmed' ? 'Dikonfirmasi' 
                : r.status === 'pending' ? 'Menunggu Konfirmasi'
                : r.status === 'checked_in' ? 'Check-in'
                : r.status === 'checked_out' ? 'Check-out'
                : 'Dibatalkan',
          checkIn: r.check_in,
          checkOut: r.check_out
        }));
        setResList(mappedRes);
      } catch (err) {
        console.error("Gagal memuat data di forecasting:", err);
      }
    };
    fetchData();
  }, []);

  // 2. STATE INTERAKTIF
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [pricingActions, setPricingActions] = useState({}); // Menyimpan status harga dinamis yang diaktifkan
  const [toastMessage, setToastMessage] = useState("");

  const itemsPerPage = 10;
  const totalRooms = roomsList.length || 20;

  // Rata-rata tarif kamar dasar
  const avgRoomPrice = useMemo(() => {
    return roomsList.reduce((sum, rm) => sum + rm.price, 0) / totalRooms;
  }, [roomsList, totalRooms]);

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 3. GENERATOR PROYEKSI DETIL 30 HARI KE DEPAN (15 Juni 2026 - 14 Juli 2026)
  const forecastDetails = useMemo(() => {
    const dates = [];
    const startDate = new Date(2026, 5, 15); // 15 Juni 2026
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }

    return dates.map(date => {
      const dateStr = formatDate(date);
      const dayName = INDONESIAN_DAYS[date.getDay()];
      
      // Ambil reservasi yang aktif pada malam tanggal tersebut (checkIn <= dateStr && dateStr < checkOut)
      const confirmedBookings = resList.filter(res => {
        const isActiveStatus = ["Booked", "Dikonfirmasi", "Menunggu Konfirmasi", "Check-in"].includes(res.status);
        return res.checkIn <= dateStr && dateStr < res.checkOut && isActiveStatus;
      });

      const confirmedCount = confirmedBookings.length;
      const baseline = getHistoricalBaseline(date, totalRooms);
      
      // Total terjual diproyeksikan (Reservasi Aktif + Baseline), dicap di kapasitas maksimal kamar
      const roomsSold = Math.min(totalRooms, confirmedCount + baseline);
      const roomsLeft = totalRooms - roomsSold;
      const occupancyRate = (roomsSold / totalRooms) * 100;

      let status = "Banyak Tersedia";
      let statusColor = "#10B981"; // Hijau
      let bgLight = "rgba(16, 185, 129, 0.08)";
      if (occupancyRate > 80) {
        status = "High Demand";
        statusColor = "#EF4444"; // Merah
        bgLight = "rgba(239, 68, 68, 0.08)";
      } else if (occupancyRate >= 50) {
        status = "Sedang";
        statusColor = "#F59E0B"; // Kuning
        bgLight = "rgba(245, 158, 11, 0.08)";
      }

      return {
        date,
        dateStr,
        dayName,
        confirmedCount,
        baseline,
        roomsSold,
        roomsLeft,
        occupancyRate,
        status,
        statusColor,
        bgLight,
        confirmedBookings
      };
    });
  }, [resList, totalRooms]);

  // 4. METRIK RINGKASAN KPI (BULAN DEPAN)
  const kpis = useMemo(() => {
    const totalOccupancySum = forecastDetails.reduce((sum, d) => sum + d.occupancyRate, 0);
    const avgOccupancy = totalOccupancySum / forecastDetails.length;

    // Estimasi pendapatan = Proyeksi kamar terjual * Rata-rata harga kamar
    const estimatedRevenue = forecastDetails.reduce((sum, d) => sum + (d.roomsSold * avgRoomPrice), 0);

    const highDemandDays = forecastDetails.filter(d => d.occupancyRate > 80).length;

    return {
      avgOccupancy,
      estimatedRevenue,
      highDemandDays
    };
  }, [forecastDetails, avgRoomPrice]);

  // 5. KALKULASI DATA GRAFIK BATANG (Juni Aktual vs Juli Prediksi)
  const weeklyChartData = useMemo(() => {
    // Helper okupansi Juni
    const getJuneDailyRate = (dayNum) => {
      const dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
      const dateObj = new Date(2026, 5, dayNum);
      
      const confirmedCount = resList.filter(r => {
        const isActiveStatus = ["Booked", "Dikonfirmasi", "Menunggu Konfirmasi", "Check-in", "Check-out"].includes(r.status);
        return r.checkIn <= dateStr && dateStr < r.checkOut && isActiveStatus;
      }).length;
      
      let occupied = confirmedCount;
      if (confirmedCount === 0) {
        // Simulasi hunian historis Juni jika tidak ada record di database
        const day = dateObj.getDay();
        const isWeekend = day === 5 || day === 6;
        const baseNum = isWeekend ? 9 : 6;
        const variance = (dayNum % 3) - 1;
        occupied = Math.min(totalRooms, baseNum + variance);
      }
      return (occupied / totalRooms) * 100;
    };

    // Helper okupansi Juli (Murni Prediksi)
    const getJulyDailyRate = (dayNum) => {
      const dateStr = `2026-07-${String(dayNum).padStart(2, '0')}`;
      const dateObj = new Date(2026, 6, dayNum);
      
      const confirmedCount = resList.filter(r => {
        const isActiveStatus = ["Booked", "Dikonfirmasi", "Menunggu Konfirmasi", "Check-in"].includes(r.status);
        return r.checkIn <= dateStr && dateStr < r.checkOut && isActiveStatus;
      }).length;

      const baseline = getHistoricalBaseline(dateObj, totalRooms);
      const occupied = Math.min(totalRooms, confirmedCount + baseline);
      return (occupied / totalRooms) * 100;
    };

    // Rata-rata Mingguan Juni (1-7, 8-14, 15-21, 22-30)
    const juneW1 = Array.from({ length: 7 }, (_, i) => getJuneDailyRate(i + 1)).reduce((s, v) => s + v, 0) / 7;
    const juneW2 = Array.from({ length: 7 }, (_, i) => getJuneDailyRate(i + 8)).reduce((s, v) => s + v, 0) / 7;
    const juneW3 = Array.from({ length: 7 }, (_, i) => getJuneDailyRate(i + 15)).reduce((s, v) => s + v, 0) / 7;
    const juneW4 = Array.from({ length: 9 }, (_, i) => getJuneDailyRate(i + 22)).reduce((s, v) => s + v, 0) / 9;

    // Rata-rata Mingguan Juli (1-7, 8-14, 15-21, 22-31)
    const julyW1 = Array.from({ length: 7 }, (_, i) => getJulyDailyRate(i + 1)).reduce((s, v) => s + v, 0) / 7;
    const julyW2 = Array.from({ length: 7 }, (_, i) => getJulyDailyRate(i + 8)).reduce((s, v) => s + v, 0) / 7;
    const julyW3 = Array.from({ length: 7 }, (_, i) => getJulyDailyRate(i + 15)).reduce((s, v) => s + v, 0) / 7;
    const julyW4 = Array.from({ length: 10 }, (_, i) => getJulyDailyRate(i + 22)).reduce((s, v) => s + v, 0) / 10;

    return [
      { label: "Minggu 1", june: juneW1, july: julyW1 },
      { label: "Minggu 2", june: juneW2, july: julyW2 },
      { label: "Minggu 3", june: juneW3, july: julyW3 },
      { label: "Minggu 4", june: juneW4, july: julyW4 }
    ];
  }, [resList, totalRooms]);

  // 6. FILTERING DAFTAR PROYEKSI UNTUK TABEL DETAIL
  const filteredForecast = useMemo(() => {
    return forecastDetails.filter(d => {
      const dateIndoText = `${d.dayName}, ${d.date.getDate()} ${INDONESIAN_MONTHS[d.date.getMonth()]}`.toLowerCase();
      const dateText = d.dateStr.toLowerCase();
      const matchSearch = dateIndoText.includes(searchQuery.toLowerCase()) || dateText.includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "Semua" || 
        (statusFilter === "High Demand" && d.occupancyRate > 80) ||
        (statusFilter === "Sedang" && d.occupancyRate >= 50 && d.occupancyRate <= 80) ||
        (statusFilter === "Banyak Tersedia" && d.occupancyRate < 50);

      return matchSearch && matchStatus;
    });
  }, [forecastDetails, searchQuery, statusFilter]);

  // Sliced data untuk pagination tabel
  const paginatedForecast = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredForecast.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredForecast, currentPage]);

  const totalPages = Math.ceil(filteredForecast.length / itemsPerPage);

  // Daftar Tanggal Berpotensi Penuh (>80% occupancy)
  const highDemandDaysList = useMemo(() => {
    return forecastDetails.filter(d => d.occupancyRate > 80);
  }, [forecastDetails]);

  // Handler terapkan tarif dinamis
  const handleApplyPricing = (dateStr) => {
    setPricingActions(prev => ({
      ...prev,
      [dateStr]: true
    }));
    triggerToast(`Harga dinamis (+15%) berhasil diaktifkan pada tanggal ${dateStr}!`);
  };

  // Handler prefill booking redirect
  const handleRedirectBooking = (dateStr) => {
    // Prefill data kosong dengan tanggal check-in terpilih
    localStorage.setItem("hotelify_prefill_booking_guest", JSON.stringify({
      guestName: "",
      phone: "",
      email: "",
      identityNumber: "",
      checkIn: dateStr,
      checkOut: formatDate(new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)) // H+1
    }));
    triggerToast(`Membuka form reservasi untuk tanggal masuk ${dateStr}...`);
    setTimeout(() => {
      navigate("/reservations");
    }, 1200);
  };

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
          <FaCheckCircle style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaChartLine style={{ color: 'var(--primary-color)' }} /> Forecasting Hunian
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Pantau proyeksi tingkat hunian kamar 30 hari ke depan untuk menyusun strategi okupansi & tarif dinamis hotel.
          </p>
        </div>
        
        {/* Periode Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}>
          <FaCalendarAlt style={{ color: 'var(--primary-color)' }} />
          <span>15 Jun 2026 - 14 Jul 2026 (30 Hari)</span>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* KPI 1 */}
        <div className="kpi-card">
          <div className="kpi-icon primary">
            <FaPercentage />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Rata-rata Okupansi Prediksi</span>
            <span className="kpi-value">{kpis.avgOccupancy.toFixed(1)}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Target Hotel: &gt;70.0% hunian
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card">
          <div className="kpi-icon success">
            <FaCoins />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Estimasi Pendapatan Kotor</span>
            <span className="kpi-value">{formatRupiah(kpis.estimatedRevenue)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Berdasarkan proyeksi kamar terjual
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card">
          <div className="kpi-icon warning">
            <FaExclamationTriangle />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Hari High-Demand (&gt;80%)</span>
            <span className="kpi-value" style={{ color: kpis.highDemandDays > 0 ? 'var(--danger-color)' : 'var(--text-main)' }}>
              {kpis.highDemandDays} Hari
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Saran: Aktifkan harga dinamis
            </span>
          </div>
        </div>
      </div>

      {/* ROW 1: CALENDAR CALCULATION & WEEKLY CHART */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Calendar Grid (8 Columns) */}
        <div className="table-card" style={{ gridColumn: 'span 8' }}>
          <div className="table-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <span className="table-title">Kalender Prediksi Okupansi</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Grid 30 hari ke depan berwarna: Hijau (&lt;50%), Kuning (50-80%), Merah (&gt;80%). Klik tanggal untuk detail.
              </p>
            </div>
          </div>
          
          <div style={{ padding: '20px' }}>
            {/* Calendar Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
              <div>Min</div>
            </div>

            {/* Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px'
            }}>
              {forecastDetails.map((day, idx) => {
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedForecast(day)}
                    style={{
                      border: `1.5px solid ${day.statusColor}`,
                      backgroundColor: day.bgLight,
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      height: '92px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    className="hover-scale-calendar"
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {day.date.getDate()} {INDONESIAN_MONTHS[day.date.getMonth()].substring(0, 3)}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: day.statusColor, margin: '4px 0' }}>
                      {day.occupancyRate.toFixed(0)}%
                    </span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 600, 
                      color: day.statusColor, 
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${day.statusColor}`,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {day.roomsSold}/{totalRooms} Rm
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '24px', 
              marginTop: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 600 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}>Banyak Tersedia (&lt;50%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}>Okupansi Sedang (50% - 80%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#EF4444', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}>High Demand (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Comparison Chart (4 Columns) */}
        <div className="table-card" style={{ gridColumn: 'span 4' }}>
          <div className="table-header">
            <div>
              <span className="table-title">Perbandingan Okupansi</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Aktual Juni vs Prediksi Juli 2026 (Mingguan)
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 320 230" style={{ width: '100%', height: 'auto' }}>
                {/* Y-axis gridlines & labels */}
                {[0, 25, 50, 75, 100].map((level, i) => {
                  const y = 180 - (level / 100) * 150;
                  return (
                    <g key={i}>
                      <line x1="30" y1={y} x2="310" y2={y} stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3,3" />
                      <text x="25" y={y + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                        {level}%
                      </text>
                    </g>
                  );
                })}

                {/* Draw side-by-side bars for Weeks */}
                {weeklyChartData.map((data, idx) => {
                  const cx = 45 + (idx * 68) + 25; // center x of week block
                  
                  // June Actual Bar
                  const hJune = (data.june / 100) * 150;
                  const yJune = 180 - hJune;
                  
                  // July Predicted Bar
                  const hJuly = (data.july / 100) * 150;
                  const yJuly = 180 - hJuly;

                  const w = 12;

                  return (
                    <g key={idx}>
                      {/* June Bar */}
                      <rect 
                        x={cx - w - 2} 
                        y={yJune} 
                        width={w} 
                        height={hJune} 
                        fill="#94A3B8" 
                        rx="2"
                        style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        onMouseEnter={() => setHoveredBar({
                          x: cx - w/2 - 2,
                          y: yJune,
                          label: `${data.label} (Juni)`,
                          value: data.june
                        })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />

                      {/* July Bar */}
                      <rect 
                        x={cx + 2} 
                        y={yJuly} 
                        width={w} 
                        height={hJuly} 
                        fill="var(--primary-color)" 
                        rx="2"
                        style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        onMouseEnter={() => setHoveredBar({
                          x: cx + w/2 + 2,
                          y: yJuly,
                          label: `${data.label} (Juli)`,
                          value: data.july
                        })}
                        onMouseLeave={() => setHoveredBar(null)}
                      />

                      {/* Week label */}
                      <text x={cx} y="195" fill="var(--text-main)" fontSize="8" fontWeight="600" textAnchor="middle">
                        {data.label}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis line */}
                <line x1="30" y1="180" x2="310" y2="180" stroke="var(--border-color)" strokeWidth="1.5" />

                {/* SVG Tooltip */}
                {hoveredBar && (
                  <g>
                    <rect 
                      x={Math.max(10, Math.min(200, hoveredBar.x - 55))} 
                      y={Math.max(5, hoveredBar.y - 40)} 
                      width="110" 
                      height="32" 
                      rx="4" 
                      fill="var(--text-main)" 
                      opacity="0.95" 
                    />
                    <text 
                      x={Math.max(10, Math.min(200, hoveredBar.x - 55)) + 55} 
                      y={Math.max(5, hoveredBar.y - 40) + 12} 
                      fill="#FFF" 
                      fontSize="7.5" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {hoveredBar.label}
                    </text>
                    <text 
                      x={Math.max(10, Math.min(200, hoveredBar.x - 55)) + 55} 
                      y={Math.max(5, hoveredBar.y - 40) + 24} 
                      fill="#3B82F6" 
                      fontSize="9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {hoveredBar.value.toFixed(1)}% Okupansi
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Legend Chart */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#94A3B8', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}>Juni (Aktual)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary-color)', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)' }}>Juli (Prediksi)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: DEMAND ALERTS & DYNAMIC PRICING STRATEGY */}
      <div className="table-card">
        <div className="table-header" style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaExclamationTriangle style={{ color: 'var(--danger-color)', fontSize: '1.25rem' }} />
            <div>
              <span className="table-title">Strategi Harga Dinamis (High Demand Dates)</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Daftar tanggal dengan prediksi okupansi kritis (&gt;80%). Disarankan menaikkan tarif untuk mengoptimalkan yield keuangan.
              </p>
            </div>
          </div>
          <span style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger-color)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)'
          }}>
            Terdeteksi {highDemandDaysList.length} Tanggal Padat
          </span>
        </div>

        <div style={{ padding: '20px' }}>
          {highDemandDaysList.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px',
              color: 'var(--text-muted)',
              gap: '10px'
            }}>
              <FaInfoCircle style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
              <p style={{ fontWeight: 600 }}>Tidak ada tanggal dengan tingkat okupansi kritis (&gt;80%).</p>
              <p style={{ fontSize: '0.8rem' }}>Semua tanggal tergolong aman dengan ketersediaan kamar mencukupi.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {highDemandDaysList.map((day, idx) => {
                const isApplied = pricingActions[day.dateStr];
                return (
                  <div 
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      backgroundColor: 'var(--surface-color)',
                      boxShadow: 'var(--shadow-sm)',
                      borderLeft: '4px solid var(--danger-color)'
                    }}
                  >
                    {/* Header Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {day.dayName}, {day.date.getDate()} {INDONESIAN_MONTHS[day.date.getMonth()]} 2026
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Okupansi: {day.occupancyRate.toFixed(1)}% ({day.roomsSold}/{totalRooms} Kamar)
                        </span>
                      </div>
                      <span style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger-color)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        Padat
                      </span>
                    </div>

                    {/* Rekomendasi Deskripsi */}
                    <div style={{
                      backgroundColor: 'var(--bg-color)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      borderLeft: '2.5px solid var(--primary-color)'
                    }}>
                      <strong>Saran CRM:</strong> Naikkan harga dasar kamar sebesar <strong>+15%</strong> dan matikan promo khusus pada tanggal ini.
                    </div>

                    {/* Aksi */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <button 
                        onClick={() => handleRedirectBooking(day.dateStr)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-color)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Buat Reservasi <FaArrowRight />
                      </button>

                      <button 
                        onClick={() => handleApplyPricing(day.dateStr)}
                        disabled={isApplied}
                        style={{
                          backgroundColor: isApplied ? '#10B981' : 'var(--primary-color)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: isApplied ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {isApplied ? (
                          <>
                            <FaCheckCircle /> Aktif!
                          </>
                        ) : (
                          <>
                            <FaPercentage /> Aktifkan Dinamis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: DETAILED TABLE FORECAST */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <span className="table-title">Daftar Rincian Proyeksi Harian</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tabel proyeksi harian lengkap. Klik detail untuk melihat daftar tamu dan alokasi kamar.
            </p>
          </div>
          
          {/* SEARCH & FILTERS BAR */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <input 
                type="text" 
                placeholder="Cari Tanggal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaFilter style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Semua">Semua Okupansi</option>
                <option value="Banyak Tersedia">Tersedia (&lt;50%)</option>
                <option value="Sedang">Sedang (50-80%)</option>
                <option value="High Demand">High Demand (&gt;80%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div style={{ overflowX: 'auto' }}>
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Kamar Terjual (Prediksi)</th>
                <th>Kamar Tersisa</th>
                <th>Okupansi (%)</th>
                <th>Status Kepadatan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedForecast.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    Tidak ada data proyeksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedForecast.map((row, idx) => {
                  return (
                    <tr key={idx} style={{ 
                      backgroundColor: selectedForecast?.dateStr === row.dateStr ? 'rgba(37,99,235,0.04)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {row.date.getDate()} {INDONESIAN_MONTHS[row.date.getMonth()]} {row.date.getFullYear()}
                      </td>
                      <td>{row.dayName}</td>
                      <td style={{ fontWeight: 600 }}>{row.roomsSold} Kamar</td>
                      <td>{row.roomsLeft} Kamar</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '6px', 
                            backgroundColor: 'var(--border-color)', 
                            borderRadius: '3px',
                            overflow: 'hidden' 
                          }}>
                            <div style={{ 
                              width: `${row.occupancyRate}%`, 
                              height: '100%', 
                              backgroundColor: row.statusColor 
                            }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{row.occupancyRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: row.bgLight,
                          color: row.statusColor,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${row.statusColor}`
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => setSelectedForecast(row)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'rgba(37,99,235,0.08)',
                            color: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="hover-btn-details"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Menampilkan {paginatedForecast.length} dari {filteredForecast.length} baris data
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-color)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '6px 12px',
                      border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--primary-color)' : 'var(--surface-color)',
                      color: isActive ? '#FFFFFF' : 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-color)',
                  color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FORECAST DATE */}
      {selectedForecast && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '780px',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            border: '1px solid var(--border-color)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            {/* Modal Close Button */}
            <button 
              onClick={() => setSelectedForecast(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>

            {/* Modal Header */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Detail Proyeksi: {selectedForecast.dayName}, {selectedForecast.date.getDate()} {INDONESIAN_MONTHS[selectedForecast.date.getMonth()]} {selectedForecast.date.getFullYear()}
                </h3>
                <span style={{
                  backgroundColor: selectedForecast.bgLight,
                  color: selectedForecast.statusColor,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${selectedForecast.statusColor}`
                }}>
                  {selectedForecast.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Berikut adalah rincian data hunian dan daftar tamu yang terkonfirmasi menginap pada tanggal ini.
              </p>
            </div>

            {/* Modal Body: Metrics Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tingkat Okupansi</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: selectedForecast.statusColor, marginTop: '2px' }}>
                  {selectedForecast.occupancyRate.toFixed(1)}%
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kamar Terjual</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedForecast.roomsSold} / {totalRooms}
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reservasi Riil</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '2px' }}>
                  {selectedForecast.confirmedCount} Bookings
                </div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Historis Baseline</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#64748B', marginTop: '2px' }}>
                  +{selectedForecast.baseline} Kamar
                </div>
              </div>
            </div>

            {/* Modal Body: Bookings List */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                Daftar Reservasi Terkonfirmasi ({selectedForecast.confirmedCount} Tamu)
              </span>

              {selectedForecast.confirmedBookings.length === 0 ? (
                <div style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  border: '1px dashed var(--border-color)'
                }}>
                  Belum ada reservasi terkonfirmasi yang menginap pada tanggal ini.<br />
                  <span style={{ fontSize: '0.75rem' }}>Prediksi okupansi didasarkan penuh pada baseline data historis hotel.</span>
                </div>
              ) : (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="hotel-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 16px' }}>Nama Tamu</th>
                        <th style={{ padding: '8px 16px' }}>Tipe/Kamar</th>
                        <th style={{ padding: '8px 16px' }}>Check-in</th>
                        <th style={{ padding: '8px 16px' }}>Check-out</th>
                        <th style={{ padding: '8px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedForecast.confirmedBookings.map((res, i) => {
                        return (
                          <tr key={i}>
                            <td style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text-main)' }}>{res.guestName}</td>
                            <td style={{ padding: '8px 16px' }}>{res.roomType} (RM-{res.roomNumber})</td>
                            <td style={{ padding: '8px 16px' }}>{res.checkIn}</td>
                            <td style={{ padding: '8px 16px' }}>{res.checkOut}</td>
                            <td style={{ padding: '8px 16px' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: res.status === "Check-in" ? "rgba(16, 185, 129, 0.1)" : "rgba(37, 99, 235, 0.1)",
                                color: res.status === "Check-in" ? "#10B981" : "var(--primary-color)",
                                fontWeight: 700
                              }}>
                                {res.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '16px' 
            }}>
              <button 
                onClick={() => setSelectedForecast(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>

              <button 
                onClick={() => {
                  setSelectedForecast(null);
                  handleRedirectBooking(selectedForecast.dateStr);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary-color)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaPlus /> Buat Reservasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
