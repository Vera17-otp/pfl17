import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch, FaCalendarAlt, FaUser, FaChild, FaWifi, FaSnowflake,
  FaTv, FaBath, FaGlassMartini, FaBed, FaStar, FaStarHalf,
  FaSwimmingPool, FaUtensils, FaDumbbell, FaSpa, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaTwitter,
  FaChevronDown, FaChevronUp, FaFilter, FaTimes, FaHeart,
  FaCheckCircle, FaArrowRight, FaBars, FaAngleRight,
  FaQuoteLeft, FaConciergeBell, FaShuttleVan, FaWineGlass, FaCrown
} from "react-icons/fa";
import { rooms } from "../../data/rooms";
import { useGuestAuth } from "../../context/GuestAuthContext";

// ── Warna brand ───────────────────────────────────────────────────────────────
const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const CREAM = "#FDF8F2";
const CREAM_DARK = "#F5EDD8";
const BORDER = "#E8DCC8";

// ── Konversi harga ─────────────────────────────────────────────────────────────
const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// ── Data rating simulasi per tipe kamar ───────────────────────────────────────
const ROOM_RATINGS = { Standard: 4.2, Deluxe: 4.6, Suite: 4.8, Family: 4.5 };
const ROOM_REVIEWS = { Standard: 128, Deluxe: 245, Suite: 189, Family: 97 };

const ROOM_DESCRIPTIONS = {
  Standard: "Kamar nyaman dengan fasilitas lengkap untuk perjalanan bisnis maupun liburan. Dilengkapi tempat tidur queen-size dengan kasur premium.",
  Deluxe: "Kamar luas dengan pemandangan kota yang memukau. Nikmati kenyamanan superior dengan dekorasi modern dan fasilitas premium.",
  Suite: "Kamar suite mewah dengan ruang tamu terpisah dan bathtub premium. Pilihan sempurna untuk pengalaman menginap tak terlupakan.",
  Family: "Kamar luas yang ideal untuk keluarga, dilengkapi extra bed dan fasilitas lengkap untuk kenyamanan seluruh anggota keluarga.",
};

const ROOM_CAPACITY = { Standard: "1-2 tamu", Deluxe: "2 tamu", Suite: "2-3 tamu", Family: "4-5 tamu" };

// ── Ikon fasilitas ─────────────────────────────────────────────────────────────
const FAC_ICONS = {
  WiFi: <FaWifi />, AC: <FaSnowflake />, TV: <FaTv />,
  Bathtub: <FaBath />, Minibar: <FaGlassMartini />, "Extra Bed": <FaBed />,
};

const FAC_LABELS = {
  WiFi: "WiFi", AC: "AC", TV: "Smart TV",
  Bathtub: "Bathtub", Minibar: "Minibar", "Extra Bed": "Extra Bed",
};

// ── Ulasan tamu ────────────────────────────────────────────────────────────────
const REVIEWS = [
  {
    id: 1, name: "Rina Susanti", avatar: "RS", city: "Jakarta",
    rating: 5, roomType: "Deluxe Room", date: "Mei 2026",
    comment: "Pelayanan luar biasa! Staf sangat ramah dan kamarnya sangat bersih. Pemandangan dari jendela juga memukau. Pasti akan kembali lagi!",
  },
  {
    id: 2, name: "Budi Hartono", avatar: "BH", city: "Surabaya",
    rating: 5, roomType: "Suite Room", date: "April 2026",
    comment: "Pengalaman menginap yang tak terlupakan. Kamar suite sangat mewah dengan bathtub yang nyaman. Sarapan buffet-nya juga sangat lengkap.",
  },
  {
    id: 3, name: "Siti Rahayu", avatar: "SR", city: "Bandung",
    rating: 4, roomType: "Family Room", date: "Juni 2026",
    comment: "Cocok untuk keluarga dengan anak kecil. Kolam renang sangat bersih dan terjaga. Lokasi strategis dekat pusat perbelanjaan. Recommended!",
  },
];

