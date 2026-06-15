import { useNavigate } from "react-router-dom";
import { FaLock, FaCrown } from "react-icons/fa";
import { useGuestAuth } from "../../context/GuestAuthContext";

export default function PremiumLockOverlay({ children, inline = false }) {
  const { isPremium } = useGuestAuth();
  const navigate = useNavigate();

  // Memanggil fungsi isPremium dari context untuk mengecek status
  const premiumStatus = typeof isPremium === "function" ? isPremium() : isPremium;

  if (premiumStatus) {
    return <>{children}</>;
  }

  // Jika mode inline (misal untuk harga / teks pendek), ganti isi sepenuhnya
  if (inline) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#F1F5F9", color: "#64748B", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>
        <FaLock style={{ fontSize: "0.6rem" }} /> Khusus Premium
      </span>
    );
  }

  // Mode block (Overlay Penuh)
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "inherit" }}>
      {/* Konten yang diblur */}
      <div style={{ filter: "blur(6px)", opacity: 0.6, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>

      {/* Overlay Gembok dan Pesan */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.4)", backdropFilter: "blur(2px)",
        padding: "20px", textAlign: "center", zIndex: 10
      }}>
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", boxShadow: "0 4px 12px rgba(30,58,95,0.1)" }}>
          <FaLock style={{ fontSize: "1.4rem", color: "#1E3A5F" }} />
        </div>
        <h4 style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 800, color: "#1E3A5F" }}>
          Fitur ini khusus untuk member Premium
        </h4>
        <button 
          onClick={() => navigate("/guest/membership")} 
          style={{ 
            marginTop: "12px", padding: "10px 20px", borderRadius: "10px", 
            backgroundColor: "#C9A84C", color: "#1E3A5F", fontSize: "0.85rem", fontWeight: 800, 
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(201,168,76,0.3)"
          }}
        >
          <FaCrown /> Upgrade ke Premium
        </button>
      </div>
    </div>
  );
}
