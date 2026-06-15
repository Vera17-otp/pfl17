import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft, FaBed, FaUser, FaWifi, FaSnowflake, FaTv, FaBath,
  FaGlassMartini, FaStar, FaStarHalf, FaCheckCircle, FaTimes,
  FaChevronLeft, FaChevronRight, FaRulerCombined, FaSmokingBan,
  FaClock, FaInfoCircle, FaCoffee, FaCar, FaGift, FaCrown
} from "react-icons/fa";
import { rooms } from "../../data/rooms";
import { useGuestAuth } from "../../context/GuestAuthContext";

// ── Warna brand ───────────────────────────────────────────────────────────────
const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const CREAM = "#FDF8F2";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// Data mock untuk deskripsi tambahan dan luas
const ROOM_INFO = {
  Standard: { size: 24, bed: "1 Queen Bed" },
  Deluxe: { size: 32, bed: "1 King Bed atau 2 Twin Beds" },
  Suite: { size: 54, bed: "1 Super King Bed" },
  Family: { size: 68, bed: "1 King Bed + 2 Twin Beds" },
};

const ROOM_DESCRIPTIONS = {
  Standard: "Kamar nyaman dengan fasilitas lengkap untuk perjalanan bisnis maupun liburan. Dilengkapi tempat tidur queen-size dengan kasur premium, meja kerja fungsional, dan pencahayaan yang hangat untuk menjamin istirahat yang optimal setelah seharian beraktivitas.",
  Deluxe: "Kamar luas dengan pemandangan kota yang memukau. Nikmati kenyamanan superior dengan dekorasi modern, fasilitas premium, area duduk santai dekat jendela, dan mesin pembuat kopi/teh dalam kamar.",
  Suite: "Kamar suite mewah dengan ruang tamu terpisah dan bathtub premium. Pilihan sempurna untuk pengalaman menginap tak terlupakan. Nikmati akses eksklusif ke Executive Lounge, layanan turndown setiap malam, dan pilihan bantal premium.",
  Family: "Kamar luas yang ideal untuk keluarga, dilengkapi extra bed dan fasilitas lengkap untuk kenyamanan seluruh anggota keluarga. Memiliki dua area tidur terpisah namun terhubung, kamar mandi luas ganda, dan pilihan hiburan untuk anak-anak.",
};

const FAC_ICONS = {
  WiFi: <FaWifi />, AC: <FaSnowflake />, TV: <FaTv />,
  Bathtub: <FaBath />, Minibar: <FaGlassMartini />, "Extra Bed": <FaBed />,
};

const EXTRA_SERVICES = [
  { id: "breakfast", title: "Sarapan Buffet", desc: "Sarapan sepuasnya untuk 2 orang di Restoran Utama", price: 150000, icon: <FaCoffee /> },
  { id: "transfer", title: "Airport Transfer", desc: "Layanan antar-jemput dari/ke bandara", price: 250000, icon: <FaCar /> },
  { id: "decor", title: "Dekorasi Romantis", desc: "Dekorasi kelopak mawar dan handuk angsa di kasur", price: 300000, icon: <FaGift /> },
];

const REVIEWS = [
  { id: 1, name: "Budi S.", rating: 5, date: "12 Juni 2026", comment: "Sangat nyaman dan bersih. Fasilitas lengkap." },
  { id: 2, name: "Anita W.", rating: 4, date: "05 Mei 2026", comment: "Pemandangan bagus, pelayanan ramah. Sayang AC agak berisik." },
  { id: 3, name: "Reza F.", rating: 5, date: "28 April 2026", comment: "Sempurna untuk staycation! Bathtub-nya besar." },
];

function StarRating({ value }) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <span style={{ color: GOLD, display: "inline-flex", gap: "2px", fontSize: "0.9rem" }}>
      {Array.from({ length: full }, (_, i) => <FaStar key={i} />)}
      {half && <FaStarHalf />}
    </span>
  );
}