// ── Fasilitas hotel ────────────────────────────────────────────────────────────
const HOTEL_FACILITIES = [
  {
    icon: <FaSwimmingPool />, title: "Kolam Renang", color: "#0EA5E9", bg: "#E0F2FE",
    desc: "Kolam renang outdoor dengan pemandangan taman yang asri. Tersedia area khusus anak dan jacuzzi untuk relaksasi.",
  },
  {
    icon: <FaUtensils />, title: "Restoran & Bar", color: "#F59E0B", bg: "#FEF3C7",
    desc: "Sajikan cita rasa nusantara dan internasional di restoran signature kami. Buka 24 jam dengan menu sarapan, makan siang, dan makan malam.",
  },
  {
    icon: <FaDumbbell />, title: "Pusat Kebugaran", color: "#10B981", bg: "#D1FAE5",
    desc: "Gym modern dengan peralatan terkini. Tersedia personal trainer berpengalaman dan kelas yoga setiap pagi.",
  },
  {
    icon: <FaSpa />, title: "Spa & Wellness", color: "#7C3AED", bg: "#EDE9FE",
    desc: "Manjakan diri dengan paket perawatan tubuh dan wajah eksklusif. Tersedia treatment tradisional Jawa dan Bali.",
  },
  {
    icon: <FaConciergeBell />, title: "Concierge 24 Jam", color: NAVY, bg: "#EBF0F8",
    desc: "Tim concierge profesional siap membantu kebutuhan Anda 24 jam, dari pemesanan tur hingga transfer bandara.",
  },
  {
    icon: <FaShuttleVan />, title: "Airport Transfer", color: "#EF4444", bg: "#FEE2E2",
    desc: "Layanan antar-jemput bandara dengan armada nyaman dan pengemudi profesional berpengalaman.",
  },
];

// ── Star rating display ────────────────────────────────────────────────────────
function StarRating({ value, size = "0.85rem" }) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <span style={{ color: GOLD, display: "inline-flex", alignItems: "center", gap: "1px", fontSize: size }}>
      {Array.from({ length: full }, (_, i) => <FaStar key={i} />)}
      {half && <FaStarHalf />}
    </span>
  );
}

