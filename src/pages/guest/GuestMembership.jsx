import { useState } from "react";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaCrown, FaStar, FaChevronDown, FaChevronUp } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const COMPARISON_DATA = [
  { feature: "Riwayat Booking", free: "3 Terakhir", premium: "Tak Terbatas" },
  { feature: "Harga Kamar", free: "Harga Normal", premium: "Diskon Eksklusif Member" },
  { feature: "Early Check-in / Late Check-out", free: <FaTimes color="#EF4444" />, premium: "Ya (Sesuai Ketersediaan)" },
  { feature: "Upgrade Kamar Gratis", free: <FaTimes color="#EF4444" />, premium: "Ya (Sesuai Ketersediaan)" },
  { feature: "Poin Reward", free: "1×", premium: "2× Lipat" },
  { feature: "Katalog Reward", free: "Terbatas", premium: "Semua (termasuk Spa & Dining)" },
  { feature: "Tier Keanggotaan", free: <FaTimes color="#EF4444" />, premium: "Silver / Gold / Platinum" },
  { feature: "Analitik Pribadi (Statistik & Laporan)", free: <FaTimes color="#EF4444" />, premium: <FaCheck color="#10B981" /> },
  { feature: "Export Data (PDF & Excel)", free: <FaTimes color="#EF4444" />, premium: <FaCheck color="#10B981" /> },
  { feature: "Notifikasi Promo Eksklusif", free: <FaTimes color="#EF4444" />, premium: <FaCheck color="#10B981" /> }
];

const FAQ_DATA = [
  { q: "Bagaimana cara berhenti berlangganan?", a: "Anda dapat membatalkan langganan kapan saja melalui halaman Profil Anda. Langganan Anda akan tetap aktif hingga akhir periode penagihan saat ini." },
  { q: "Apakah poin saya akan hangus jika berhenti Premium?", a: "Tidak. Poin yang sudah Anda kumpulkan tetap menjadi milik Anda, namun pengumpulan poin Anda selanjutnya akan kembali ke rasio 1× (Free)." },
  { q: "Apakah saya bisa upgrade dari Bulanan ke Tahunan?", a: "Ya, Anda bisa upgrade kapan saja. Sisa hari pada langganan bulanan Anda akan diakumulasikan sebagai potongan harga pada tagihan tahunan Anda." },
  { q: "Seberapa sering diskon eksklusif diberikan?", a: "Diskon eksklusif selalu tersedia untuk setiap pemesanan langsung melalui aplikasi, selain itu kami mengirim penawaran musiman sebulan dua kali." }
];

function FAQAccordion({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "16px 0" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: NAVY }}>
        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{faq.q}</h4>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {open && <p style={{ margin: "12px 0 0", fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.6 }}>{faq.a}</p>}
    </div>
  );
}

