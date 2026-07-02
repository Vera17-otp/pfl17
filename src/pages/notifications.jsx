import React, { useState, useMemo } from "react";
import { 
  FaBell, 
  FaPaperPlane, 
  FaCog, 
  FaHistory, 
  FaEnvelope, 
  FaWhatsapp, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTimes, 
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaInfoCircle
} from "react-icons/fa";
import { supabase } from "../lib/supabase";

// Mengambil data reservasi untuk simulasi penggabungan template
import { reservations } from "../data/reservations";

// Helper helper functions defined outside component for purity
const parseTemplate = (text, data) => {
  if (!text) return "";
  let result = text;
  result = result.replace(/\{\{guestName\}\}/g, data.guestName || "Tamu");
  result = result.replace(/\{\{bookingId\}\}/g, data.bookingId || "HTL-XXXX");
  result = result.replace(/\{\{roomNumber\}\}/g, data.roomNumber || "000");
  result = result.replace(/\{\{roomType\}\}/g, data.roomType || "Standard");
  result = result.replace(/\{\{checkInDate\}\}/g, data.checkIn || "2026-06-15");
  result = result.replace(/\{\{checkOutDate\}\}/g, data.checkOut || "2026-06-16");
  result = result.replace(/\{\{reviewLink\}\}/g, "https://review.vera-hotel.id/feedback");
  result = result.replace(/\{\{wifiPassword\}\}/g, `GrandVeraWiFi_${data.roomNumber || '101'}`);
  return result;
};

