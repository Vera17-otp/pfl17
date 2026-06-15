import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaPrint, FaCheckCircle, FaHotel } from "react-icons/fa";
import { useState } from "react";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// Mock Invoice Data
const MOCK_INVOICE = {
  invoiceNo: "INV-202606-10024A",
  date: "16 Juni 2026",
  guestName: "Budi Santoso",
  roomType: "Deluxe Room",
  roomNumber: "305",
  checkIn: "14 Jun 2026",
  checkOut: "16 Jun 2026",
  nights: 2,
  paymentMethod: "Kartu Kredit (Visa xxxx-1234)",
  items: [
    { name: "Deluxe Room (2 Malam)", amount: 2400000 },
    { name: "Room Service - Nasi Goreng (x2)", amount: 150000 },
    { name: "Room Service - Ice Tea (x2)", amount: 60000 },
    { name: "Laundry (Express)", amount: 125000 },
    { name: "Minibar - Chocolate", amount: 45000 }
  ]
};

export default function GuestInvoice() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [isDownloading, setIsDownloading] = useState(false);

  const subtotal = MOCK_INVOICE.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.11;
  const service = subtotal * 0.10;
  const total = subtotal + tax + service;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("PDF Struk Digital telah berhasil diunduh.");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Struk Digital</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Riwayat transaksi untuk {bookingId || "RES-10024A"}</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(30,58,95,0.05)", padding: "40px", position: "relative", overflow: "hidden", marginBottom: "24px" }}>
        
        {/* Dekorasi Airmail Edge */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: `repeating-linear-gradient(45deg, ${NAVY}, ${NAVY} 10px, ${GOLD} 10px, ${GOLD} 20px)` }} />
        
        {/* Header Invoice */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: NAVY, marginBottom: "8px" }}>
              <FaHotel style={{ fontSize: "1.8rem" }} />
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900 }}>HotelQu</h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>Jl. Pariwisata No. 123, Jakarta<br/>(021) 555-0198 • contact@hotelqu.com</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: "2rem", fontWeight: 900, color: NAVY, letterSpacing: "1px" }}>INVOICE</h1>
            <p style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#4B5563" }}>#{MOCK_INVOICE.invoiceNo}</p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6B7280" }}>Diterbitkan: {MOCK_INVOICE.date}</p>
          </div>
        </div>

        {/* Info Tamu & Menginap */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px", padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "12px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Ditagihkan Kepada:</p>
            <p style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>{MOCK_INVOICE.guestName}</p>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Check-in</p>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: NAVY }}>{MOCK_INVOICE.checkIn}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Check-out</p>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: NAVY }}>{MOCK_INVOICE.checkOut}</p>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Biaya */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `2px solid ${NAVY}`, paddingBottom: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>Deskripsi Tagihan</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: NAVY }}>Jumlah</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {MOCK_INVOICE.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px dashed ${BORDER}`, paddingBottom: "12px" }}>
                <span style={{ fontSize: "0.9rem", color: "#4B5563" }}>{item.name}</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: NAVY }}>{rp(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Biaya */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem", color: "#4B5563" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{rp(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pajak (11%)</span>
              <span style={{ fontWeight: 600 }}>{rp(tax)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}`, paddingBottom: "10px" }}>
              <span>Service Charge (10%)</span>
              <span style={{ fontWeight: 600 }}>{rp(service)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Total Dibayar</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: NAVY }}>{rp(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px solid ${BORDER}`, paddingTop: "24px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>Metode Pembayaran</p>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>{MOCK_INVOICE.paymentMethod}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", border: "2px solid #10B981", padding: "8px 16px", borderRadius: "8px" }}>
            <FaCheckCircle style={{ fontSize: "1.2rem" }} />
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>LUNAS</span>
          </div>
        </div>

      </div>

      {/* Aksi Tambahan */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
        <button style={{ padding: "12px 24px", backgroundColor: "#fff", color: NAVY, borderRadius: "10px", border: `1px solid ${BORDER}`, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <FaPrint /> Cetak
        </button>
        <button onClick={handleDownload} disabled={isDownloading} style={{ padding: "12px 24px", backgroundColor: NAVY, color: "#fff", borderRadius: "10px", border: "none", fontSize: "0.95rem", fontWeight: 700, cursor: isDownloading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s" }}>
          <FaDownload /> {isDownloading ? "Mengunduh PDF..." : "Download PDF"}
        </button>
      </div>

    </div>
  );
}
