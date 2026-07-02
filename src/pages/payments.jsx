import React, { useState, useMemo, useEffect } from "react";
import { 
  FaFileInvoiceDollar, 
  FaMoneyBillWave, 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaPrint, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTimes,
  FaCreditCard,
  FaCashRegister,
  FaCalendarAlt,
  FaHotel,
  FaExclamationTriangle
} from "react-icons/fa";
import { supabase } from "../lib/supabase";

// Mengambil data reservasi awal untuk inisialisasi invoices
import { reservations } from "../data/reservations";

// Helper hitung lama menginap
const getStayNights = (inStr, outStr) => {
  const inDate = new Date(inStr);
  const outDate = new Date(outStr);
  const diffTime = outDate - inDate;
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Helper format mata uang Rupiah
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num);
};

export default function Payments() {
  const todayStr = "2026-06-14"; // Hari audit simulasi finansial

  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("outstanding"); // "outstanding" | "history" | "invoices"

  const fetchInvoices = async () => {
    try {
      const { data: dbRes, error } = await supabase
        .from("reservations")
        .select("*, profiles(*), rooms(*)")
        .order("check_in", { ascending: false });
      if (error) throw error;

      const mappedInvoices = dbRes.map((res, i) => {
        const checkInDate = new Date(res.check_in);
        const checkOutDate = new Date(res.check_out);
        const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
        const totalAmount = Number(res.total_price);
        const pricePerNight = Math.round(totalAmount / nights);

        let paymentStatus = "Belum Bayar";
        let amountPaid = 0;

        if (res.status === "checked_out") {
          paymentStatus = "Lunas";
          amountPaid = totalAmount;
        } else if (res.status === "checked_in") {
          paymentStatus = "DP Terbayar";
          amountPaid = Math.round(totalAmount * 0.4);
        } else if (res.status === "confirmed") {
          paymentStatus = "DP Terbayar";
          amountPaid = Math.round(totalAmount * 0.3);
        }

        return {
          invoiceId: `INV-${res.id.substring(0, 8).toUpperCase()}`,
          bookingId: res.id,
          guestName: res.profiles?.full_name || "Tamu",
          roomNumber: res.rooms?.room_number || "",
          roomType: res.rooms?.room_type || "Deluxe",
          checkIn: res.check_in,
          checkOut: res.check_out,
          nights,
          pricePerNight,
          totalAmount,
          amountPaid,
          balance: totalAmount - amountPaid,
          paymentStatus
        };
      });
      setInvoices(mappedInvoices);
    } catch (err) {
      console.error("Gagal memuat invoices:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = data.map(t => {
        const dt = new Date(t.created_at);
        const timeStr = dt.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${dt.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB`;
        
        return {
          transactionId: `TXN-${t.id.substring(0, 8).toUpperCase()}`,
          invoiceId: t.description?.split(" ").pop() || "INV-UNK",
          guestName: "Tamu",
          amount: Number(t.amount),
          method: t.payment_method,
          time: timeStr
        };
      });
      setTransactions(formatted);
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchInvoices(), fetchTransactions()]);
      setLoading(false);
    };
    initData();
  }, []);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Modal control states
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState(null); // Modal Catat Pembayaran
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Transfer Bank");
  const [payNotes, setPayNotes] = useState("");

  const [previewInvoice, setPreviewInvoice] = useState(null); // Modal Cetak/View Invoice

  const [toastMessage, setToastMessage] = useState("");

  // Helper show toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // 3. EVENT HANDLERS
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentTargetInvoice) return;

    const inputNum = parseFloat(payAmount);
    if (isNaN(inputNum) || inputNum <= 0) {
      alert("Harap masukkan jumlah pembayaran yang valid (lebih besar dari 0)!");
      return;
    }

    if (inputNum > paymentTargetInvoice.balance) {
      alert(`Gagal! Jumlah pembayaran melebihi sisa tagihan (${formatRupiah(paymentTargetInvoice.balance)})`);
      return;
    }

    try {
      // 1. Insert transaction to DB
      const { error: txError } = await supabase
        .from("financial_transactions")
        .insert([{
          type: "income",
          amount: inputNum,
          category: "Kamar",
          description: `Pembayaran invoice ${paymentTargetInvoice.invoiceId}`,
          payment_method: payMethod
        }]);
      if (txError) throw txError;

      // 2. Fetch fresh invoices & transactions
      await fetchInvoices();
      await fetchTransactions();

      showToast(`Sukses mencatat pembayaran Rp ${inputNum.toLocaleString('id-ID')} untuk ${paymentTargetInvoice.guestName}`);
      
      // Close modal
      setPaymentTargetInvoice(null);
      setPayAmount("");
      setPayNotes("");
    } catch (err) {
      console.error("Gagal memproses pembayaran:", err);
      alert("Gagal memproses pembayaran: " + err.message);
    }
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  // 4. COMPUTES & FILTERS
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Filter Nama/Invoice
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = inv.guestName.toLowerCase().includes(query);
        const matchInvoice = inv.invoiceId.toLowerCase().includes(query);
        const matchBooking = inv.bookingId.toLowerCase().includes(query);
        if (!matchName && !matchInvoice && !matchBooking) return false;
      }
      // Filter Tanggal Check-in
      if (filterDate && inv.checkIn !== filterDate) return false;

      // Filter Tab
      if (activeTab === "outstanding") {
        return inv.paymentStatus === "Belum Bayar" || inv.paymentStatus === "DP Terbayar";
      }

      return true;
    });
  }, [invoices, activeTab, searchQuery, filterDate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        t.guestName.toLowerCase().includes(query) ||
        t.invoiceId.toLowerCase().includes(query) ||
        t.method.toLowerCase().includes(query)
      );
    });
  }, [transactions, searchQuery]);

  // Ringkasan Finansial Harian (Untuk Tanggal 14 Jun 2026)
  const financeKPI = useMemo(() => {
    let incomeToday = 0;
    let txnTodayCount = 0;
    let totalOutstanding = 0;
    
    // Hitung metode pembayaran terpopuler hari ini
    const methodCounts = {};

    transactions.forEach(t => {
      if (t.time.includes("14 Jun 2026")) {
        incomeToday += t.amount;
        txnTodayCount++;
        methodCounts[t.method] = (methodCounts[t.method] || 0) + 1;
      }
    });

    invoices.forEach(inv => {
      if (inv.paymentStatus !== "Lunas") {
        totalOutstanding += inv.balance;
      }
    });

    let topMethod = "Tidak Ada Transaksi";
    let maxCount = 0;
    Object.keys(methodCounts).forEach(m => {
      if (methodCounts[m] > maxCount) {
        maxCount = methodCounts[m];
        topMethod = m;
      }
    });

    return { incomeToday, txnTodayCount, topMethod, totalOutstanding };
  }, [transactions, invoices]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Lunas":
        return { bg: "rgba(16, 185, 129, 0.1)", color: "#10B981" };
      case "DP Terbayar":
        return { bg: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" };
      case "Belum Bayar":
        return { bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444" };
      default:
        return { bg: "rgba(100, 116, 139, 0.1)", color: "#64748B" };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Print Override Style Block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="no-print" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid var(--border-color)',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <FaCheckCircle style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* MODAL: CATAT PEMBAYARAN BARU */}
      {paymentTargetInvoice && (
        <div className="no-print" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99
        }}>
          <div className="table-card" style={{ width: '100%', maxWidth: '450px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMoneyBillWave style={{ color: 'var(--primary-color)' }} /> Catat Pembayaran Baru
              </span>
              <button onClick={() => setPaymentTargetInvoice(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                <FaTimes />
              </button>
            </div>

            {/* Invoice Summary */}
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>No. Invoice:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{paymentTargetInvoice.invoiceId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nama Tamu:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{paymentTargetInvoice.guestName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Tagihan:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(paymentTargetInvoice.totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Telah Dibayar:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>{formatRupiah(paymentTargetInvoice.amountPaid)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Sisa Saldo:</span>
                <span style={{ fontWeight: 800, color: '#EF4444' }}>{formatRupiah(paymentTargetInvoice.balance)}</span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Jumlah Pembayaran (IDR):</label>
                <input 
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={`Maks: ${paymentTargetInvoice.balance}`}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--surface-color)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Metode Pembayaran:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--surface-color)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="Kartu Kredit">Kartu Kredit / Debit</option>
                  <option value="OTA Payment">Online Travel Agent (OTA)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Catatan Internal (Optional):</label>
                <input 
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Contoh: Pembayaran DP Pelunasan, dll..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--surface-color)'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaCheckCircle /> Simpan Transaksi Pembayaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW INVOICE (AND PRINT LAYOUT) */}
      {previewInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          {/* Main Invoice Card Wrapper */}
          <div className="table-card" style={{ width: '100%', maxWidth: '650px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Actions Header (Hidden in Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Pratinjau Kuitansi Invoice</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={handlePrintTrigger}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FaPrint /> Cetak PDF
                </button>
                <button onClick={() => setPreviewInvoice(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '6px' }}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* PRINTABLE AREA (TARGET OF window.print()) */}
            <div id="printable-invoice" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              
              {/* RUBBER STAMP OVERLAY */}
              <div style={{
                position: 'absolute',
                top: '120px',
                right: '40px',
                border: `4px double ${getStatusColor(previewInvoice.paymentStatus).color}`,
                borderRadius: '8px',
                color: getStatusColor(previewInvoice.paymentStatus).color,
                fontSize: '1.4rem',
                fontWeight: 900,
                padding: '8px 24px',
                transform: 'rotate(-10deg)',
                opacity: 0.85,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                pointerEvents: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}>
                {previewInvoice.paymentStatus}
              </div>

              {/* Invoice Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    <FaHotel size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Grand Vera Hotel & Resort</h2>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jl. Kemang Raya No. 17, Jakarta Selatan • info@vera-hotel.id</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>INVOICE</h3>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{previewInvoice.invoiceId}</span>
                </div>
              </div>

              {/* Invoice Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', fontSize: '0.8rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Ditagihkan Kepada:</h4>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>{previewInvoice.guestName}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Ref Reservasi: {previewInvoice.bookingId}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Rincian Tanggal:</h4>
                  <span style={{ display: 'block' }}>Tanggal Tagihan: <strong>14 Jun 2026</strong></span>
                  <span style={{ display: 'block' }}>Periode Inap: <strong>{previewInvoice.checkIn}</strong> s/d <strong>{previewInvoice.checkOut}</strong></span>
                </div>
              </div>

              {/* Room details & calculation table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Deskripsi Layanan</th>
                    <th style={{ padding: '10px' }}>Nomor Kamar</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Durasi</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Tarif Per Malam</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total Sewa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>Sewa Kamar Hotel</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipe: {previewInvoice.roomType}</span>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>Room {previewInvoice.roomNumber}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{previewInvoice.nights} Malam</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>{formatRupiah(previewInvoice.pricePerNight)}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700 }}>{formatRupiah(previewInvoice.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Financial calculations area */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal Kamar:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatRupiah(previewInvoice.totalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pajak & Servis (0%):</span>
                    <span>Rp 0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total Tagihan:</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{formatRupiah(previewInvoice.totalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                    <span>Telah Dibayar:</span>
                    <span style={{ fontWeight: 700 }}>{formatRupiah(previewInvoice.amountPaid)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#EF4444', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ fontWeight: 700 }}>Sisa Saldo:</span>
                    <span style={{ fontWeight: 800 }}>{formatRupiah(previewInvoice.balance)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '24px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                <p style={{ fontWeight: 700, margin: '0 0 4px 0' }}>Terima Kasih Atas Kunjungan Anda!</p>
                <p style={{ margin: 0 }}>Harap simpan kuitansi invoice ini sebagai bukti pelunasan sewa kamar yang sah di Grand Vera Hotel & Resort.</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Header section */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFileInvoiceDollar style={{ color: 'var(--primary-color)' }} /> Keuangan & Billing Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Pelacakan tagihan outstanding, histori pencatatan transaksi masuk, dan pencetakan invoice resmi hotel.
          </p>
        </div>
      </div>

      {/* Ringkasan Finansial Harian (KPI) */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #10B981' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PEMASUKAN HARI INI</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{formatRupiah(financeKPI.incomeToday)}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Audit tanggal: {todayStr}</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #3B82F6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>JUMLAH TRANSAKSI</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {financeKPI.txnTodayCount} Transaksi <FaCashRegister size={14} />
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tercatat sukses hari ini</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #F59E0B' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>METODE TERBANYAK</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {financeKPI.topMethod}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saluran bayar paling populer</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #EF4444' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL TAGIHAN OUTSTANDING</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {formatRupiah(financeKPI.totalOutstanding)}
            {financeKPI.totalOutstanding > 0 && <FaExclamationTriangle size={15} className="text-danger-pulse" />}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sisa tagihan belum dilunasi</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="no-print table-card" style={{ padding: '20px' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px' }}>
          {[
            { id: "outstanding", name: "Tagihan Outstanding", count: invoices.filter(i => i.paymentStatus !== "Lunas").length },
            { id: "history", name: "Histori Transaksi", count: transactions.length },
            { id: "invoices", name: "Daftar Invoice", count: invoices.length }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 4px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.name}
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  backgroundColor: isActive ? 'rgba(37,99,235,0.08)' : 'var(--bg-color)', 
                  color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "history" ? "Cari nama tamu, nomor invoice, atau metode..." : "Cari nama tamu, nomor invoice, atau booking..."}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.875rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-color)'
              }}
            />
          </div>

          {activeTab !== "history" && (
            <div style={{ position: 'relative', width: '200px' }}>
              <FaCalendarAlt style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <input 
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-color)',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}
        </div>

        {/* TABLE COMPONENT CONDITIONAL RENDER */}
        <div style={{ overflowX: 'auto' }}>
          
          {/* TAB: OUTSTANDING & INVOICES */}
          {activeTab !== "history" && (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Ref Booking</th>
                  <th>Nama Tamu</th>
                  <th>Kamar & Tipe</th>
                  <th>Tanggal Inap</th>
                  <th>Total Tagihan</th>
                  <th>Sisa Saldo</th>
                  <th>Status Bayar</th>
                  <th style={{ textAlign: 'center' }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Tidak ada tagihan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const statusColor = getStatusColor(inv.paymentStatus);
                    return (
                      <tr key={inv.invoiceId}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.invoiceId}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{inv.bookingId}</td>
                        <td style={{ fontWeight: 700 }}>{inv.guestName}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>Room {inv.roomNumber}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.roomType}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {inv.checkIn} s/d {inv.checkOut}
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>({inv.nights} Malam)</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(inv.totalAmount)}</td>
                        <td style={{ fontWeight: 700, color: inv.balance > 0 ? '#EF4444' : 'var(--text-main)' }}>
                          {inv.balance > 0 ? formatRupiah(inv.balance) : "Rp 0"}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: statusColor.bg,
                            color: statusColor.color
                          }}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {inv.paymentStatus !== "Lunas" && (
                              <button 
                                onClick={() => {
                                  setPaymentTargetInvoice(inv);
                                  setPayAmount(inv.balance.toString());
                                }}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#10B981', borderColor: '#10B981' }}
                              >
                                Bayar
                              </button>
                            )}
                            <button 
                              onClick={() => setPreviewInvoice(inv)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                            >
                              Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* TAB: TRANSACTION HISTORY */}
          {activeTab === "history" && (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>No. Invoice</th>
                  <th>Ref Booking</th>
                  <th>Nama Tamu</th>
                  <th>Metode Bayar</th>
                  <th>Waktu Bayar</th>
                  <th style={{ textAlign: 'right' }}>Jumlah Masuk</th>
                  <th style={{ textAlign: 'center' }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Tidak ada histori transaksi yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(t => {
                    // Temukan invoice terkait untuk preview
                    const relatedInvoice = invoices.find(inv => inv.invoiceId === t.invoiceId);
                    
                    return (
                      <tr key={t.transactionId}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{t.transactionId}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.invoiceId}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{t.bookingId}</td>
                        <td style={{ fontWeight: 700 }}>{t.guestName}</td>
                        <td style={{ fontWeight: 600 }}>{t.method}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.time}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10B981' }}>{formatRupiah(t.amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            disabled={!relatedInvoice}
                            onClick={() => setPreviewInvoice(relatedInvoice)}
                            className="btn-primary"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.75rem', 
                              backgroundColor: 'transparent', 
                              color: relatedInvoice ? 'var(--primary-color)' : 'var(--text-muted)', 
                              border: `1px solid ${relatedInvoice ? 'var(--primary-color)' : 'var(--border-color)'}`,
                              cursor: relatedInvoice ? 'pointer' : 'not-allowed'
                            }}
                          >
                            Lihat Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

        </div>

      </div>

    </div>
  );
}
