import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaUtensils, FaGift, FaCar, FaSpa, FaBed } from "react-icons/fa";
import { reservations } from "../../data/reservations";

const NAVY = "#1E3A5F";
const GOLD = "#C9A84C";
const BORDER = "#E8DCC8";

const rp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const CATALOG = [
  { id: "breakfast", title: "Paket Sarapan Tambahan", desc: "Sarapan sepuasnya di restoran utama", price: 150000, icon: <FaUtensils /> },
  { id: "dinner", title: "Set Menu Makan Malam", desc: "Makan malam romantis 3-course di restoran rooftop", price: 350000, icon: <FaUtensils /> },
  { id: "decor", title: "Dekorasi Kamar Romantis", desc: "Hiasan kelopak mawar, lilin LED, dan handuk angsa", price: 300000, icon: <FaGift /> },
  { id: "transfer", title: "Airport Transfer (Jemput)", desc: "Layanan jemput dari bandara ke hotel", price: 250000, icon: <FaCar /> },
  { id: "spa", title: "Paket Relaksasi Spa (60m)", desc: "Pijat tradisional Bali untuk relaksasi maksimal", price: 400000, icon: <FaSpa /> },
  { id: "extrabed", title: "Extra Bed", desc: "Termasuk bantal, selimut, dan sarapan 1 orang", price: 350000, icon: <FaBed /> },
];

export default function GuestAddOns() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const res = useMemo(() => reservations.find(r => r.bookingId === bookingId) || {
    bookingId, guestName: "Vera Zakia", roomType: "Deluxe Room", totalPayment: 1500000
  }, [bookingId]);

  const [selected, setSelected] = useState({});

  const toggleItem = (item) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = { ...item, qty: 1 };
      }
      return next;
    });
  };

  const updateQty = (id, delta) => {
    setSelected(prev => {
      if (!prev[id]) return prev;
      const newQty = prev[id].qty + delta;
      if (newQty < 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], qty: newQty } };
    });
  };

  const selectedItems = Object.values(selected);
  const totalTambahan = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalBaru = res.totalPayment + totalTambahan;

  const handleSimpan = () => {
    // In real app, make API call to save these extras to the reservation
    alert(`Berhasil menambahkan ${selectedItems.length} layanan ekstra ke reservasi ${bookingId}`);
    navigate(`/guest/reservasi/${bookingId}`);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: NAVY, fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 900, color: NAVY }}>Tambah Layanan Ekstra</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6B7280" }}>Booking ID: {bookingId}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Katalog */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {CATALOG.map(item => {
              const isSelected = !!selected[item.id];
              return (
                <div key={item.id} style={{ 
                  backgroundColor: "#fff", borderRadius: "16px", padding: "20px", 
                  border: `2px solid ${isSelected ? GOLD : BORDER}`, 
                  boxShadow: isSelected ? "0 4px 12px rgba(201,168,76,0.15)" : "0 2px 8px rgba(30,58,95,0.03)",
                  display: "flex", gap: "16px", alignItems: "center", transition: "all 0.2s"
                }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: isSelected ? GOLD : "#F8FAFC", color: isSelected ? "#fff" : NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0, transition: "all 0.2s" }}>
                    {item.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: NAVY }}>{item.title}</h3>
                      <div style={{ fontSize: "0.95rem", fontWeight: 800, color: GOLD }}>{rp(item.price)}</div>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#6B7280" }}>{item.desc}</p>
                    
                    {isSelected ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#F8FAFC", padding: "4px", borderRadius: "8px", border: `1px solid ${BORDER}` }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", backgroundColor: "#fff", color: NAVY, fontWeight: 800, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>-</button>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY, width: "20px", textAlign: "center" }}>{selected[item.id].qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", backgroundColor: "#fff", color: NAVY, fontWeight: 800, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>+</button>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: NAVY }}>
                          Subtotal: {rp(item.price * selected[item.id].qty)}
                        </span>
                      </div>
                    ) : (
                      <button onClick={() => toggleItem(item)} style={{ padding: "6px 16px", borderRadius: "8px", border: `1px solid ${NAVY}`, backgroundColor: "transparent", color: NAVY, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                        Pilih Layanan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "24px", border: `1px solid ${BORDER}`, boxShadow: "0 4px 20px rgba(30,58,95,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 800, color: NAVY }}>Ringkasan Penambahan</h3>
            
            {selectedItems.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: "0 0 20px", textAlign: "center", padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
                Belum ada layanan yang dipilih
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {selectedItems.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.85rem" }}>
                    <div style={{ color: NAVY, fontWeight: 600 }}>{item.qty}x {item.title}</div>
                    <div style={{ color: "#4B5563" }}>{rp(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: `1px dashed ${BORDER}`, paddingTop: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#6B7280" }}>
                <span>Total Reservasi Awal</span>
                <span>{rp(res.totalPayment)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: NAVY, fontWeight: 700 }}>
                <span>Total Tambahan Baru</span>
                <span>+{rp(totalTambahan)}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#EBF0F8", borderRadius: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: NAVY }}>Total Tagihan Baru</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: GOLD }}>{rp(totalBaru)}</span>
            </div>

            <button onClick={handleSimpan} disabled={selectedItems.length === 0} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: selectedItems.length > 0 ? NAVY : "#CBD5E1", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.95rem", cursor: selectedItems.length > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
              <FaCheckCircle /> Simpan Layanan Ekstra
            </button>
            {selectedItems.length > 0 && (
              <p style={{ margin: "12px 0 0", fontSize: "0.75rem", color: "#6B7280", textAlign: "center" }}>
                Tagihan akan diupdate ke reservasi Anda dan dapat dibayar saat check-out.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
