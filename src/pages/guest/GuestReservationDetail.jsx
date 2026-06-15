import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaCalendarAlt, FaBed, FaUser, FaCheckCircle, 
  FaQrcode, FaPlus, FaUtensils, FaGift, FaPrint, FaDownload,
  FaCrown, FaLock
} from "react-icons/fa";
import { reservations } from "../../data/reservations";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function GuestReservationDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { guest } = useGuestAuth();
  const isPremium = guest?.isPremium;

  // Find reservation or mock one
  const res = useMemo(() => reservations.find(r => r.bookingId === bookingId) || {
    bookingId, guestName: "Vera Zakia", roomType: "Deluxe Room", roomNumber: "-", 
    status: "Booked", checkIn: "2026-06-18", checkOut: "2026-06-20", totalPayment: 1500000
  }, [bookingId]);

  // Simulate extra services added
  const [extras, setExtras] = useState([]);
  const [upgradeRequested, setUpgradeRequested] = useState(false);

  // Check if eligible for pre-checkin (H-3 to H-1)
  const checkInDate = new Date(res.checkIn);
  const today = new Date();
  const diffDays = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
  const canPreCheckIn = res.status === "Booked" && diffDays >= 1 && diffDays <= 3;
  // Assume pre-checkin is done if status is Check-in or we store a flag (mocking flag for now)
  const isPreCheckInDone = localStorage.getItem(`precheckin_${bookingId}`) === "done";

  const totalExtras = extras.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = res.totalPayment + totalExtras;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <button onClick={() => navigate("/guest/reservasi")} style={{ background: "none", border: "none", color: NAVY, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, marginBottom: "24px", padding: 0 }}>
        <FaArrowLeft /> Kembali ke Daftar Reservasi
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.8rem", fontWeight: 900, color: NAVY }}>Detail Reservasi</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6B7280", fontWeight: 600 }}>Booking ID: {res.bookingId}</p>
        </div>
        <span style={{ 
          padding: "6px 14px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700,
          backgroundColor: res.status === "Booked" ? "#FEF3C7" : res.status === "Check-in" ? "#D1FAE5" : "#F3F4F6",
          color: res.status === "Booked" ? "#F59E0B" : res.status === "Check-in" ? "#10B981" : "#6B7280"
        }}>
          {res.status === "Booked" ? "Akan Datang" : res.status === "Check-in" ? "Sedang Menginap" : res.status}
        </span>
      </div>

      {/* PRA-CHECK-IN BANNER */}
      {res.status === "Booked" && !isPreCheckInDone && (
        <div style={{ 
          backgroundColor: canPreCheckIn ? "#EBF0F8" : "#F8FAFC", 
          border: `1px solid ${canPreCheckIn ? NAVY : BORDER}`, 
          borderRadius: "16px", padding: "20px", marginBottom: "24px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>
              {canPreCheckIn ? "Waktunya Pra-Check-in!" : "Pra-Check-in Online"}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#4B5563" }}>
              {canPreCheckIn 
                ? "Lakukan pra-check-in sekarang untuk menghindari antrean di resepsionis." 
                : "Fitur ini akan terbuka pada H-3 sebelum tanggal check-in Anda."}
            </p>
          </div>
          <button 
            disabled={!canPreCheckIn}
            onClick={() => navigate(`/guest/pre-checkin/${bookingId}`)}
            style={{ 
              padding: "12px 24px", borderRadius: "10px", 
              backgroundColor: canPreCheckIn ? NAVY : "#CBD5E1", 
              color: "#fff", border: "none", fontWeight: 700, cursor: canPreCheckIn ? "pointer" : "not-allowed",
              whiteSpace: "nowrap"
            }}>
            Lakukan Pra-Check-in
          </button>
        </div>
      )}

      {isPreCheckInDone && (
        <div style={{ backgroundColor: "#D1FAE5", border: "1px solid #10B981", borderRadius: "16px", padding: "20px", marginBottom: "24px", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ width: "80px", height: "80px", backgroundColor: "#fff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #10B981", flexShrink: 0 }}>
            <FaQrcode style={{ fontSize: "3rem", color: NAVY }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <FaCheckCircle style={{ color: "#10B981" }} />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>Pra-Check-in Selesai</h3>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#4B5563" }}>
              Tunjukkan QR Code ini kepada resepsionis saat kedatangan untuk proses check-in kilat (Express Lane).
            </p>
            <button style={{ background: "none", border: "none", color: NAVY, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
              <FaDownload /> Simpan QR Code
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* KOLOM KIRI */}
        <div>
          {/* Rincian Kamar */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, marginBottom: "24px", boxShadow: "0 2px 12px rgba(30,58,95,0.03)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Informasi Reservasi</h3>
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#EBF0F8", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, fontSize: "1.5rem" }}>
                <FaBed />
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>{res.roomType}</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Kamar No: <strong style={{ color: NAVY }}>{res.roomNumber}</strong></p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Check-in</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>{new Date(res.checkIn).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280" }}>Mulai 14:00</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Check-out</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>{new Date(res.checkOut).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280" }}>Sebelum 12:00</span>
              </div>
            </div>
            
            <div style={{ marginTop: "16px", borderTop: `1px dashed ${BORDER}`, paddingTop: "16px" }}>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Tamu Utama</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: "8px" }}><FaUser style={{ color: GOLD }} /> {res.guestName}</span>
            </div>

            {res.status === "Booked" && (
              <div style={{ marginTop: "20px" }}>
                <PremiumLockOverlay>
                  <button 
                    onClick={() => { alert("Permintaan upgrade kamar dikirim ke resepsionis. Kami akan mengonfirmasi H-1."); setUpgradeRequested(true); }}
                    disabled={upgradeRequested}
                    style={{ 
                      width: "100%", padding: "14px", borderRadius: "12px", 
                      backgroundColor: upgradeRequested ? "#D1FAE5" : `${GOLD}20`, 
                      border: `1.5px solid ${upgradeRequested ? "#10B981" : GOLD}`, 
                      color: upgradeRequested ? "#059669" : NAVY, 
                      fontWeight: 800, cursor: upgradeRequested ? "default" : "pointer", 
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
                      fontFamily: "inherit", position: "relative", overflow: "hidden" 
                    }}>
                    {upgradeRequested ? <FaCheckCircle /> : <FaCrown style={{ color: GOLD }} />}
                    {upgradeRequested ? "Permintaan Upgrade Terkirim" : "Minta Upgrade Kamar Gratis"}
                  </button>
                  {!upgradeRequested && <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "#6B7280", textAlign: "center" }}>*Tergantung ketersediaan kamar pada hari check-in.</p>}
                </PremiumLockOverlay>
              </div>
            )}
          </div>

          {/* Layanan Tambahan */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(30,58,95,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Layanan Tambahan</h3>
              <button 
                onClick={() => navigate(`/guest/tambah-layanan/${bookingId}`)}
                style={{ background: "none", border: "none", color: GOLD, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaPlus /> Tambah
              </button>
            </div>

            {extras.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: `1px dashed ${BORDER}` }}>
                <p style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#6B7280" }}>Belum ada layanan ekstra yang ditambahkan.</p>
                <button onClick={() => navigate(`/guest/tambah-layanan/${bookingId}`)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>Lihat Katalog Layanan</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {extras.map((ex, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ color: GOLD, fontSize: "1.2rem" }}>{ex.icon}</div>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY }}>{ex.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{ex.qty}x</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{rp(ex.price * ex.qty)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, position: "sticky", top: "100px", boxShadow: "0 4px 20px rgba(30,58,95,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Rincian Tagihan</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem", color: "#4B5563" }}>
              <span>Kamar & Pajak</span>
              <span>{rp(res.totalPayment)}</span>
            </div>
            
            {extras.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem", color: "#4B5563" }}>
                <span>Layanan Ekstra</span>
                <span>{rp(totalExtras)}</span>
              </div>
            )}

            <div style={{ borderTop: `1px dashed ${BORDER}`, margin: "16px 0" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Total Tagihan</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 900, color: GOLD }}>{rp(grandTotal)}</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", backgroundColor: "#D1FAE5", borderRadius: "8px", color: "#059669", fontSize: "0.8rem", fontWeight: 600, marginBottom: "20px" }}>
              <FaCheckCircle /> Lunas (Via Kartu Kredit)
            </div>

            <button style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "transparent", border: `1.5px solid ${NAVY}`, color: NAVY, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit" }}>
              <FaPrint /> Cetak Struk
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
