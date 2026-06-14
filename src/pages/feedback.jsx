import React, { useState, useMemo } from 'react';
import { 
  FaSmile, 
  FaCheckCircle, 
  FaTimes, 
  FaExclamationTriangle, 
  FaReply, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaRegStar, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaArrowRight
} from 'react-icons/fa';

// Fallback data
import { reservations } from '../data/reservations';

// Indonesian month labels
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

export default function Feedback() {
  const todayStr = "2026-06-14"; // Audit simulated date

  // 1. INTEGRASI DATA RESERVASI (LOCAL STORAGE)
  const [resList] = useState(() => {
    const saved = localStorage.getItem("hotelify_reservations");
    let parsed = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat reservasi di feedback", e);
      }
    }

    if (!parsed || parsed.length === 0) {
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

    // Pastikan ada check-out kemarin (13 Juni 2026) untuk simulasi pemicu kirim form H+1
    const hasYesterdayCheckout = parsed.some(r => r.checkOut === "2026-06-13" && r.status === "Check-out");
    if (!hasYesterdayCheckout) {
      parsed.push({
        bookingId: "BOK-7777",
        guestName: "Sarah Jenkins",
        roomNumber: "104",
        roomType: "Deluxe",
        status: "Check-out",
        checkIn: "2026-06-10",
        checkOut: "2026-06-13",
        totalPayment: 1100000,
        email: "sarah.j@example.com",
        phone: "081298765435"
      });
    }
    localStorage.setItem("hotelify_reservations", JSON.stringify(parsed));
    return parsed;
  });

  // 2. DATABASE SURVEI LOCAL STORAGE
  const [surveysList, setSurveysList] = useState(() => {
    const saved = localStorage.getItem("hotelify_surveys");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat survei", e);
      }
    }

    // Default surveys
    const defaults = [
      {
        id: "SRV-1001",
        guestName: "Vera Zakia",
        stayDates: "12 Jun - 14 Jun 2026",
        roomType: "Suite",
        cleanliness: 5,
        staff: 5,
        facilities: 5,
        value: 5,
        overall: 5.0,
        comment: "Menginap di kamar Suite sangat memuaskan! Kamar bersih sekali, bathtub mewah, dan makanan enak.",
        date: "2026-06-14",
        replied: false,
        replyText: ""
      },
      {
        id: "SRV-1002",
        guestName: "John Doe",
        stayDates: "10 Jun - 12 Jun 2026",
        roomType: "Deluxe",
        cleanliness: 5,
        staff: 4,
        facilities: 4,
        value: 5,
        overall: 4.5,
        comment: "Kamar sangat bersih dan staf sangat ramah. Lokasi hotel strategis, sangat direkomendasikan!",
        date: "2026-06-13",
        replied: false,
        replyText: ""
      },
      {
        id: "SRV-1003",
        guestName: "Siti Aminah",
        stayDates: "08 Jun - 11 Jun 2026",
        roomType: "Standard",
        cleanliness: 2,
        staff: 3,
        facilities: 2,
        value: 3,
        overall: 2.0, // Critical Review (Red highlighted)
        comment: "AC kamar panas dan air kamar mandi sempat macet. Harap diperbaiki kebersihan dan fasilitasnya.",
        date: "2026-06-12",
        replied: true,
        replyText: "Terima kasih Ibu Siti Aminah atas masukannya. Kami segera melakukan pengecekan AC dan air di kamar terkait. Mohon maaf atas ketidaknyamanannya."
      },
      {
        id: "SRV-1004",
        guestName: "Budi Santoso",
        stayDates: "05 Jun - 07 Jun 2026",
        roomType: "Family",
        cleanliness: 4,
        staff: 5,
        facilities: 5,
        value: 4,
        overall: 4.4,
        comment: "Fasilitas kolam renang anak sangat disukai keluarga. Pelayanan staf luar biasa baik.",
        date: "2026-06-08",
        replied: false,
        replyText: ""
      },
      {
        id: "SRV-1005",
        guestName: "Michael Chen",
        stayDates: "28 Mei - 31 Mei 2026",
        roomType: "Suite",
        cleanliness: 3,
        staff: 2,
        facilities: 3,
        value: 3,
        overall: 2.8,
        comment: "Staf di lobby kurang ramah saat proses check-in yang sangat padat. Kamar biasa saja.",
        date: "2026-06-01",
        replied: false,
        replyText: ""
      }
    ];
    localStorage.setItem("hotelify_surveys", JSON.stringify(defaults));
    return defaults;
  });

  // 3. STATES FILTER & INTERAKTIF
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Semua"); // Semua, Positif, Negatif, Netral
  const [roomTypeFilter, setRoomTypeFilter] = useState("Semua"); // Semua, Standard, Deluxe, Suite, Family
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSurveyToReply, setSelectedSurveyToReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [hoveredTrend, setHoveredTrend] = useState(null);

  // Status simulasi survei terkirim
  const [sentSurveyStatus, setSentSurveyStatus] = useState({}); // bookingId -> status ("Terkirim", "Selesai")

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // 4. DETEKSI TAMU CHECK-OUT H-1 UNTUK SIMULASI SURVEI OTOMATIS
  const yesterdayCheckouts = useMemo(() => {
    return resList.filter(res => {
      // Check-out kemarin (2026-06-13)
      const isYesterday = res.checkOut === "2026-06-13";
      // Belum ada survey atas nama tamu ini
      const alreadySurveyed = surveysList.some(s => s.guestName === res.guestName);
      return isYesterday && res.status === "Check-out" && !alreadySurveyed;
    });
  }, [resList, surveysList]);

  // 5. KALKULASI RATA-RATA RATING PER KATEGORI (KPI METRICS)
  const categoryMetrics = useMemo(() => {
    const count = surveysList.length;
    if (count === 0) return { cleanliness: 0, staff: 0, facilities: 0, value: 0, overall: 0, count: 0 };

    const cleanlinessSum = surveysList.reduce((s, r) => s + r.cleanliness, 0);
    const staffSum = surveysList.reduce((s, r) => s + r.staff, 0);
    const facilitiesSum = surveysList.reduce((s, r) => s + r.facilities, 0);
    const valueSum = surveysList.reduce((s, r) => s + r.value, 0);
    const overallSum = surveysList.reduce((s, r) => s + r.overall, 0);

    return {
      cleanliness: cleanlinessSum / count,
      staff: staffSum / count,
      facilities: facilitiesSum / count,
      value: valueSum / count,
      overall: overallSum / count,
      count
    };
  }, [surveysList]);

  // 6. FILTERS & PENYARINGAN DATA TAMU
  const filteredSurveys = useMemo(() => {
    return surveysList.filter(s => {
      // Pencarian nama tamu atau komentar
      const matchesSearch = s.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.comment.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter Tanggal
      const surveyDate = new Date(s.date).getTime();
      const matchesStart = startDate ? surveyDate >= new Date(startDate).getTime() : true;
      const matchesEnd = endDate ? surveyDate <= new Date(endDate).getTime() : true;

      // Filter Kategori Rating
      let matchesRating = true;
      if (ratingFilter === "Positif") matchesRating = s.overall >= 4.0;
      else if (ratingFilter === "Negatif") matchesRating = s.overall <= 2.0;
      else if (ratingFilter === "Netral") matchesRating = s.overall > 2.0 && s.overall < 4.0;

      // Filter Tipe Kamar
      const matchesRoom = roomTypeFilter === "Semua" || s.roomType === roomTypeFilter;

      return matchesSearch && matchesStart && matchesEnd && matchesRating && matchesRoom;
    });
  }, [surveysList, searchQuery, startDate, endDate, ratingFilter, roomTypeFilter]);

  // 7. KALKULASI DATA TREN KEPUASAN BULANAN (SVG Line Chart)
  // Menghitung bulan Juni secara dinamis berdasarkan data review Juni di surveylist, base statik bulan lalu
  const monthlyTrends = useMemo(() => {
    const baseTrends = [
      { label: "Jan", val: 4.1 },
      { label: "Feb", val: 4.2 },
      { label: "Mar", val: 3.9 },
      { label: "Apr", val: 4.3 },
      { label: "Mei", val: 4.4 }
    ];

    // Hitung rata-rata Juni dari database lokal
    const juneReviews = surveysList.filter(s => s.date.startsWith("2026-06"));
    const juneAvg = juneReviews.length > 0
      ? juneReviews.reduce((sum, r) => sum + r.overall, 0) / juneReviews.length
      : 4.5;

    return [...baseTrends, { label: "Jun", val: juneAvg }];
  }, [surveysList]);

  // 8. ACTIONS

  // Simulasi Kirim Survei ke Sarah Jenkins
  const handleSendSurveyInvitation = (res) => {
    setSentSurveyStatus(prev => ({ ...prev, [res.bookingId]: "Terkirim" }));
    triggerToast(`Form survei kepuasan berhasil dikirim ke email/WA ${res.guestName}!`);

    // Simulasi respons otomatis dari tamu dalam 2 detik
    setTimeout(() => {
      setSentSurveyStatus(prev => ({ ...prev, [res.bookingId]: "Selesai" }));
      
      const newSurvey = {
        id: `SRV-${1000 + surveysList.length + 1}`,
        guestName: res.guestName,
        stayDates: `${res.checkIn} - ${res.checkOut}`,
        roomType: res.roomType,
        cleanliness: 5,
        staff: 5,
        facilities: 4,
        value: 5,
        overall: 4.8,
        comment: "Kamar sangat bersih dan nyaman! Proses check-out cepat, dan staf ramah.",
        date: todayStr,
        replied: false,
        replyText: ""
      };

      const updatedSurveys = [newSurvey, ...surveysList];
      setSurveysList(updatedSurveys);
      localStorage.setItem("hotelify_surveys", JSON.stringify(updatedSurveys));
      
      triggerToast(`Umpan balik baru diterima dari ${res.guestName} dengan rating 4.8/5.0!`);
    }, 2000);
  };

  // Submit Balasan / Follow-up Staf
  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyText) return;

    const updated = surveysList.map(s => {
      if (s.id === selectedSurveyToReply.id) {
        return {
          ...s,
          replied: true,
          replyText: replyText
        };
      }
      return s;
    });

    setSurveysList(updated);
    localStorage.setItem("hotelify_surveys", JSON.stringify(updated));
    setSelectedSurveyToReply(null);
    setReplyText("");
    triggerToast("Balasan umpan balik berhasil disimpan dan terkirim!");
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
          <FaCheckCircle style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaSmile style={{ color: 'var(--primary-color)' }} /> Analisis Kepuasan Tamu (Feedback CRM)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Pantau kualitas layanan hotel berdasarkan kepuasan tamu harian, tren bulanan, dan tanggapi feedback kritis.
          </p>
        </div>
      </div>

      {/* ROW 1: SATISFACTION SUMMARY DASHBOARD & TRENDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Category Scores - Horizontal Bar Chart (6 columns) */}
        <div className="table-card" style={{ gridColumn: 'span 6' }}>
          <div className="table-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <span className="table-title">Dasbor Skor Kepuasan</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Rata-rata penilaian survei per kategori layanan hotel (Skala 1 - 5)
              </p>
            </div>
            
            <span style={{
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              color: 'var(--primary-color)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)'
            }}>
              Skor Global: {categoryMetrics.overall.toFixed(2)} / 5.0
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cleanliness */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-main)' }}>Kebersihan Kamar</span>
                <span style={{ color: 'var(--primary-color)' }}>{categoryMetrics.cleanliness.toFixed(1)} / 5.0</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(categoryMetrics.cleanliness / 5) * 100}%`, height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Staff Service */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-main)' }}>Pelayanan Staf</span>
                <span style={{ color: 'var(--primary-color)' }}>{categoryMetrics.staff.toFixed(1)} / 5.0</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(categoryMetrics.staff / 5) * 100}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Facilities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-main)' }}>Fasilitas Hotel</span>
                <span style={{ color: 'var(--primary-color)' }}>{categoryMetrics.facilities.toFixed(1)} / 5.0</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(categoryMetrics.facilities / 5) * 100}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Value for Money */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-main)' }}>Kesesuaian Harga (Value)</span>
                <span style={{ color: 'var(--primary-color)' }}>{categoryMetrics.value.toFixed(1)} / 5.0</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(categoryMetrics.value / 5) * 100}%`, height: '100%', backgroundColor: '#8B5CF6', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend - SVG Line Chart (6 columns) */}
        <div className="table-card" style={{ gridColumn: 'span 6' }}>
          <div className="table-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <span className="table-title">Tren Kepuasan Tamu (6 Bulan Terakhir)</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Pergerakan rata-rata indeks kepuasan hotel bulanan.
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 320 160" style={{ width: '100%', height: 'auto' }}>
                
                {/* Horizontal Gridlines & Y-axis labels */}
                {[3.0, 3.5, 4.0, 4.5, 5.0].map((score, i) => {
                  const y = 130 - ((score - 3.0) / 2.0) * 100;
                  return (
                    <g key={i}>
                      <line x1="35" y1={y} x2="300" y2={y} stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="3,3" />
                      <text x="30" y={y + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">
                        {score.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Draw line path */}
                {(() => {
                  const coords = monthlyTrends.map((t, idx) => {
                    const x = 50 + idx * 48;
                    const y = 130 - ((t.val - 3.0) / 2.0) * 100;
                    return { x, y };
                  });

                  let pathData = `M ${coords[0].x} ${coords[0].y}`;
                  for (let i = 1; i < coords.length; i++) {
                    pathData += ` L ${coords[i].x} ${coords[i].y}`;
                  }

                  return (
                    <g>
                      {/* Trend line */}
                      <path d={pathData} fill="none" stroke="var(--primary-color)" strokeWidth="2.5" />
                      
                      {/* Nodes */}
                      {coords.map((c, idx) => (
                        <circle 
                          key={idx}
                          cx={c.x}
                          cy={c.y}
                          r={hoveredTrend === idx ? "5" : "3.5"}
                          fill={hoveredTrend === idx ? "#3B82F6" : "#FFFFFF"}
                          stroke="var(--primary-color)"
                          strokeWidth="2"
                          style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                          onMouseEnter={() => setHoveredTrend(idx)}
                          onMouseLeave={() => setHoveredTrend(null)}
                        />
                      ))}
                    </g>
                  );
                })()}

                {/* X-axis labels */}
                {monthlyTrends.map((t, idx) => {
                  const x = 50 + idx * 48;
                  return (
                    <text key={idx} x={x} y="145" fill="var(--text-main)" fontSize="8.5" fontWeight="600" textAnchor="middle">
                      {t.label}
                    </text>
                  );
                })}

                {/* X-axis line */}
                <line x1="35" y1="130" x2="300" y2="130" stroke="var(--border-color)" strokeWidth="1.5" />

                {/* Tooltip Overlay */}
                {hoveredTrend !== null && (
                  <g>
                    <rect 
                      x={Math.max(10, Math.min(230, (50 + hoveredTrend * 48) - 45))} 
                      y={Math.max(5, (130 - ((monthlyTrends[hoveredTrend].val - 3.0) / 2.0) * 100) - 30)} 
                      width="90" 
                      height="22" 
                      rx="3" 
                      fill="var(--text-main)" 
                      opacity="0.95" 
                    />
                    <text 
                      x={Math.max(10, Math.min(230, (50 + hoveredTrend * 48) - 45)) + 45} 
                      y={Math.max(5, (130 - ((monthlyTrends[hoveredTrend].val - 3.0) / 2.0) * 100) - 30) + 14} 
                      fill="#FFF" 
                      fontSize="8" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      {monthlyTrends[hoveredTrend].label}: {monthlyTrends[hoveredTrend].val.toFixed(2)} Rating
                    </text>
                  </g>
                )}

              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: SISTEM SURVEI OTOMATIS PANEL */}
      <div className="table-card" style={{ backgroundColor: 'rgba(59, 130, 246, 0.02)', borderLeft: '4px solid var(--primary-color)' }}>
        <div className="table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCalendarAlt style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }} />
            <div>
              <span className="table-title">Simulasi Pemicu Survei Otomatis (H+1 Check-out)</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Mendeteksi tamu yang check-out kemarin ({formatDate(new Date(new Date(todayStr).getTime() - 24 * 60 * 60 * 1000))}) untuk dikirimi form kepuasan via Email/WA.
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {yesterdayCheckouts.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: 'var(--surface-color)',
              border: '1.5px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              gap: '8px'
            }}>
              <FaInfoCircle style={{ color: 'var(--primary-color)' }} />
              <span>Semua tamu yang check-out kemarin sudah dikirimi survei & merespons.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {yesterdayCheckouts.map((res, idx) => {
                const status = sentSurveyStatus[res.bookingId] || "Belum Dikirim";
                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--surface-color)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{res.guestName}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Tipe: {res.roomType} (Room {res.roomNumber}) | Check-out: {res.checkOut}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: status === "Terkirim" ? "rgba(245, 158, 11, 0.1)" : status === "Selesai" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                        color: status === "Terkirim" ? "var(--warning-color)" : status === "Selesai" ? "var(--secondary-color)" : "var(--text-muted)",
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {status === "Terkirim" ? "Menunggu Umpan Balik..." : status === "Selesai" ? "Umpan Balik Selesai" : "Menunggu Pengiriman"}
                      </span>

                      <button
                        onClick={() => handleSendSurveyInvitation(res)}
                        disabled={status !== "Belum Dikirim"}
                        className="btn-primary"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: status === "Terkirim" ? '#94A3B8' : status === "Selesai" ? '#10B981' : 'var(--primary-color)',
                          cursor: status !== "Belum Dikirim" ? 'default' : 'pointer'
                        }}
                      >
                        {status === "Selesai" ? (
                          <>
                            <FaCheckCircle /> Selesai!
                          </>
                        ) : (
                          <>
                            Kirim Form Survei <FaArrowRight />
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

      {/* ROW 3: SURVEY RESPONSES DIRECTORY */}
      <div className="table-card">
        <div className="table-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
          
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="table-title">Direktori Umpan Balik Tamu</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Seluruh riwayat pengisian kuesioner. Review negatif (&le; 2.0) di-highlight merah untuk ditindaklanjuti.
              </p>
            </div>
          </div>

          {/* Filtering row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="Cari nama atau komentar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--surface-color)',
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

            {/* Filter Date Range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Periode:</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', outline: 'none'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>s/d</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>

            {/* Filter Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaFilter style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                style={{
                  padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', backgroundColor: 'var(--surface-color)', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="Semua">Semua Rating</option>
                <option value="Positif">Positif (&ge; 4.0)</option>
                <option value="Netral">Netral (2.1 - 3.9)</option>
                <option value="Negatif">Negatif (&le; 2.0)</option>
              </select>
            </div>

            {/* Filter Room Type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                style={{
                  padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', backgroundColor: 'var(--surface-color)', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="Semua">Semua Tipe Kamar</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
              </select>
            </div>

          </div>
        </div>

        {/* Responses Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Tamu / Tanggal</th>
                <th style={{ width: '10%' }}>Tipe</th>
                <th style={{ width: '25%' }}>Kategori Penilaian</th>
                <th>Skor Global</th>
                <th style={{ width: '30%' }}>Umpan Balik (Komentar)</th>
                <th>Status Respon</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    Tidak ada respon kuesioner yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((srv, idx) => {
                  const isNegative = srv.overall <= 2.0;
                  return (
                    <tr 
                      key={idx}
                      style={{
                        backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        borderLeft: isNegative ? '4px solid var(--danger-color)' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{srv.guestName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Menginap: {srv.stayDates}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: 'rgba(79, 70, 229, 0.08)',
                          color: 'var(--primary-color)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {srv.roomType}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                          <span>Bersih: <strong>{srv.cleanliness}/5</strong></span>
                          <span>Staf: <strong>{srv.staff}/5</strong></span>
                          <span>Fasilitas: <strong>{srv.facilities}/5</strong></span>
                          <span>Harga: <strong>{srv.value}/5</strong></span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.08)',
                            color: isNegative ? 'var(--danger-color)' : 'var(--primary-color)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isNegative && <FaExclamationTriangle />}
                            {srv.overall.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{srv.comment || 'Tidak ada komentar'}"
                        </div>
                        
                        {/* Display staff response text if exists */}
                        {srv.replied && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            backgroundColor: 'var(--bg-color)',
                            borderLeft: '2.5px solid var(--secondary-color)',
                            borderRadius: '2px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                          }}>
                            <strong>Respon Staf:</strong> "{srv.replyText}"
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: srv.replied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.08)',
                          color: srv.replied ? 'var(--secondary-color)' : 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          {srv.replied ? "Telah Dibalas" : "Belum Dibalas"}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedSurveyToReply(srv)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: srv.replied ? 'rgba(100, 116, 139, 0.08)' : 'rgba(37,99,235,0.08)',
                            color: srv.replied ? 'var(--text-muted)' : 'var(--primary-color)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            margin: '0 auto'
                          }}
                        >
                          <FaReply /> {srv.replied ? "Lihat/Edit" : "Balas"}
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

      {/* POPUP MODAL: BALAS FEEDBACK */}
      {selectedSurveyToReply && (
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
            border: '1px solid var(--border-color)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <button 
              onClick={() => {
                setSelectedSurveyToReply(null);
                setReplyText("");
              }}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', color: 'var(--text-muted)'
              }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
              Respons Masukan Tamu
            </h3>

            {/* Guest Review Summary Card */}
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--bg-color)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-main)' }}>
                <span>{selectedSurveyToReply.guestName} ({selectedSurveyToReply.roomType})</span>
                <span style={{ color: selectedSurveyToReply.overall <= 2.0 ? 'var(--danger-color)' : 'var(--primary-color)' }}>
                  ★ {selectedSurveyToReply.overall.toFixed(1)} / 5.0
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Menginap: {selectedSurveyToReply.stayDates}</p>
              <div style={{ marginTop: '8px', color: 'var(--text-main)', fontStyle: 'italic' }}>
                "{selectedSurveyToReply.comment}"
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Ketik Balasan Anda:
                </label>
                <textarea
                  rows="4"
                  value={replyText || selectedSurveyToReply.replyText || ""}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Kirim ucapan terima kasih atau konfirmasi tindak lanjut atas komplain AC/fasilitas..."
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none',
                    color: 'var(--text-main)'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSurveyToReply(null);
                    setReplyText("");
                  }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--primary-color)'
                  }}
                >
                  Simpan Respons
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
