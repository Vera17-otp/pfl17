/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import { 
  FaConciergeBell, 
  FaSearch, 
  FaFilter, 
  FaClock, 
  FaCheckCircle, 
  FaBan, 
  FaExclamationTriangle, 
  FaPlus, 
  FaHistory, 
  FaCheck, 
  FaTimes, 
  FaChevronRight, 
  FaClipboardList, 
  FaUser, 
  FaInbox,
  FaWrench,
  FaBroom,
  FaUtensils,
  FaShieldAlt,
  FaQuestionCircle
} from "react-icons/fa";

// Mengambil data reservasi awal untuk sinkronisasi tamu aktif
import { reservations } from "../data/reservations";
import { useTask } from "../context/TaskContext";
import { supabase } from "../lib/supabase";

// Helper functions defined outside the component for purity and React 19 compliance
const getCategoryIcon = (category) => {
  switch (category) {
    case "Kebersihan":
      return <FaBroom style={{ color: "#10B981" }} />;
    case "Fasilitas Rusak":
      return <FaWrench style={{ color: "#3B82F6" }} />;
    case "Layanan Kamar":
      return <FaUtensils style={{ color: "#F59E0B" }} />;
    case "Kebisingan":
      return <FaShieldAlt style={{ color: "#F43F5E" }} />;
    default:
      return <FaQuestionCircle style={{ color: "#64748B" }} />;
  }
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "Darurat":
      return { bg: "#FFE4E6", text: "#E11D48", border: "#F43F5E", label: "Darurat (30m)" };
    case "Tinggi":
      return { bg: "#FFEDD5", text: "#EA580C", border: "#F97316", label: "Tinggi (1j)" };
    case "Sedang":
      return { bg: "#FEF9C3", text: "#CA8A04", border: "#FACC15", label: "Sedang (3j)" };
    case "Rendah":
      return { bg: "#F1F5F9", text: "#475569", border: "#94A3B8", label: "Rendah (6j)" };
    default:
      return { bg: "#F1F5F9", text: "#475569", border: "#94A3B8", label: "Normal" };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Baru":
      return { bg: "rgba(37, 99, 235, 0.1)", color: "#2563EB" };
    case "Sedang Diproses":
      return { bg: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" };
    case "Selesai":
      return { bg: "rgba(16, 185, 129, 0.1)", color: "#10B981" };
    case "Ditutup":
      return { bg: "rgba(100, 116, 139, 0.1)", color: "#64748B" };
    default:
      return { bg: "rgba(100, 116, 139, 0.1)", color: "#64748B" };
  }
};

const getSlaLimit = (priority) => {
  const limits = {
    "Darurat": 30, // menit
    "Tinggi": 60,  // menit
    "Sedang": 180, // menit
    "Rendah": 360  // menit
  };
  return limits[priority] || 180;
};

