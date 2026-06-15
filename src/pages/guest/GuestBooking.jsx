import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaCheck, FaArrowLeft, FaArrowRight, FaCreditCard, FaMoneyBillWave, 
  FaWallet, FaUpload, FaFileDownload, FaTag, FaInfoCircle, FaLock, FaCrown
} from "react-icons/fa";
import { rooms } from "../../data/rooms";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const CREAM = "#FDF8F2";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const PAYMENT_METHODS = [
  { id: "transfer", name: "Transfer Bank", icon: <FaMoneyBillWave />, desc: "BCA, Mandiri, BNI, BRI" },
  { id: "cc", name: "Kartu Kredit / Debit", icon: <FaCreditCard />, desc: "Visa, Mastercard, JCB" },
  { id: "va", name: "Virtual Account", icon: <FaMoneyBillWave />, desc: "Transfer real-time via VA" },
  { id: "ewallet", name: "Dompet Digital", icon: <FaWallet />, desc: "GoPay, OVO, Dana, ShopeePay" },
];

export default function GuestBooking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { guest } = useGuestAuth();

  const room = useMemo(() => rooms.find(r => r.roomId === roomId), [roomId]);

  // Retrieve state from previous page, fallback to defaults
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  
  const checkIn = location.state?.checkIn || today;
  const checkOut = location.state?.checkOut || tomorrow;
  const extras = location.state?.extras || {};

  // Form State
  const [step, setStep] = useState(1); // 1: Data, 2: Summary, 3: Payment, 4: Success
  const [formData, setFormData] = useState({
    name: guest?.name || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    identityNumber: "",
    arrivalTime: "14:00",
    specialRequests: "",
    earlyCheckIn: false,
    lateCheckOut: false,
  });
  
  // Payment & Promo State
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [proofFile, setProofFile] = useState(null);
  const [bookingRef, setBookingRef] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (!room) {
    return <div style={{ padding: "100px", textAlign: "center" }}>Kamar tidak ditemukan.</div>;
  }

  // Calculations
  const date1 = new Date(checkIn);
  const date2 = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((date2 - date1) / 86400000));
  
  const roomTotal = room.price * nights;
  
  // Reconstruct extras total based on selected extras ids
  const EXTRA_SERVICES = [
    { id: "breakfast", title: "Sarapan Buffet", price: 150000 },
    { id: "transfer", title: "Airport Transfer", price: 250000 },
    { id: "decor", title: "Dekorasi Romantis", price: 300000 },
  ];
  
  const extrasList = EXTRA_SERVICES.filter(ex => extras[ex.id]);
  const extrasTotal = extrasList.reduce((sum, ex) => sum + ex.price, 0);
  
  const isPremium = guest?.isPremium;
  const memberDiscountAmount = isPremium ? roomTotal * 0.1 : 0;
  
  const subtotal = roomTotal + extrasTotal - memberDiscountAmount;
  const tax = subtotal * 0.11;
  const service = subtotal * 0.10;
  const grandTotalBeforeDiscount = subtotal + tax + service;
  const grandTotal = Math.max(0, grandTotalBeforeDiscount - discount);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "HOTELQU20") {
      setDiscount(150000); // Rp 150.000 discount
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === "WELCOME") {
      setDiscount(grandTotalBeforeDiscount * 0.1); // 10% discount
      setPromoApplied(true);
    } else {
      alert("Kode promo tidak valid");
      setDiscount(0);
      setPromoApplied(false);
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === "transfer" && !proofFile) {
      alert("Harap unggah bukti transfer");
      return;
    }
    
    // Simulate API call saving booking
    setBookingRef(`HQ-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
    setStep(4);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STEP 1: DATA TAMU
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
      <h2 style={{ margin: "0 0 24px", color: NAVY, fontSize: "1.4rem", fontWeight: 800 }}>Langkah 1: Data Tamu</h2>
      
      {!guest && (
        <div style={{ padding: "16px", backgroundColor: "#EBF0F8", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <FaInfoCircle style={{ color: NAVY, fontSize: "1.2rem" }} />
          <div style={{ fontSize: "0.85rem", color: NAVY }}>
            Sudah punya akun? <a href="/guest/login" style={{ fontWeight: 800, color: NAVY }}>Login sekarang</a> untuk pengisian data otomatis.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Nama Lengkap *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Nomor HP/WhatsApp *</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>No. Identitas (KTP/Paspor) *</label>
          <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} required
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Estimasi Waktu Kedatangan</label>
        <select name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange}
          style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, cursor: "pointer", backgroundColor: "#fff", boxSizing: "border-box" }}>
          <option value="14:00">14:00 - 15:00</option>
          <option value="15:00">15:00 - 16:00</option>
          <option value="16:00">16:00 - 17:00</option>
          <option value="18:00">18:00 - 20:00</option>
          <option value="20:00">Di atas 20:00</option>
        </select>
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

      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Permintaan Khusus (Opsional)</label>
        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows={3} placeholder="Contoh: Kamar non-smoking, bed tipe king, late check-in..."
          style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1.5px solid ${BORDER}`, outline: "none", fontSize: "0.9rem", color: NAVY, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>*Tergantung ketersediaan saat check-in</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => {
          if (!formData.name || !formData.email || !formData.phone || !formData.identityNumber) {
            alert("Harap isi semua kolom wajib (*)"); return;
          }
          setStep(2);
        }} style={{ padding: "14px 28px", borderRadius: "10px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          Lanjut ke Ringkasan <FaArrowRight />
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STEP 2: RINGKASAN
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
      <h2 style={{ margin: "0 0 24px", color: NAVY, fontSize: "1.4rem", fontWeight: 800 }}>Langkah 2: Ringkasan Pesanan</h2>
      
      {/* Kartu Kamar Mini */}
      <div style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "24px" }}>
        <img src={room.image} alt="Room" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{room.type} Room</h3>
          <div style={{ fontSize: "0.85rem", color: "#4B5563", marginBottom: "4px" }}>
            {new Date(checkIn).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} - {new Date(checkOut).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#4B5563", fontWeight: 700 }}>
            {nights} Malam • {room.capacity} Tamu
          </div>
        </div>
      </div>

      {/* Rincian Tamu */}
      <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: `1px dashed ${BORDER}` }}>
        <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", color: NAVY }}>Data Pemesan</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem", color: "#4B5563" }}>
          <div><strong>Nama:</strong> {formData.name}</div>
          <div><strong>Email:</strong> {formData.email}</div>
          <div><strong>No. HP:</strong> {formData.phone}</div>
          <div><strong>Estimasi Tiba:</strong> {formData.arrivalTime}</div>
        </div>
      </div>

      {/* Rincian Biaya */}
      <h4 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Rincian Pembayaran</h4>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem", color: "#4B5563" }}>
        <span>Harga Kamar ({nights} Malam)</span>
        <span>{rp(roomTotal)}</span>
      </div>
      
      {extrasList.map(ex => (
        <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem", color: "#4B5563" }}>
          <span>Tambahan: {ex.title}</span>
          <span>{rp(ex.price)}</span>
        </div>
      ))}
      
      {isPremium && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem", color: "#10B981", fontWeight: 700 }}>
          <span>Diskon Member Premium (10%)</span>
          <span>-{rp(memberDiscountAmount)}</span>
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.9rem", color: "#4B5563" }}>
        <span>Pajak PB1 (11%)</span>
        <span>{rp(tax)}</span>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "0.9rem", color: "#4B5563" }}>
        <span>Biaya Layanan (10%)</span>
        <span>{rp(service)}</span>
      </div>

      {/* Kode Promo */}
      <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: `1px solid ${BORDER}` }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>
          <FaTag style={{ color: GOLD }} /> Punya Kode Promo?
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} disabled={promoApplied} placeholder="Masukkan kode promo"
            style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", textTransform: "uppercase" }} />
          <button onClick={handleApplyPromo} disabled={promoApplied || !promoCode}
            style={{ padding: "0 20px", borderRadius: "8px", border: "none", backgroundColor: promoApplied ? "#10B981" : NAVY, color: "#fff", fontWeight: 700, cursor: promoApplied ? "default" : "pointer" }}>
            {promoApplied ? "Terpakai" : "Gunakan"}
          </button>
        </div>
        {promoApplied && <div style={{ fontSize: "0.8rem", color: "#10B981", marginTop: "8px", fontWeight: 600 }}>Berhasil! Diskon sebesar {rp(discount)} telah diterapkan.</div>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: `${GOLD}15`, borderRadius: "12px", border: `1px solid ${GOLD}40`, marginBottom: "30px" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Total Pembayaran</span>
        <div style={{ textAlign: "right" }}>
          {promoApplied && <div style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "#ef4444" }}>{rp(grandTotalBeforeDiscount)}</div>}
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: GOLD }}>{rp(grandTotal)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(1)} style={{ padding: "14px 28px", borderRadius: "10px", background: "transparent", color: NAVY, border: `1.5px solid ${BORDER}`, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          Kembali
        </button>
        <button onClick={() => setStep(3)} style={{ padding: "14px 28px", borderRadius: "10px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          Lanjut ke Pembayaran <FaArrowRight />
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STEP 3: PEMBAYARAN
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)" }}>
      <h2 style={{ margin: "0 0 24px", color: NAVY, fontSize: "1.4rem", fontWeight: 800 }}>Langkah 3: Pembayaran</h2>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "24px" }}>
        <span style={{ fontSize: "0.9rem", color: "#4B5563", fontWeight: 600 }}>Total Tagihan</span>
        <span style={{ fontSize: "1.4rem", fontWeight: 900, color: GOLD }}>{rp(grandTotal)}</span>
      </div>

      <h4 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Pilih Metode Pembayaran</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {PAYMENT_METHODS.map(method => (
          <div key={method.id} onClick={() => setPaymentMethod(method.id)} 
            style={{ padding: "16px", borderRadius: "12px", border: `2px solid ${paymentMethod === method.id ? NAVY : BORDER}`, backgroundColor: paymentMethod === method.id ? "#EBF0F8" : "#fff", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "12px", transition: "all 0.2s" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${paymentMethod === method.id ? NAVY : "#94A3B8"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {paymentMethod === method.id && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: NAVY }} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: NAVY, fontSize: "0.95rem", marginBottom: "4px" }}>
                {method.icon} {method.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{method.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethod === "transfer" && (
        <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>Informasi Transfer</h4>
          <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#4B5563" }}>
            Silakan transfer tepat sebesar <strong>{rp(grandTotal)}</strong> ke rekening berikut:<br/><br/>
            <strong>Bank BCA:</strong> 1234567890 a.n. PT HotelQu Luxury<br/>
            <strong>Bank Mandiri:</strong> 0987654321 a.n. PT HotelQu Luxury
          </p>
          
          <div style={{ border: `2px dashed ${BORDER}`, padding: "24px", borderRadius: "12px", textAlign: "center", backgroundColor: "#fff" }}>
            <FaUpload style={{ fontSize: "1.5rem", color: "#94A3B8", marginBottom: "8px" }} />
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>Upload Bukti Transfer</div>
            <input type="file" id="proof" onChange={(e) => setProofFile(e.target.files[0])} style={{ display: "none" }} accept="image/*,.pdf" />
            <label htmlFor="proof" style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#EBF0F8", color: NAVY, borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              {proofFile ? proofFile.name : "Pilih File"}
            </label>
          </div>
        </div>
      )}

      {paymentMethod !== "transfer" && (
        <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: `1px solid ${BORDER}`, marginBottom: "24px", textAlign: "center", fontSize: "0.85rem", color: "#4B5563" }}>
          Anda akan diarahkan ke halaman pembayaran aman (Payment Gateway) setelah mengklik tombol konfirmasi.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep(2)} style={{ padding: "14px 28px", borderRadius: "10px", background: "transparent", color: NAVY, border: `1.5px solid ${BORDER}`, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}>
          Kembali
        </button>
        <button onClick={handleConfirmPayment} style={{ padding: "14px 28px", borderRadius: "10px", background: `linear-gradient(135deg, ${GOLD}, #D4AF37)`, color: NAVY, border: "none", fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(201,168,76,0.3)" }}>
          <FaCheck /> Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STEP 4: SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStep4 = () => (
    <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.04)", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#D1FAE5", color: "#10B981", fontSize: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <FaCheck />
      </div>
      <h2 style={{ margin: "0 0 12px", color: NAVY, fontSize: "1.8rem", fontWeight: 900 }}>Pembayaran Berhasil!</h2>
      <p style={{ fontSize: "0.95rem", color: "#6B7280", margin: "0 auto 24px", maxWidth: "400px", lineHeight: 1.6 }}>
        Terima kasih, reservasi Anda telah berhasil dikonfirmasi. Bukti pemesanan dan E-Voucher telah dikirimkan ke email <strong>{formData.email}</strong>
      </p>

      <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "16px", border: `1px solid ${BORDER}`, maxWidth: "400px", margin: "0 auto 30px", textAlign: "left" }}>
        <div style={{ textAlign: "center", marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px dashed ${BORDER}` }}>
          <div style={{ fontSize: "0.8rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Nomor Pemesanan</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: NAVY, letterSpacing: "2px" }}>{bookingRef}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
          <div><strong style={{ color: NAVY }}>Check-in</strong><div style={{ color: "#4B5563" }}>{new Date(checkIn).toLocaleDateString("id-ID")}</div></div>
          <div><strong style={{ color: NAVY }}>Check-out</strong><div style={{ color: "#4B5563" }}>{new Date(checkOut).toLocaleDateString("id-ID")}</div></div>
          <div style={{ gridColumn: "span 2" }}><strong style={{ color: NAVY }}>Kamar</strong><div style={{ color: "#4B5563" }}>{room.type} Room ({nights} Malam)</div></div>
          <div style={{ gridColumn: "span 2" }}><strong style={{ color: NAVY }}>Tamu</strong><div style={{ color: "#4B5563" }}>{formData.name} ({room.capacity} Tamu)</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={() => navigate("/beranda")} style={{ padding: "12px 24px", borderRadius: "10px", background: "transparent", color: NAVY, border: `1.5px solid ${BORDER}`, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
          Kembali ke Beranda
        </button>
        <button style={{ padding: "12px 24px", borderRadius: "10px", background: `linear-gradient(135deg, ${NAVY}, #2E5490)`, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(30,58,95,0.2)" }}>
          <FaFileDownload /> Download E-Voucher
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100vh", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: NAVY, padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {step < 4 ? (
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}>
              <FaArrowLeft /> Batal
            </button>
          ) : <div style={{ width: "70px" }} />}
          <div style={{ color: GOLD, fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
            Pemesanan Kamar
          </div>
          <div style={{ width: "70px" }} />
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
        
        {/* Stepper (Only show if not success) */}
        {step < 4 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", left: "10%", right: "10%", height: "2px", backgroundColor: BORDER, zIndex: 0 }}>
              <div style={{ height: "100%", backgroundColor: GOLD, width: step === 1 ? "0%" : step === 2 ? "50%" : "100%", transition: "width 0.3s ease" }} />
            </div>
            {[
              { num: 1, label: "Data Tamu" },
              { num: 2, label: "Ringkasan" },
              { num: 3, label: "Pembayaran" }
            ].map(s => (
              <div key={s.num} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= s.num ? GOLD : "#fff", border: `2px solid ${step >= s.num ? GOLD : BORDER}`, color: step >= s.num ? NAVY : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", transition: "all 0.3s ease" }}>
                  {step > s.num ? <FaCheck /> : s.num}
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: step >= s.num ? 700 : 500, color: step >= s.num ? NAVY : "#94A3B8", textAlign: "center" }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

      </div>
    </div>
  );
}
