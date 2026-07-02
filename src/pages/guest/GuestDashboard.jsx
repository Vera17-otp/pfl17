import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { supabase } from "../../lib/supabase";
import {
  FaCalendarAlt, FaStar, FaBell, FaExclamationCircle,
  FaPlus, FaConciergeBell, FaDoorOpen, FaDoorClosed,
  FaHistory, FaGift, FaSmile, FaChevronRight,
  FaBed, FaCreditCard, FaLock, FaCrown, FaChartLine
} from "react-icons/fa";
import GuestInStayDashboard from "./GuestInStayDashboard";
import { reservations } from "../../data/reservations";

// ── Card KPI ──────────────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub, color, bg, onClick }) {
  return (
    <div onClick={onClick} style={{
      backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "20px",
      border: `1px solid ${bg}`, boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
      cursor: onClick ? "pointer" : "default", transition: "transform 0.18s, box-shadow 0.18s",
      display: "flex", alignItems: "center", gap: "16px",
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,58,95,0.12)"; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,58,95,0.06)"; }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ margin: "3px 0 0", fontSize: "0.75rem", color, fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Shortcut button ────────────────────────────────────────────────────────────
function Shortcut({ icon, label, color, bg, onClick, locked, navigate }) {
  return (
    <button onClick={locked ? () => navigate("/guest/membership") : onClick} style={{
      backgroundColor: "#FFFFFF", border: `1px solid ${bg}`,
      borderRadius: "16px", padding: "20px 12px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",
      cursor: "pointer", transition: "all 0.18s", fontFamily: "inherit",
      boxShadow: "0 2px 8px rgba(30,58,95,0.05)", position: "relative"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${bg}`; e.currentTarget.style.borderColor = color; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,58,95,0.05)"; e.currentTarget.style.borderColor = bg; }}>
      
      {locked && (
        <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "#F1F5F9", borderRadius: "50%", padding: "4px", color: "#64748B", display: "flex" }}>
          <FaLock style={{ fontSize: "0.6rem" }} />
        </div>
      )}

      <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: locked ? "#F1F5F9" : bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: locked ? "#94A3B8" : color }}>{icon}</div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: locked ? "#94A3B8" : "#1E3A5F", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

// ── Recent activity item ────────────────────────────────────────────────────────
function ActivityItem({ icon, text, sub, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #F5EDD8" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: "0.83rem", fontWeight: 600, color: "#1E3A5F" }}>{text}</p>
        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94A3B8" }}>{sub}</p>
      </div>
      <FaChevronRight style={{ color: "#E8DCC8", fontSize: "0.75rem" }} />
    </div>
  );
}

// ── Active stay banner ─────────────────────────────────────────────────────────
function ActiveStayBanner({ navigate }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1E3A5F 0%, #2E5490 100%)",
      borderRadius: "20px", padding: "24px 28px", marginBottom: "28px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: "16px", position: "relative", overflow: "hidden",
    }}>
      {/* Gold glow */}
      <div style={{ position: "absolute", top: "-30px", right: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(201,168,76,0.15)", filter: "blur(20px)" }} />
      <div style={{ position: "absolute", bottom: "-20px", left: "20%", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", filter: "blur(15px)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "1px" }}>Sedang Menginap</span>
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF" }}>Deluxe Room — Kamar 305</h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Check-out: Senin, 16 Juni 2026 • 12:00</p>
      </div>

      <div style={{ display: "flex", gap: "10px", position: "relative", zIndex: 1 }}>
        <button onClick={() => navigate("/guest/layanan")}
          style={{ padding: "10px 18px", borderRadius: "10px", backgroundColor: "#C9A84C", color: "#1E3A5F", border: "none", fontWeight: 800, fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit" }}>
          🛎️ Room Service
        </button>
        <button onClick={() => navigate("/guest/checkinout")}
          style={{ padding: "10px 18px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.12)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.25)", fontWeight: 700, fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit" }}>
          Check-out Digital
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ── Membership card ────────────────────────────────────────────────────────────
function LoyaltyMiniCard({ profile, navigate }) {
  const isPremium = profile?.isPremium;

  if (!isPremium) {
    return (
      <div style={{
        background: `linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)`,
        borderRadius: "16px", padding: "20px", border: "1px solid #CBD5E1",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Akun Gratis</p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#1E3A5F" }}>Basic</p>
          </div>
          <div style={{ backgroundColor: "#1E3A5F", borderRadius: "8px", padding: "4px 10px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FFFFFF" }}><FaLock /> Terkunci</span>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B" }}><FaLock style={{ marginRight: "4px" }} /> Poin Reward</p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B" }}><FaLock style={{ marginRight: "4px" }} /> Diskon Eksklusif Member</p>
        </div>

        <button onClick={() => navigate("/guest/membership")} style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "#C9A84C", color: "#1E3A5F", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <FaCrown /> Upgrade ke Premium
        </button>
      </div>
    );
  }

  const tiers = { Basic: 0, Silver: 1000, Gold: 5000, Platinum: 15000 };
  const tierOrder = ["Basic", "Silver", "Gold", "Platinum"];
  const currentIdx = tierOrder.indexOf(profile.membership);
  const nextTier = tierOrder[currentIdx + 1];
  const nextThreshold = tiers[nextTier] || tiers.Platinum;
  const prevThreshold = tiers[profile.membership] || 0;
  const progress = nextTier ? Math.min(((profile.poin - prevThreshold) / (nextThreshold - prevThreshold)) * 100, 100) : 100;

  const tierBg = { Silver: "#94A3B8", Gold: "#C9A84C", Platinum: "#7C3AED" };
  const bg = tierBg[profile.membership] || "#94A3B8";

  return (
    <div onClick={() => navigate("/guest/loyalitas")} style={{
      background: `linear-gradient(135deg, ${bg} 0%, ${bg}CC 100%)`,
      borderRadius: "16px", padding: "20px",
      cursor: "pointer", transition: "transform 0.18s", position: "relative"
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      
      <div style={{ position: "absolute", top: "12px", left: "20px", display: "inline-block", padding: "2px 8px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "1px", color: "#fff", textTransform: "uppercase" }}>
        Premium
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", marginTop: "16px" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Poin Loyalitas</p>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "#FFFFFF" }}>{profile.poin.toLocaleString("id-ID")}</p>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FFFFFF" }}>⭐ {profile.membership}</span>
        </div>
      </div>
      {nextTier && (
        <>
          <div style={{ height: "5px", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: "99px", overflow: "hidden", marginBottom: "6px" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#FFFFFF", borderRadius: "99px", transition: "width 0.5s ease" }} />
          </div>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "space-between" }}>
            <span>{(nextThreshold - profile.poin).toLocaleString("id-ID")} poin lagi ke {nextTier}</span>
            <span>Berlaku s/d: {profile.premiumExpiry || "-"}</span>
          </p>
        </>
      )}
    </div>
  );
}

// ── Halaman Dashboard Utama ────────────────────────────────────────────────────
export default function GuestDashboard() {
  const { profile, notifications, unreadCount } = useGuestAuth();
  const navigate = useNavigate();
  const [resList, setResList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("*, rooms(*)")
          .eq("guest_id", profile.id);
        if (error) throw error;
        setResList(data || []);
      } catch (err) {
        console.error("Gagal memuat reservasi tamu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile?.id]);

  const activeReservation = useMemo(() => {
    const activeRes = resList.find(r => r.status === "checked_in");
    if (!activeRes) return null;
    return {
      bookingId: activeRes.id,
      guestName: profile.namaLengkap,
      roomNumber: activeRes.rooms?.room_number || "305",
      roomType: activeRes.rooms?.room_type || "Deluxe Room",
      checkIn: activeRes.check_in,
      checkOut: activeRes.check_out,
      totalPayment: Number(activeRes.total_price),
      status: "Check-in"
    };
  }, [resList, profile?.namaLengkap]);

  const stats = useMemo(() => {
    const activeCount = resList.filter(r => r.status === "pending" || r.status === "confirmed" || r.status === "checked_in").length;
    return {
      reservasiAktif: activeCount,
      keluhanAktif: 0
    };
  }, [resList]);

  if (activeReservation) {
    return <GuestInStayDashboard activeReservation={activeReservation} />;
  }

  const shortcuts = [
    { icon: <FaPlus />, label: "Buat Reservasi", color: "#1E3A5F", bg: "#EBF0F8", path: "/guest/reservasi", locked: false },
    { icon: <FaDoorOpen />, label: "Check-in Online", color: "#10B981", bg: "#D1FAE5", path: "/guest/checkinout", locked: false },
    { icon: <FaDoorClosed />, label: "Check-out Digital", color: "#F59E0B", bg: "#FEF3C7", path: "/guest/checkinout", locked: false },
    { icon: <FaConciergeBell />, label: "Room Service", color: "#7C3AED", bg: "#EDE9FE", path: "/guest/layanan", locked: false },
    { icon: <FaExclamationCircle />, label: "Laporkan Keluhan", color: "#EF4444", bg: "#FEE2E2", path: "/guest/keluhan", locked: false },
    { icon: <FaStar />, label: "Program Loyalitas", color: "#C9A84C", bg: "#FEF3C7", path: "/guest/loyalitas", locked: !profile?.isPremium },
    { icon: <FaHistory />, label: "Riwayat Menginap", color: "#0EA5E9", bg: "#E0F2FE", path: "/guest/riwayat", locked: false },
    { icon: <FaGift />, label: "Promo Eksklusif", color: "#EC4899", bg: "#FCE7F3", path: "/guest/promo", locked: !profile?.isPremium },
    { icon: <FaChartLine />, label: "Analitik Pribadi", color: "#8B5CF6", bg: "#EDE9FE", path: "/guest/analitik", locked: !profile?.isPremium },
  ];

  const now = new Date();
  const greetingHour = now.getHours();
  const greeting = greetingHour < 11 ? "Selamat Pagi" : greetingHour < 15 ? "Selamat Siang" : greetingHour < 18 ? "Selamat Sore" : "Selamat Malam";
  const nama = profile?.namaLengkap?.split(" ")[0] || "Tamu";

  const recentActivities = [
    { icon: <FaCalendarAlt />, text: "Reservasi Deluxe Room dikonfirmasi", sub: "Hari ini, 10:32", color: "#1E3A5F" },
    { icon: <FaStar />, text: "+150 poin loyalty dari Room Service", sub: "Kemarin, 19:05", color: "#C9A84C" },
    { icon: <FaExclamationCircle />, text: "Keluhan #TKT-0023 sedang diproses", sub: "2 hari lalu", color: "#F59E0B" },
    { icon: <FaBed />, text: "Check-in berhasil — Kamar 305", sub: "13 Jun 2026, 14:20", color: "#10B981" },
  ];

  return (
    <div>
      {/* Welcome section */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: "0 0 4px", fontSize: "0.83rem", color: "#94A3B8", fontWeight: 600 }}>
          📅 {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 900, color: "#1E3A5F" }}>
          {greeting}, {nama}! 👋
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#6B7280" }}>Selamat menikmati pengalaman menginap di HotelQu</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <SummaryCard icon={<FaCalendarAlt />} label="Reservasi Aktif" value={stats.reservasiAktif} sub={`${stats.reservasiAktif} reservasi`} color="#1E3A5F" bg="#EBF0F8" onClick={() => navigate("/guest/reservasi")} />
        <SummaryCard icon={<FaStar />} label="Poin Loyalitas" value={profile?.poin?.toLocaleString("id-ID") || "0"} sub={`Tier ${profile?.membership || "Silver"}`} color="#C9A84C" bg="#FEF3C7" onClick={() => navigate("/guest/loyalitas")} />
        <SummaryCard icon={<FaBell />} label="Notifikasi" value={unreadCount} sub={unreadCount > 0 ? "belum dibaca" : "semua terbaca"} color={unreadCount > 0 ? "#EF4444" : "#10B981"} bg={unreadCount > 0 ? "#FEE2E2" : "#D1FAE5"} onClick={() => navigate("/guest/notifikasi")} />
        <SummaryCard icon={<FaExclamationCircle />} label="Keluhan Aktif" value={stats.keluhanAktif} sub="sedang diproses" color="#F59E0B" bg="#FEF3C7" onClick={() => navigate("/guest/keluhan")} />
      </div>

      {/* Shortcuts */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 16px" }}>🚀 Layanan Cepat</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {shortcuts.map(sc => (
            <Shortcut key={sc.label} icon={sc.icon} label={sc.label} color={sc.color} bg={sc.bg} onClick={() => navigate(sc.path)} locked={sc.locked} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* Bottom section: Loyalty card + Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* Loyalty mini card */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 16px" }}>🏅 Keanggotaan</h2>
          <LoyaltyMiniCard profile={profile} navigate={navigate} />

          {/* Quick promo */}
          <div style={{ backgroundColor: "#F5EDD8", borderRadius: "14px", padding: "16px", marginTop: "14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.5px" }}>🎉 Promo Hari Ini</p>
            <p style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: 700, color: "#1E3A5F" }}>Diskon 20% Akhir Pekan</p>
            <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#6B7280" }}>Berlaku 15–16 Jun 2026. Gunakan kode promo.</p>
            <button onClick={() => navigate("/guest/promo")} style={{ width: "100%", padding: "8px", borderRadius: "8px", backgroundColor: "#C9A84C", color: "#1E3A5F", border: "none", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>
              Lihat Detail
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 16px" }}>🕐 Aktivitas Terbaru</h2>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "8px 20px 4px", border: "1px solid #F0EAE0", boxShadow: "0 2px 12px rgba(30,58,95,0.05)" }}>
            {recentActivities.map((a, i) => <ActivityItem key={i} {...a} />)}
          </div>

          {/* Notif terbaru */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid #F0EAE0", marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🔔</div>
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#1E3A5F" }}>
                  {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94A3B8" }}>Klik untuk lihat semua notifikasi</p>
              </div>
            </div>
            <button onClick={() => navigate("/guest/notifikasi")} style={{ padding: "8px 14px", borderRadius: "8px", backgroundColor: "#1E3A5F", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Lihat
            </button>
          </div>
        </div>
      </div>

      {/* Responsive grid for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .gp-shortcuts-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .gp-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .gp-shortcuts-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
