import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileInvoiceDollar, FaCreditCard, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// Mock Running Bill Data
const MOCK_BILL = {
  bookingId: "RES-10024A",
  roomTotal: 2400000, // 2 nights x 1.2jt
  services: [
    { date: "15 Jun", name: "Room Service - Nasi Goreng (x2)", amount: 150000 },
    { date: "15 Jun", name: "Room Service - Ice Tea (x2)", amount: 60000 },
    { date: "16 Jun", name: "Laundry (Express)", amount: 125000 },
    { date: "16 Jun", name: "Minibar - Chocolate", amount: 45000 }
  ],
  paid: 0 // Biaya yang sudah dibayar (DP)
};

export default function GuestBilling() {
  const navigate = useNavigate();
  const [paymentStep, setPaymentStep] = useState(0); // 0 = view bill, 1 = processing, 2 = success
  const [paymentAmount, setPaymentAmount] = useState("full"); // "full" or "partial"
  
  const servicesTotal = MOCK_BILL.services.reduce((sum, item) => sum + item.amount, 0);
  const tax = (MOCK_BILL.roomTotal + servicesTotal) * 0.11;
  const serviceCharge = (MOCK_BILL.roomTotal + servicesTotal) * 0.10;
  const grandTotal = MOCK_BILL.roomTotal + servicesTotal + tax + serviceCharge;
  
  const remainingTotal = grandTotal - MOCK_BILL.paid;

  const handlePay = () => {
    setPaymentStep(1);
    setTimeout(() => {
      setPaymentStep(2);
    }, 2500); // Simulate network request
  };

  if (paymentStep === 1) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: `4px solid ${BORDER}`, borderTopColor: GOLD, animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
        <h2 style={{ color: NAVY, fontSize: "1.2rem", fontWeight: 800 }}>Memproses Pembayaran...</h2>
        <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>Mohon tunggu sebentar, jangan tutup halaman ini.</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (paymentStep === 2) {
    return (
      <div style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#10B98115", color: "#10B981", fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <FaCheckCircle />
        </div>
        <h1 style={{ color: NAVY, fontSize: "1.5rem", fontWeight: 900, marginBottom: "8px" }}>Pembayaran Berhasil!</h1>
        <p style={{ color: "#6B7280", fontSize: "0.9rem", marginBottom: "32px", lineHeight: 1.5 }}>
          Terima kasih, pembayaran Anda sebesar <strong>{paymentAmount === "full" ? rp(remainingTotal) : rp(remainingTotal / 2)}</strong> telah kami terima.
        </p>
        
        <button onClick={() => navigate("/guest/dashboard")} style={{ padding: "14px 32px", backgroundColor: NAVY, color: "#fff", borderRadius: "10px", border: "none", fontSize: "0.95rem", fontWeight: 800, cursor: "pointer" }}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Tagihan Berjalan (Real-time)</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Rincian biaya selama Anda menginap: {MOCK_BILL.bookingId}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* KOLOM KIRI: RINCIAN BIAYA */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 16px rgba(30,58,95,0.03)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", backgroundColor: "#F8FAFC", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <FaFileInvoiceDollar style={{ fontSize: "1.2rem", color: NAVY }} />
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Rincian Transaksi</h2>
          </div>
          
          <div style={{ padding: "24px" }}>
            {/* Biaya Kamar */}
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px dashed ${BORDER}` }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Biaya Kamar</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem" }}>
                <span style={{ color: NAVY, fontWeight: 600 }}>Deluxe Room (2 Malam)</span>
                <span style={{ color: NAVY, fontWeight: 700 }}>{rp(MOCK_BILL.roomTotal)}</span>
              </div>
            </div>

            {/* Layanan Tambahan */}
            <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px dashed ${BORDER}` }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Layanan & Ekstra</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MOCK_BILL.services.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ color: "#94A3B8", width: "45px" }}>{item.date}</span>
                      <span style={{ color: NAVY }}>{item.name}</span>
                    </div>
                    <span style={{ color: NAVY, fontWeight: 600 }}>{rp(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal & Pajak */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "#4B5563" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span>{rp(MOCK_BILL.roomTotal + servicesTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Pajak (11%)</span>
                <span>{rp(tax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Service Charge (10%)</span>
                <span>{rp(serviceCharge)}</span>
              </div>
            </div>

            {/* Total Akhir */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: NAVY }}>Total Keseluruhan</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 900, color: NAVY }}>{rp(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: PEMBAYARAN */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div style={{ backgroundColor: "#1E3A5F", color: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(30,58,95,0.15)" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Sisa Tagihan</h2>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: GOLD, marginBottom: "24px" }}>
              {rp(remainingTotal)}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer", border: paymentAmount === "full" ? `1px solid ${GOLD}` : "1px solid transparent" }}>
                <input type="radio" name="payType" checked={paymentAmount === "full"} onChange={() => setPaymentAmount("full")} style={{ accentColor: GOLD }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Lunasi Semua</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>Bayar seluruh tagihan berjalan</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer", border: paymentAmount === "partial" ? `1px solid ${GOLD}` : "1px solid transparent" }}>
                <input type="radio" name="payType" checked={paymentAmount === "partial"} onChange={() => setPaymentAmount("partial")} style={{ accentColor: GOLD }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Bayar Sebagian (50%)</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>Meringankan saat check-out</div>
                </div>
              </label>
            </div>

            <button onClick={handlePay} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: GOLD, color: NAVY, border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
              <FaCreditCard /> Bayar {paymentAmount === "full" ? rp(remainingTotal) : rp(remainingTotal / 2)}
            </button>
            <p style={{ margin: "16px 0 0", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.5 }}>
              Pembayaran di muka tidak wajib, semua sisa tagihan akan ditagih saat check-out.
            </p>
          </div>
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
