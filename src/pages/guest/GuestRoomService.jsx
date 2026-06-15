import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaPlus, FaMinus, FaUtensils, FaClock, FaCheckCircle, FaMotorcycle } from "react-icons/fa";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const MENU_KATEGORI = ["Semua", "Makan Utama", "Cemilan", "Minuman"];
const MOCK_MENU = [
  { id: 1, kategori: "Makan Utama", nama: "Nasi Goreng Spesial HotelQu", desc: "Dilengkapi sate ayam, telur mata sapi, dan kerupuk udang", harga: 75000, img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80" },
  { id: 2, kategori: "Makan Utama", nama: "Spaghetti Bolognese", desc: "Pasta klasik dengan saus daging sapi dan taburan keju parmesan", harga: 85000, img: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=400&q=80" },
  { id: 3, kategori: "Makan Utama", nama: "Grilled Salmon", desc: "Salmon panggang dengan mashed potato dan saus lemon butter", harga: 145000, img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80" },
  { id: 4, kategori: "Cemilan", nama: "Crispy Calamari", desc: "Cumi goreng tepung dengan saus tartar", harga: 55000, img: "https://images.unsplash.com/photo-1599487488020-f56e9c3541bd?auto=format&fit=crop&w=400&q=80" },
  { id: 5, kategori: "Minuman", nama: "Fresh Orange Juice", desc: "Jus jeruk peras murni tanpa gula tambahan", harga: 35000, img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80" },
  { id: 6, kategori: "Minuman", nama: "Ice Lychee Tea", desc: "Teh manis dingin dengan buah leci asli", harga: 30000, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80" },
];

export default function GuestRoomService() {
  const navigate = useNavigate();
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState("");
  const [orderStatus, setOrderStatus] = useState(null); // null, 'Diterima', 'Diproses', 'Dalam Perjalanan', 'Terkirim'

  const filteredMenu = activeKategori === "Semua" ? MOCK_MENU : MOCK_MENU.filter(m => m.kategori === activeKategori);

  const updateCart = (item, delta) => {
    setCart(prev => {
      const next = { ...prev };
      const currentQty = next[item.id]?.qty || 0;
      const newQty = currentQty + delta;
      
      if (newQty <= 0) {
        delete next[item.id];
      } else {
        next[item.id] = { ...item, qty: newQty };
      }
      return next;
    });
  };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.harga * item.qty), 0);
  const serviceCharge = subtotal * 0.10;
  const totalTagihan = subtotal + serviceCharge;

  const handlePesan = () => {
    setOrderStatus("Diterima");
    
    // Simulate order progress
    setTimeout(() => setOrderStatus("Diproses"), 3000);
    setTimeout(() => setOrderStatus("Dalam Perjalanan"), 8000);
    setTimeout(() => setOrderStatus("Terkirim"), 14000);
  };

  // TAMPILAN JIKA PESANAN AKTIF
  if (orderStatus) {
    const statusData = {
      "Diterima": { icon: <FaUtensils />, text: "Pesanan Diterima", desc: "Dapur telah menerima pesanan Anda", color: "#6B7280" },
      "Diproses": { icon: <FaUtensils />, text: "Sedang Dimasak", desc: "Koki kami sedang menyiapkan hidangan", color: "#F59E0B" },
      "Dalam Perjalanan": { icon: <FaMotorcycle />, text: "Dalam Perjalanan", desc: "Pesanan diantar menuju kamar Anda", color: "#0EA5E9" },
      "Terkirim": { icon: <FaCheckCircle />, text: "Pesanan Selesai", desc: "Selamat menikmati hidangan Anda!", color: "#10B981" }
    };
    const current = statusData[orderStatus];

    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 24px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Status Pesanan</h1>
        
        <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "20px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(30,58,95,0.05)", marginBottom: "24px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: `${current.color}15`, color: current.color, fontSize: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {current.icon}
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem", fontWeight: 800, color: current.color }}>{current.text}</h2>
          <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6B7280" }}>{current.desc}</p>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "10px" }}>
            <FaClock style={{ color: NAVY }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>Estimasi: 25 - 35 Menit</span>
          </div>
        </div>

        <button onClick={() => navigate("/guest/dashboard")} style={{ padding: "14px 28px", borderRadius: "12px", backgroundColor: NAVY, color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Pesan Layanan Kamar</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Makan dan minum tanpa harus keluar kamar</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* KOLOM KIRI: MENU */}
        <div>
          {/* Filter Kategori */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "8px" }} className="no-scrollbar">
            {MENU_KATEGORI.map(cat => (
              <button key={cat} onClick={() => setActiveKategori(cat)} style={{
                padding: "8px 16px", borderRadius: "20px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap", border: "none",
                backgroundColor: activeKategori === cat ? NAVY : "#F3F4F6", color: activeKategori === cat ? "#fff" : "#4B5563"
              }}>
                {cat}
              </button>
            ))}
          </div>

          {/* List Menu */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {filteredMenu.map(item => {
              const qty = cart[item.id]?.qty || 0;
              return (
                <div key={item.id} style={{ backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(30,58,95,0.03)", display: "flex", flexDirection: "column" }}>
                  <img src={item.img} alt={item.nama} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>{item.kategori}</span>
                      <h3 style={{ margin: "4px 0 6px", fontSize: "1rem", fontWeight: 800, color: NAVY }}>{item.nama}</h3>
                      <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.4 }}>{item.desc}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>{rp(item.harga)}</span>
                      
                      {qty === 0 ? (
                        <button onClick={() => updateCart(item, 1)} style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: NAVY, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <FaPlus />
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F8FAFC", padding: "4px", borderRadius: "8px", border: `1px solid ${BORDER}` }}>
                          <button onClick={() => updateCart(item, -1)} style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#fff", color: NAVY, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}><FaMinus fontSize="0.7rem" /></button>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY }}>{qty}</span>
                          <button onClick={() => updateCart(item, 1)} style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#fff", color: NAVY, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}><FaPlus fontSize="0.7rem" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM KANAN: KERANJANG */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(30,58,95,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaShoppingCart /> Pesanan Saya
            </h3>

            {cartItems.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 20px", textAlign: "center", padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
                Keranjang masih kosong
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.85rem" }}>
                    <div style={{ color: NAVY, fontWeight: 600 }}>{item.qty}x {item.nama}</div>
                    <div style={{ color: "#4B5563" }}>{rp(item.harga * item.qty)}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <textarea placeholder="Catatan khusus (contoh: pedas, tambah saus)..." value={notes} onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${BORDER}`, outline: "none", fontSize: "0.8rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>

            <div style={{ borderTop: `1px dashed ${BORDER}`, paddingTop: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#6B7280" }}>
                <span>Subtotal</span>
                <span>{rp(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#6B7280" }}>
                <span>Biaya Layanan Kamar</span>
                <span>{rp(serviceCharge)}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#EBF0F8", borderRadius: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Total Tagihan</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: GOLD }}>{rp(totalTagihan)}</span>
            </div>

            <button onClick={handlePesan} disabled={cartItems.length === 0} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: cartItems.length > 0 ? NAVY : "#CBD5E1", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: cartItems.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Pesan Sekarang
            </button>
            {cartItems.length > 0 && (
              <p style={{ margin: "12px 0 0", fontSize: "0.75rem", color: "#6B7280", textAlign: "center" }}>
                Biaya akan ditambahkan ke tagihan kamar Anda.
              </p>
            )}
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
