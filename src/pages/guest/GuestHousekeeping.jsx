import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBroom, FaCheckCircle, FaClock } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const HK_OPTIONS = [
  { id: "makeup", title: "Bersihkan Kamar", desc: "Merapikan tempat tidur, menyapu, dan mengepel lantai" },
  { id: "towels", title: "Tambah Handuk", desc: "Minta handuk mandi atau handuk wajah tambahan" },
  { id: "amenities", title: "Tambah Amenities", desc: "Minta sabun, sampo, sikat gigi, atau shower cap" },
  { id: "sheets", title: "Ganti Sprei", desc: "Mengganti sprei, sarung bantal, dan selimut dengan yang baru" },
];

export default function GuestHousekeeping() {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [scheduleType, setScheduleType] = useState("now"); // "now" or "later"
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  
  // Mock requests list
  const [requests, setRequests] = useState([]);

  const handleToggle = (id) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRequest = () => {
    if (selectedServices.length === 0) return alert("Pilih minimal satu layanan.");
    if (scheduleType === "later" && !scheduledTime) return alert("Pilih waktu penjadwalan.");

    const newReq = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      services: selectedServices.map(id => HK_OPTIONS.find(o => o.id === id).title),
      time: scheduleType === "now" ? "Sekarang" : scheduledTime,
      status: "Diterima",
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setRequests([newReq, ...requests]);
    
    // Reset form
    setSelectedServices([]);
    setScheduleType("now");
    setScheduledTime("");
    setNotes("");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Housekeeping</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Minta pembersihan atau tambahan amenities</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* KOLOM KIRI: FORM */}
        <div>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.03)", marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Pilih Layanan</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {HK_OPTIONS.map(opt => {
                const isSelected = selectedServices.includes(opt.id);
                return (
                  <div key={opt.id} onClick={() => handleToggle(opt.id)} style={{
                    padding: "16px", borderRadius: "12px", border: `2px solid ${isSelected ? GOLD : BORDER}`,
                    backgroundColor: isSelected ? "#FDF8F2" : "#F8FAFC", cursor: "pointer", transition: "all 0.2s",
                    display: "flex", flexDirection: "column", gap: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>{opt.title}</span>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${isSelected ? GOLD : "#CBD5E1"}`, backgroundColor: isSelected ? GOLD : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isSelected && <FaCheckCircle style={{ color: "#fff", fontSize: "12px" }} />}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.4 }}>{opt.desc}</p>
                  </div>
                );
              })}
            </div>

            <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Waktu Layanan</h2>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: NAVY, cursor: "pointer" }}>
                <input type="radio" name="schedule" checked={scheduleType === "now"} onChange={() => setScheduleType("now")} style={{ accentColor: GOLD, width: "16px", height: "16px" }} />
                Sekarang (Secepatnya)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: NAVY, cursor: "pointer" }}>
                <input type="radio" name="schedule" checked={scheduleType === "later"} onChange={() => setScheduleType("later")} style={{ accentColor: GOLD, width: "16px", height: "16px" }} />
                Jadwalkan Waktu
              </label>
            </div>
            
            {scheduleType === "later" && (
              <div style={{ marginBottom: "20px" }}>
                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, fontFamily: "inherit" }} />
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Catatan Tambahan (Opsional)</label>
              <textarea rows="3" placeholder="Contoh: Tolong bawa 2 handuk tambahan..." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.85rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            <button onClick={handleRequest} disabled={selectedServices.length === 0} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: selectedServices.length > 0 ? NAVY : "#CBD5E1", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: selectedServices.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Kirim Permintaan
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: STATUS PERMINTAAN */}
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>Permintaan Aktif</h2>
          
          {requests.length === 0 ? (
            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: `1px dashed ${BORDER}`, textAlign: "center" }}>
              <FaBroom style={{ fontSize: "2rem", color: "#CBD5E1", marginBottom: "12px" }} />
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Belum ada permintaan housekeeping aktif.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {requests.map(req => (
                <div key={req.id} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: GOLD }}>{req.id}</span>
                    <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#FEF3C7", color: "#F59E0B" }}>
                      {req.status}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>
                    {req.services.join(", ")}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#6B7280" }}>
                    <FaClock /> Waktu: {req.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .gp-grid-2-1 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
