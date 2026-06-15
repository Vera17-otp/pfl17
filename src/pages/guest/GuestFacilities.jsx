import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaWifi, FaPhone, FaMapSigns, FaUtensils, 
  FaDumbbell, FaSpa, FaSwimmingPool, FaMapMarkerAlt 
} from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const TABS = ["Buku Tamu", "Peta Denah", "Eksplorasi Sekitar"];

const FACILITIES = [
  { icon: <FaUtensils />, name: "Restoran Sky Rooftop", time: "06:00 - 23:00", floor: "Lantai 15", desc: "Sarapan prasmanan pukul 06:00 - 10:00" },
  { icon: <FaSwimmingPool />, name: "Kolam Renang Infinity", time: "07:00 - 20:00", floor: "Lantai 5", desc: "Tersedia handuk gratis di area kolam" },
  { icon: <FaDumbbell />, name: "Pusat Kebugaran (Gym)", time: "06:00 - 22:00", floor: "Lantai 5", desc: "Pakaian olahraga & sepatu wajib" },
  { icon: <FaSpa />, name: "Lotus Spa & Wellness", time: "10:00 - 22:00", floor: "Lantai 4", desc: "Diperlukan reservasi sebelumnya" }
];

const RECOMMENDATIONS = [
  { id: 1, name: "Pasar Seni Lokal", dist: "1.2 km", type: "Belanja & Budaya", img: "https://images.unsplash.com/photo-1596423735880-5c6fa71abcb4?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Museum Sejarah Nasional", dist: "2.5 km", type: "Pariwisata Edukasi", img: "https://images.unsplash.com/photo-1564399579883-456c550e0eb5?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Jalan Kuliner Malam", dist: "0.8 km", type: "Kawasan Kuliner", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" },
];

export default function GuestFacilities() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Info & Panduan Hotel</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Ketahui fasilitas dan ekskplorasi area sekitar</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: `2px solid ${BORDER}`, overflowX: "auto" }} className="no-scrollbar">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 20px", border: "none", background: "none", fontWeight: 800, fontSize: "0.95rem",
            color: activeTab === tab ? NAVY : "#94A3B8", cursor: "pointer", whiteSpace: "nowrap",
            borderBottom: activeTab === tab ? `3px solid ${NAVY}` : "3px solid transparent",
            marginBottom: "-2px", transition: "color 0.2s"
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* KONTEN TAB 1: BUKU TAMU */}
      {activeTab === "Buku Tamu" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Kartu Akses */}
            <div style={{ backgroundColor: "#1E3A5F", color: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(30,58,95,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <FaWifi style={{ fontSize: "1.5rem", color: GOLD }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Akses WiFi Gratis</h3>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Network</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>HotelQu_Guest</p>
                </div>
                <div style={{ width: "1px", height: "30px", backgroundColor: "rgba(255,255,255,0.2)" }} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Password</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>enjoyyourstay</p>
                </div>
              </div>
            </div>

            {/* Nomor Penting */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}` }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY, display: "flex", alignItems: "center", gap: "10px" }}>
                <FaPhone style={{ color: GOLD }} /> Ekstensi Telepon Penting
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px dashed ${BORDER}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>Resepsionis / Bantuan</span>
                  <strong style={{ color: NAVY }}>0</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px dashed ${BORDER}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>Layanan Kamar (Room Service)</span>
                  <strong style={{ color: NAVY }}>1</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px dashed ${BORDER}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>Housekeeping</span>
                  <strong style={{ color: NAVY }}>2</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px dashed ${BORDER}`, paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>Spa & Keugaran</span>
                  <strong style={{ color: NAVY }}>3</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Jam Operasional Fasilitas */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}` }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Jam Operasional Fasilitas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {FACILITIES.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F8FAFC", color: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>{f.name}</h4>
                    <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#6B7280" }}>{f.floor} • <strong>{f.time}</strong></p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: GOLD, fontStyle: "italic" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KONTEN TAB 2: PETA DENAH */}
      {activeTab === "Peta Denah" && (
        <div style={{ textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", padding: "40px", border: `1px solid ${BORDER}` }}>
          <FaMapSigns style={{ fontSize: "3rem", color: "#CBD5E1", margin: "0 auto 16px" }} />
          <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>Peta Denah Lantai (Simulasi)</h2>
          <p style={{ fontSize: "0.9rem", color: "#6B7280", maxWidth: "400px", margin: "0 auto 24px" }}>
            Anda dapat melihat jalur evakuasi dan denah umum untuk lantai tempat kamar Anda berada.
          </p>
          <div style={{ width: "100%", height: "300px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: `2px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
            [ Gambar Ilustrasi Denah Lantai Akan Dimuat di Sini ]
          </div>
        </div>
      )}

      {/* KONTEN TAB 3: EKSPLORASI SEKITAR */}
      {activeTab === "Eksplorasi Sekitar" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#6B7280" }}>Rekomendasi terbaik di radius 5 km dari hotel</p>
            <button style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaMapMarkerAlt /> Buka di Maps
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {RECOMMENDATIONS.map(rec => (
              <div key={rec.id} style={{ backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }}>
                <img src={rec.img} alt={rec.name} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>{rec.type}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY, backgroundColor: "#EBF0F8", padding: "2px 8px", borderRadius: "4px" }}>{rec.dist}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>{rec.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .gp-grid-2-1 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