export default function GuestMembership() {
  const { profile, updateProfile } = useGuestAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = (paket) => {
    setIsProcessing(true);
    setTimeout(() => {
      navigate(`/guest/membership/payment/${paket}`);
    }, 500);
  };

  const handleCancel = () => {
    if(window.confirm("Apakah Anda yakin ingin membatalkan keanggotaan Premium? Anda akan kehilangan manfaat eksklusif setelah periode aktif berakhir.")) {
      updateProfile({ isPremium: false, premiumExpiry: null });
    }
  };

  // --- VIEW: DASHBOARD PREMIUM AKTIF ---
  if (profile?.isPremium) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <FaCrown style={{ color: GOLD, fontSize: "1.8rem" }} />
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Keanggotaan Premium</h1>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2a5286 100%)`, borderRadius: "20px", padding: "40px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(30,58,95,0.2)" }}>
          <div style={{ position: "absolute", top: "-50px", right: "-30px", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(201,168,76,0.15)", filter: "blur(20px)" }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-block", padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              <span style={{ color: "#10B981", marginRight: "6px" }}>●</span> Status: Aktif
            </div>
            
            <h2 style={{ margin: "0 0 8px", fontSize: "2rem", fontWeight: 900 }}>HotelQu Premium</h2>
            <p style={{ margin: "0 0 32px", fontSize: "1rem", color: "rgba(255,255,255,0.8)" }}>Nikmati layanan eksklusif tak tertandingi dalam setiap kunjungan Anda.</p>
            
            <div style={{ display: "flex", gap: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Diperpanjang pada</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>{profile.premiumExpiry || "16 Juni 2027"}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Plan Aktif</p>
                <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Tahunan</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleCancel} style={{ padding: "10px 20px", backgroundColor: "transparent", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#FEE2E2"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
            Batalkan Langganan
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: LANDING PAGE PENJUALAN PREMIUM ---
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {/* 1. Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "48px", paddingTop: "20px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#FEF3C7", color: "#B45309", borderRadius: "20px", fontWeight: 800, fontSize: "0.85rem", marginBottom: "16px", border: `1px solid ${GOLD}` }}>
          <FaStar /> PENAWARAN TERBATAS
        </div>
        <h1 style={{ margin: "0 0 16px", fontSize: "2.4rem", fontWeight: 900, color: NAVY, lineHeight: 1.2 }}>
          Nikmati Lebih Banyak dengan<br/><span style={{ color: GOLD }}>HotelQu Premium</span>
        </h1>
        <p style={{ margin: "0 auto 32px", fontSize: "1.05rem", color: "#6B7280", maxWidth: "600px", lineHeight: 1.6 }}>
          Tingkatkan pengalaman menginap Anda dengan akses eksklusif ke diskon khusus, layanan prioritas, dan hadiah yang lebih cepat.
        </p>
      </div>

      {/* 2. Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
        
        {/* Bulanan */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "32px", textAlign: "center", boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>Paket Bulanan</h3>
          <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6B7280" }}>Fleksibilitas penuh, bayar per bulan.</p>
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: NAVY }}>Rp 99rb</span><span style={{ color: "#94A3B8" }}>/bln</span>
          </div>
          <button onClick={() => handleSubscribe("bulanan")} disabled={isProcessing} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `2px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 800, fontSize: "1rem", cursor: isProcessing ? "wait" : "pointer", transition: "all 0.2s" }} onMouseOver={e => !isProcessing && (e.currentTarget.style.backgroundColor = "#F8FAFC")} onMouseOut={e => !isProcessing && (e.currentTarget.style.backgroundColor = "transparent")}>
            {isProcessing ? "Memproses..." : "Pilih Paket Bulanan"}
          </button>
        </div>

        {/* Tahunan */}
        <div style={{ backgroundColor: NAVY, borderRadius: "20px", border: `2px solid ${GOLD}`, padding: "32px", textAlign: "center", boxShadow: "0 10px 30px rgba(30,58,95,0.2)", position: "relative" }}>
          <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", backgroundColor: GOLD, color: "#fff", padding: "4px 16px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
            Paling Hemat 33%
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>Paket Tahunan</h3>
          <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Investasi terbaik untuk traveller reguler.</p>
          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff" }}>Rp 799rb</span><span style={{ color: "rgba(255,255,255,0.5)" }}>/thn</span>
          </div>
          <button onClick={() => handleSubscribe("tahunan")} disabled={isProcessing} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", backgroundColor: GOLD, color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: isProcessing ? "wait" : "pointer", transition: "transform 0.2s", boxShadow: "0 4px 12px rgba(201,168,76,0.3)" }} onMouseOver={e => !isProcessing && (e.currentTarget.style.transform = "scale(1.02)")} onMouseOut={e => !isProcessing && (e.currentTarget.style.transform = "scale(1)")}>
            {isProcessing ? "Memproses..." : "Pilih Paket Tahunan"}
          </button>
        </div>

      </div>

      {/* 3. Comparison Table */}
      <div style={{ marginBottom: "60px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 900, color: NAVY, marginBottom: "32px" }}>Bandingkan Fitur</h2>
        
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(30,58,95,0.03)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", backgroundColor: "#F8FAFC", padding: "20px", borderBottom: `2px solid ${BORDER}`, fontWeight: 800, color: NAVY }}>
            <div>Fitur</div>
            <div style={{ textAlign: "center" }}>Free</div>
            <div style={{ textAlign: "center", color: GOLD }}><FaCrown style={{ marginRight: "4px" }} /> Premium</div>
          </div>
          
          {COMPARISON_DATA.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "16px 20px", borderBottom: idx !== COMPARISON_DATA.length - 1 ? `1px solid ${BORDER}` : "none", alignItems: "center", fontSize: "0.95rem" }}>
              <div style={{ fontWeight: 600, color: NAVY }}>{item.feature}</div>
              <div style={{ textAlign: "center", color: "#6B7280" }}>{item.free}</div>
              <div style={{ textAlign: "center", fontWeight: 700, color: NAVY }}>{item.premium}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FAQ */}
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 900, color: NAVY, marginBottom: "24px" }}>Pertanyaan Umum</h2>
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "24px", boxShadow: "0 4px 20px rgba(30,58,95,0.03)" }}>
          {FAQ_DATA.map((faq, idx) => (
            <FAQAccordion key={idx} faq={faq} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          form > div:first-child { grid-template-columns: 1fr !important; }
          .gp-shortcuts-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
