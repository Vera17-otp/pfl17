import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGift, FaCrown, FaStar, FaCoffee, FaBed, FaClock, FaLock, FaUtensils, FaTicketAlt } from "react-icons/fa";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";
const SILVER = "#94A3B8";
const PLATINUM = "#334155";

const REWARDS = [
  { id: 1, title: "Diskon Menginap 10%", pts: 500, icon: <FaTicketAlt />, desc: "Potongan harga 10% untuk pemesanan kamar berikutnya.", isPremiumOnly: false },
  { id: 2, title: "Sarapan Gratis 2 Pax", pts: 800, icon: <FaCoffee />, desc: "Voucher sarapan prasmanan di Restoran Sky Rooftop.", isPremiumOnly: false },
  { id: 3, title: "Voucher Menginap 1 Malam", pts: 5000, icon: <FaBed />, desc: "Gratis menginap 1 malam di tipe kamar Deluxe.", isPremiumOnly: false },
  { id: 4, title: "Upgrade Kamar ke Suite", pts: 2000, icon: <FaCrown />, desc: "Nikmati kenyamanan ekstra di kamar suite kami.", isPremiumOnly: true },
  { id: 5, title: "Voucher Spa 50%", pts: 600, icon: <FaStar />, desc: "Manjakan diri Anda dengan diskon 50% di Lotus Spa.", isPremiumOnly: true },
  { id: 6, title: "Makan Malam Romantis", pts: 1500, icon: <FaUtensils />, desc: "Paket makan malam eksklusif untuk 2 orang.", isPremiumOnly: true },
  { id: 7, title: "Late Check-out (15:00)", pts: 500, icon: <FaClock />, desc: "Perpanjang waktu bersantai Anda hingga jam 3 sore.", isPremiumOnly: true }
];

const RAW_HISTORY = [
  { date: "16 Jun 2026", month: "06", year: "2026", desc: "Bonus Survei Kepuasan", pts: "+50", type: "earn" },
  { date: "16 Jun 2026", month: "06", year: "2026", desc: "Menginap di Deluxe Room (2 Malam)", pts: "+400", type: "earn" },
  { date: "10 Feb 2026", month: "02", year: "2026", desc: "Menginap di Executive Suite (2 Malam)", pts: "+800", type: "earn" },
  { date: "10 Feb 2026", month: "02", year: "2026", desc: "Tukar Poin - Late Check-out", pts: "-500", type: "spend" },
  { date: "05 Jan 2026", month: "01", year: "2026", desc: "Menginap di Standard Room (1 Malam)", pts: "+150", type: "earn" }
];

