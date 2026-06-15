import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaCheck, FaInfoCircle, FaQrcode, FaLock, FaCrown } from "react-icons/fa";
import { reservations } from "../../data/reservations";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

export default function GuestPreCheckIn() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { guest } = useGuestAuth();

  const res = useMemo(() => reservations.find(r => r.bookingId === bookingId) || {
    bookingId, guestName: "Vera Zakia", roomType: "Deluxe Room",
    status: "Booked", checkIn: "2026-06-18", checkOut: "2026-06-20"
  }, [bookingId]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: guest?.name || res.guestName,
    email: guest?.email || "tamu@contoh.com",
    phone: guest?.phone || "081234567890",
    idFile: null,
    floor: "sedang",
    location: "dekat",
    pillow: "lembut",
    arrivalTime: "14:00",
    specialRequests: "",
    earlyCheckIn: false,
    lateCheckOut: false,
  });

  const isPremium = guest?.isPremium;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleFinish = () => {
    // Save to local storage to mock state
    localStorage.setItem(`precheckin_${bookingId}`, "done");
    setStep(3); // QR Code step
  };

  const renderStep1 = () => (
    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>Konfirmasi Data Diri & ID</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Nama Lengkap Sesuai ID</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Nomor HP</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Upload Foto KTP / Paspor</label>
        <div style={{ border: `2px dashed ${BORDER}`, padding: "30px", borderRadius: "12px", textAlign: "center", backgroundColor: "#F8FAFC" }}>
          <FaUpload style={{ fontSize: "1.5rem", color: "#94A3B8", marginBottom: "8px" }} />
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Tarik file ke sini atau klik untuk memilih</div>
          <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: "0 0 12px" }}>Format JPG, PNG maksimal 5MB</p>
          <input type="file" id="idFile" onChange={e => setFormData({...formData, idFile: e.target.files[0]})} style={{ display: "none" }} />
          <label htmlFor="idFile" style={{ display: "inline-block", padding: "8px 16px", backgroundColor: NAVY, color: "#fff", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            {formData.idFile ? formData.idFile.name : "Pilih File"}
          </label>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => {
          if (!formData.name || !formData.phone) return alert("Lengkapi data diri.");
          setStep(2);
        }} style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: GOLD, color: NAVY, border: "none", fontWeight: 800, cursor: "pointer" }}>
          Lanjut ke Preferensi
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>Preferensi & Kedatangan</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Pilihan Lantai</label>
          <select value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none" }}>
            <option value="rendah">Lantai Rendah</option>
            <option value="sedang">Lantai Sedang</option>
            <option value="tinggi">Lantai Tinggi</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Lokasi Kamar</label>
          <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none" }}>
            <option value="dekat">Dekat Lift</option>
            <option value="jauh">Jauh dari Lift</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Tipe Bantal</label>
          <select value={formData.pillow} onChange={e => setFormData({...formData, pillow: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none" }}>
            <option value="lembut">Lembut (Soft)</option>
            <option value="keras">Agak Keras (Firm)</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Estimasi Jam Kedatangan</label>
          <select value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none" }}>
            <option value="12:00">12:00 - 14:00 (Early Check-in)*</option>
            <option value="14:00">14:00 - 16:00 (Standar)</option>
            <option value="16:00">16:00 - 18:00</option>
            <option value="18:00">18:00 - 20:00</option>
            <option value="20:00">Di atas 20:00</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <PremiumLockOverlay>
          <div 
            onClick={() => setFormData(f => ({ ...f, earlyCheckIn: !f.earlyCheckIn }))}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", border: `1px solid ${formData.earlyCheckIn ? GOLD : BORDER}`, backgroundColor: formData.earlyCheckIn ? `${GOLD}15` : "#fff", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${formData.earlyCheckIn ? GOLD : BORDER}`, backgroundColor: formData.earlyCheckIn ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {formData.earlyCheckIn && <FaCheck style={{ color: "#fff", fontSize: "0.7rem" }} />}
            </div>
            <div style={{ zIndex: 2 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: "6px" }}>Minta Early Check-in <FaCrown style={{ color: GOLD }}/></div>
              <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Mulai 11:00 AM</div>
            </div>
          </div>
        </PremiumLockOverlay>
        
        <PremiumLockOverlay>
          <div 
            onClick={() => setFormData(f => ({ ...f, lateCheckOut: !f.lateCheckOut }))}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", border: `1px solid ${formData.lateCheckOut ? GOLD : BORDER}`, backgroundColor: formData.lateCheckOut ? `${GOLD}15` : "#fff", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${formData.lateCheckOut ? GOLD : BORDER}`, backgroundColor: formData.lateCheckOut ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {formData.lateCheckOut && <FaCheck style={{ color: "#fff", fontSize: "0.7rem" }} />}
            </div>
            <div style={{ zIndex: 2 }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: "6px" }}>Minta Late Check-out <FaCrown style={{ color: GOLD }}/></div>
              <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Hingga 14:00 PM</div>
            </div>
          </div>
        </PremiumLockOverlay>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>Permintaan Khusus</label>
        <textarea rows={3} value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} placeholder="Contoh: Kejutan ulang tahun, extra handuk..." style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>*Permintaan khusus dan early check-in bergantung pada ketersediaan.</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(1)} style={{ padding: "12px 24px", borderRadius: "10px", background: "transparent", color: NAVY, border: `1px solid ${BORDER}`, fontWeight: 700, cursor: "pointer" }}>
          Kembali
        </button>
        <button onClick={handleFinish} style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}>
          Selesaikan Pra-Check-in
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", textAlign: "center" }}>
      <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#D1FAE5", color: "#10B981", fontSize: "1.8rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <FaCheck />
      </div>
      <h2 style={{ margin: "0 0 12px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Pra-Check-in Berhasil!</h2>
      <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: "0 auto 24px", maxWidth: "400px", lineHeight: 1.6 }}>
        Terima kasih, data Anda telah kami terima. Kami akan mempersiapkan kamar sesuai preferensi Anda.
      </p>

      <div style={{ display: "inline-block", backgroundColor: "#F8FAFC", padding: "24px", borderRadius: "16px", border: `2px dashed ${BORDER}`, marginBottom: "30px" }}>
        <FaQrcode style={{ fontSize: "8rem", color: NAVY, marginBottom: "16px" }} />
        <div style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Tunjukkan QR Ini</div>
        <div style={{ fontSize: "1rem", color: NAVY, fontWeight: 900 }}>di Express Lane Resepsionis</div>
      </div>

      <div>
        <button onClick={() => navigate(`/guest/reservasi/${bookingId}`)} style={{ padding: "12px 30px", borderRadius: "10px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}>
          Kembali ke Detail Reservasi
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Pra-Check-in Online</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Booking ID: {bookingId} • {res.roomType}</p>
        </div>
      </div>

      {step < 3 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "6px", borderRadius: "4px", backgroundColor: step >= 1 ? GOLD : "#E2E8F0" }} />
          <div style={{ flex: 1, height: "6px", borderRadius: "4px", backgroundColor: step >= 2 ? GOLD : "#E2E8F0" }} />
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
