import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { 
  FaQrcode, FaUtensils, FaBroom, FaComments, 
  FaExclamationTriangle, FaFileInvoiceDollar, FaInfoCircle,
  FaBell, FaChevronRight, FaSignOutAlt, FaClock
} from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

// ── In-Stay Quick Access Button ─────────────────────────────────────────────
function InStayShortcut({ icon, label, onClick, color, bg }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: "#fff", border: `1px solid ${BORDER}`,
      borderRadius: "16px", padding: "20px 12px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
      cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "inherit",
      boxShadow: "0 2px 8px rgba(30,58,95,0.04)"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,58,95,0.1)"; e.currentTarget.style.borderColor = color; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,58,95,0.04)"; e.currentTarget.style.borderColor = BORDER; }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
        {icon}
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: NAVY, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

// ── Active Request Item ──────────────────────────────────────────────────────
function ActiveRequest({ title, status, time, type }) {
  const statusColors = {
    "Diproses": { bg: "#FEF3C7", text: "#F59E0B" },
    "Disiapkan": { bg: "#E0F2FE", text: "#0EA5E9" },
    "Selesai": { bg: "#D1FAE5", text: "#10B981" }
  };
  const sc = statusColors[status] || { bg: "#F3F4F6", text: "#6B7280" };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", backgroundColor: "#F8FAFC", borderRadius: "12px", marginBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ color: NAVY, fontSize: "1.2rem", padding: "10px", backgroundColor: "#fff", borderRadius: "10px", border: `1px solid ${BORDER}` }}>
          {type === "food" ? <FaUtensils /> : type === "clean" ? <FaBroom /> : <FaExclamationTriangle />}
        </div>
        <div>
          <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{title}</h4>
          <span style={{ fontSize: "0.75rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}><FaClock /> {time}</span>
        </div>
      </div>
      <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: sc.bg, color: sc.text }}>{status}</span>
    </div>
  );
}

export default function GuestInStayDashboard({ activeReservation }) {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();

  const [showQR, setShowQR] = useState(false);

  // Hitung sisa hari
  const today = new Date();
  const checkOutDate = new Date(activeReservation.checkOut);
  const diffDays = Math.ceil((checkOutDate - today) / (1000 * 60 * 60 * 24));
  const isCheckOutDay = diffDays <= 0;

  const shortcuts = [
    { icon: <FaUtensils />, label: "Pesan Makan", color: "#F59E0B", bg: "#FEF3C7", path: "/guest/layanan/makanan" },
    { icon: <FaBroom />, label: "Housekeeping", color: "#10B981", bg: "#D1FAE5", path: "/guest/layanan/housekeeping" },
    { icon: <FaComments />, label: "Chat Resepsionis", color: "#0EA5E9", bg: "#E0F2FE", path: "/guest/chat" },
    { icon: <FaExclamationTriangle />, label: "Lapor Masalah", color: "#EF4444", bg: "#FEE2E2", path: "/guest/keluhan" },
    { icon: <FaFileInvoiceDollar />, label: "Tagihan Saya", color: NAVY, bg: "#EBF0F8", path: "/guest/tagihan" },
    { icon: <FaInfoCircle />, label: "Info Fasilitas", color: "#7C3AED", bg: "#EDE9FE", path: "/guest/fasilitas" },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      
      {/* 1. Stay Info Card */}
      <div style={{ 
        background: `linear-gradient(135deg, ${NAVY} 0%, #2E5490 100%)`, 
        borderRadius: "20px", padding: "28px", color: "#fff", marginBottom: "28px",
        position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(30,58,95,0.2)"
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-30px", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(201,168,76,0.15)", filter: "blur(20px)" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10B981", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "1px" }}>Sedang Menginap</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 900 }}>{activeReservation.roomType}</h1>
            <p style={{ margin: 0, fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Kamar <strong style={{ color: "#fff" }}>{activeReservation.roomNumber}</strong></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Sisa Waktu</p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: GOLD }}>
              {isCheckOutDay ? "Hari Terakhir" : `${diffDays} Hari`}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)" }}>Check-in</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{activeReservation.checkIn}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)" }}>Check-out</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{activeReservation.checkOut} (12:00)</p>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start", marginBottom: "28px" }}>
        
        {/* 2. Digital Room Key */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "24px", textAlign: "center", boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Kunci Digital</h3>
          <p style={{ margin: "0 0 20px", fontSize: "0.8rem", color: "#6B7280" }}>Tap QR Code ke pintu kamar</p>
          
          <div onClick={() => setShowQR(!showQR)} style={{ width: "160px", height: "160px", margin: "0 auto", backgroundColor: showQR ? "#fff" : "#F8FAFC", borderRadius: "16px", border: `2px dashed ${showQR ? NAVY : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s" }}>
            {showQR ? (
              <FaQrcode style={{ fontSize: "8rem", color: NAVY }} />
            ) : (
              <div style={{ color: NAVY, fontWeight: 700, fontSize: "0.9rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <FaQrcode style={{ fontSize: "2rem" }} />
                <span>Tampilkan QR</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Quick Access Menu */}
        <div>
          <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Akses Cepat</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {shortcuts.map((sc, i) => <InStayShortcut key={i} {...sc} onClick={() => navigate(sc.path)} />)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* 4. Active Requests */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Permintaan Aktif</h3>
            <button style={{ background: "none", border: "none", color: GOLD, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Lihat Semua</button>
          </div>
          
          {/* Mock active requests */}
          <ActiveRequest title="Handuk tambahan" status="Diproses" time="10:45 AM" type="clean" />
          <ActiveRequest title="Nasi Goreng Spesial" status="Disiapkan" time="11:15 AM" type="food" />
        </div>

        {/* 5. Notifications */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Pesan & Info</h3>
            <div style={{ backgroundColor: "#FEE2E2", color: "#EF4444", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800 }}>1 Baru</div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", paddingBottom: "12px", borderBottom: `1px solid ${BORDER}`, marginBottom: "12px" }}>
            <div style={{ color: GOLD, fontSize: "1.2rem", marginTop: "2px" }}><FaBell /></div>
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>Promo Happy Hour Spa</h4>
              <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#6B7280" }}>Diskon 30% untuk pijat di jam 14:00 - 16:00. Pesan sekarang!</p>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>10 menit lalu</span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ color: "#10B981", fontSize: "1.2rem", marginTop: "2px" }}><FaComments /></div>
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>Resepsionis</h4>
              <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#6B7280" }}>Permintaan sarapan Anda telah kami jadwalkan jam 07:00 besok.</p>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Kemarin, 20:15</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Check-out Button */}
      {isCheckOutDay && (
        <div style={{ marginTop: "28px", backgroundColor: "#FEE2E2", borderRadius: "20px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #FCA5A5" }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: "#991B1B" }}>Waktunya Check-out</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#B91C1C" }}>Terima kasih telah menginap. Silakan selesaikan proses check-out sebelum jam 12:00 siang.</p>
          </div>
          <button onClick={() => navigate("/guest/checkinout")} style={{ padding: "14px 28px", borderRadius: "12px", backgroundColor: "#DC2626", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}>
            <FaSignOutAlt /> Check-out Sekarang
          </button>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .gp-shortcuts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