export default function Notifications() {
  // 1. TEMPLATE DEFAULT CONFIGURATION
  const defaultTemplates = [
    {
      id: "booking_confirmation",
      name: "Konfirmasi Reservasi Baru",
      trigger: "dikirim segera setelah booking baru berhasil disimpan",
      isActive: true,
      channel: "WhatsApp & Email",
      message: "Halo {{guestName}},\n\nReservasi Anda di Grand Vera Hotel telah berhasil dikonfirmasi! Berikut rincian pesanan Anda:\n\n• Kode Booking: {{bookingId}}\n• Tipe Kamar: {{roomType}}\n• Tanggal Check-in: {{checkInDate}}\n• Tanggal Check-out: {{checkOutDate}}\n\nKami menantikan kedatangan Anda. Terima kasih!"
    },
    {
      id: "checkin_reminder",
      name: "Reminder Check-in H-1",
      trigger: "dikirim otomatis H-1 sebelum tanggal check-in pukul 10:00",
      isActive: true,
      channel: "WhatsApp",
      message: "Halo {{guestName}},\n\nIni adalah pengingat bahwa masa menginap Anda di Grand Vera Hotel akan dimulai besok, {{checkInDate}}.\n\nAnda dapat melakukan Check-in Digital sebelum tiba untuk mempercepat proses masuk kamar. Silakan siapkan nomor identitas (NIK/Paspor) Anda.\n\nSampai jumpa besok!"
    },
    {
      id: "welcome_message",
      name: "Ucapan Selamat Datang",
      trigger: "dikirim segera setelah check-in selesai diproses",
      isActive: true,
      channel: "WhatsApp & Email",
      message: "Selamat datang di Grand Vera Hotel, {{guestName}}!\n\nKamar Anda adalah Room {{roomNumber}} ({{roomType}}). Untuk kenyamanan Anda, berikut beberapa informasi penting:\n\n• Password WiFi Kamar: {{wifiPassword}}\n• Layanan Sarapan: Pukul 06:00 - 10:00 WIB di Restoran Utama (Lantai 1)\n\nJika Anda memerlukan layanan atau memiliki permintaan khusus, Anda dapat menghubungi kami via menu Help Desk di panel ini. Selamat beristirahat!"
    },
    {
      id: "checkout_reminder",
      name: "Reminder Check-out H-0 Pagi",
      trigger: "dikirim otomatis pada pukul 08:00 di hari check-out",
      isActive: true,
      channel: "WhatsApp",
      message: "Halo {{guestName}},\n\nKami menginfokan bahwa batas waktu check-out untuk Kamar {{roomNumber}} Anda adalah hari ini sebelum pukul 12:00 WIB.\n\nStruk billing akhir Anda saat ini sedang disiapkan. Jika Anda memerlukan layanan check-out kilat atau bantuan porter bagasi, harap balas pesan ini atau hubungi Resepsionis.\n\nTerima kasih telah menginap bersama kami!"
    },
    {
      id: "thankyou_review",
      name: "Ucapan Terima Kasih & Link Review",
      trigger: "dikirim otomatis H+1 setelah check-out selesai pukul 14:00",
      isActive: true,
      channel: "Email",
      message: "Halo {{guestName}},\n\nTerima kasih atas kunjungan Anda di Grand Vera Hotel. Kami harap pelayanan kami memberikan kesan menyenangkan selama masa tinggal Anda.\n\nMasukan Anda sangat berharga bagi kami. Mohon luangkan waktu 1 menit untuk membagikan ulasan Anda melalui tautan resmi kami:\n{{reviewLink}}\n\nSampai jumpa pada kunjungan Anda berikutnya!"
    },
    {
      id: "birthday_promo",
      name: "Promo Ulang Tahun Tamu",
      trigger: "dikirim otomatis pada hari ulang tahun tamu pukul 07:00 (Marketing)",
      isActive: false,
      channel: "Email",
      message: "Selamat ulang tahun {{guestName}}!\n\nDi hari spesial Anda ini, Grand Vera Hotel memberikan kado istimewa berupa VOUCHER DISKON 20% untuk menginap di kunjungan Anda berikutnya.\n\n• Kode Promo: HBD{{guestName}}\n• Berlaku hingga: 3 bulan sejak hari ini\n\nRayakan hari bahagia Anda bersama pelayanan terbaik dari kami. Selamat ulang tahun!"
    }
  ];

  // 2. MOCK INITIAL LOGS
  const defaultLogs = [
    {
      logId: "NLOG-7001",
      guestName: "Vera Zakia",
      bookingId: "BOK-5000",
      roomNumber: "101",
      type: "Ucapan Selamat Datang",
      channel: "WhatsApp & Email",
      time: "14 Jun 2026, 15:45 WIB",
      status: "Terkirim",
      body: "Selamat datang di Grand Vera Hotel, Vera Zakia! Kamar Anda adalah Room 101 (Deluxe Room). Password WiFi Kamar: GrandVeraWiFi_101. Sarapan pagi tersedia pukul 06:00 - 10:00 WIB."
    },
    {
      logId: "NLOG-7002",
      guestName: "John Doe",
      bookingId: "BOK-5001",
      roomNumber: "102",
      type: "Reminder Check-in H-1",
      channel: "WhatsApp",
      time: "13 Jun 2026, 10:00 WIB",
      status: "Terkirim",
      body: "Halo John Doe, ini adalah pengingat bahwa masa menginap Anda di Grand Vera Hotel akan dimulai besok, 2026-06-14. Silakan siapkan nomor identitas Anda."
    },
    {
      logId: "NLOG-7003",
      guestName: "Siti Aminah",
      bookingId: "BOK-5002",
      roomNumber: "103",
      type: "Konfirmasi Reservasi Baru",
      channel: "WhatsApp & Email",
      time: "12 Jun 2026, 09:35 WIB",
      status: "Terkirim",
      body: "Halo Siti Aminah, reservasi Anda dengan kode BOK-5002 untuk Kamar Double Bed telah berhasil dikonfirmasi. Check-in mulai 2026-06-14."
    },
    {
      logId: "NLOG-7004",
      guestName: "Michael Chen",
      bookingId: "BOK-5003",
      roomNumber: "104",
      type: "Promo Ulang Tahun Tamu",
      channel: "Email",
      time: "11 Jun 2026, 07:00 WIB",
      status: "Gagal",
      body: "Selamat ulang tahun Michael Chen! Kami memberikan kado spesial diskon 20%. Kode promo: HBDMichael Chen.",
      reason: "Email bounce - Alamat email tujuan tidak aktif/tidak valid."
    },
    {
      logId: "NLOG-7005",
      guestName: "Budi Santoso",
      bookingId: "BOK-5004",
      roomNumber: "105",
      type: "Ucapan Terima Kasih & Link Review",
      channel: "Email",
      time: "10 Jun 2026, 13:00 WIB",
      status: "Terkirim",
      body: "Terima kasih atas kunjungan Anda di Grand Vera Hotel, Budi Santoso. Berikan ulasan Anda melalui tautan review kami."
    },
    {
      logId: "NLOG-7006",
      guestName: "Sarah Jenkins",
      bookingId: "BOK-5005",
      roomNumber: "106",
      type: "Reminder Check-out H-0 Pagi",
      channel: "WhatsApp",
      time: "09 Jun 2026, 08:00 WIB",
      status: "Terkirim",
      body: "Halo Sarah Jenkins, kami menginfokan batas waktu check-out untuk Kamar 106 adalah hari ini sebelum pukul 12:00 WIB."
    },
    {
      logId: "NLOG-7007",
      guestName: "Elena Rodriguez",
      bookingId: "BOK-5006",
      roomNumber: "107",
      type: "Konfirmasi Reservasi Baru",
      channel: "WhatsApp & Email",
      time: "08 Jun 2026, 16:20 WIB",
      status: "Gagal",
      body: "Halo Elena Rodriguez, reservasi Anda BOK-5006 telah dikonfirmasi.",
      reason: "Gagal WhatsApp - Nomor HP tujuan tidak terdaftar atau tidak memiliki akses WA."
    }
  ];

  // 3. STATE INITIALIZATION
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem("hotelify_notification_templates");
    return saved ? JSON.parse(saved) : defaultTemplates;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("hotelify_notification_logs");
    return saved ? JSON.parse(saved) : defaultLogs;
  });

  // State control
  const [expandedTemplateId, setExpandedTemplateId] = useState("booking_confirmation");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null); // Modal detail log

  // Test Simulation Form States
  const [testBookingId, setTestBookingId] = useState("");
  const [testTemplateId, setTestTemplateId] = useState("booking_confirmation");

  // Visual success alert toast
  const [toastMessage, setToastMessage] = useState("");

  // 4. SAVE HANDLERS
  const handleSaveTemplate = (id, newText, newChannel, newIsActive) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        return {
          ...t,
          message: newText,
          channel: newChannel,
          isActive: newIsActive
        };
      }
      return t;
    });
    setTemplates(updated);
    localStorage.setItem("hotelify_notification_templates", JSON.stringify(updated));
    showToast("Perubahan template notifikasi berhasil disimpan!");
  };

  const handleToggleTemplate = (id) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        const nextState = !t.isActive;
        showToast(`Template "${t.name}" kini ${nextState ? "AKTIF" : "NONAKTIF"}`);
        return { ...t, isActive: nextState };
      }
      return t;
    });
    setTemplates(updated);
    localStorage.setItem("hotelify_notification_templates", JSON.stringify(updated));
  };

  // 5. TEST NOTIFICATION TRIGGER (SIMULATION & DB SYNC)
  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    if (!testBookingId) {
      alert("Harap pilih salah satu reservasi tamu!");
      return;
    }

    const targetRes = reservations.find(r => r.bookingId === testBookingId);
    const targetTemplate = templates.find(t => t.id === testTemplateId);

    if (!targetRes || !targetTemplate) return;

    if (!targetTemplate.isActive) {
      alert(`Gagal! Pemicu "${targetTemplate.name}" sedang dinonaktifkan.`);
      return;
    }

    // Merge placeholders
    const mergedText = parseTemplate(targetTemplate.message, targetRes);
    const newLogId = `NLOG-${logs.length + 7008}`;
    const nowStr = new Date().toLocaleString("id-ID", { dateStyle: 'short', timeStyle: 'short' }) + " WIB";

    // Simulasikan kegagalan acak kecil jika data tidak lengkap
    let isSuccess = true;
    let failReason = "";
    if (targetTemplate.channel.includes("WhatsApp") && targetRes.guestName.includes("Elena")) {
      isSuccess = false;
      failReason = "Gagal WhatsApp - Nomor tidak valid/tidak aktif.";
    }

    // Connect to Supabase system_notifications table
    try {
      const emailQuery = targetRes.email || `${targetRes.guestName.toLowerCase().replace(/\s+/g, '')}@example.com`;
      const { data: guestProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", emailQuery)
        .maybeSingle();

      if (guestProfile && isSuccess) {
        await supabase
          .from("system_notifications")
          .insert([{
            profile_id: guestProfile.id,
            title: targetTemplate.name,
            content: mergedText,
            type: "info",
            is_read: false
          }]);
      }
    } catch (dbErr) {
      console.error("Gagal menyimpan notifikasi ke DB:", dbErr);
    }

    const newLog = {
      logId: newLogId,
      guestName: targetRes.guestName,
      bookingId: targetRes.bookingId,
      roomNumber: targetRes.roomNumber,
      type: targetTemplate.name,
      channel: targetTemplate.channel,
      time: nowStr,
      status: isSuccess ? "Terkirim" : "Gagal",
      body: mergedText,
      ...(failReason && { reason: failReason })
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("hotelify_notification_logs", JSON.stringify(updatedLogs));

    showToast(`Notifikasi "${targetTemplate.name}" sukses diproses via ${targetTemplate.channel}!`);
    setTestBookingId("");
  };

  // Helper show toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  // Helper insert tag di kursor textarea
  const handleInsertTag = (templateId, tag) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const textarea = document.getElementById(`textarea-${templateId}`);
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = template.message;
    const insertedText = text.substring(0, startPos) + tag + text.substring(endPos, text.length);
    
    // Update state
    const updated = templates.map(t => {
      if (t.id === templateId) {
        return { ...t, message: insertedText };
      }
      return t;
    });
    setTemplates(updated);
  };

  // Clear Logs
  const handleClearLogs = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat log notifikasi?")) {
      setLogs([]);
      localStorage.removeItem("hotelify_notification_logs");
      showToast("Log riwayat notifikasi dikosongkan!");
    }
  };

  // 6. COMPUTES & FILTERS
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        l.guestName.toLowerCase().includes(query) ||
        l.bookingId.toLowerCase().includes(query) ||
        l.type.toLowerCase().includes(query)
      );
    });
  }, [logs, searchQuery]);

  const kpiStats = useMemo(() => {
    let sentCount = 0;
    let waCount = 0;
    let emailCount = 0;
    let failCount = 0;

    logs.forEach(l => {
      if (l.status === "Terkirim") {
        sentCount++;
        if (l.channel.includes("WhatsApp")) waCount++;
        if (l.channel.includes("Email")) emailCount++;
      } else {
        failCount++;
      }
    });

    return { sentCount, waCount, emailCount, failCount };
  }, [logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
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

      {/* Log Detail Modal popup */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="table-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Detail Pesan Terkirim</span>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tamu:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedLog.guestName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trigger:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedLog.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Waktu Kirim:</span>
                <span style={{ color: 'var(--text-main)' }}>{selectedLog.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Saluran:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{selectedLog.channel}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Konten Pesan Terkirim:</span>
              <div style={{ 
                backgroundColor: 'var(--bg-color)', 
                border: '1px solid var(--border-color)', 
                padding: '14px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                color: 'var(--text-main)', 
                whiteSpace: 'pre-line',
                lineHeight: 1.4
              }}>
                {selectedLog.body}
              </div>
            </div>

            {selectedLog.status === "Gagal" && (
              <div style={{ padding: '10px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', color: '#B91C1C', fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <FaTimesCircle />
                <span><strong>Alasan Gagal:</strong> {selectedLog.reason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBell style={{ color: 'var(--primary-color)' }} /> Marketing & Service Automation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
          Konfigurasi otomatisasi pengiriman notifikasi pemicu tamu via Email & WhatsApp, serta log audit pengiriman.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--primary-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL NOTIFIKASI</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpiStats.sentCount} Sukses</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Terkirim ke email / WA tamu</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #10B981' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SALURAN WHATSAPP</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {kpiStats.waCount} Pesan <FaWhatsapp size={16} />
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Melalui WhatsApp Gateway</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #3B82F6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SALURAN EMAIL</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {kpiStats.emailCount} Email <FaEnvelope size={14} />
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Melalui SMTP Email Relay</span>
        </div>
        <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid #EF4444' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PENGIRIMAN GAGAL</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444' }}>{kpiStats.failCount} Gagal</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Perlu perhatian atau koreksi kontak</span>
        </div>
      </div>

      {/* Main Grid: Left Templates (60%) and Right Logs (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 2.5fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: TEMPLATE EDITOR ACCORDIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCog style={{ color: 'var(--primary-color)' }} /> Pengaturan & Template Pemicu
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klik kartu untuk mengedit konten</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templates.map(t => {
              const isExpanded = expandedTemplateId === t.id;
              return (
                <div 
                  key={t.id} 
                  className="table-card" 
                  style={{ 
                    padding: '16px 20px',
                    borderColor: t.isActive ? 'var(--border-color)' : 'transparent',
                    opacity: t.isActive ? 1 : 0.7,
                    transition: 'all 0.3s ease',
                    boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedTemplateId(isExpanded ? null : t.id)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.name}
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          backgroundColor: t.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                          color: t.isActive ? '#10B981' : 'var(--text-muted)'
                        }}>
                          {t.isActive ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pemicu: {t.trigger}</span>
                    </div>
                    
                    {/* Toggle and Expand indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                      {/* Custom Toggle Switch */}
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                        <input 
                          type="checkbox" 
                          checked={t.isActive} 
                          onChange={() => handleToggleTemplate(t.id)} 
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: t.isActive ? 'var(--primary-color)' : '#CBD5E1',
                          transition: '0.3s',
                          borderRadius: '20px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '""',
                            height: '14px', width: '14px',
                            left: t.isActive ? '18px' : '4px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.3s',
                            borderRadius: '50%'
                          }} />
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Card Body (Expanded Content) */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Channel Selection dropdown */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Saluran Pengiriman (Delivery Channel):</label>
                        <select 
                          value={t.channel}
                          onChange={(e) => {
                            const updated = templates.map(temp => temp.id === t.id ? { ...temp, channel: e.target.value } : temp);
                            setTemplates(updated);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--surface-color)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="WhatsApp">WhatsApp Gateway Saja</option>
                          <option value="Email">SMTP Email Relay Saja</option>
                          <option value="WhatsApp & Email">Keduanya (WhatsApp & Email)</option>
                        </select>
                      </div>

                      {/* Text editor with help tags */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Konten Isi Pesan Notifikasi:</label>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sisipkan variabel otomatis:</span>
                        </div>

                        {/* Tag helper buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {[
                            { tag: "{{guestName}}", label: "Nama Tamu" },
                            { tag: "{{bookingId}}", label: "Kode Booking" },
                            { tag: "{{roomNumber}}", label: "No Kamar" },
                            { tag: "{{roomType}}", label: "Tipe Kamar" },
                            { tag: "{{checkInDate}}", label: "Check-in" },
                            { tag: "{{checkOutDate}}", label: "Check-out" },
                            { tag: "{{wifiPassword}}", label: "WiFi Password" },
                            { tag: "{{reviewLink}}", label: "Link Review" }
                          ].map(badge => (
                            <button
                              key={badge.tag}
                              type="button"
                              onClick={() => handleInsertTag(t.id, badge.tag)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-color)',
                                color: 'var(--text-main)',
                                cursor: 'pointer'
                              }}
                            >
                              {badge.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          id={`textarea-${t.id}`}
                          value={t.message}
                          onChange={(e) => {
                            const updated = templates.map(temp => temp.id === t.id ? { ...temp, message: e.target.value } : temp);
                            setTemplates(updated);
                          }}
                          rows="6"
                          placeholder="Tulis pesan Anda..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            outline: 'none',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--surface-color)',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            lineHeight: 1.4
                          }}
                        />
                      </div>

                      {/* Action footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => handleSaveTemplate(t.id, t.message, t.channel, t.isActive)}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                          Simpan Perubahan
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: MANUAL TEST SIMULATOR & LOG HISTORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SIMULATION TEST FORUM */}
          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPaperPlane style={{ color: 'var(--primary-color)' }} /> Simulasi Tes Kirim Notifikasi
            </h3>
            
            <form onSubmit={handleSendTestNotification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Select guest booking record */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Pilih Reservasi Tamu Target:</label>
                <select
                  value={testBookingId}
                  onChange={(e) => setTestBookingId(e.target.value)}
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
                  <option value="">-- Pilih Booking Tamu --</option>
                  {reservations.map(res => (
                    <option key={res.bookingId} value={res.bookingId}>
                      {res.guestName} ({res.bookingId} - Room {res.roomNumber} - {res.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select trigger template type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Pilih Pemicu Notifikasi (Trigger Template):</label>
                <select
                  value={testTemplateId}
                  onChange={(e) => setTestTemplateId(e.target.value)}
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
                  {templates.map(t => (
                    <option key={t.id} value={t.id} disabled={!t.isActive}>
                      {t.name} {!t.isActive && "(NONAKTIF)"}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaPaperPlane /> Kirim Tes Notifikasi
              </button>

            </form>
          </div>

          {/* NOTIFICATION LOG HISTORY */}
          <div className="table-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FaHistory style={{ color: 'var(--primary-color)' }} /> Log Pengiriman Notifikasi
              </h3>
              {logs.length > 0 && (
                <button 
                  onClick={handleClearLogs}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger-color)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FaTrashAlt size={10} /> Kosongkan
                </button>
              )}
            </div>

            {/* Search filter for logs */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)', fontSize: '0.75rem' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama tamu atau jenis pemicu..."
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 28px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-color)'
                }}
              />
            </div>

            {/* Log list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Tidak ada riwayat pengiriman notifikasi.
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isSuccess = log.status === "Terkirim";
                  return (
                    <div 
                      key={log.logId}
                      onClick={() => setSelectedLog(log)}
                      style={{ 
                        padding: '12px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--bg-color)',
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                          {log.guestName}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Channel indicators */}
                          {log.channel.includes("WhatsApp") && <FaWhatsapp size={12} style={{ color: '#10B981' }} title="WhatsApp" />}
                          {log.channel.includes("Email") && <FaEnvelope size={11} style={{ color: '#3B82F6' }} title="Email" />}
                          
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 800, 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isSuccess ? '#10B981' : '#EF4444'
                          }}>
                            {log.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Pemicu: {log.type}</span>
                        <span>{log.time.split(',')[0]}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '2px' }}>
                        <FaInfoCircle size={10} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          {log.body}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