export default function GuestLoyalty() {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  
  const isPremium = profile?.isPremium;
  const userPoints = profile?.poin || 0;
  
  const [activeTab, setActiveTab] = useState("katalog");
  const [monthFilter, setMonthFilter] = useState("all");
  const [showTierModal, setShowTierModal] = useState(false);
  const [newTier, setNewTier] = useState("");

  // Tier calculation
  let currentTier = "Basic";
  let nextTier = "Silver";
  let nextTierPoints = 0;
  let tierColor = "#4B5563"; // Default gray

  if (isPremium) {
    if (userPoints >= 20000) {
      currentTier = "Platinum";
      nextTier = "Maksimal";
      nextTierPoints = 20000;
      tierColor = PLATINUM;
    } else if (userPoints >= 5000) {
      currentTier = "Gold";
      nextTier = "Platinum";
      nextTierPoints = 20000;
      tierColor = GOLD;
    } else {
      currentTier = "Silver";
      nextTier = "Gold";
      nextTierPoints = 5000;
      tierColor = SILVER;
    }
  }

  const progress = isPremium && nextTier !== "Maksimal" 
    ? (userPoints / nextTierPoints) * 100 
    : 100;

  const handleRedeem = (item) => {
    if (userPoints >= item.pts) {
      if (window.confirm(`Apakah Anda yakin ingin menukar ${item.pts} poin untuk ${item.title}?`)) {
        alert("Permintaan penukaran berhasil dikirim! Staf kami akan segera memprosesnya.");
        
        // Simulasi naik tier (hanya untuk demo)
        if (isPremium && currentTier === "Silver" && userPoints + 100 > 5000) {
           setNewTier("Gold");
           setShowTierModal(true);
        }
      }
    } else {
      alert("Maaf, poin Anda tidak mencukupi untuk reward ini.");
    }
  };

  const filteredHistory = useMemo(() => {
    if (monthFilter === "all") return RAW_HISTORY;
    return RAW_HISTORY.filter(h => h.month === monthFilter);
  }, [monthFilter]);

  const canAfford = (requiredPoints) => {
    return (userPoints ?? 0) >= requiredPoints;
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Poin & Reward Saya</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Keuntungan eksklusif untuk pelanggan setia</p>
        </div>
      </div>

      {/* Profil Membership Card */}
      <div style={{ 
        background: isPremium 
          ? `linear-gradient(135deg, ${tierColor} 0%, #111827 100%)` 
          : `linear-gradient(135deg, #4B5563 0%, #1F2937 100%)`, 
        borderRadius: "20px", padding: "32px", color: "#fff", position: "relative", overflow: "hidden", 
        boxShadow: isPremium ? `0 10px 30px ${tierColor}40` : "0 10px 30px rgba(0,0,0,0.1)", 
        marginBottom: "24px" 
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-30px", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(20px)" }} />
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", backgroundColor: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: "20px", width: "fit-content" }}>
              {isPremium ? <FaCrown style={{ color: tierColor === PLATINUM ? "#E5E4E2" : tierColor === GOLD ? "#FFE066" : "#E2E8F0" }} /> : <FaStar style={{ color: "#E2E8F0" }} />}
              <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                {isPremium ? `${currentTier} Member` : "Akun Gratis"}
              </span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>Total Poin Aktif</p>
            <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: 900, textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>{userPoints.toLocaleString("id-ID")}</h1>
          </div>

          {isPremium ? (
            <div style={{ minWidth: "250px", flex: 1, maxWidth: "350px", backgroundColor: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>
                <span>Menuju {nextTier}</span>
                <span>{nextTier !== "Maksimal" ? nextTierPoints.toLocaleString("id-ID") + " pts" : "Maksimal"}</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ width: `${progress}%`, height: "100%", backgroundColor: tierColor === PLATINUM ? "#E5E4E2" : tierColor === GOLD ? "#FFE066" : "#F8FAFC", borderRadius: "4px" }} />
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
                {nextTier !== "Maksimal" 
                  ? `Dapatkan ${(nextTierPoints - userPoints).toLocaleString("id-ID")} poin lagi untuk naik tingkat.` 
                  : "Anda telah mencapai tier tertinggi!"}
              </p>
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.75rem", color: "#D1FAE5", fontWeight: 600 }}>
                ✓ Setiap transaksi Anda mendapat poin 2× lipat dibanding akun gratis
              </div>
            </div>
          ) : (
             <div style={{ minWidth: "250px", flex: 1, maxWidth: "350px", backgroundColor: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "16px", backdropFilter: "blur(10px)", border: "1px dashed rgba(255,255,255,0.3)" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.95rem", fontWeight: 800 }}>Tingkatkan Pengalaman Anda!</h4>
                <p style={{ margin: "0 0 16px", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                  Upgrade ke Premium untuk membuka semua reward VIP dan dapatkan poin 2× lipat dari setiap transaksi.
                </p>
                <button onClick={() => navigate("/guest/membership")} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: GOLD, color: NAVY, fontWeight: 800, border: "none", cursor: "pointer" }}>
                  Upgrade ke Premium
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: `2px solid ${BORDER}` }}>
        <button onClick={() => setActiveTab("katalog")} style={{ padding: "12px 24px", border: "none", background: "none", fontSize: "0.95rem", fontWeight: 800, color: activeTab === "katalog" ? NAVY : "#94A3B8", borderBottom: activeTab === "katalog" ? `3px solid ${NAVY}` : "3px solid transparent", marginBottom: "-2px", cursor: "pointer", transition: "all 0.2s" }}>
          Katalog Reward
        </button>
        <button onClick={() => setActiveTab("riwayat")} style={{ padding: "12px 24px", border: "none", background: "none", fontSize: "0.95rem", fontWeight: 800, color: activeTab === "riwayat" ? NAVY : "#94A3B8", borderBottom: activeTab === "riwayat" ? `3px solid ${NAVY}` : "3px solid transparent", marginBottom: "-2px", cursor: "pointer", transition: "all 0.2s" }}>
          Riwayat Poin
        </button>
      </div>

      {/* Tab Konten: Katalog */}
      {activeTab === "katalog" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {REWARDS.map(item => {
            const content = (
              <div style={{ 
                backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, 
                padding: "24px", display: "flex", flexDirection: "column", 
                boxShadow: "0 2px 12px rgba(30,58,95,0.03)", position: "relative", overflow: "hidden", height: "100%"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "#F8FAFC", color: GOLD, fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>{item.title}</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 900, color: GOLD }}>{item.pts.toLocaleString("id-ID")} Pts</p>
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.5, marginBottom: "24px", flex: 1 }}>{item.desc}</p>
                <button 
                  onClick={() => handleRedeem(item)} 
                  disabled={!canAfford(item.pts)}
                  style={{ 
                    width: "100%", padding: "12px", borderRadius: "10px", 
                    border: `1px solid ${canAfford(item.pts) ? NAVY : "#CBD5E1"}`, 
                    backgroundColor: canAfford(item.pts) ? NAVY : "#F8FAFC", 
                    color: canAfford(item.pts) ? "#fff" : "#94A3B8", 
                    fontSize: "0.9rem", fontWeight: 800, 
                    cursor: !canAfford(item.pts) ? "not-allowed" : "pointer", transition: "all 0.2s" 
                  }}>
                  {canAfford(item.pts) ? <><FaGift style={{ marginRight: "6px" }} /> Tukar Reward</> : "Poin Tidak Cukup"}
                </button>
              </div>
            );

            return item.isPremiumOnly ? (
              <PremiumLockOverlay key={item.id}>
                {content}
              </PremiumLockOverlay>
            ) : (
              <div key={item.id} style={{ height: "100%" }}>
                {content}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Konten: Riwayat */}
      {activeTab === "riwayat" && (
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 2px 12px rgba(30,58,95,0.03)" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Aktivitas Poin</h3>
            {isPremium && (
              <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.85rem", color: NAVY, fontWeight: 600 }}>
                <option value="all">Semua Bulan</option>
                <option value="06">Juni 2026</option>
                <option value="02">Februari 2026</option>
                <option value="01">Januari 2026</option>
              </select>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredHistory.length > 0 ? filteredHistory.map((h, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: idx !== filteredHistory.length - 1 ? `1px dashed ${BORDER}` : "none", paddingBottom: idx !== filteredHistory.length - 1 ? "16px" : "0" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: NAVY }}>{h.desc}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8" }}>{h.date}</p>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 900, color: h.type === "earn" ? "#10B981" : "#EF4444", padding: "4px 12px", backgroundColor: h.type === "earn" ? "#D1FAE5" : "#FEE2E2", borderRadius: "8px" }}>
                  {h.pts}
                </span>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: "0.9rem" }}>
                Tidak ada riwayat pada bulan ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Naik Tier */}
      {showTierModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30,58,95,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "24px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: `${GOLD}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
               <FaCrown style={{ fontSize: "3rem", color: GOLD }} />
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Selamat!</h2>
            <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.6 }}>
              Anda telah naik level menjadi <strong style={{ color: NAVY }}>{newTier} Member</strong>. Nikmati berbagai keistimewaan dan benefit baru yang telah terbuka untuk Anda.
            </p>
            <button onClick={() => setShowTierModal(false)} style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: NAVY, color: "#fff", fontWeight: 800, fontSize: "1rem", border: "none", cursor: "pointer" }}>
              Luar Biasa!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
