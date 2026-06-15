import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHistory, FaCalendarCheck, FaRedoAlt, FaFileInvoiceDollar, FaStar, FaLock, FaCrown } from "react-icons/fa";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const MOCK_HISTORY = [
  { id: "RES-10024A", date: "14 Jun 2026 - 16 Jun 2026", type: "Deluxe Room", nights: 2, status: "Selesai", total: 2908200, hasSurvey: false },
  { id: "RES-09912B", date: "10 Feb 2026 - 12 Feb 2026", type: "Executive Suite", nights: 2, status: "Selesai", total: 4500000, hasSurvey: true },
  { id: "RES-08101C", date: "24 Des 2025 - 26 Des 2025", type: "Deluxe Room", nights: 2, status: "Selesai", total: 3200000, hasSurvey: true },
  { id: "RES-07502D", date: "15 Okt 2025 - 18 Okt 2025", type: "Standard Room", nights: 3, status: "Selesai", total: 3600000, hasSurvey: true },
  { id: "RES-06115E", date: "02 Agu 2025 - 03 Agu 2025", type: "Junior Suite", nights: 1, status: "Selesai", total: 1800000, hasSurvey: true },
];

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function GuestHistory() {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  const [filter, setFilter] = useState("Semua");

  const filteredHistory = MOCK_HISTORY.filter(h => filter === "Semua" || h.status === filter);
  const displayHistory = filteredHistory;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Riwayat Menginap</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Lihat kenangan perjalanan Anda bersama HotelQu</p>
        </div>
      </div>

      {profile?.isPremium && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto" }}>
          {["Semua", "Selesai", "Dibatalkan"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: "20px", border: `1px solid ${filter === f ? NAVY : BORDER}`, backgroundColor: filter === f ? NAVY : "#fff", color: filter === f ? "#fff" : NAVY, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {displayHistory.slice(0, 3).map((item, idx) => (
          <div key={idx} style={{ backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 2px 12px rgba(30,58,95,0.03)", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
            {/* Info Utama */}
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F8FAFC", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                  <FaCalendarCheck />
                </div>
                <div>
                  <h2 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{item.type}</h2>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>{item.date} ({item.nights} Malam)</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.85rem" }}>
                <span style={{ color: "#94A3B8" }}>ID: <strong style={{ color: NAVY }}>{item.id}</strong></span>
                <span style={{ padding: "4px 8px", backgroundColor: "#D1FAE5", color: "#10B981", borderRadius: "6px", fontWeight: 700, fontSize: "0.75rem" }}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Aksi & Harga */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px", flex: "1 1 auto" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: GOLD }}>{rp(item.total)}</span>
              
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button onClick={() => navigate(`/guest/invoice/${item.id}`)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${BORDER}`, backgroundColor: "#fff", color: NAVY, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#F8FAFC"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
                  <FaFileInvoiceDollar /> Struk Digital
                </button>
                
                {!item.hasSurvey && (
                  <button onClick={() => navigate(`/guest/survei/${item.id}`)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${GOLD}`, backgroundColor: "#FEF3C7", color: "#D97706", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}>
                    <FaStar /> Beri Ulasan
                  </button>
                )}

                <button onClick={() => navigate("/guest")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: NAVY, color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,58,95,0.2)" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
                  <FaRedoAlt /> Pesan Lagi
                </button>
              </div>
            </div>
          </div>
        ))}

        {displayHistory.length > 3 && (
          <PremiumLockOverlay>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {displayHistory.slice(3).map((item, idx) => (
                <div key={idx} style={{ backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 2px 12px rgba(30,58,95,0.03)", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ flex: "1 1 300px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F8FAFC", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                        <FaCalendarCheck />
                      </div>
                      <div>
                        <h2 style={{ margin: "0 0 2px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{item.type}</h2>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>{item.date} ({item.nights} Malam)</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.85rem" }}>
                      <span style={{ color: "#94A3B8" }}>ID: <strong style={{ color: NAVY }}>{item.id}</strong></span>
                      <span style={{ padding: "4px 8px", backgroundColor: "#D1FAE5", color: "#10B981", borderRadius: "6px", fontWeight: 700, fontSize: "0.75rem" }}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px", flex: "1 1 auto" }}>
                    <span style={{ fontSize: "1.2rem", fontWeight: 900, color: GOLD }}>{rp(item.total)}</span>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${BORDER}`, backgroundColor: "#fff", color: NAVY, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaFileInvoiceDollar /> Struk Digital
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumLockOverlay>
        )}

        <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
          <FaHistory style={{ fontSize: "2rem", marginBottom: "12px" }} />
          <p style={{ margin: 0, fontSize: "0.9rem" }}>Anda telah melihat semua riwayat menginap Anda.</p>
        </div>
      </div>
    </div>
  );
}
