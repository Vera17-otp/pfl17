import { useNavigate } from "react-router-dom";
import { FaUtensils, FaBroom, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

const NAVY = "#1E3A5F";
const BORDER = "#E8DCC8";

export default function GuestLayanan() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer" }}>
          <FaArrowLeft />
        </button>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Layanan Kamar & Bantuan</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        <button onClick={() => navigate("/guest/layanan/makanan")} style={{ padding: "24px", backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
          <div style={{ width: "60px", height: "60px", backgroundColor: "#FEF3C7", color: "#F59E0B", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
            <FaUtensils />
          </div>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Pesan Makanan (Room Service)</h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Pesan hidangan dari restoran kami langsung ke kamar Anda.</p>
          </div>
        </button>

        <button onClick={() => navigate("/guest/layanan/housekeeping")} style={{ padding: "24px", backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
          <div style={{ width: "60px", height: "60px", backgroundColor: "#D1FAE5", color: "#10B981", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
            <FaBroom />
          </div>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Permintaan Housekeeping</h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Minta pembersihan kamar, ganti sprei, atau handuk tambahan.</p>
          </div>
        </button>

        <button onClick={() => navigate("/guest/keluhan")} style={{ padding: "24px", backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={e => e.currentTarget.style.transform = "none"}>
          <div style={{ width: "60px", height: "60px", backgroundColor: "#FEE2E2", color: "#EF4444", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
            <FaExclamationTriangle />
          </div>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Laporkan Masalah</h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Laporkan masalah fasilitas kamar, kebersihan, atau lainnya.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