export default function GuestRoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  const room = useMemo(() => rooms.find(r => r.roomId === roomId), [roomId]);
  
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  
  // Date selection
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  
  // Extras
  const [extras, setExtras] = useState({});
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [roomId]);

  if (!room) {
    return <div style={{ padding: "100px", textAlign: "center" }}>Kamar tidak ditemukan.</div>;
  }

  // Generate 4 images for gallery
  const gallery = [
    room.image,
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop", // bathroom
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2070&auto=format&fit=crop", // view
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop", // amenities
  ];

  const info = ROOM_INFO[room.type] || ROOM_INFO.Standard;
  
  // Calc
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((date2 - date1) / 86400000));
  
  const isPremium = profile?.isPremium;
  const effectivePrice = isPremium ? room.price * 0.9 : room.price;
  const roomTotal = effectivePrice * nights;
  const extrasTotal = EXTRA_SERVICES.filter(ex => extras[ex.id]).reduce((sum, ex) => sum + ex.price, 0);
  const subtotal = roomTotal + extrasTotal;
  const tax = subtotal * 0.11; // 11% PB1
  const service = subtotal * 0.10; // 10% service
  const grandTotal = subtotal + tax + service;

  const toggleExtra = (id) => setExtras(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100vh", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      {/* Simple Header */}
      <div style={{ backgroundColor: NAVY, padding: "16px 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
            <FaArrowLeft /> Kembali
          </button>
          <div style={{ color: GOLD, fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
            🏨 HotelQu
          </div>
          <div style={{ width: "80px" }} /> {/* Spacer */}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px", alignItems: "start" }}>
        
        {/* KOLOM KIRI (Info Kamar) */}
        <div>
          {/* GALERI */}
          <div style={{ marginBottom: "30px" }}>
            <div 
              onClick={() => setLightbox(true)}
              style={{ width: "100%", height: "460px", borderRadius: "20px", overflow: "hidden", marginBottom: "12px", cursor: "zoom-in", position: "relative" }}>
              <img src={gallery[activeImg]} alt="Room" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s" }} />
              <div style={{ position: "absolute", bottom: "16px", right: "16px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px 14px", borderRadius: "99px", fontSize: "0.8rem", backdropFilter: "blur(4px)" }}>
                Klik untuk perbesar
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {gallery.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ height: "90px", borderRadius: "12px", overflow: "hidden", cursor: "pointer", border: activeImg === i ? `3px solid ${GOLD}` : "none", opacity: activeImg === i ? 1 : 0.6, transition: "all 0.2s" }}>
                  <img src={img} alt="Thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* JUDUL & DESKRIPSI */}
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: `1px solid ${BORDER}`, marginBottom: "24px", boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h1 style={{ margin: "0 0 8px", color: NAVY, fontSize: "2rem", fontWeight: 900 }}>{room.type} Room</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#6B7280", fontSize: "0.9rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaRulerCombined /> {info.size} m²</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaBed /> {info.bed}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><FaUser /> {room.capacity} Tamu</span>
                </div>
              </div>
              <div style={{ textAlign: "right", backgroundColor: `${GOLD}15`, padding: "8px 16px", borderRadius: "12px", border: `1px solid ${GOLD}40` }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: NAVY }}>4.8</div>
                <StarRating value={4.8} />
              </div>
            </div>
            
            <p style={{ color: "#4B5563", lineHeight: 1.7, fontSize: "0.95rem", margin: "0 0 24px" }}>
              {ROOM_DESCRIPTIONS[room.type]}
            </p>

            {/* FASILITAS */}
            <h3 style={{ margin: "0 0 16px", color: NAVY, fontSize: "1.1rem", fontWeight: 800 }}>Fasilitas Kamar</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {room.facilities.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", color: NAVY, fontSize: "0.9rem", fontWeight: 600 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#EBF0F8", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, fontSize: "1.1rem" }}>
                    {FAC_ICONS[f]}
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* KEBIJAKAN & KALENDER */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: NAVY, fontSize: "1.1rem", fontWeight: 800 }}>Kebijakan Hotel</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px" }}><FaClock style={{ color: GOLD, marginTop: "4px" }}/> <div><strong style={{ display: "block", color: NAVY, fontSize: "0.85rem" }}>Check-in / Check-out</strong><span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Mulai 14:00 / Sebelum 12:00</span></div></div>
                <div style={{ display: "flex", gap: "10px" }}><FaSmokingBan style={{ color: "#EF4444", marginTop: "4px" }}/> <div><strong style={{ display: "block", color: NAVY, fontSize: "0.85rem" }}>Bebas Asap Rokok</strong><span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Kamar ini 100% bebas rokok. Denda berlaku.</span></div></div>
                <div style={{ display: "flex", gap: "10px" }}><FaInfoCircle style={{ color: NAVY, marginTop: "4px" }}/> <div><strong style={{ display: "block", color: NAVY, fontSize: "0.85rem" }}>Pembatalan</strong><span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Gratis pembatalan hingga H-3 sebelum check-in.</span></div></div>
              </div>
            </div>

            {/* Simple Availability Calendar visual */}
            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", color: NAVY, fontSize: "1.1rem", fontWeight: 800 }}>Ketersediaan Kamar</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", marginBottom: "12px" }}>
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => <div key={d} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8" }}>{d}</div>)}
                {/* Mock dates */}
                {Array.from({ length: 14 }).map((_, i) => {
                  const booked = i === 3 || i === 4 || i === 9;
                  return (
                    <div key={i} style={{ 
                      aspectRatio: "1", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 600,
                      backgroundColor: booked ? "#FEE2E2" : "#D1FAE5", color: booked ? "#DC2626" : "#059669", opacity: booked ? 0.6 : 1
                    }}>
                      {i + 15}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#059669" }}/>Tersedia</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#DC2626" }}/>Penuh</span>
              </div>
            </div>
          </div>

          {/* ULASAN */}
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
            <h3 style={{ margin: "0 0 20px", color: NAVY, fontSize: "1.2rem", fontWeight: 800 }}>Ulasan Tamu (128)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {REVIEWS.map(r => (
                <div key={r.id} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontWeight: 700, color: NAVY }}>{r.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{r.date}</div>
                  </div>
                  <div style={{ marginBottom: "8px" }}><StarRating value={r.rating} /></div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#4B5563", lineHeight: 1.5 }}>"{r.comment}"</p>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "12px", marginTop: "16px", borderRadius: "10px", border: `1px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Lihat Semua Ulasan
            </button>
          </div>
        </div>

        {/* KOLOM KANAN (Booking Widget) */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "24px", padding: "28px", border: `1.5px solid ${isPremium ? GOLD : GOLD + "60"}`, boxShadow: "0 12px 40px rgba(30,58,95,0.08)" }}>
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: "0.85rem", color: "#6B7280" }}>Mulai dari</span>
              {isPremium ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FEF3C7", padding: "4px 8px", borderRadius: "6px", marginBottom: "4px", width: "fit-content" }}>
                    <FaCrown style={{ color: GOLD }} />
                    <span style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 800 }}>Harga Member Aktif</span>
                  </div>
                  <div style={{ fontSize: "1.1rem", textDecoration: "line-through", color: "#94A3B8" }}>{rp(room.price)}</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: GOLD }}>{rp(effectivePrice)} <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#6B7280" }}>/malam</span></div>
                </>
              ) : (
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: NAVY }}>{rp(room.price)} <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#6B7280" }}>/malam</span></div>
              )}
            </div>

            {/* Date Picker */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={{ backgroundColor: "#F9FAFB", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: "4px" }}>Check-in</label>
                <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontWeight: 600, color: NAVY, fontFamily: "inherit" }} />
              </div>
              <div style={{ backgroundColor: "#F9FAFB", padding: "10px 14px", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: "4px" }}>Check-out</label>
                <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} style={{ width: "100%", border: "none", background: "transparent", outline: "none", fontWeight: 600, color: NAVY, fontFamily: "inherit" }} />
              </div>
            </div>

            {/* Extra Services */}
            <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>Tambah Layanan Ekstra</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {EXTRA_SERVICES.map(ex => (
                <div key={ex.id} onClick={() => toggleExtra(ex.id)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: `1px solid ${extras[ex.id] ? GOLD : BORDER}`, backgroundColor: extras[ex.id] ? `${GOLD}10` : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `2px solid ${extras[ex.id] ? GOLD : "#CBD5E1"}`, backgroundColor: extras[ex.id] ? GOLD : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {extras[ex.id] && <FaCheckCircle style={{ color: "#fff", fontSize: "0.7rem" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY }}>{ex.title}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: GOLD }}>+{rp(ex.price)}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{ex.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculator */}
            <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>Rincian Biaya ({nights} Malam)</h4>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#4B5563" }}>
                <span>Kamar ({rp(effectivePrice)} × {nights})</span>
                <span>{rp(roomTotal)}</span>
              </div>
              
              {extrasTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#4B5563" }}>
                  <span>Layanan Ekstra</span>
                  <span>{rp(extrasTotal)}</span>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#4B5563" }}>
                <span>Pajak (11%)</span>
                <span>{rp(tax)}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "0.85rem", color: "#4B5563" }}>
                <span>Biaya Layanan (10%)</span>
                <span>{rp(service)}</span>
              </div>
              
              <div style={{ borderTop: `1px dashed ${BORDER}`, paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: NAVY }}>Total Biaya</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 900, color: GOLD }}>{rp(grandTotal)}</span>
              </div>
            </div>

            <button onClick={() => navigate(`/guest/booking/${roomId}`, { state: { checkIn, checkOut, extras } })} style={{ width: "100%", padding: "16px", borderRadius: "14px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 900, fontSize: "1.05rem", cursor: "pointer", fontFamily: "inherit", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 8px 24px rgba(30,58,95,0.3)" }}>
              Lanjut Pesan Sekarang
            </button>
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "0.75rem", color: "#6B7280" }}>
              Anda tidak akan dikenakan biaya pada tahap ini
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(false)} style={{ position: "absolute", top: "30px", right: "40px", background: "none", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer" }}>
            <FaTimes />
          </button>
          
          <button onClick={() => setActiveImg(i => (i === 0 ? gallery.length - 1 : i - 1))} style={{ position: "absolute", left: "40px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>
            <FaChevronLeft />
          </button>

          <img src={gallery[activeImg]} alt="Gallery" style={{ maxWidth: "85%", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }} />

          <button onClick={() => setActiveImg(i => (i === gallery.length - 1 ? 0 : i + 1))} style={{ position: "absolute", right: "40px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", cursor: "pointer", backdropFilter: "blur(4px)" }}>
            <FaChevronRight />
          </button>
          
          <div style={{ position: "absolute", bottom: "30px", display: "flex", gap: "10px" }}>
            {gallery.map((_, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: activeImg === i ? GOLD : "rgba(255,255,255,0.3)", cursor: "pointer" }} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