// ── Kartu kamar ────────────────────────────────────────────────────────────────
function RoomCard({ room, onBook, highlighted = false }) {
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const rating = ROOM_RATINGS[room.type] || 4.0;
  const reviews = ROOM_REVIEWS[room.type] || 50;
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  
  const isPremium = profile?.isPremium;
  const memberPrice = room.price * 0.9; // 10% discount

  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "20px", overflow: "hidden",
      border: highlighted ? `2px solid ${GOLD}` : `1px solid ${BORDER}`,
      boxShadow: highlighted ? `0 8px 32px rgba(201,168,76,0.2)` : "0 4px 16px rgba(30,58,95,0.07)",
      transition: "transform 0.25s, box-shadow 0.25s",
      position: "relative",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(30,58,95,0.14)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = highlighted ? "0 8px 32px rgba(201,168,76,0.2)" : "0 4px 16px rgba(30,58,95,0.07)"; }}>
      
      {highlighted && (
        <div style={{ position: "absolute", top: "14px", left: "14px", zIndex: 10, backgroundColor: GOLD, color: NAVY, fontSize: "0.65rem", fontWeight: 900, padding: "4px 10px", borderRadius: "99px", letterSpacing: "0.5px" }}>
          ⭐ TERPOPULER
        </div>
      )}

      {/* Foto kamar */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden", backgroundColor: "#F5EDD8" }}>
        {!imgLoaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5EDD8" }}>
            <div style={{ width: "32px", height: "32px", border: `3px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "roomSpin 0.8s linear infinite" }} />
          </div>
        )}
        <img src={room.image} alt={room.type} onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", opacity: imgLoaded ? 1 : 0 }}
          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
        {/* Like button */}
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          style={{ position: "absolute", top: "12px", right: "12px", zIndex: 5, width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.95rem", color: liked ? "#EF4444" : "#94A3B8", backdropFilter: "blur(4px)", transition: "all 0.2s" }}>
          <FaHeart />
        </button>
        {/* Harga overlay */}
        <div style={{ position: "absolute", bottom: "12px", right: "12px", backgroundColor: "rgba(30,58,95,0.9)", borderRadius: "10px", padding: "6px 12px", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {isPremium ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(201,168,76,0.2)", padding: "2px 6px", borderRadius: "4px", marginBottom: "2px" }}>
                <FaCrown style={{ color: GOLD, fontSize: "0.6rem" }} />
                <span style={{ fontSize: "0.65rem", color: GOLD, fontWeight: 700 }}>Harga Member</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textDecoration: "line-through" }}>{rp(room.price)}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 900, color: GOLD }}>{rp(memberPrice)}</div>
            </>
          ) : (
            <>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>mulai dari</span>
              <div style={{ fontSize: "0.92rem", fontWeight: 900, color: GOLD }}>{rp(room.price)}</div>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>/ malam</span>
            </>
          )}
        </div>
      </div>

      {/* Konten kartu */}
      <div style={{ padding: "18px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <h3 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 800, color: NAVY }}>{room.type} Room</h3>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
              <FaBed style={{ fontSize: "0.7rem" }} /> Lantai {room.floor} • Kamar {room.roomNumber}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
              <StarRating value={rating} />
              <span style={{ fontWeight: 800, fontSize: "0.82rem", color: NAVY }}>{rating}</span>
            </div>
            <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{reviews} ulasan</span>
          </div>
        </div>

        {/* Deskripsi */}
        <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {ROOM_DESCRIPTIONS[room.type]}
        </p>

        {/* Fasilitas ikon */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
          {room.facilities.map(f => (
            <span key={f} title={FAC_LABELS[f]} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 600, color: NAVY, backgroundColor: "#EBF0F8", padding: "3px 9px", borderRadius: "99px" }}>
              <span style={{ fontSize: "0.65rem" }}>{FAC_ICONS[f]}</span>
              {FAC_LABELS[f]}
            </span>
          ))}
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", fontWeight: 600, color: "#10B981", backgroundColor: "#D1FAE5", padding: "3px 9px", borderRadius: "99px" }}>
            <FaUser style={{ fontSize: "0.6rem" }} />{ROOM_CAPACITY[room.type]}
          </span>
        </div>

        {/* Status tersedia */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: room.status === "Available" ? "#10B981" : "#F59E0B" }} />
          <span style={{ fontSize: "0.73rem", fontWeight: 700, color: room.status === "Available" ? "#10B981" : "#F59E0B" }}>
            {room.status === "Available" ? "Tersedia" : "Segera Tersedia"}
          </span>
        </div>

        {/* Tombol aksi */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate(`/guest/kamar/${room.roomId}`)}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `1.5px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#EBF0F8"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            Lihat Detail
          </button>
          <button
            onClick={onBook}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Pesan <FaArrowRight style={{ fontSize: "0.75rem" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Price Slider ─────────────────────────────────────────────────────
function PriceRangeSlider({ min, max, value, onChange }) {
  const range = max - min;
  const leftPct = ((value[0] - min) / range) * 100;
  const rightPct = ((value[1] - min) / range) * 100;

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY }}>{rp(value[0])}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY }}>{rp(value[1])}</span>
      </div>
      <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
        {/* Track */}
        <div style={{ position: "absolute", left: 0, right: 0, height: "4px", backgroundColor: BORDER, borderRadius: "99px" }}>
          <div style={{ position: "absolute", left: `${leftPct}%`, right: `${100 - rightPct}%`, height: "100%", backgroundColor: GOLD, borderRadius: "99px" }} />
        </div>
        {/* Min thumb */}
        <input type="range" min={min} max={max} step={50000} value={value[0]}
          onChange={e => { const v = +e.target.value; if (v < value[1]) onChange([v, value[1]]); }}
          style={{ position: "absolute", width: "100%", opacity: 0, cursor: "pointer", height: "20px", zIndex: 2 }} />
        {/* Max thumb */}
        <input type="range" min={min} max={max} step={50000} value={value[1]}
          onChange={e => { const v = +e.target.value; if (v > value[0]) onChange([value[0], v]); }}
          style={{ position: "absolute", width: "100%", opacity: 0, cursor: "pointer", height: "20px", zIndex: 3 }} />
        {/* Visual thumbs */}
        <div style={{ position: "absolute", left: `${leftPct}%`, transform: "translateX(-50%)", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#fff", border: `2px solid ${GOLD}`, boxShadow: "0 2px 6px rgba(201,168,76,0.4)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: `${rightPct}%`, transform: "translateX(-50%)", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#fff", border: `2px solid ${GOLD}`, boxShadow: "0 2px 6px rgba(201,168,76,0.4)", zIndex: 1, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

// ── Komponen Filter Panel ─────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onReset }) {
  const allTypes = ["Standard", "Deluxe", "Suite", "Family"];
  const allFacilities = ["WiFi", "AC", "TV", "Bathtub", "Minibar", "Extra Bed"];
  const minPrice = 300000;
  const maxPrice = 900000;

  function toggleType(t) {
    const types = filters.types.includes(t) ? filters.types.filter(x => x !== t) : [...filters.types, t];
    onChange({ ...filters, types });
  }
  function toggleFacility(f) {
    const facs = filters.facilities.includes(f) ? filters.facilities.filter(x => x !== f) : [...filters.facilities, f];
    onChange({ ...filters, facilities: facs });
  }

  const activeCount = filters.types.length + filters.facilities.length + (filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: `1px solid ${BORDER}`, padding: "20px", boxShadow: "0 4px 16px rgba(30,58,95,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaFilter style={{ color: GOLD, fontSize: "0.9rem" }} />
          <span style={{ fontWeight: 800, color: NAVY, fontSize: "0.95rem" }}>Filter</span>
          {activeCount > 0 && <span style={{ backgroundColor: GOLD, color: NAVY, fontSize: "0.65rem", fontWeight: 900, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} style={{ fontSize: "0.75rem", color: "#EF4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <FaTimes /> Reset
          </button>
        )}
      </div>

      {/* Tipe kamar */}
      <div style={{ marginBottom: "18px" }}>
        <p style={{ margin: "0 0 10px", fontSize: "0.73rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.6px" }}>Tipe Kamar</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {allTypes.map(t => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer" }}>
              <div onClick={() => toggleType(t)} style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${filters.types.includes(t) ? NAVY : BORDER}`, backgroundColor: filters.types.includes(t) ? NAVY : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.15s" }}>
                {filters.types.includes(t) && <FaCheckCircle style={{ fontSize: "0.65rem", color: "#fff" }} />}
              </div>
              <span onClick={() => toggleType(t)} style={{ fontSize: "0.85rem", fontWeight: 600, color: NAVY, cursor: "pointer" }}>{t} Room</span>
            </label>
          ))}
        </div>
      </div>

      {/* Harga */}
      <div style={{ marginBottom: "18px" }}>
        <p style={{ margin: "0 0 12px", fontSize: "0.73rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.6px" }}>Rentang Harga/Malam</p>
        <PriceRangeSlider min={minPrice} max={maxPrice} value={filters.priceRange} onChange={v => onChange({ ...filters, priceRange: v })} />
      </div>

      {/* Fasilitas */}
      <div>
        <p style={{ margin: "0 0 10px", fontSize: "0.73rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.6px" }}>Fasilitas</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {allFacilities.map(f => (
            <label key={f} style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer" }}>
              <div onClick={() => toggleFacility(f)} style={{ width: "18px", height: "18px", borderRadius: "5px", border: `2px solid ${filters.facilities.includes(f) ? GOLD : BORDER}`, backgroundColor: filters.facilities.includes(f) ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.15s" }}>
                {filters.facilities.includes(f) && <FaCheckCircle style={{ fontSize: "0.65rem", color: NAVY }} />}
              </div>
              <span onClick={() => toggleFacility(f)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: NAVY, cursor: "pointer" }}>
                <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{FAC_ICONS[f]}</span>
                {FAC_LABELS[f]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Navbar Publik ─────────────────────────────────────────────────────────────
function PublicNavbar({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navBg = scrolled ? "#1E3A5F" : "transparent";
  const navShadow = scrolled ? "0 2px 20px rgba(30,58,95,0.3)" : "none";

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: navBg, boxShadow: navShadow, transition: "all 0.3s ease" }}>
      {/* Gold line — only when scrolled */}
      {scrolled && <div style={{ height: "3px", background: `linear-gradient(90deg, ${GOLD}, #F0D9A0, ${GOLD})` }} />}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "70px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `linear-gradient(135deg, ${GOLD}, #E8C87A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🏨</div>
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.3px" }}>HotelQu</span>
            <div style={{ fontSize: "0.6rem", color: GOLD, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginTop: "-2px" }}>Luxury Hotel</div>
          </div>
        </div>

        {/* Desktop menu */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {["Beranda", "Kamar", "Fasilitas", "Tentang", "Kontak"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              {item}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link to="/guest/login" style={{ padding: "8px 18px", borderRadius: "8px", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700, transition: "all 0.2s", display: "inline-block" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
            Masuk
          </Link>
          <Link to="/guest/register" style={{ padding: "9px 18px", borderRadius: "8px", background: `linear-gradient(135deg, ${GOLD}, #E8C87A)`, color: NAVY, textDecoration: "none", fontSize: "0.85rem", fontWeight: 800, transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function GuestHomepage() {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  // Scroll state for navbar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Search form
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [searchForm, setSearchForm] = useState({ checkIn: today, checkOut: tomorrow, adults: 2, children: 0 });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({ types: [], priceRange: [300000, 900000], facilities: [] });
  const [showFilter, setShowFilter] = useState(true);
  const [sortBy, setSortBy] = useState("rating"); // "rating" | "price-asc" | "price-desc"

  function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 900);
  }

  function resetFilters() {
    setFilters({ types: [], priceRange: [300000, 900000], facilities: [] });
  }

  // Filter + sort logic
  const filteredRooms = useMemo(() => {
    let result = rooms.filter(r => {
      const typeOk = filters.types.length === 0 || filters.types.includes(r.type);
      const priceOk = r.price >= filters.priceRange[0] && r.price <= filters.priceRange[1];
      const facOk = filters.facilities.length === 0 || filters.facilities.every(f => r.facilities.includes(f));
      return typeOk && priceOk && facOk;
    });

    // Deduplicate by type (show one per type for cleanliness, or show all)
    if (sortBy === "rating") result = [...result].sort((a, b) => (ROOM_RATINGS[b.type] || 4) - (ROOM_RATINGS[a.type] || 4));
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [filters, sortBy]);

  // Kamar populer: 1 per tipe, sorted by rating
  const popularRooms = useMemo(() => {
    const seen = new Set();
    return rooms.filter(r => { if (seen.has(r.type)) return false; seen.add(r.type); return true; })
      .sort((a, b) => (ROOM_RATINGS[b.type] || 0) - (ROOM_RATINGS[a.type] || 0))
      .slice(0, 3);
  }, []);

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
    borderRadius: "12px", padding: "12px 14px", color: "#fff", fontFamily: "inherit",
    fontSize: "0.88rem", outline: "none", width: "100%", backdropFilter: "blur(8px)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: CREAM, minHeight: "100vh" }}>
      <PublicNavbar scrolled={scrolled} />

      {/* ════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════ */}
      <section id="beranda" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.55) 50%, rgba(10,22,40,0.8) 100%)" }} />
        {/* Dekoratif garis emas */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${GOLD}, #F0D9A0, ${GOLD})`, zIndex: 5 }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "120px 20px 60px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(201,168,76,0.15)", border: `1px solid ${GOLD}40`, borderRadius: "99px", padding: "6px 18px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: GOLD, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Welcome to HotelQu Luxury</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Pengalaman Menginap<br />
            <span style={{ color: GOLD }}>Tak Terlupakan</span>
          </h1>

          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)", color: "rgba(255,255,255,0.85)", maxWidth: "540px", margin: "0 auto 48px", lineHeight: 1.7 }}>
            Nikmati kenyamanan dan kemewahan terbaik di jantung kota. Layanan 5 bintang dengan sentuhan kehangatan lokal.
          </p>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "48px", flexWrap: "wrap" }}>
            {[
              { value: "200+", label: "Kamar Mewah" },
              { value: "4.8★", label: "Rating Tamu" },
              { value: "15+", label: "Tahun Pengalaman" },
              { value: "50K+", label: "Tamu Puas" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: GOLD }}>{stat.value}</div>
                <div style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── FORM PENCARIAN ─────────────────────────── */}
          <form onSubmit={handleSearch} style={{ backgroundColor: "rgba(10,22,40,0.7)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "28px", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "left" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "0.85rem", fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "1.5px" }}>🔍 Cari Kamar Tersedia</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 130px 110px", gap: "12px", marginBottom: "16px" }}>
              {/* Check-in */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <FaCalendarAlt style={{ marginRight: "5px" }} />Check-in
                </label>
                <input type="date" value={searchForm.checkIn} min={today}
                  onChange={e => setSearchForm(f => ({ ...f, checkIn: e.target.value }))}
                  style={inputStyle} />
              </div>
              {/* Check-out */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <FaCalendarAlt style={{ marginRight: "5px" }} />Check-out
                </label>
                <input type="date" value={searchForm.checkOut} min={searchForm.checkIn}
                  onChange={e => setSearchForm(f => ({ ...f, checkOut: e.target.value }))}
                  style={inputStyle} />
              </div>
              {/* Dewasa */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <FaUser style={{ marginRight: "5px" }} />Dewasa
                </label>
                <select value={searchForm.adults} onChange={e => setSearchForm(f => ({ ...f, adults: +e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} style={{ color: NAVY, backgroundColor: "#fff" }}>{n} orang</option>)}
                </select>
              </div>
              {/* Anak */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <FaChild style={{ marginRight: "5px" }} />Anak
                </label>
                <select value={searchForm.children} onChange={e => setSearchForm(f => ({ ...f, children: +e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} style={{ color: NAVY, backgroundColor: "#fff" }}>{n} anak</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: `linear-gradient(135deg, ${GOLD}, #E8C87A)`, color: NAVY, fontWeight: 900, fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit", transition: "opacity 0.2s", letterSpacing: "0.3px" }}>
              {loading ? (
                <>
                  <div style={{ width: "18px", height: "18px", border: `2.5px solid ${NAVY}`, borderTopColor: "transparent", borderRadius: "50%", animation: "roomSpin 0.8s linear infinite" }} />
                  Mencari kamar tersedia...
                </>
              ) : (
                <><FaSearch />Cari Kamar Sekarang</>
              )}
            </button>
          </form>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", animation: "bounce 2s infinite", zIndex: 10 }}>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" }}>SCROLL</span>
          <FaChevronDown style={{ color: GOLD, fontSize: "1.1rem" }} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HASIL PENCARIAN
      ════════════════════════════════════════════════ */}
      {searched && (
        <section ref={resultsRef} id="hasil" style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Hasil Pencarian</h2>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#6B7280" }}>
                {filteredRooms.length} kamar tersedia •{" "}
                {new Date(searchForm.checkIn).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} →{" "}
                {new Date(searchForm.checkOut).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} •{" "}
                {searchForm.adults} dewasa{searchForm.children > 0 ? `, ${searchForm.children} anak` : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={() => setShowFilter(!showFilter)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, backgroundColor: showFilter ? NAVY : "#fff", color: showFilter ? "#fff" : NAVY, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit" }}>
                <FaFilter style={{ fontSize: "0.8rem" }} /> Filter
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, backgroundColor: "#fff", color: NAVY, fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
                <option value="rating">Rating Tertinggi</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: showFilter ? "260px 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
            {/* Filter panel */}
            {showFilter && (
              <div style={{ position: "sticky", top: "90px" }}>
                <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
              </div>
            )}

            {/* Grid kamar */}
            <div>
              {filteredRooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "#FFFFFF", borderRadius: "16px", border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
                  <h3 style={{ color: NAVY, margin: "0 0 8px" }}>Tidak ada kamar yang sesuai</h3>
                  <p style={{ color: "#6B7280", fontSize: "0.88rem" }}>Coba ubah filter pencarian Anda</p>
                  <button onClick={resetFilters} style={{ marginTop: "16px", padding: "10px 24px", borderRadius: "10px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Reset Filter</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {filteredRooms.map(room => (
                    <RoomCard key={room.roomId} room={room} onBook={() => navigate("/guest/login")} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          KAMAR POPULER
      ════════════════════════════════════════════════ */}
      <section id="kamar" style={{ padding: "80px 24px", background: `linear-gradient(180deg, ${CREAM} 0%, #FFFFFF 100%)` }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}40`, borderRadius: "99px", padding: "5px 16px", marginBottom: "14px" }}>
              <FaStar style={{ color: GOLD, fontSize: "0.75rem" }} />
              <span style={{ fontSize: "0.73rem", fontWeight: 800, color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase" }}>Most Loved</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, color: NAVY, margin: "0 0 12px" }}>Kamar Terpopuler</h2>
            <p style={{ fontSize: "0.95rem", color: "#6B7280", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Pilihan kamar favorit para tamu kami berdasarkan ulasan dan rating terbaik
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {popularRooms.map((room, idx) => (
              <RoomCard key={room.roomId} room={room} onBook={() => navigate("/guest/login")} highlighted={idx === 0} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "36px" }}>
            <button onClick={handleSearch}
              style={{ padding: "13px 36px", borderRadius: "12px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Lihat Semua Kamar <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FASILITAS HOTEL
      ════════════════════════════════════════════════ */}
      <section id="fasilitas" style={{ padding: "80px 24px", backgroundColor: NAVY, position: "relative", overflow: "hidden" }}>
        {/* Background pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="2" fill={GOLD} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}40`, borderRadius: "99px", padding: "5px 16px", marginBottom: "14px" }}>
              <FaConciergeBell style={{ color: GOLD, fontSize: "0.75rem" }} />
              <span style={{ fontSize: "0.73rem", fontWeight: 800, color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase" }}>World Class</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, color: "#FFFFFF", margin: "0 0 12px" }}>Fasilitas Hotel</h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Nikmati berbagai fasilitas bintang lima yang dirancang untuk kenyamanan dan kepuasan Anda
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {HOTEL_FACILITIES.map((fac) => (
              <div key={fac.title} style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${GOLD}50`; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: fac.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: fac.color, marginBottom: "16px" }}>
                  {fac.icon}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" }}>{fac.title}</h3>
                <p style={{ margin: 0, fontSize: "0.83rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ULASAN TAMU
      ════════════════════════════════════════════════ */}
      <section id="ulasan" style={{ padding: "80px 24px", backgroundColor: CREAM }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: `${GOLD}18`, border: `1px solid ${GOLD}40`, borderRadius: "99px", padding: "5px 16px", marginBottom: "14px" }}>
              <FaQuoteLeft style={{ color: GOLD, fontSize: "0.75rem" }} />
              <span style={{ fontSize: "0.73rem", fontWeight: 800, color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase" }}>Kata Mereka</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, color: NAVY, margin: "0 0 12px" }}>Ulasan Tamu Kami</h2>
            <p style={{ fontSize: "0.95rem", color: "#6B7280", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Dengar langsung pengalaman nyata dari para tamu yang telah menginap bersama kami
            </p>
            {/* Overall rating */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "10px 20px", marginTop: "20px", boxShadow: "0 4px 16px rgba(30,58,95,0.08)" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: NAVY }}>4.8</div>
              <div>
                <StarRating value={4.8} size="1rem" />
                <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>dari 659 ulasan</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {REVIEWS.map(review => (
              <div key={review.id} style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "28px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.06)", position: "relative", transition: "box-shadow 0.25s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 36px rgba(30,58,95,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(30,58,95,0.06)"}>
                {/* Quote icon */}
                <div style={{ position: "absolute", top: "20px", right: "24px", opacity: 0.08 }}>
                  <FaQuoteLeft style={{ fontSize: "2.5rem", color: NAVY }} />
                </div>
                {/* Stars */}
                <div style={{ marginBottom: "14px" }}>
                  <StarRating value={review.rating} size="1rem" />
                </div>
                {/* Comment */}
                <p style={{ margin: "0 0 20px", fontSize: "0.88rem", color: "#374151", lineHeight: 1.7, fontStyle: "italic" }}>
                  "{review.comment}"
                </p>
                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: CREAM_DARK, marginBottom: "16px" }} />
                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", color: GOLD, flexShrink: 0 }}>
                    {review.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: NAVY, fontSize: "0.9rem" }}>{review.name}</div>
                    <div style={{ fontSize: "0.73rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaMapMarkerAlt style={{ fontSize: "0.65rem" }} />{review.city} • {review.roomType} • {review.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link to="/guest/register" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 40px", borderRadius: "14px", background: `linear-gradient(135deg, ${GOLD}, #E8C87A)`, color: NAVY, textDecoration: "none", fontWeight: 900, fontSize: "1rem", boxShadow: `0 8px 24px ${GOLD}40`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${GOLD}50`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 8px 24px ${GOLD}40`; }}>
              Daftar & Mulai Menginap <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer id="kontak" style={{ backgroundColor: "#0A1628", padding: "56px 24px 24px", color: "rgba(255,255,255,0.8)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Footer grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "40px", marginBottom: "40px" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(135deg, ${GOLD}, #E8C87A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏨</div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>HotelQu</div>
                  <div style={{ fontSize: "0.65rem", color: GOLD, fontWeight: 700, letterSpacing: "2px" }}>LUXURY HOTEL</div>
                </div>
              </div>
              <p style={{ fontSize: "0.83rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: "0 0 20px", maxWidth: "280px" }}>
                Pengalaman menginap premium dengan sentuhan budaya lokal yang hangat. Kami hadir untuk membuat setiap momen Anda tak terlupakan.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {[FaInstagram, FaFacebook, FaTwitter].map((Icon, i) => (
                  <div key={i} style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = `${GOLD}30`}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}>
                    <Icon style={{ fontSize: "0.9rem", color: GOLD }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Kamar */}
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>Kamar</h4>
              {["Standard Room", "Deluxe Room", "Suite Room", "Family Room"].map(item => (
                <a key={item} href="#kamar" style={{ display: "block", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.83rem", marginBottom: "9px", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                  {item}
                </a>
              ))}
            </div>

            {/* Layanan */}
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>Layanan</h4>
              {["Kolam Renang", "Spa & Wellness", "Restoran", "Gym", "Airport Transfer", "Concierge"].map(item => (
                <a key={item} href="#fasilitas" style={{ display: "block", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.83rem", marginBottom: "9px", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = GOLD}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}>
                  {item}
                </a>
              ))}
            </div>

            {/* Kontak */}
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>Hubungi Kami</h4>
              {[
                { icon: <FaMapMarkerAlt />, text: "Jl. Hotel Mewah No. 1, Jakarta Selatan, Indonesia 12560" },
                { icon: <FaPhone />, text: "+62 21 1234 5678" },
                { icon: <FaEnvelope />, text: "info@hotelqu.id" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: GOLD, fontSize: "0.82rem", marginTop: "2px", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}

              {/* Mini CTA */}
              <Link to="/guest/register" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", padding: "10px 20px", borderRadius: "9px", backgroundColor: GOLD, color: NAVY, textDecoration: "none", fontWeight: 800, fontSize: "0.82rem" }}>
                Pesan Sekarang <FaArrowRight style={{ fontSize: "0.7rem" }} />
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", marginBottom: "20px" }} />

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
              © 2026 HotelQu Luxury Hotel. Seluruh hak cipta dilindungi.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Cookies"].map(item => (
                <a key={item} href="#" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS */}
      <style>{`
        @keyframes roomSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        
        @media (max-width: 900px) {
          .hero-form-grid { grid-template-columns: 1fr 1fr !important; }
          .popular-grid { grid-template-columns: 1fr 1fr !important; }
          .facility-grid { grid-template-columns: 1fr 1fr !important; }
          .review-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .hero-form-grid { grid-template-columns: 1fr !important; }
          .popular-grid { grid-template-columns: 1fr !important; }
          .facility-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
