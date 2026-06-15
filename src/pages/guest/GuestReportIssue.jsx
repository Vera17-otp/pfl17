import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle, FaUpload, FaTools } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const CATEGORIES = [
  "Fasilitas Rusak (AC, TV, Lampu, dll)",
  "Kebersihan Kamar",
  "Kebisingan / Gangguan",
  "Koneksi Internet / WiFi",
  "Lainnya"
];

export default function GuestReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    photo: null
  });

  const [tickets, setTickets] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description) return alert("Mohon lengkapi kategori dan deskripsi.");

    const newTicket = {
      id: `TKT-${Math.floor(Math.random() * 1000)}`,
      category: formData.category,
      desc: formData.description,
      status: "Menunggu Teknisi",
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setTickets([newTicket, ...tickets]);
    
    // Reset form
    setFormData({ category: "", description: "", photo: null });
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Lapor Masalah</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Bantuan cepat untuk kendala di kamar Anda</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* KOLOM KIRI: FORM */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.03)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Kategori Masalah</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, fontFamily: "inherit" }}>
                <option value="" disabled>Pilih Kategori...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Deskripsi Masalah</label>
              <textarea rows="4" placeholder="Jelaskan masalah secara detail (contoh: AC bocor air menetes ke lantai)..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Upload Foto (Opsional)</label>
              <div style={{ border: `2px dashed ${BORDER}`, padding: "20px", borderRadius: "10px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
                <FaUpload style={{ fontSize: "1.2rem", color: "#94A3B8", marginBottom: "8px" }} />
                <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "0 0 12px" }}>Bantu kami memahami masalah lebih cepat</p>
                <input type="file" id="issuePhoto" onChange={e => setFormData({...formData, photo: e.target.files[0]})} style={{ display: "none" }} />
                <label htmlFor="issuePhoto" style={{ display: "inline-block", padding: "6px 16px", backgroundColor: "#EBF0F8", color: NAVY, borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", border: `1px solid ${NAVY}` }}>
                  {formData.photo ? formData.photo.name : "Pilih Foto"}
                </label>
              </div>
            </div>

            <button type="submit" style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" }}>
              Kirim Laporan
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: RIWAYAT LAPORAN */}
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>Tiket Terbuka</h2>
          
          {tickets.length === 0 ? (
            <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: `1px dashed ${BORDER}`, textAlign: "center" }}>
              <FaTools style={{ fontSize: "2rem", color: "#CBD5E1", marginBottom: "12px" }} />
              <p style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>Tidak ada masalah</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>Semua berjalan lancar.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tickets.map(t => (
                <div key={t.id} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY }}>{t.id}</span>
                    <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#FEE2E2", color: "#EF4444" }}>
                      {t.status}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>{t.category}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#6B7280" }}>{t.desc}</p>
                  <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Estimasi Teknisi Tiba: 15 Menit</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
