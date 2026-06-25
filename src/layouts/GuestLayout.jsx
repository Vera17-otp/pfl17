import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGuestAuth } from "../context/GuestAuthContext";
import { supabase } from "../lib/supabase";
import {
  FaHome, FaCalendarAlt, FaConciergeBell, FaExclamationCircle,
  FaStar, FaUser, FaBell, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";

// ── Toast global ───────────────────────────────────────────────────────────────
function GuestToast() {
  const { toast } = useGuestAuth();
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      backgroundColor: isError ? "#EF4444" : "#10B981",
      color: "#fff", padding: "12px 24px", borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 9999,
      fontSize: "0.88rem", fontWeight: 600, whiteSpace: "nowrap",
      animation: "fadeIn 0.3s ease",
    }}>
      {isError ? "❌" : "✅"} {toast.msg}
    </div>
  );
}

const NAV_ITEMS = [
  { to: "/guest/dashboard", icon: <FaHome />, label: "Beranda" },
  { to: "/guest/reservasi", icon: <FaCalendarAlt />, label: "Reservasi" },
  { to: "/guest/layanan", icon: <FaConciergeBell />, label: "Layanan" },
  { to: "/guest/keluhan", icon: <FaExclamationCircle />, label: "Keluhan" },
  { to: "/guest/loyalitas", icon: <FaStar />, label: "Loyalitas" },
];

export default function GuestLayout() {
  const { isLoggedIn, profile, unreadCount, logout, isPremium } = useGuestAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropOpen, setNotifDropOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate("/guest/login", { replace: true });
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const tierColors = {
    Basic: { bg: "#94A3B8", text: "#fff" },
    Silver: { bg: "#94A3B8", text: "#fff" },
    Gold: { bg: "#C9A84C", text: "#fff" },
    Platinum: { bg: "#7C3AED", text: "#fff" },
  };
  const tierCfg = tierColors[profile.membership] || tierColors.Silver;

  const avatarInitials = profile.namaLengkap?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDF8F2", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navbar ─────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 500,
        backgroundColor: "#1E3A5F",
        boxShadow: "0 2px 16px rgba(30,58,95,0.3)",
      }}>
        {/* Gold accent line */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, #C9A84C, #F0D9A0, #C9A84C)" }} />
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          
          {/* Logo */}
          <NavLink to="/guest/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg, #C9A84C, #E8C87A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏨</div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>HotelQu</span>
            <span style={{ fontSize: "0.7rem", color: "#C9A84C", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Guest</span>
          </NavLink>

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: "4px", alignItems: "center" }} className="gp-desktop-nav">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", textDecoration: "none",
                fontSize: "0.83rem", fontWeight: 600, transition: "all 0.15s",
                color: isActive ? "#1E3A5F" : "rgba(255,255,255,0.85)",
                backgroundColor: isActive ? "#C9A84C" : "transparent",
              })}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notif bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifDropOpen(!notifDropOpen); setMobileMenuOpen(false); }}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "1.05rem", position: "relative" }}>
                <FaBell />
                {unreadCount > 0 && <span style={{ position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#EF4444", fontSize: "0.6rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
              </button>
              {notifDropOpen && (
                <div style={{ position: "absolute", top: "48px", right: 0, backgroundColor: "#fff", borderRadius: "14px", width: "300px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 100 }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F0EAE0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E3A5F" }}>Notifikasi</span>
                    <button onClick={() => navigate("/guest/notifikasi")} style={{ background: "none", border: "none", fontSize: "0.75rem", color: "#C9A84C", fontWeight: 700, cursor: "pointer" }}>Lihat Semua</button>
                  </div>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {/* preview notif — just 3 latest */}
                    <div style={{ padding: "10px 16px", fontSize: "0.8rem", color: "#6B7280" }}>Buka halaman notifikasi untuk detail lengkap.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {typeof isPremium === "function" ? !isPremium() : !isPremium ? (
                <button onClick={() => navigate("/guest/membership")} style={{ background: "linear-gradient(135deg, #C9A84C, #E8C87A)", border: "none", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800, color: "#1E3A5F", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 8px rgba(201,168,76,0.4)" }}>
                  👑 Upgrade
                </button>
              ) : null}
              <NavLink to="/guest/profil" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#C9A84C", color: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem", border: "2px solid rgba(255,255,255,0.3)" }}>
                  {profile.foto ? <img src={profile.foto} alt="profil" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : avatarInitials}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }} className="gp-desktop-nav">
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{profile.namaLengkap?.split(" ")[0]}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: (typeof isPremium === "function" ? isPremium() : isPremium) ? "#C9A84C" : "#94A3B8" }}>
                    {profile.membership}
                  </span>
                </div>
              </NavLink>
            </div>

            {/* Logout */}
            <button onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("memberSession");
              localStorage.removeItem("memberData");
              logout();
              navigate("/guest/login");
            }}
              title="Keluar"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", transition: "all 0.15s" }}>
              <FaSignOutAlt />
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="gp-mobile-only"
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: "1.1rem" }}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: "#162C4A", borderTop: "1px solid rgba(201,168,76,0.2)", padding: "12px 20px 16px" }}>
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", textDecoration: "none", marginBottom: "4px",
                  color: isActive ? "#1E3A5F" : "rgba(255,255,255,0.85)",
                  backgroundColor: isActive ? "#C9A84C" : "transparent",
                  fontSize: "0.88rem", fontWeight: 600,
                })}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* ── Konten Halaman ─────────────────────────────────────── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px 100px" }}>
        <Outlet />
      </main>

      {/* ── Bottom Nav Mobile ──────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#1E3A5F",
        borderTop: "2px solid #C9A84C",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 env(safe-area-inset-bottom)",
        zIndex: 400,
      }} className="gp-bottom-nav">
        {[...NAV_ITEMS, { to: "/guest/profil", icon: <FaUser />, label: "Profil" }].map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", padding: "4px 12px" }}>
              <span style={{ fontSize: "1.1rem", color: isActive ? "#C9A84C" : "rgba(255,255,255,0.5)" }}>{item.icon}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: isActive ? "#C9A84C" : "rgba(255,255,255,0.5)", letterSpacing: "0.3px" }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <GuestToast />

      {/* Backdrop untuk close dropdown */}
      {notifDropOpen && <div onClick={() => setNotifDropOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </div>
  );
}