const calculateElapsedTime = (createdAt, currTime) => {
  const diffMs = currTime - new Date(createdAt).getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  
  if (diffMins < 60) {
    return `${diffMins} m`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours} j ${mins} m`;
};

const checkSlaExceeded = (createdAt, priority, status, currTime) => {
  if (status === "Selesai" || status === "Ditutup") return false;
  const diffMs = currTime - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const limit = getSlaLimit(priority);
  return diffMins > limit;
};

export default function HelpDesk() {
  const { createHelpdeskTask } = useTask();
  // 1. DATA TAMU AKTIF (CHECK-IN)
  const activeGuests = useMemo(() => {
    return reservations.filter(res => res.status === "Check-in");
  }, []);

  // 2. INITIAL DATA MOCK TICKETS
  const getInitialTickets = () => {
    const saved = localStorage.getItem("hotelify_tickets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat tiket dari localStorage", e);
      }
    }
    
    // Default mock data jika localStorage masih kosong
    const now = Date.now();
    return [
      {
        ticketId: "TCK-4001",
        guestName: "Vera Zakia",
        roomNumber: "101",
        category: "Kebersihan",
        description: "Minta handuk tambahan 2 buah dan keset kamar mandi baru karena basah.",
        priority: "Sedang",
        status: "Baru",
        department: "Tim Housekeeping",
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(), // 4 jam yang lalu (SLA: 3 jam) -> MELEBIHI SLA
        notes: [],
        history: [
          { status: "Baru", time: "19:00", note: "Tiket dibuat secara otomatis via sistem CRM." }
        ]
      },
      {
        ticketId: "TCK-4002",
        guestName: "John Doe",
        roomNumber: "102",
        category: "Fasilitas Rusak",
        description: "AC di kamar tidak dingin, blower menyala tapi suhu tetap panas.",
        priority: "Tinggi",
        status: "Sedang Diproses",
        department: "Tim Maintenance",
        createdAt: new Date(now - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 jam yang lalu (SLA: 1 jam) -> MELEBIHI SLA
        notes: [
          { time: new Date(now - 1.2 * 60 * 60 * 1000).toLocaleTimeString("id-ID"), staffName: "Staf Maintenance", text: "Teknisi AC (Budi) sedang menuju ke kamar dengan membawa unit cadangan." }
        ],
        history: [
          { status: "Baru", time: "21:30", note: "Tiket dibuat via telepon tamu ke Front Desk." },
          { status: "Sedang Diproses", time: "21:48", note: "Status tiket diperbarui ke Sedang Diproses." }
        ]
      },
      {
        ticketId: "TCK-4003",
        guestName: "Siti Aminah",
        roomNumber: "103",
        category: "Layanan Kamar",
        description: "Pesan Nasi Goreng Kampung 1 porsi, level pedas sedang, es teh manis 1.",
        priority: "Darurat",
        status: "Baru",
        department: "Tim F&B",
        createdAt: new Date(now - 12 * 60 * 1000).toISOString(), // 12 menit yang lalu (SLA: 30 menit) -> Aman
        notes: [],
        history: [
          { status: "Baru", time: "22:51", note: "Tiket pesanan layanan kamar dicatat via panel tamu." }
        ]
      },
      {
        ticketId: "TCK-4004",
        guestName: "Budi Santoso",
        roomNumber: "105",
        category: "Kebisingan",
        description: "Suara musik kencang terdengar dari kamar sebelah (106) mengganggu tidur anak.",
        priority: "Rendah",
        status: "Selesai",
        department: "Tim Keamanan",
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5 jam yang lalu (SLA: 6 jam) -> Selesai
        notes: [
          { time: new Date(now - 4.5 * 60 * 60 * 1000).toLocaleTimeString("id-ID"), staffName: "Staf Sekuriti", text: "Telah dilakukan kunjungan ke Kamar 106, penghuni meminta maaf dan langsung mengecilkan volume musik." }
        ],
        history: [
          { status: "Baru", time: "18:03", note: "Keluhan kebisingan dilaporkan." },
          { status: "Sedang Diproses", time: "18:15", note: "Petugas sekuriti dikerahkan ke lokasi." },
          { status: "Selesai", time: "18:30", note: "Masalah diselesaikan." }
        ]
      }
    ];
  };

  // 3. STATES
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("helpdesk_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      const formatted = data.map(t => ({
        ticketId: t.id,
        guestName: t.guest_name,
        roomNumber: t.room_number,
        category: t.category,
        description: t.description,
        priority: t.priority,
        status: t.status,
        department: t.department,
        createdAt: t.created_at,
        notes: t.notes || [],
        history: t.history || []
      }));
      setTickets(formatted);
    } catch (err) {
      console.error("Gagal memuat tiket helpdesk:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);
  
  // Ticker untuk trigger update SLA timer (realtime count-up)
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua Kategori");
  const [filterPriority, setFilterPriority] = useState("Semua Prioritas");
  const [activeStatusTab, setActiveStatusTab] = useState("Aktif"); // "Aktif" | "Baru" | "Diproses" | "Selesai" | "Ditutup" | "Semua"

  // Form states
  const [formGuestId, setFormGuestId] = useState("");
  const [formGuestName, setFormGuestName] = useState("");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formCategory, setFormCategory] = useState("Kebersihan");
  const [formPriority, setFormPriority] = useState("Sedang");
  const [formDescription, setFormDescription] = useState("");

  // Detail panel staff notes state
  const [noteText, setNoteText] = useState("");

  // Room history lookup state
  const [historyRoomSearch, setHistoryRoomSearch] = useState("");

  // Guest Notification Simulation State
  const [guestNotification, setGuestNotification] = useState(null);

  // 4. LIVE TICKING EFFECT
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000); // Trigger re-render setiap 15 detik untuk update timer SLA
    return () => clearInterval(timer);
  }, []);

  // Sync nama tamu & nomor kamar saat pilihan dropdown tamu di form berubah
  useEffect(() => {
    if (formGuestId) {
      const selectedRes = activeGuests.find(g => g.bookingId === formGuestId);
      if (selectedRes) {
        setFormGuestName(selectedRes.guestName);
        setFormRoomNumber(selectedRes.roomNumber);
      }
    } else {
      setFormGuestName("");
      setFormRoomNumber("");
    }
  }, [formGuestId, activeGuests]);

  // 5. HELPER FUNCTIONS REMOVED (DEFINED OUTSIDE)

  // 6. EVENT HANDLERS
  // 6. EVENT HANDLERS
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!formGuestName.trim() || !formRoomNumber.trim() || !formDescription.trim()) {
      alert("Harap lengkapi semua data keluhan tamu!");
      return;
    }

    let routedDept = "Front Desk Staf";
    if (formCategory === "Kebersihan") routedDept = "Tim Housekeeping";
    else if (formCategory === "Fasilitas Rusak") routedDept = "Tim Maintenance";
    else if (formCategory === "Layanan Kamar") routedDept = "Tim F&B";
    else if (formCategory === "Kebisingan") routedDept = "Tim Keamanan";

    const initialHistory = [
      { status: "Baru", time: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB", note: `Keluhan dibuat dan secara otomatis dirutekan ke ${routedDept}.` }
    ];

    try {
      const { data, error } = await supabase
        .from("helpdesk_tickets")
        .insert([{
          guest_name: formGuestName,
          room_number: formRoomNumber,
          category: formCategory,
          description: formDescription,
          priority: formPriority,
          status: "Baru",
          department: routedDept,
          history: initialHistory,
          notes: []
        }])
        .select()
        .single();
      if (error) throw error;

      await fetchTickets();

      const newTicket = {
        ticketId: data.id,
        guestName: data.guest_name,
        roomNumber: data.room_number,
        category: data.category,
        description: data.description,
        priority: data.priority,
        status: data.status,
        department: data.department,
        createdAt: data.created_at,
        notes: data.notes || [],
        history: data.history || []
      };

      // Auto-buat tugas ke departemen terkait
      createHelpdeskTask({
        category: formCategory,
        description: formDescription,
        priority: formPriority,
        roomNumber: formRoomNumber,
      });

      // Reset Form fields
      setFormGuestId("");
      setFormGuestName("");
      setFormRoomNumber("");
      setFormDescription("");

      // Trigger visual notification simulator ke tamu
      setGuestNotification({
        ticketId: data.id,
        roomNumber: formRoomNumber,
        guestName: formGuestName,
        category: formCategory,
        message: `NOTIFIKASI TERKIRIM (WhatsApp/Email) ke ${formGuestName} (Kamar ${formRoomNumber}): "Halo ${formGuestName}, keluhan Anda mengenai '${formCategory}' telah kami terima (Tiket: ${data.id}). Tiket ini telah dirutekan ke ${routedDept} dengan prioritas ${formPriority}. Tim kami akan segera menangani masalah Anda. Terima kasih!"`
      });

      setSelectedTicket(newTicket);
    } catch (err) {
      console.error("Gagal membuat tiket:", err);
      alert("Gagal membuat tiket: " + err.message);
    }
  };

  const handleUpdateStatus = async (ticketId, nextStatus) => {
    const target = tickets.find(t => t.ticketId === ticketId);
    if (!target) return;

    const nowStr = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB";
    const historyNote = `Status diubah ke "${nextStatus}" oleh Staf Desk.`;
    const newHistory = [...(target.history || []), { status: nextStatus, time: nowStr, note: historyNote }];

    try {
      const { error } = await supabase
        .from("helpdesk_tickets")
        .update({
          status: nextStatus,
          history: newHistory
        })
        .eq("id", ticketId);
      if (error) throw error;

      await fetchTickets();

      setSelectedTicket(prev => prev ? { ...prev, status: nextStatus, history: newHistory } : null);

      let statusMessageText = "";
      if (nextStatus === "Sedang Diproses") {
        statusMessageText = `sedang ditangani oleh ${target.department}. Petugas kami segera mendatangi kamar Anda.`;
      } else if (nextStatus === "Selesai") {
        statusMessageText = `telah diselesaikan oleh ${target.department}. Jika Anda masih membutuhkan bantuan, harap menghubungi Front Desk.`;
      } else if (nextStatus === "Ditutup") {
        statusMessageText = `telah ditutup secara resmi di sistem.`;
      }

      setGuestNotification({
        ticketId: ticketId,
        roomNumber: target.roomNumber,
        guestName: target.guestName,
        category: target.category,
        message: `NOTIFIKASI UPDATE TERKIRIM ke ${target.guestName} (Kamar ${target.roomNumber}): "Halo ${target.guestName}, tiket keluhan Anda (${ticketId}) ${statusMessageText}"`
      });
    } catch (err) {
      console.error("Gagal update status tiket:", err);
      alert("Gagal update status: " + err.message);
    }
  };

  const handleAddStaffNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedTicket) return;

    const nowStr = new Date().toLocaleString("id-ID", { dateStyle: 'short', timeStyle: 'short' }) + " WIB";
    const newNoteObj = {
      time: nowStr,
      staffName: "Front Desk Staf",
      text: noteText
    };
    const newNotes = [...(selectedTicket.notes || []), newNoteObj];

    try {
      const { error } = await supabase
        .from("helpdesk_tickets")
        .update({ notes: newNotes })
        .eq("id", selectedTicket.ticketId);
      if (error) throw error;

      await fetchTickets();

      setSelectedTicket(prev => prev ? { ...prev, notes: newNotes } : null);
      setNoteText("");
    } catch (err) {
      console.error("Gagal menambahkan catatan staff:", err);
      alert("Gagal menambahkan catatan: " + err.message);
    }
  };

  // 7. COMPUTES & FILTERS
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // 1. Filter Tab Status
      if (activeStatusTab === "Aktif") {
        if (t.status !== "Baru" && t.status !== "Sedang Diproses") return false;
      } else if (activeStatusTab !== "Semua" && t.status !== activeStatusTab) {
        return false;
      }

      // 2. Filter Kategori
      if (filterCategory !== "Semua Kategori" && t.category !== filterCategory) return false;

      // 3. Filter Prioritas
      if (filterPriority !== "Semua Prioritas" && t.priority !== filterPriority) return false;

      // 4. Filter Pencarian Teks
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.guestName.toLowerCase().includes(query);
        const matchesRoom = t.roomNumber.includes(query);
        const matchesId = t.ticketId.toLowerCase().includes(query);
        return matchesName || matchesRoom || matchesId;
      }

      return true;
    });
  }, [tickets, activeStatusTab, filterCategory, filterPriority, searchQuery]);

  const kpiStats = useMemo(() => {
    let totalActive = 0;
    let totalNew = 0;
    let totalProcessing = 0;
    let totalExceededSla = 0;

    tickets.forEach(t => {
      if (t.status === "Baru") {
        totalActive++;
        totalNew++;
      } else if (t.status === "Sedang Diproses") {
        totalActive++;
        totalProcessing++;
      }

      if (checkSlaExceeded(t.createdAt, t.priority, t.status, currentTime)) {
        totalExceededSla++;
      }
    });

    return { totalActive, totalNew, totalProcessing, totalExceededSla };
  }, [tickets, currentTime]);

  const roomHistoryTickets = useMemo(() => {
    if (!historyRoomSearch.trim()) return [];
    return tickets.filter(t => t.roomNumber === historyRoomSearch.trim());
  }, [tickets, historyRoomSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Visual Notification Drawer Simulator */}
      {guestNotification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)',
          zIndex: 9999,
          maxWidth: '400px',
          borderLeft: '5px solid #10B981',
          animation: 'slideInRight 0.3s ease-out',
          fontSize: '0.8rem',
          lineHeight: 1.4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaConciergeBell /> SIMULASI OTOMASI NOTIFIKASI
            </span>
            <button onClick={() => setGuestNotification(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <FaTimes />
            </button>
          </div>
          <p style={{ margin: 0, color: '#E2E8F0' }}>{guestNotification.message}</p>
          <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#94A3B8', textAlign: 'right' }}>
            Sent via CRM Service Engine • Just now
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaConciergeBell style={{ color: 'var(--primary-color)' }} /> Help Desk & Service Automation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Meja operasional penanganan keluhan tamu, otomatisasi routing departemen, dan pemantauan batas SLA.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--primary-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TIKET AKTIF</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpiStats.totalActive} Tiket</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baru & Sedang Diproses</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #3B82F6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TIKET BARU</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6' }}>{kpiStats.totalNew} Tiket</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menunggu tindak lanjut</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #F59E0B' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SEDANG DIPROSES</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{kpiStats.totalProcessing} Tiket</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sedang ditangani tim</span>
        </div>
        <div className="table-card" style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px', 
          borderLeft: '4px solid #EF4444', 
          backgroundColor: kpiStats.totalExceededSla > 0 ? 'rgba(239, 68, 68, 0.04)' : 'var(--surface-color)',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MELEBIHI SLA</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {kpiStats.totalExceededSla} Tiket
            {kpiStats.totalExceededSla > 0 && <FaExclamationTriangle size={16} className="text-danger-pulse" />}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Respons melebihi batas waktu</span>
        </div>
      </div>

      {/* Main Grid: Left List (70%) and Right Detail/Form (30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: LIST & FILTER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="table-card" style={{ padding: '20px' }}>
            
            {/* Status Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px' }}>
              {["Aktif", "Baru", "Sedang Diproses", "Selesai", "Ditutup", "Semua"].map(tab => {
                const isActive = activeStatusTab === tab;
                let color = "var(--text-muted)";
                let borderBottomColor = "transparent";
                if (isActive) {
                  color = "var(--primary-color)";
                  borderBottomColor = "var(--primary-color)";
                  if (tab === "Baru") color = "#2563EB";
                  if (tab === "Sedang Diproses") color = "#F59E0B";
                  if (tab === "Selesai") color = "#10B981";
                }
                
                return (
                  <button 
                    key={tab} 
                    onClick={() => setActiveStatusTab(tab)}
                    style={{
                      padding: '10px 4px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      color,
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderBottom: `3px solid ${borderBottomColor}`,
                      transition: 'all 0.2s ease',
                      marginBottom: '-1px'
                    }}
                  >
                    {tab === "Aktif" ? "Tiket Aktif" : tab}
                  </button>
                );
              })}
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kamar, nama tamu, atau ID tiket..."
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

              <div style={{ position: 'relative' }}>
                <FaFilter style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-color)',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="Semua Kategori">Semua Kategori</option>
                  <option value="Kebersihan">Kebersihan</option>
                  <option value="Fasilitas Rusak">Fasilitas Rusak</option>
                  <option value="Layanan Kamar">Layanan Kamar</option>
                  <option value="Kebisingan">Kebisingan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <FaFilter style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                <select 
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-color)',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="Semua Prioritas">Semua Prioritas</option>
                  <option value="Rendah">Prioritas: Rendah</option>
                  <option value="Sedang">Prioritas: Sedang</option>
                  <option value="Tinggi">Prioritas: Tinggi</option>
                  <option value="Darurat">Prioritas: Darurat</option>
                </select>
              </div>
            </div>

            {/* Tickets Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="hotel-table">
                <thead>
                  <tr>
                    <th>Tiket ID</th>
                    <th>Kamar & Tamu</th>
                    <th>Keluhan / Kategori</th>
                    <th>Routing / Tim</th>
                    <th>SLA Timer</th>
                    <th>Prioritas</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <FaInbox size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--text-muted)', opacity: 0.5 }} />
                        Tidak ada tiket yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(t => {
                      const isExceeded = checkSlaExceeded(t.createdAt, t.priority, t.status, currentTime);
                      const priorityInfo = getPriorityStyle(t.priority);
                      const statusInfo = getStatusStyle(t.status);
                      const isSelected = selectedTicket?.ticketId === t.ticketId;
                      
                      return (
                        <tr 
                          key={t.ticketId} 
                          onClick={() => setSelectedTicket(t)}
                          style={{ 
                            cursor: 'pointer', 
                            backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                            boxShadow: isSelected ? 'inset 4px 0 0 var(--primary-color)' : 'none',
                            borderLeft: isExceeded ? '4px solid #EF4444' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{t.ticketId}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Kamar {t.roomNumber}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.guestName}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {getCategoryIcon(t.category)}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {t.description}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.category}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                              {t.department}
                            </span>
                          </td>
                          <td>
                            {(t.status === "Selesai" || t.status === "Ditutup") ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selesai</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaClock size={11} style={{ color: isExceeded ? '#EF4444' : 'var(--text-muted)' }} />
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  color: isExceeded ? '#EF4444' : 'var(--text-main)',
                                  animation: isExceeded ? 'pulseRed 1.5s infinite' : 'none'
                                }}>
                                  {calculateElapsedTime(t.createdAt, currentTime)}
                                </span>
                                {isExceeded && (
                                  <span style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 800, 
                                    backgroundColor: '#FFE4E6', 
                                    color: '#E11D48', 
                                    padding: '2px 4px', 
                                    borderRadius: '3px',
                                    border: '1px solid #F43F5E'
                                  }}>
                                    EXCEEDED
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: priorityInfo.bg,
                              color: priorityInfo.text,
                              border: `1px solid ${priorityInfo.border}`
                            }}>
                              {priorityInfo.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color,
                              display: 'inline-block',
                              textAlign: 'center',
                              minWidth: '90px'
                            }}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* ROOM HISTORY TAB / SECTION */}
          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaHistory style={{ color: 'var(--primary-color)' }} /> Cari Riwayat Tiket Per Kamar
            </h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input 
                type="text"
                value={historyRoomSearch}
                onChange={(e) => setHistoryRoomSearch(e.target.value)}
                placeholder="Masukkan Nomor Kamar (contoh: 101, 102, 105)..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '0.875rem',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-color)'
                }}
              />
              <button 
                onClick={() => setHistoryRoomSearch("")} 
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Reset
              </button>
            </div>

            {historyRoomSearch.trim() && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Menampilkan {roomHistoryTickets.length} tiket riwayat Kamar {historyRoomSearch.trim()}
                </h4>
                {roomHistoryTickets.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                    Kamar ini tidak memiliki riwayat tiket keluhan/permintaan di sistem.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {roomHistoryTickets.map(t => (
                      <div key={t.ticketId} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.8rem' }}>{t.ticketId}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: getStatusStyle(t.status).bg, color: getStatusStyle(t.status).color }}>{t.status}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>{t.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>Kategori: {t.category}</span>
                          <span>Tim: {t.department}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL PANEL OR NEW TICKET FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TICKET DETAIL VIEW PANEL (IF SELECTED) */}
          {selectedTicket ? (
            <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `4px solid ${getPriorityStyle(selectedTicket.priority).border}` }}>
              
              {/* Detail Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>TINDAKAN TIKET KELUHAN</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0 0' }}>{selectedTicket.ticketId}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Guest & Room Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tamu Menginap:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedTicket.guestName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kamar Ditempati:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Kamar {selectedTicket.roomNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Routing Otomatis:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{selectedTicket.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Batas SLA:</span>
                  <span style={{ fontWeight: 700, color: getPriorityStyle(selectedTicket.priority).text }}>
                    {getPriorityStyle(selectedTicket.priority).label}
                  </span>
                </div>
              </div>

              {/* Ticket Description */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Deskripsi Keluhan:</span>
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-main)', lineHeight: 1.4, backgroundColor: 'rgba(251, 191, 36, 0.03)', border: '1px dashed #FACC15', padding: '10px', borderRadius: '6px' }}>
                  "{selectedTicket.description}"
                </p>
              </div>

              {/* Action Buttons to Update Status */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Pembaruan Status Penanganan:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {selectedTicket.status === "Baru" && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedTicket.ticketId, "Sedang Diproses")}
                      className="btn-primary" 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}
                    >
                      <FaClock /> Mulai Proses Keluhan
                    </button>
                  )}

                  {selectedTicket.status === "Sedang Diproses" && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedTicket.ticketId, "Selesai")}
                      className="btn-primary" 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#10B981', borderColor: '#10B981' }}
                    >
                      <FaCheckCircle /> Tandai Selesai (Resolved)
                    </button>
                  )}

                  {selectedTicket.status === "Selesai" && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedTicket.ticketId, "Ditutup")}
                      className="btn-primary" 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#64748B', borderColor: '#64748B' }}
                    >
                      <FaBan /> Tutup Tiket Resmi (Closed)
                    </button>
                  )}

                  {selectedTicket.status === "Ditutup" && (
                    <div style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                      Tiket ini telah ditutup. Riwayat tersimpan permanen.
                    </div>
                  )}

                </div>
              </div>

              {/* Staff Notes section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Catatan Penanganan Staf:</span>
                
                {/* Notes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', marginBottom: '12px' }}>
                  {(!selectedTicket.notes || selectedTicket.notes.length === 0) ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', italic: 'true', padding: '6px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', textAlign: 'center' }}>
                      Belum ada catatan penanganan staf.
                    </div>
                  ) : (
                    selectedTicket.notes.map((note, idx) => (
                      <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                          <span>{note.staffName}</span>
                          <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.65rem' }}>{note.time}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.3 }}>{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Notes Form */}
                {selectedTicket.status !== "Ditutup" && (
                  <form onSubmit={handleAddStaffNoteSubmit} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Tambah catatan penanganan..."
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        outline: 'none',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-color)'
                      }}
                    />
                    <button 
                      type="submit" 
                      className="btn-primary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
                    >
                      Simpan
                    </button>
                  </form>
                )}
              </div>

              {/* Change log trail */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Linimasa Status Tiket:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '6px' }}>
                  {(selectedTicket.history || []).map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', marginTop: '4px' }} />
                        {idx !== selectedTicket.history.length - 1 && (
                          <div style={{ width: '1px', flex: 1, backgroundColor: 'var(--border-color)', minHeight: '12px' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{h.status} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.65rem' }}>({h.time})</span></span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            
            /* CREATION TICKET FORM (DEFAULT PANEL WHEN NO TICKET SELECTED) */
            <div className="table-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlus style={{ color: 'var(--primary-color)' }} /> Buat Laporan Tiket Baru
              </h3>
              
              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Guest dropdown selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tamu Pelapor (Aktif Menginap):</label>
                  <select 
                    value={formGuestId}
                    onChange={(e) => setFormGuestId(e.target.value)}
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
                    <option value="">-- Pilih Tamu Check-in --</option>
                    {activeGuests.map(g => (
                      <option key={g.bookingId} value={g.bookingId}>
                        {g.guestName} (Kamar {g.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Read-only populated Room Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Nomor Kamar:</label>
                  <input 
                    type="text"
                    value={formRoomNumber}
                    readOnly
                    placeholder="Otomatis terisi..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-color)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Kategori Masalah:</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                    <option value="Kebersihan">Kebersihan (Housekeeping)</option>
                    <option value="Fasilitas Rusak">Fasilitas Rusak (Maintenance)</option>
                    <option value="Layanan Kamar">Layanan Kamar (F&B)</option>
                    <option value="Kebisingan">Kebisingan (Security)</option>
                    <option value="Lainnya">Lainnya (Front Office)</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tingkat Prioritas (SLA):</label>
                  <select 
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
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
                    <option value="Rendah">Rendah (SLA 6 jam)</option>
                    <option value="Sedang">Sedang (SLA 3 jam)</option>
                    <option value="Tinggi">Tinggi (SLA 1 jam)</option>
                    <option value="Darurat">Darurat (SLA 30 menit)</option>
                  </select>
                </div>

                {/* Description Textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Deskripsi Masalah:</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows="4"
                    placeholder="Masukkan rincian keluhan atau permintaan tamu secara lengkap..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      backgroundColor: 'var(--surface-color)',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <FaPlus /> Kirim & Rutekan Tiket
                </button>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
