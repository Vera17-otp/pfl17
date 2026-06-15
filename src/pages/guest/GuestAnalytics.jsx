import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaChartLine, FaChartBar, FaFilePdf, FaFileExcel, 
  FaBed, FaCalendarCheck, FaRegMoneyBillAlt, FaChartPie, FaCrown
} from "react-icons/fa";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { rooms } from "../../data/rooms";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

// --- Mock Data Analytics ---
const MOCK_STATS = {
  totalNights: 24,
  totalSpend: 34500000,
  avgDuration: 2.8,
  visitsThisYear: 6,
  visitsLastYear: 4,
  spendThisYear: 18500000,
  spendLastYear: 16000000,
};

const MONTHLY_SPEND = [
  { month: "Jan", val: 1500000 },
  { month: "Feb", val: 0 },
  { month: "Mar", val: 4200000 },
  { month: "Apr", val: 0 },
  { month: "Mei", val: 6500000 },
  { month: "Jun", val: 6300000 },
  { month: "Jul", val: 0 },
  { month: "Ags", val: 3200000 },
  { month: "Sep", val: 0 },
  { month: "Okt", val: 5100000 },
  { month: "Nov", val: 0 },
  { month: "Des", val: 7700000 },
];

const ROOM_PREFS = [
  { type: "Deluxe Room", pct: 60, color: NAVY },
  { type: "Suite Room", pct: 25, color: GOLD },
  { type: "Standard Room", pct: 15, color: "#94A3B8" }
];

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function GuestAnalytics() {
  const navigate = useNavigate();
  const { profile, isPremium } = useGuestAuth();
  
  const premiumStatus = typeof isPremium === "function" ? isPremium() : isPremium;
  const [viewMode, setViewMode] = useState("monthly"); // monthly | yearly

  // Helper untuk max value chart bulanan
  const maxSpend = Math.max(...MONTHLY_SPEND.map(m => m.val));

  // Rekomendasi (ambil 3 kamar)
  const recommendedRooms = rooms.slice(0, 3);

  const handleExport = (type) => {
    alert(`Laporan Anda sedang di-generate dan akan segera diunduh dalam format ${type}.`);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ margin: "0", fontSize: "1.6rem", fontWeight: 900, color: NAVY }}>Analitik Pribadi</h1>
            {premiumStatus && <FaCrown style={{ color: GOLD, fontSize: "1.2rem" }} />}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#6B7280" }}>Wawasan mendalam dari histori menginap Anda</p>
        </div>
      </div>

      <PremiumLockOverlay>
        {/* 1. Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#EBF0F8", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: "12px" }}>
              <FaBed />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Total Malam Inap</p>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: NAVY }}>{MOCK_STATS.totalNights}</h2>
          </div>
          
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#FEF3C7", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: "12px" }}>
              <FaRegMoneyBillAlt />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Total Pengeluaran</p>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: NAVY }}>{rp(MOCK_STATS.totalSpend)}</h2>
          </div>
          
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#EBF0F8", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: "12px" }}>
              <FaCalendarCheck />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Rata-rata Durasi Inap</p>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: NAVY }}>{MOCK_STATS.avgDuration} <span style={{ fontSize: "0.9rem", color: "#94A3B8", fontWeight: 600 }}>mlm</span></h2>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F3F4F6", color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", marginBottom: "12px" }}>
              <FaChartLine />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Kunjungan (Tahun Ini vs Lalu)</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: NAVY }}>{MOCK_STATS.visitsThisYear}</h2>
              <span style={{ fontSize: "0.9rem", color: "#6B7280", fontWeight: 600 }}>vs {MOCK_STATS.visitsLastYear}</span>
              <span style={{ fontSize: "0.75rem", backgroundColor: "#D1FAE5", color: "#059669", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>+50%</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "32px", alignItems: "start" }}>
          {/* 2. Grafik Pengeluaran Bulanan */}
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Grafik Pengeluaran</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>12 Bulan Terakhir</p>
              </div>
              <div style={{ display: "flex", backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "4px" }}>
                 <button onClick={() => setViewMode("monthly")} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: viewMode === "monthly" ? "#fff" : "transparent", color: viewMode === "monthly" ? NAVY : "#94A3B8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", boxShadow: viewMode === "monthly" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>Bulanan</button>
                 <button onClick={() => setViewMode("yearly")} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: viewMode === "yearly" ? "#fff" : "transparent", color: viewMode === "yearly" ? NAVY : "#94A3B8", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", boxShadow: viewMode === "yearly" ? "0 2px 4px rgba(0,0,0,0.05)" : "none" }}>Tahunan</button>
              </div>
            </div>

            <div style={{ height: "220px", display: "flex", alignItems: "flex-end", gap: "8px", paddingTop: "20px", borderBottom: `2px solid ${BORDER}`, paddingBottom: "8px" }}>
               {MONTHLY_SPEND.map((data, idx) => {
                 const heightPct = data.val > 0 ? (data.val / maxSpend) * 100 : 0;
                 return (
                   <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                     {data.val > 0 && <span style={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 700, transform: "rotate(-45deg)", marginBottom: "4px" }}>{data.val/1000000}M</span>}
                     <div style={{ 
                       width: "100%", maxWidth: "30px", height: `${heightPct}%`, minHeight: data.val > 0 ? "4px" : "0", 
                       backgroundColor: data.val === maxSpend ? GOLD : NAVY, borderRadius: "4px 4px 0 0", transition: "height 0.5s ease" 
                     }} />
                   </div>
                 );
               })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              {MONTHLY_SPEND.map((data, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "#6B7280", fontWeight: 600 }}>{data.month}</div>
              ))}
            </div>
          </div>

          {/* 3. Tipe Kamar Favorit */}
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#EBF0F8", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}><FaChartPie /></div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Kamar Favorit</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {ROOM_PREFS.map((pref, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>
                    <span>{pref.type}</span>
                    <span>{pref.pct}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${pref.pct}%`, height: "100%", backgroundColor: pref.color, borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "24px", fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.5, backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${GOLD}` }}>
              Anda paling sering memesan kamar Deluxe. Pertimbangkan untuk upgrade ke Suite pada kunjungan berikutnya untuk pengalaman ekstra.
            </p>
          </div>
        </div>

        {/* 5. Perbandingan YoY */}
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Perbandingan Year-over-Year (YoY)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: `1px dashed ${BORDER}` }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6B7280", marginBottom: "12px" }}>Total Pengeluaran</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "2px" }}>Tahun Ini</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: NAVY }}>{rp(MOCK_STATS.spendThisYear)}</div>
                </div>
                <div style={{ width: "1px", height: "30px", backgroundColor: "#E2E8F0" }} />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "2px" }}>Tahun Lalu</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6B7280" }}>{rp(MOCK_STATS.spendLastYear)}</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "inline-block", backgroundColor: "#D1FAE5", color: "#059669", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 }}>
                +15.6% Naik
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: `1px dashed ${BORDER}` }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6B7280", marginBottom: "12px" }}>Total Malam Menginap</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "2px" }}>Tahun Ini</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: NAVY }}>{MOCK_STATS.visitsThisYear} Malam</div>
                </div>
                <div style={{ width: "1px", height: "30px", backgroundColor: "#E2E8F0" }} />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: "2px" }}>Tahun Lalu</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6B7280" }}>{MOCK_STATS.visitsLastYear} Malam</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "inline-block", backgroundColor: "#D1FAE5", color: "#059669", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 }}>
                +50% Naik
              </div>
            </div>

          </div>
        </div>

        {/* 4. Rekomendasi Personal */}
        <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 900, color: NAVY }}>Rekomendasi Personal Anda</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {recommendedRooms.map(room => (
            <div key={room.roomId} style={{ backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
              <div style={{ height: "120px", backgroundColor: "#EBF0F8", position: "relative" }}>
                 <img src={room.image} alt={room.type} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                 <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: GOLD, color: NAVY, fontSize: "0.65rem", fontWeight: 800, padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                   <FaCrown /> Cocok untukmu
                 </div>
              </div>
              <div style={{ padding: "16px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 800, color: NAVY }}>{room.type}</h4>
                <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#6B7280" }}>Sesuai dengan riwayat pencarian Anda.</p>
                <button onClick={() => navigate(`/guest/kamar/${room.roomId}`)} style={{ width: "100%", padding: "8px", borderRadius: "8px", backgroundColor: "transparent", border: `1px solid ${NAVY}`, color: NAVY, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>Lihat Kamar</button>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Export Data */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
           <button onClick={() => handleExport('PDF')} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "10px", backgroundColor: "#fff", border: `1.5px solid ${BORDER}`, color: NAVY, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,58,95,0.05)" }}>
             <FaFilePdf style={{ color: "#EF4444" }} /> Export ke PDF
           </button>
           <button onClick={() => handleExport('Excel')} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "10px", backgroundColor: "#10B981", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }}>
             <FaFileExcel /> Export ke Excel
           </button>
        </div>
      </PremiumLockOverlay>
    </div>
  );
}
