import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { FaCalendarAlt, FaChevronRight, FaMapMarkerAlt, FaBed, FaArrowRight } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";

// Mock mapping to get images for room types
const ROOM_IMAGES = {
  "Deluxe": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop",
  "Suite": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
  "Double": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1974&auto=format&fit=crop",
  "Single": "https://images.unsplash.com/photo-1505691938895-1758d7bef511?q=80&w=2070&auto=format&fit=crop",
};

export default function GuestReservations() {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  const [resList, setResList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReservations() {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabase
          .from("reservations")
          .select("*, rooms(*)")
          .eq("guest_id", profile.id)
          .order("check_in", { ascending: false });
        if (error) throw error;
        setResList(data || []);
      } catch (err) {
        console.error("Gagal memuat reservasi:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReservations();
  }, [profile?.id]);

  const myReservations = resList
    .filter(r => r.status === "pending" || r.status === "confirmed" || r.status === "checked_in")
    .map(r => ({
      bookingId: r.id,
      roomType: r.rooms?.room_type || "Deluxe",
      checkIn: r.check_in,
      checkOut: r.check_out,
      status: r.status === "pending" ? "Menunggu Konfirmasi" : r.status === "confirmed" ? "Dikonfirmasi" : "Check-in"
    }));

  const pastReservations = resList
    .filter(r => r.status === "checked_out" || r.status === "cancelled")
    .map(r => ({
      bookingId: r.id,
      roomType: r.rooms?.room_type || "Deluxe",
      checkIn: r.check_in,
      checkOut: r.check_out,
      status: r.status === "checked_out" ? "Check-out" : "Dibatalkan"
    }));

  const renderCard = (res) => {
    const isUpcoming = res.status === "Menunggu Konfirmasi" || res.status === "Dikonfirmasi";
    const isCheckIn = res.status === "Check-in";
    const statusLabel = isUpcoming ? "Akan Datang" : isCheckIn ? "Sedang Menginap" : res.status;
    const statusBg = isUpcoming ? "#FEF3C7" : isCheckIn ? "#D1FAE5" : "#F3F4F6";
    const statusColor = isUpcoming ? "#F59E0B" : isCheckIn ? "#10B981" : "#6B7280";

    return (
      <div key={res.bookingId} onClick={() => navigate(`/guest/reservasi/${res.bookingId}`)}
        style={{
          display: "flex", gap: "16px", backgroundColor: "#fff", padding: "16px",
          borderRadius: "16px", border: "1px solid #E8DCC8", cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s", marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(30,58,95,0.04)"
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,58,95,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,58,95,0.04)"; }}>
        
        <img src={ROOM_IMAGES[res.roomType] || ROOM_IMAGES["Deluxe"]} alt={res.roomType} 
          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }} />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{res.roomType} Room</h3>
              <span style={{ 
                padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
                backgroundColor: statusBg,
                color: statusColor
              }}>
                {statusLabel}
              </span>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaCalendarAlt /> {res.checkIn} — {res.checkOut}
            </p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>Booking ID: {res.bookingId}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 700, color: GOLD }}>
              Lihat Detail <FaChevronRight style={{ fontSize: "0.7rem" }}/>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Reservasi Saya</h1>
        <button onClick={() => navigate("/beranda")} style={{ padding: "10px 20px", borderRadius: "10px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaCalendarAlt /> Pesan Kamar Baru
        </button>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>Aktif & Akan Datang</h2>
        {myReservations.length > 0 ? myReservations.map(renderCard) : (
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #E8DCC8" }}>
            <FaBed style={{ fontSize: "2rem", color: "#CBD5E1", marginBottom: "12px" }} />
            <p style={{ margin: "0 0 8px", color: NAVY, fontWeight: 700 }}>Belum ada reservasi aktif</p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Pesan kamar sekarang untuk pengalaman menginap tak terlupakan.</p>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>Riwayat Menginap</h2>
        {pastReservations.map(renderCard)}
      </div>
    </div>
  );
}
