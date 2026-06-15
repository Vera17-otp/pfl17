import { useState, useEffect } from "react";
import { FaTag, FaCopy, FaSearch, FaGift, FaBell, FaChevronRight, FaChevronLeft } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

// Mock Promo Data
const PROMO_DATA = [
  { id: 1, type: "umum", title: "Diskon Awal Tahun", code: "AWAL26", discount: "15% Off", desc: "Nikmati potongan harga untuk semua tipe kamar. Berlaku hingga 31 Januari.", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, type: "member", title: "Member Exclusive Stay", code: "MEMBER20", discount: "20% Off", desc: "Diskon eksklusif untuk tamu yang memiliki akun di HotelQu.", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, type: "vip", title: "Suite Upgrade Gold", code: "GOLDVIP", discount: "Free Upgrade", desc: "Upgrade kamar gratis ke tipe Suite khusus member Gold/Platinum.", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, type: "ulang tahun", title: "Spesial Ulang Tahun", code: "BDAY26", discount: "25% Off + Cake", desc: "Rayakan hari spesial Anda dengan diskon besar dan kue ulang tahun gratis.", img: "https://images.unsplash.com/photo-1530103862676-de8892ebe819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

export default function GuestPromo() {
  const [filter, setFilter] = useState("semua");
  const [manualCode, setManualCode] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === PROMO_DATA.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Kode promo ${code} berhasil disalin! Anda bisa menempelkannya di halaman Booking.`);
  };

  const handleManualRedeem = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    alert(`Kode ${manualCode} sedang diverifikasi oleh sistem...`);
    setManualCode("");
  };

  const filteredPromos = PROMO_DATA.filter(p => filter === "semua" || p.type === filter);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      
      {/* Notifikasi Baru */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#D1FAE5", padding: "16px", borderRadius: "16px", marginBottom: "24px", border: "1px solid #34D399", color: "#065F46" }}>
        <FaBell style={{ fontSize: "1.2rem", animation: "ring 2s infinite" }} />
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: "0.95rem", fontWeight: 800 }}>Promo Baru Untukmu!</h3>
          <p style={{ margin: 0, fontSize: "0.85rem" }}>Cek penawaran "Spesial Ulang Tahun" di bulan lahirmu.</p>
        </div>
        <style>{`@keyframes ring { 0%,100%{transform:rotate(0)} 10%,30%,50%,70%,90%{transform:rotate(10deg)} 20%,40%,60%,80%{transform:rotate(-10deg)} }`}</style>
      </div>

      {/* Hero Carousel */}
      <div style={{ position: "relative", width: "100%", height: "250px", borderRadius: "20px", overflow: "hidden", marginBottom: "32px", boxShadow: "0 10px 30px rgba(30,58,95,0.15)" }}>
        {PROMO_DATA.map((promo, idx) => (
          <div key={idx} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: currentSlide === idx ? 1 : 0, transition: "opacity 0.8s ease-in-out", backgroundImage: `url(${promo.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(30,58,95,0.9) 0%, rgba(30,58,95,0.4) 100%)" }} />
            <div style={{ position: "absolute", bottom: "40px", left: "40px", color: "#fff", maxWidth: "60%" }}>
              <span style={{ padding: "4px 10px", backgroundColor: GOLD, color: "#fff", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>{promo.type}</span>
              <h1 style={{ margin: "12px 0 8px", fontSize: "1.8rem", fontWeight: 900 }}>{promo.title}</h1>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{promo.desc}</p>
            </div>
          </div>
        ))}
        {/* Slider Controls */}
        <div style={{ position: "absolute", bottom: "20px", right: "40px", display: "flex", gap: "8px" }}>
          {PROMO_DATA.map((_, idx) => (
            <div key={idx} onClick={() => setCurrentSlide(idx)} style={{ width: currentSlide === idx ? "24px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: currentSlide === idx ? GOLD : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Input Kode Manual */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, display: "flex", gap: "12px", marginBottom: "32px", boxShadow: "0 2px 12px rgba(30,58,95,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, backgroundColor: "#F8FAFC", padding: "0 16px", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
          <FaSearch style={{ color: "#94A3B8" }} />
          <input type="text" placeholder="Punya kode promo eksternal?" value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())} style={{ width: "100%", padding: "16px 0", border: "none", background: "none", outline: "none", fontSize: "0.95rem", fontWeight: 600, color: NAVY }} />
        </div>
        <button onClick={handleManualRedeem} style={{ padding: "0 24px", backgroundColor: NAVY, color: "#fff", borderRadius: "12px", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
          Klaim
        </button>
      </div>

      {/* Kategori Filters */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }} className="no-scrollbar">
        {["semua", "umum", "member", "vip", "ulang tahun"].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: "10px 20px", borderRadius: "20px", border: `1px solid ${filter === cat ? NAVY : BORDER}`, backgroundColor: filter === cat ? NAVY : "#fff", color: filter === cat ? "#fff" : "#6B7280", fontSize: "0.85rem", fontWeight: 700, textTransform: "capitalize", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Daftar Promo Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        {filteredPromos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>Belum ada promo untuk kategori ini.</div>
        ) : (
          filteredPromos.map(promo => (
            <div key={promo.id} style={{ display: "flex", backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(30,58,95,0.03)", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
              
              {/* Image Side */}
              <div style={{ width: "200px", backgroundImage: `url(${promo.img})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, backdropFilter: "blur(4px)" }}>
                  {promo.discount}
                </div>
              </div>
              
              {/* Content Side */}
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>{promo.title}</h2>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: GOLD, textTransform: "uppercase", padding: "4px 8px", backgroundColor: "#FEF3C7", borderRadius: "4px" }}>
                      {promo.type}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#6B7280", lineHeight: 1.5 }}>{promo.desc}</p>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px dashed ${BORDER}`, paddingTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaTag style={{ color: NAVY }} />
                    <span style={{ fontSize: "1.1rem", fontWeight: 900, color: NAVY, letterSpacing: "1px" }}>{promo.code}</span>
                  </div>
                  <button onClick={() => handleCopy(promo.code)} style={{ padding: "8px 16px", backgroundColor: "#F8FAFC", color: NAVY, borderRadius: "8px", border: `1px solid ${NAVY}`, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }} onMouseOver={e => { e.currentTarget.style.backgroundColor = NAVY; e.currentTarget.style.color = "#fff"; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.color = NAVY; }}>
                    <FaCopy /> Gunakan Promo
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
