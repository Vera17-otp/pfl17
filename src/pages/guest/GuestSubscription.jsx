import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaCrown, FaCreditCard, FaCalendarCheck, 
  FaFilePdf, FaExclamationTriangle, FaCheckCircle, 
  FaClock, FaTimesCircle, FaBan, FaRegPauseCircle
} from "react-icons/fa";
import { useGuestAuth } from "../../context/GuestAuthContext";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

// --- Mock Payment History ---
const PAYMENT_HISTORY = [
  { id: "INV-001", date: "14 Mei 2026", plan: "Premium Bulanan", amount: 250000, method: "Kartu Kredit **** 4242", status: "Lunas" },
  { id: "INV-002", date: "14 Apr 2026", plan: "Premium Bulanan", amount: 250000, method: "Kartu Kredit **** 4242", status: "Lunas" },
  { id: "INV-003", date: "14 Mar 2026", plan: "Premium Bulanan", amount: 250000, method: "Virtual Account BCA", status: "Lunas" },
];

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function GuestSubscription() {
  const navigate = useNavigate();
  const { profile } = useGuestAuth();
  
  // Simulasi data status langganan
  const isPremium = profile?.isPremium;
  const currentPlan = "Premium Bulanan";
  const startDate = "14 Mei 2026";
  const endDate = "18 Juni 2026"; // Diset H-4 untuk memicu banner
  const price = 250000;
  
  const [autoRenew, setAutoRenew] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);

  const handleDownload = (id) => {
    alert(`Mengunduh invoice ${id} dalam format PDF...`);
  };

  const handleChangePayment = () => {
    alert("Diarahkan ke portal pembaruan kartu / metode pembayaran...");
  };

  const handleUpgradeYearly = () => {
    navigate("/guest/membership/pembayaran");
  };

  // ── Render Jika Bukan Premium ──
  if (!isPremium) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
             <FaArrowLeft />
          </button>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Kelola Langganan</h1>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "60px 20px", borderRadius: "20px", textAlign: "center", border: `1px solid ${BORDER}`, boxShadow: "0 10px 30px rgba(30,58,95,0.05)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <FaTimesCircle style={{ fontSize: "3rem", color: "#94A3B8" }} />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Membership Berakhir</h2>
          <p style={{ margin: "0 auto 24px", fontSize: "0.95rem", color: "#6B7280", lineHeight: 1.6, maxWidth: "400px" }}>
            Anda saat ini menggunakan akun Gratis. Aktifkan kembali membership Premium untuk menikmati harga eksklusif, late check-out, dan poin reward 2x lipat.
          </p>
          <button onClick={() => navigate("/guest/membership")} style={{ padding: "14px 32px", borderRadius: "12px", backgroundColor: GOLD, color: NAVY, fontSize: "1rem", fontWeight: 800, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(201,168,76,0.3)" }}>
            <FaCrown /> Aktifkan Kembali Premium
          </button>
        </div>
      </div>
    );
  }

  // ── Render Jika Premium ──
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0", fontSize: "1.6rem", fontWeight: 900, color: NAVY }}>Kelola Langganan</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#6B7280" }}>Pusat kontrol pengaturan membership Anda</p>
        </div>
      </div>

      {/* Banner Pengingat H-4 */}
      <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <FaExclamationTriangle style={{ color: "#D97706", fontSize: "1.5rem" }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: "#92400E" }}>Segera Berakhir! (Sisa 4 Hari)</h4>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#B45309" }}>Membership Premium Anda akan berakhir pada {endDate}. Perpanjang sekarang agar akses manfaat VIP Anda tidak terputus.</p>
        </div>
        <button style={{ padding: "8px 16px", backgroundColor: "#D97706", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Perpanjang Sekarang</button>
      </div>

      {/* 1. Status Panel */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", overflow: "hidden", marginBottom: "32px" }}>
        <div style={{ backgroundColor: NAVY, padding: "24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div>
             <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
               <FaCrown style={{ color: GOLD }} />
               <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: GOLD }}>Status: Aktif</span>
             </div>
             <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900 }}>{currentPlan}</h2>
           </div>
           <div style={{ textAlign: "right" }}>
             <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Biaya Berlangganan</p>
             <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900 }}>{rp(price)} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>/ bln</span></h2>
           </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600 }}>Tanggal Mulai</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: NAVY, display: "flex", alignItems: "center", gap: "8px" }}><FaCalendarCheck style={{ color: GOLD }} /> {startDate}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600 }}>Tanggal Berakhir</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: NAVY, display: "flex", alignItems: "center", gap: "8px" }}><FaClock style={{ color: "#EF4444" }} /> {endDate}</p>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <FaCreditCard style={{ fontSize: "1.2rem", color: "#64748B" }} />
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "0.85rem", fontWeight: 700, color: NAVY }}>Kartu Kredit **** 4242</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8" }}>Metode pembayaran utama</p>
              </div>
            </div>
            <button onClick={handleChangePayment} style={{ background: "none", border: `1px solid ${NAVY}`, color: NAVY, padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Ubah Metode</button>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: "24px", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
               <p style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Perpanjangan Otomatis (Auto-renew)</p>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>Otomatis memperpanjang paket pada tanggal tagihan berikutnya.</p>
             </div>
             <div 
               onClick={() => setAutoRenew(!autoRenew)} 
               style={{ width: "48px", height: "24px", borderRadius: "12px", backgroundColor: autoRenew ? "#10B981" : "#CBD5E1", position: "relative", cursor: "pointer", transition: "background-color 0.3s" }}
             >
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#fff", position: "absolute", top: "2px", left: autoRenew ? "26px" : "2px", transition: "left 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
             </div>
          </div>
        </div>
      </div>

      {/* 3. Opsi Kelola / Aksi Lanjutan */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <button onClick={handleUpgradeYearly} style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#fff", border: `2px solid ${GOLD}`, display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer", boxShadow: "0 4px 12px rgba(201,168,76,0.1)" }}>
          <div style={{ display: "inline-block", backgroundColor: "#FEF3C7", color: "#B45309", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, marginBottom: "12px" }}>HEMAT RP 500.000</div>
          <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>Upgrade ke Tahunan</h4>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280", textAlign: "left" }}>Bayar sekaligus untuk 1 tahun dan dapatkan gratis 2 bulan berlangganan.</p>
        </button>

        <button onClick={() => { setCancelStep(1); setShowCancelModal(true); }} style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#fff", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "flex-start", cursor: "pointer", boxShadow: "0 2px 8px rgba(30,58,95,0.03)" }}>
          <div style={{ display: "inline-block", backgroundColor: "#FEE2E2", color: "#B91C1C", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}><FaBan /> BERHENTI LANGGANAN</div>
          <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>Batalkan Langganan</h4>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280", textAlign: "left" }}>Akses premium akan dihentikan di akhir siklus tagihan Anda saat ini.</p>
        </button>
      </div>

      {/* 2. Riwayat Pembayaran */}
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Riwayat Pembayaran</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead style={{ backgroundColor: "#F8FAFC" }}>
              <tr>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Tanggal</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Paket</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Metode</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Total</th>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 24px", textAlign: "center", fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_HISTORY.map((txn, idx) => (
                <tr key={idx} style={{ borderBottom: idx === PAYMENT_HISTORY.length - 1 ? "none" : `1px solid ${BORDER}` }}>
                  <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: NAVY, fontWeight: 600 }}>{txn.date}</td>
                  <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: "#6B7280" }}>{txn.plan}</td>
                  <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: "#6B7280" }}>{txn.method}</td>
                  <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: NAVY, fontWeight: 700 }}>{rp(txn.amount)}</td>
                  <td style={{ padding: "16px 24px", fontSize: "0.85rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#D1FAE5", color: "#059669", padding: "4px 8px", borderRadius: "6px", fontWeight: 700, fontSize: "0.75rem" }}>
                      <FaCheckCircle /> {txn.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <button onClick={() => handleDownload(txn.id)} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: "1.1rem" }}>
                      <FaFilePdf />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Pembatalan (Dua Tahap) */}
      {showCancelModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30,58,95,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "24px", maxWidth: "450px", width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            
            {cancelStep === 1 ? (
              <>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                   <FaExclamationTriangle style={{ fontSize: "2rem", color: "#EF4444" }} />
                </div>
                <h2 style={{ margin: "0 0 12px", fontSize: "1.3rem", fontWeight: 900, color: NAVY, textAlign: "center" }}>Yakin ingin membatalkan?</h2>
                <p style={{ margin: "0 0 20px", fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.6, textAlign: "center" }}>
                  Jika Anda membatalkan, Anda akan kehilangan fitur eksklusif berikut pada <strong>{endDate}</strong>:
                </p>
                <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
                  <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.85rem", color: NAVY, lineHeight: 1.8 }}>
                    <li>Poin akumulasi tidak lagi berlipat ganda</li>
                    <li>Kehilangan diskon kamar 10-15%</li>
                    <li>Fitur Early Check-in & Late Check-out terkunci</li>
                    <li>Akses penukaran reward VIP (Spa, dsb) ditutup</li>
                  </ul>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={() => setShowCancelModal(false)} style={{ padding: "14px", borderRadius: "12px", backgroundColor: NAVY, color: "#fff", fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: "pointer" }}>Jangan Batalkan (Kembali)</button>
                  <button onClick={() => setCancelStep(2)} style={{ padding: "14px", borderRadius: "12px", backgroundColor: "transparent", color: "#EF4444", fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: "pointer" }}>Ya, Batalkan Langganan</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#E0E7FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                   <FaRegPauseCircle style={{ fontSize: "2.2rem", color: "#4F46E5" }} />
                </div>
                <h2 style={{ margin: "0 0 12px", fontSize: "1.3rem", fontWeight: 900, color: NAVY, textAlign: "center" }}>Tunggu! Bagaimana jika dijeda saja?</h2>
                <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6B7280", lineHeight: 1.6, textAlign: "center" }}>
                  Daripada membatalkan sepenuhnya dan kehilangan status Anda, Anda bisa <strong>menjeda (Pause) langganan selama 1 bulan</strong>. Tidak ada tagihan bulan depan, dan status Premium Anda akan aman tersimpan.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button onClick={() => { alert("Langganan berhasil dijeda selama 1 bulan."); setShowCancelModal(false); }} style={{ padding: "14px", borderRadius: "12px", backgroundColor: "#4F46E5", color: "#fff", fontWeight: 800, fontSize: "0.95rem", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>Jeda 1 Bulan Saja</button>
                  <button onClick={() => { alert("Langganan dibatalkan. Akses premium berakhir pada " + endDate); setShowCancelModal(false); }} style={{ padding: "14px", borderRadius: "12px", backgroundColor: "transparent", color: "#94A3B8", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer" }}>Tetap Batalkan Sepenuhnya</button>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
