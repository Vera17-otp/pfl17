import { useNavigate } from "react-router-dom";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { FaCalendarAlt, FaChevronRight, FaMapMarkerAlt, FaBed, FaArrowRight } from "react-icons/fa";
import { reservations } from "../../data/reservations";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";

// Mock mapping to get images for room types
const ROOM_IMAGES = {
  "Deluxe Room": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop",
  "Suite Room": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
  "Double Bed": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1974&auto=format&fit=crop",
  "Penthouse": "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=1974&auto=format&fit=crop",
  "Single Room": "https://images.unsplash.com/photo-1505691938895-1758d7bef511?q=80&w=2070&auto=format&fit=crop",
};

export default function GuestReservations() {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();

  // Filter mock reservations to simulate guest's own reservations
  // For demonstration, we just take the first 3 "Booked" or "Check-in"
  const myReservations = reservations
    .filter(r => r.status === "Booked" || r.status === "Check-in")
    .slice(0, 3);

  const pastReservations = reservations
    .filter(r => r.status === "Check-out" || r.status === "Cancelled")
    .slice(0, 2);

  const renderCard = (res) => {
    const isUpcoming = res.status === "Booked";
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
        
        <img src={ROOM_IMAGES[res.roomType] || ROOM_IMAGES["Deluxe Room"]} alt={res.roomType} 
          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }} />
        
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{res.roomType}</h3>
              <span style={{ 
                padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
                backgroundColor: res.status === "Booked" ? "#FEF3C7" : res.status === "Check-in" ? "#D1FAE5" : "#F3F4F6",
                color: res.status === "Booked" ? "#F59E0B" : res.status === "Check-in" ? "#10B981" : "#6B7280"
              }}>
                {res.status === "Booked" ? "Akan Datang" : res.status === "Check-in" ? "Sedang Menginap" : res.status}
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
