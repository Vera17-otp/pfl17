import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGuestAuth } from "../../context/GuestAuthContext";
import { FaCheckCircle, FaCreditCard, FaWallet, FaUniversity, FaChevronRight, FaCrown, FaEnvelope } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

export default function GuestMembershipPayment() {
  const { paket } = useParams();
  const navigate = useNavigate();
  const { profile, updateProfile, showToast } = useGuestAuth();

  const isTahunan = paket === "tahunan";
  const basePrice = isTahunan ? 799000 : 99000;

  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dates, setDates] = useState({ start: "", end: "" });

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    if (isTahunan) {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    setDates({
      start: start.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
      end: end.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    });
  }, [isTahunan]);

  const totalPrice = basePrice - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "MEMBERBARU") {
      setDiscount(basePrice * 0.1); // 10% discount
      showToast("Kode promo MEMBERBARU berhasil digunakan!", "success");
    } else {
      setDiscount(0);
      showToast("Kode promo tidak valid atau kadaluarsa.", "error");
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const paymentOptions = [
    { id: "bca_va", name: "BCA Virtual Account", type: "Virtual Account", icon: <FaUniversity />, time: "Otomatis" },
    { id: "mandiri_va", name: "Mandiri Virtual Account", type: "Virtual Account", icon: <FaUniversity />, time: "Otomatis" },
    { id: "cc", name: "Kartu Kredit / Debit", type: "Kartu Kredit", icon: <FaCreditCard />, time: "Otomatis" },
    { id: "gopay", name: "GoPay", type: "Dompet Digital", icon: <FaWallet />, time: "Otomatis" },
    { id: "ovo", name: "OVO", type: "Dompet Digital", icon: <FaWallet />, time: "Otomatis" }
  ];

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // 1. Update Guest Profile
      updateProfile({
        isPremium: true,
        premiumExpiry: dates.end
      });

      // 2. Record to Admin Invoices
      try {
        const savedInvoices = localStorage.getItem("hotelify_invoices");
        let invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
        const newInvoice = {
          id: `INV-MEM-${Math.floor(Math.random() * 10000)}`,
          guestName: profile.namaLengkap,
          roomNumber: "Guest Portal", // Tidak ada kamar spesifik
          checkIn: dates.start,
          checkOut: dates.end,
          totalAmount: totalPrice,
          status: "Paid",
          paymentMethod: paymentOptions.find(p => p.id === paymentMethod)?.name || "Transfer",
          items: [
            { desc: `Membership Premium (${isTahunan ? 'Tahunan' : 'Bulanan'})`, amount: basePrice },
            ...(discount > 0 ? [{ desc: 'Diskon Promo', amount: -discount }] : [])
          ],
          date: new Date().toISOString()
        };
        invoices.push(newInvoice);
        localStorage.setItem("hotelify_invoices", JSON.stringify(invoices));
      } catch (err) {
        console.error("Gagal menyimpan invoice admin", err);
      }

      setIsProcessing(false);
      setStep(3);
      window.scrollTo(0, 0);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {/* STEPPER HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", padding: "0 20px" }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "12px", opacity: step >= s ? 1 : 0.4 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= s ? NAVY : "#E2E8F0", color: step >= s ? "#fff" : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              {s}
            </div>
            <span style={{ fontWeight: 700, color: step >= s ? NAVY : "#64748B", display: "none" }} className="sm-block">
              {s === 1 ? "Ringkasan" : s === 2 ? "Pembayaran" : "Konfirmasi"}
            </span>
            {s !== 3 && <FaChevronRight style={{ color: "#CBD5E1", marginLeft: "12px" }} />}
          </div>
        ))}
      </div>

      {/* STEP 1: RINGKASAN PESANAN */}
      {step === 1 && (
        <div className="fade-in">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: NAVY, marginBottom: "24px" }}>Ringkasan Pesanan</h2>
          <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: `1px solid ${BORDER}`, padding: "32px", boxShadow: "0 4px 20px rgba(30,58,95,0.03)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>HotelQu Premium</h3>
                <p style={{ margin: 0, color: "#6B7280" }}>Paket {isTahunan ? "Tahunan" : "Bulanan"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: NAVY }}>{formatRupiah(basePrice)}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "24px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Tanggal Mulai Aktif</p>
                <p style={{ margin: 0, fontWeight: 700, color: NAVY }}>{dates.start}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Tanggal Berakhir</p>
                <p style={{ margin: 0, fontWeight: 700, color: NAVY }}>{dates.end}</p>
              </div>
            </div>

            <div style={{ padding: "24px 0", borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>Kode Promo / Voucher</p>
              <div style={{ display: "flex", gap: "12px" }}>
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Masukkan kode promo (Cth: MEMBERBARU)" 
                  style={{ flex: 1, padding: "12px 16px", border: `1px solid ${BORDER}`, borderRadius: "12px", outline: "none", fontSize: "0.95rem" }}
                />
                <button onClick={handleApplyPromo} style={{ padding: "0 24px", backgroundColor: NAVY, color: "#fff", borderRadius: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  Gunakan
                </button>
              </div>
              {discount > 0 && (
                <p style={{ margin: "12px 0 0", color: "#10B981", fontSize: "0.9rem", fontWeight: 700 }}>
                  <FaCheckCircle style={{ marginRight: "6px" }} />
                  Potongan harga {formatRupiah(discount)} berhasil diterapkan.
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY }}>Total Tagihan</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: GOLD }}>{formatRupiah(totalPrice)}</span>
            </div>

          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <button onClick={() => navigate(-1)} style={{ padding: "16px", width: "30%", backgroundColor: "transparent", color: NAVY, border: `2px solid ${BORDER}`, borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>
              Kembali
            </button>
            <button onClick={() => setStep(2)} style={{ padding: "16px", width: "70%", backgroundColor: NAVY, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer" }}>
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: METODE PEMBAYARAN */}
      {step === 2 && (
        <div className="fade-in">
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: NAVY, marginBottom: "24px" }}>Pilih Metode Pembayaran</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "32px" }}>
            {paymentOptions.map((opt) => (
              <label key={opt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", backgroundColor: paymentMethod === opt.id ? "#F8FAFC" : "#fff", border: `2px solid ${paymentMethod === opt.id ? NAVY : BORDER}`, borderRadius: "16px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ color: paymentMethod === opt.id ? NAVY : "#94A3B8", fontSize: "1.5rem" }}>{opt.icon}</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: NAVY }}>{opt.name}</h4>
                    <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{opt.type}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#10B981", backgroundColor: "#D1FAE5", padding: "4px 8px", borderRadius: "8px", fontWeight: 700 }}>Verifikasi: {opt.time}</span>
                  <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} style={{ width: "20px", height: "20px", accentColor: NAVY }} />
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <button onClick={() => setStep(1)} style={{ padding: "16px", width: "30%", backgroundColor: "transparent", color: NAVY, border: `2px solid ${BORDER}`, borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}>
              Kembali
            </button>
            <button onClick={handleConfirmPayment} disabled={!paymentMethod || isProcessing} style={{ padding: "16px", width: "70%", backgroundColor: (!paymentMethod || isProcessing) ? "#94A3B8" : NAVY, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "1.05rem", cursor: (!paymentMethod || isProcessing) ? "not-allowed" : "pointer" }}>
              {isProcessing ? "Memverifikasi..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: KONFIRMASI (SUKSES) */}
      {step === 3 && (
        <div className="fade-in" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#D1FAE5", color: "#10B981", fontSize: "3rem", marginBottom: "24px" }}>
            <FaCheckCircle />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: NAVY, marginBottom: "8px" }}>Pembayaran Berhasil!</h2>
          <p style={{ fontSize: "1.05rem", color: "#6B7280", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
            Selamat! Status membership Anda kini telah menjadi <b>Premium Aktif</b>.
          </p>

          <div style={{ backgroundColor: "#F8FAFC", border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "24px", maxWidth: "500px", margin: "0 auto 32px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", borderBottom: `1px solid ${BORDER}`, paddingBottom: "16px" }}>
              <FaCrown style={{ color: GOLD, fontSize: "1.5rem" }} />
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Paket Langganan</p>
                <p style={{ margin: 0, fontWeight: 800, color: NAVY }}>Premium {isTahunan ? "Tahunan" : "Bulanan"}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Aktif Sejak</p>
                <p style={{ margin: 0, fontWeight: 700, color: NAVY }}>{dates.start}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "#6B7280" }}>Berakhir Pada</p>
                <p style={{ margin: 0, fontWeight: 700, color: NAVY }}>{dates.end}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", backgroundColor: "#FEF3C7", color: "#B45309", padding: "12px 24px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 700, marginBottom: "40px" }}>
            <FaEnvelope style={{ fontSize: "1.2rem" }} /> Email konfirmasi dan invoice telah dikirim.
          </div>

          <div>
            <button onClick={() => navigate("/guest/dashboard")} style={{ padding: "16px 48px", backgroundColor: NAVY, color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(30,58,95,0.3)" }}>
              Mulai Nikmati Premium
            </button>
          </div>
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 600px) {
          .sm-block { display: none !important; }
        }
      `}</style>
    </div>
  );
}
