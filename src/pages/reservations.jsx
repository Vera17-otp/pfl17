/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaHistory, 
  FaPlus, 
  FaCheckCircle, 
  FaBan, 
  FaDoorOpen, 
  FaArrowLeft, 
  FaSearch, 
  FaFilter,
  FaBed,
  FaUsers,
  FaClock,
  FaCheck,
  FaExclamationTriangle,
  FaCoins,
  FaWifi,
  FaCoffee,
  FaDownload,
  FaPrint,
  FaBroom
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

// Import data asli
import { reservations } from "../data/reservations";
import { rooms } from "../data/rooms";
import { useTask } from "../context/TaskContext";

// Helper rupiah formatter
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

// Helper hitung lama menginap dalam hari/malam
const getStayNights = (inStr, outStr) => {
  if (!inStr || !outStr) return 0;
  const inParts = inStr.split('-');
  const outParts = outStr.split('-');
  const inDate = new Date(inParts[0], inParts[1] - 1, inParts[2]);
  const outDate = new Date(outParts[0], outParts[1] - 1, outParts[2]);
  const diffTime = outDate - inDate;
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// Helper update status kamar di DB Supabase
const updateRoomStatusInDB = async (roomNumber, nextStatus) => {
  const dbStatus = nextStatus.toLowerCase();
  try {
    const { error } = await supabase
      .from("rooms")
      .update({ status: dbStatus })
      .eq("room_number", roomNumber);
    if (error) throw error;
  } catch (err) {
    console.error("Gagal update status kamar:", err);
  }
};

export default function Reservations() {
  const { createCheckoutTask } = useTask();
  // 1. STATE UTAMA & NAVIGASI TAB
  const [activeTab, setActiveTab] = useState("reservation"); // "reservation" | "checkin" | "checkout"
  const [viewMode, setViewMode] = useState("list"); // "list" | "create" | "detail"
  const [selectedResId, setSelectedResId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Semua Tipe");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [filterDate, setFilterDate] = useState("");

  // Hari ini dalam simulasi sistem hotel
  const todayStr = "2026-06-14";

  // 1. STATE UTAMA (Supabase Integration)
  const [resList, setResList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Riwayat Status (Lini Masa Audit Trail) - local storage fallback
  const [statusHistory, setStatusHistory] = useState(() => {
    const saved = localStorage.getItem("hotelify_status_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat status history", e);
      }
    }
    return {};
  });

  // Pelacakan Data Deposit Check-in - local storage fallback
  const [depositRecords, setDepositRecords] = useState(() => {
    const saved = localStorage.getItem("hotelify_deposit_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat deposit records", e);
      }
    }
    return {};
  });

  const fetchData = async () => {
    try {
      // 1. Fetch Rooms
      const { data: dbRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*");
      if (roomsError) throw roomsError;
      
      const formattedRooms = dbRooms.map(rm => ({
        roomId: rm.id,
        roomNumber: rm.room_number,
        type: rm.room_type,
        price: Number(rm.price_per_night),
        capacity: rm.capacity,
        status: rm.status.charAt(0).toUpperCase() + rm.status.slice(1),
        description: rm.description,
        floor: rm.floor,
        facilities: rm.facilities || [],
        image: rm.image
      }));
      setRoomsList(formattedRooms);

      // 1b. Fetch Services
      const { data: dbServices, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (!servicesError && dbServices) {
        setServicesList(dbServices);
      }

      // 2. Fetch Reservations
      const { data: dbRes, error: resError } = await supabase
        .from("reservations")
        .select("*, profiles(*), rooms(*)");
      if (resError) throw resError;

      const formattedRes = dbRes.map(res => {
        let statusLabel = "Menunggu Konfirmasi";
        if (res.status === "confirmed") statusLabel = "Dikonfirmasi";
        else if (res.status === "checked_in") statusLabel = "Check-in";
        else if (res.status === "checked_out") statusLabel = "Check-out";
        else if (res.status === "cancelled") statusLabel = "Dibatalkan";

        return {
          bookingId: res.id,
          guestId: res.guest_id,
          guestName: res.profiles?.full_name || "Tamu",
          phone: res.profiles?.phone || "",
          email: res.profiles?.email || "",
          roomNumber: res.rooms?.room_number || "",
          roomType: res.rooms?.room_type || "",
          checkIn: res.check_in,
          checkOut: res.check_out,
          status: statusLabel,
          totalPayment: Number(res.total_price),
          pointsEarned: res.points_earned,
          additionalServiceFee: 0 // Ideally this should be fetched from reservation_services sum
        };
      });

      setResList(formattedRes);
    } catch (err) {
      console.error("Error fetching reservation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("hotelify_status_history", JSON.stringify(statusHistory));
  }, [statusHistory]);

  useEffect(() => {
    localStorage.setItem("hotelify_deposit_records", JSON.stringify(depositRecords));
  }, [depositRecords]);

  // MODAL OPERASIONAL STATES
  const [activeCheckInRes, setActiveCheckInRes] = useState(null); // Reservasi yang akan di-check-in
  const [activeCheckOutRes, setActiveCheckOutRes] = useState(null); // Reservasi yang akan di-check-out
  const [showWelcomeCard, setShowWelcomeCard] = useState(null); // Data Welcome Card pop-up
  const [showReceipt, setShowReceipt] = useState(null); // Data Receipt pop-up

  // Inputs for Check-in Modal
  const [checkInDeposit, setCheckInDeposit] = useState(200000);
  const [checkInDepositMethod, setCheckInDepositMethod] = useState("Tunai");

  // Inputs for Check-out Modal
  const [checkOutPaymentMethod, setCheckOutPaymentMethod] = useState("Tunai");

  // 2. FORM STATES (BUAT RESERVASI BARU)
  const [formName, setFormName] = useState("");
  const [formIdentity, setFormIdentity] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRoomType, setFormRoomType] = useState("Single");
  const [formCheckIn, setFormCheckIn] = useState("2026-06-15");
  const [formCheckOut, setFormCheckOut] = useState("2026-06-16");
  const [formAdults, setFormAdults] = useState(2);
  const [formChildren, setFormChildren] = useState(0);
  const [formRequest, setFormRequest] = useState("");
  const [formSource, setFormSource] = useState("Website");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formSelectedServices, setFormSelectedServices] = useState({}); // { serviceId: quantity }

  const [showRoomChanger, setShowRoomChanger] = useState(false);

  // Deteksi Prefill Booking Tamu dari data loyalitas
  useEffect(() => {
    const prefill = localStorage.getItem("hotelify_prefill_booking_guest");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        setFormName(data.guestName || "");
        setFormPhone(data.phone || "");
        setFormEmail(data.email || "");
        setFormIdentity(data.identityNumber || "");
        
        // Alihkan tampilan ke form pembuatan reservasi baru
        setViewMode("create");
        setActiveTab("reservation");
      } catch (err) {
        console.error("Gagal memuat prefill data tamu", err);
      } finally {
        localStorage.removeItem("hotelify_prefill_booking_guest");
      }
    }
  }, []);

  // 3. CEK KETERSEDIAAN KAMAR (FORMULIR BARU)
  const availableRoomsForForm = useMemo(() => {
    if (!formRoomType) return [];
    const matchingRooms = roomsList.filter(room => room.type.toLowerCase() === formRoomType.toLowerCase());
    const occupiedRoomNumbers = resList
      .filter(res => {
        if (res.status === "Dibatalkan" || res.status === "Check-out") return false;
        const checkInTime = new Date(res.checkIn).getTime();
        const checkOutTime = new Date(res.checkOut).getTime();
        const formInTime = new Date(formCheckIn).getTime();
        const formOutTime = new Date(formCheckOut).getTime();
        return (formInTime < checkOutTime && formOutTime > checkInTime);
      })
      .map(res => res.roomNumber);

    return matchingRooms.filter(r => !occupiedRoomNumbers.includes(r.roomNumber));
  }, [formRoomType, formCheckIn, formCheckOut, resList, roomsList]);

  // Kalkulasi harga kamar formulir
  const stayNightsInForm = useMemo(() => {
    return getStayNights(formCheckIn, formCheckOut);
  }, [formCheckIn, formCheckOut]);

  const selectedRoomPrice = useMemo(() => {
    const room = roomsList.find(r => r.roomNumber === formRoomNumber);
    return room ? room.price : 0;
  }, [formRoomNumber, roomsList]);

  const totalCostInForm = useMemo(() => {
    let serviceCost = 0;
    Object.entries(formSelectedServices).forEach(([svcId, qty]) => {
      const svc = servicesList.find(s => s.id === svcId);
      if (svc && qty > 0) serviceCost += svc.price * qty;
    });
    return (selectedRoomPrice * stayNightsInForm) + serviceCost;
  }, [selectedRoomPrice, stayNightsInForm, formSelectedServices, servicesList]);

  // 4. PENYARINGAN & PENCARIAN RESERVASI (TAB 1: MEJA RESERVASI)
  const filteredReservations = useMemo(() => {
    return resList.filter(res => {
      const q = searchQuery.toLowerCase();
      const matchSearch = res.guestName.toLowerCase().includes(q) || res.bookingId.toLowerCase().includes(q);
      const matchType = filterType === "Semua Tipe" || res.roomType === filterType;
      const matchStatus = filterStatus === "Semua Status" || res.status === filterStatus;
      
      let matchDate = true;
      if (filterDate) {
        matchDate = res.checkIn === filterDate || res.checkOut === filterDate;
      }
      return matchSearch && matchType && matchStatus && matchDate;
    });
  }, [resList, searchQuery, filterType, filterStatus, filterDate]);

  // 5. SINKRONISASI DAFTAR TAB CHECK-IN & CHECK-OUT HARI INI
  
  // Daftar tamu dijadwalkan Check-in hari ini (2026-06-14)
  const checkInTodayList = useMemo(() => {
    return resList
      .filter(res => res.checkIn === todayStr && (res.status === "Menunggu Konfirmasi" || res.status === "Dikonfirmasi"))
      .map((res, i) => {
        // Simulasi jam kedatangan diurutkan
        const arrivalTimes = ["09:00 WIB", "11:30 WIB", "14:00 WIB", "15:30 WIB", "18:00 WIB"];
        return {
          ...res,
          arrivalTime: arrivalTimes[i % 5]
        };
      })
      .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  }, [resList]);

  // Daftar tamu dijadwalkan Check-out hari ini (2026-06-14)
  const checkOutTodayList = useMemo(() => {
    return resList.filter(res => res.checkOut === todayStr && res.status === "Check-in");
  }, [resList]);

  const activeReservation = useMemo(() => {
    return resList.find(r => r.bookingId === selectedResId) || null;
  }, [resList, selectedResId]);

  // Kamar alternatif untuk pemindahan kamar
  const availableRoomsForChanger = useMemo(() => {
    if (!activeReservation) return [];
    const matchingRooms = roomsList.filter(room => room.type.toLowerCase() === activeReservation.roomType.toLowerCase());
    const occupiedRoomNumbers = resList
      .filter(res => {
        if (res.bookingId === activeReservation.bookingId) return false;
        if (res.status === "Dibatalkan" || res.status === "Check-out") return false;
        const checkInTime = new Date(res.checkIn).getTime();
        const checkOutTime = new Date(res.checkOut).getTime();
        const activeInTime = new Date(activeReservation.checkIn).getTime();
        const activeOutTime = new Date(activeReservation.checkOut).getTime();
        return (activeInTime < checkOutTime && activeOutTime > checkInTime);
      })
      .map(res => res.roomNumber);

    return matchingRooms.filter(r => !occupiedRoomNumbers.includes(r.roomNumber));
  }, [activeReservation, resList, roomsList]);

  // 6. EVENT HANDLERS (SUBMIT, STATUS UPDATES, PROCESS CHECK-IN / CHECK-OUT)

  // 6. EVENT HANDLERS (SUBMIT, STATUS UPDATES, PROCESS CHECK-IN / CHECK-OUT)

  // Buat Reservasi Baru
  const handleSaveReservation = async (e) => {
    e.preventDefault();
    if (!formName || !formRoomNumber || !formIdentity) {
      alert("Harap lengkapi semua kolom wajib!");
      return;
    }

    setLoading(true);

    try {
      // Find or create profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formEmail.trim())
        .maybeSingle();

      let guestId;
      if (existingProfile) {
        guestId = existingProfile.id;
      } else {
        const tempPassword = "HotelQuTempPass123!";
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formEmail.trim(),
          password: tempPassword,
          options: {
            data: {
              full_name: formName.trim(),
              phone: formPhone.trim(),
            }
          }
        });
        if (signUpError) throw signUpError;
        guestId = signUpData.user.id;
      }

      // Update phone number in profiles
      await supabase
        .from("profiles")
        .update({ phone: formPhone.trim() })
        .eq("id", guestId);

      // Find room id
      const targetRoom = roomsList.find(r => r.roomNumber === formRoomNumber);
      if (!targetRoom) {
        alert("Kamar tidak ditemukan!");
        setLoading(false);
        return;
      }

      // Insert reservation
      const { data: resData, error: insertError } = await supabase
        .from("reservations")
        .insert([{
          guest_id: guestId,
          room_id: targetRoom.roomId,
          check_in: formCheckIn,
          check_out: formCheckOut,
          status: "pending",
          total_price: totalCostInForm
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert extra services
      const extraServicesToInsert = Object.entries(formSelectedServices)
        .filter(([_, qty]) => qty > 0)
        .map(([svcId, qty]) => {
          const svc = servicesList.find(s => s.id === svcId);
          return {
            reservation_id: resData.id,
            service_id: svcId,
            quantity: qty,
            price_at_booking: svc.price
          };
        });

      if (extraServicesToInsert.length > 0) {
        const { error: serviceInsertError } = await supabase
          .from("reservation_services")
          .insert(extraServicesToInsert);
        if (serviceInsertError) throw serviceInsertError;
      }

      // Fetch fresh data
      await fetchData();

      // Reset Form
      setFormName("");
      setFormIdentity("");
      setFormPhone("");
      setFormEmail("");
      setFormRoomNumber("");
      setFormRequest("");
      setFormSelectedServices({});

      setViewMode("list");
      setAlertMessage(`Reservasi Baru Berhasil Dibuat!`);
      setTimeout(() => setAlertMessage(""), 4000);
    } catch (err) {
      console.error("Gagal menyimpan reservasi:", err);
      alert(`Gagal menyimpan reservasi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Status reservasi general
  const updateReservationStatus = async (bookingId, nextStatus, logNote) => {
    let dbStatus = "pending";
    if (nextStatus === "Dikonfirmasi") dbStatus = "confirmed";
    else if (nextStatus === "Check-in") dbStatus = "checked_in";
    else if (nextStatus === "Check-out") dbStatus = "checked_out";
    else if (nextStatus === "Dibatalkan") dbStatus = "cancelled";

    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: dbStatus })
        .eq("id", bookingId);
      if (error) throw error;

      await fetchData();

      if (nextStatus === "Dikonfirmasi") {
        const targetRes = resList.find(r => r.bookingId === bookingId);
        setAlertMessage(`Email konfirmasi reservasi & kartu digital dikirim ke ${targetRes?.email || "tamu"}`);
        setTimeout(() => setAlertMessage(""), 4500);
      } else {
        setAlertMessage(`Status reservasi #${bookingId} diubah ke ${nextStatus}`);
        setTimeout(() => setAlertMessage(""), 3000);
      }
    } catch (err) {
      console.error("Gagal update status reservasi:", err);
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // Pindah Kamar (Change Room)
  const handleChangeRoomNumber = async (newRoomNo) => {
    if (!activeReservation) return;
    const oldRoomNo = activeReservation.roomNumber;
    
    const targetRoom = roomsList.find(r => r.roomNumber === newRoomNo);
    if (!targetRoom) {
      alert("Kamar baru tidak ditemukan!");
      return;
    }

    try {
      const { error } = await supabase
        .from("reservations")
        .update({ room_id: targetRoom.roomId })
        .eq("id", activeReservation.bookingId);
      if (error) throw error;

      // Update status kamar di DB
      await updateRoomStatusInDB(oldRoomNo, "available");
      await updateRoomStatusInDB(newRoomNo, "occupied");

      await fetchData();

      setShowRoomChanger(false);
      setAlertMessage(`Nomor kamar berhasil ditukar ke Room ${newRoomNo}`);
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (err) {
      console.error("Error changing room number:", err);
      alert(`Gagal menukar kamar: ${err.message}`);
    }
  };

  // AKSI PROSES CHECK-IN SELESAI
  const handleProcessCheckInSubmit = async () => {
    if (!activeCheckInRes) return;
    
    const bId = activeCheckInRes.bookingId;

    try {
      // 1. Ubah Status Reservasi ke 'checked_in' di Supabase
      const { error } = await supabase
        .from("reservations")
        .update({ status: "checked_in" })
        .eq("id", bId);
      if (error) throw error;

      // 2. Simpan Deposit
      setDepositRecords(prev => ({
        ...prev,
        [bId]: { amount: checkInDeposit, method: checkInDepositMethod }
      }));

      // 3. Update status kamar di DB
      await updateRoomStatusInDB(activeCheckInRes.roomNumber, "occupied");

      await fetchData();

      // 4. Buka welcome card
      setShowWelcomeCard({
        guestName: activeCheckInRes.guestName,
        roomNumber: activeCheckInRes.roomNumber,
        checkIn: activeCheckInRes.checkIn,
        checkOut: activeCheckInRes.checkOut,
        email: activeCheckInRes.email
      });

      setActiveCheckInRes(null);
      setAlertMessage(`Kamar ${activeCheckInRes.roomNumber} kini berstatus 'Terisi' (Occupied)`);
      setTimeout(() => setAlertMessage(""), 3000);
    } catch (err) {
      console.error("Error check-in:", err);
      alert("Gagal memproses check-in: " + err.message);
    }
  };

  // AKSI PROSES CHECK-OUT SELESAI
  const handleProcessCheckOutSubmit = async () => {
    if (!activeCheckOutRes) return;

    const bId = activeCheckOutRes.bookingId;
    const depositObj = depositRecords[bId] || { amount: 200000, method: "Tunai" };
    
    try {
      // 1. Ubah status reservasi ke 'checked_out'
      const { error } = await supabase
        .from("reservations")
        .update({ status: "checked_out" })
        .eq("id", bId);
      if (error) throw error;

      // 2. Call the points & tier processing function in Supabase RPC
      const { error: rpcError } = await supabase.rpc("fn_process_checkout", { p_reservation_id: bId });
      if (rpcError) {
        console.error("Error calling fn_process_checkout RPC:", rpcError);
      }

      // 3. Update status kamar di DB ke 'dirty'
      await updateRoomStatusInDB(activeCheckOutRes.roomNumber, "dirty");

      await fetchData();

      // 4. Siapkan struk pembayaran (Receipt)
      setShowReceipt({
        bookingId: bId,
        guestName: activeCheckOutRes.guestName,
        roomNumber: activeCheckOutRes.roomNumber,
        roomType: activeCheckOutRes.roomType,
        checkIn: activeCheckOutRes.checkIn,
        checkOut: activeCheckOutRes.checkOut,
        roomFee: activeCheckOutRes.totalPayment,
        serviceFee: activeCheckOutRes.additionalServiceFee || 145000,
        depositRefund: depositObj.amount,
        paymentMethod: checkOutPaymentMethod
      });

      setActiveCheckOutRes(null);
      setAlertMessage(`Kamar ${activeCheckOutRes.roomNumber} diset ke 'Perlu Dibersihkan' & dikirim ke tim Housekeeping.`);
      setTimeout(() => setAlertMessage(""), 5000);

      // Auto-buat tugas kebersihan kamar ke Housekeeping
      createCheckoutTask(activeCheckOutRes.roomNumber, bId);
    } catch (err) {
      console.error("Error checkout:", err);
      alert("Gagal memproses check-out: " + err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'Dikonfirmasi':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' };
      case 'Check-in':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'Check-out':
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
      case 'Dibatalkan':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Alert */}
      {alertMessage && (
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
          border: '1px solid var(--border-color)'
        }}>
          <FaCheckCircle style={{ color: '#10B981' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{alertMessage}</span>
        </div>
      )}
      
      {/* 1. SISTEM TAB NAVIGASI UTAMA DI ATAS */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '2px solid var(--border-color)', 
          gap: '8px',
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px 12px 0 0',
          padding: '12px 16px 0 16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <button 
          onClick={() => { setActiveTab("reservation"); setViewMode("list"); }}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'reservation' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'reservation' ? 'var(--primary-color)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          Meja Reservasi
        </button>
        <button 
          onClick={() => setActiveTab("checkin")}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'checkin' ? '3px solid #10B981' : '3px solid transparent',
            color: activeTab === 'checkin' ? '#10B981' : 'var(--text-muted)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaDoorOpen /> Check-in Hari Ini
          {checkInTodayList.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#E6F7ED', color: '#10B981', fontWeight: 800 }}>
              {checkInTodayList.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("checkout")}
          style={{
            padding: '12px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'checkout' ? '3px solid #64748B' : '3px solid transparent',
            color: activeTab === 'checkout' ? '#64748B' : 'var(--text-muted)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaBroom /> Check-out Hari Ini
          {checkOutTodayList.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 800 }}>
              {checkOutTodayList.length}
            </span>
          )}
        </button>
      </div>

      {/* ==================== TAB 1: MEJA RESERVASI ==================== */}
      {activeTab === "reservation" && (
        <>
          {viewMode === "list" && (
            <>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Meja Operasional Reservasi</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Kelola pesanan masuk, alokasi nomor kamar kosong, proses check-in/out, dan audit status.
                  </p>
                </div>
                <button 
                  onClick={() => setViewMode("create")}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FaPlus /> Buat Reservasi Baru
                </button>
              </div>

              {/* Bar Filter */}
              <div className="table-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <FaFilter style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Filter Pencarian Reservasi</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                  {/* Pencarian */}
                  <div style={{ gridColumn: 'span 4' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Cari Nama / Kode Booking</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Contoh: Budi Santoso atau BOK-5001" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 34px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }}
                      />
                      <FaSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} size={13} />
                    </div>
                  </div>

                  {/* Tipe Kamar */}
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tipe Kamar</label>
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }}
                    >
                      <option value="Semua Tipe">Semua Tipe Kamar</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Status Reservasi</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }}
                    >
                      <option value="Semua Status">Semua Status</option>
                      <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                      <option value="Dikonfirmasi">Dikonfirmasi</option>
                      <option value="Check-in">Check-in</option>
                      <option value="Check-out">Check-out</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  {/* Tanggal */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tanggal Inap</label>
                    <input 
                      type="date" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabel */}
              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">Database Pemesanan Terdaftar</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Menampilkan {filteredReservations.length} data</span>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="hotel-table">
                    <thead>
                      <tr>
                        <th>Ref Booking</th>
                        <th>Nama Tamu</th>
                        <th>Detail Kamar</th>
                        <th>Tanggal Inap</th>
                        <th>Total Bayar</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Tidak ada reservasi ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredReservations.map((res) => {
                          const badgeStyle = getStatusStyle(res.status);
                          return (
                            <tr key={res.bookingId}>
                              <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{res.bookingId}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.06)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {res.guestName.charAt(0)}
                                  </div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.guestName}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Kamar {res.roomNumber}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipe: {res.roomType}</span>
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span>CI: {res.checkIn}</span>
                                  <span>CO: {res.checkOut}</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(res.totalPayment)}</td>
                              <td>
                                <span 
                                  style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '999px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700,
                                    backgroundColor: badgeStyle.bg,
                                    color: badgeStyle.color,
                                    display: 'inline-block'
                                  }}
                                >
                                  {res.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => {
                                    setSelectedResId(res.bookingId);
                                    setViewMode("detail");
                                  }}
                                  className="btn-primary" 
                                  style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.05)' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                >
                                  Lihat Detail
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Form Pembuatan Baru */}
          {viewMode === "create" && (
            <form onSubmit={handleSaveReservation} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setViewMode("list")}
                  style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Registrasi Reservasi Baru</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Masukkan data tamu dan tentukan alokasi kamar berdasarkan tanggal ketersediaan.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Form Inputs */}
                <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                      <FaUser style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Profil Tamu Utama
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Nama Lengkap *</label>
                        <input type="text" required placeholder="Budi Santoso" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Nomor Identitas (NIK) *</label>
                        <input type="text" required placeholder="16 Digit NIK KTP" value={formIdentity} onChange={(e) => setFormIdentity(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Nomor HP *</label>
                        <input type="text" required placeholder="08123456789" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Email *</label>
                        <input type="email" required placeholder="budi@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                      <FaCalendarAlt style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Rincian Stay & Tamu
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tanggal Check-in</label>
                        <input type="date" value={formCheckIn} onChange={(e) => setFormCheckIn(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tanggal Check-out</label>
                        <input type="date" value={formCheckOut} onChange={(e) => setFormCheckOut(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Tipe Kamar</label>
                        <select value={formRoomType} onChange={(e) => { setFormRoomType(e.target.value); setFormRoomNumber(""); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)', cursor: 'pointer' }}>
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Suite">Suite</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Dewasa</label>
                        <input type="number" min="1" value={formAdults} onChange={(e) => setFormAdults(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Anak-anak</label>
                        <input type="number" min="0" value={formChildren} onChange={(e) => setFormChildren(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Sumber</label>
                        <select value={formSource} onChange={(e) => setFormSource(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)', cursor: 'pointer' }}>
                          <option value="Website">Website</option>
                          <option value="Telepon">Telepon</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="OTA">OTA</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Permintaan Khusus (Opsional)</label>
                    <textarea placeholder="Catatan alergi, extra bed..." value={formRequest} onChange={(e) => setFormRequest(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)', resize: 'none', fontFamily: 'inherit' }} />
                  </div>
                </div>

                {/* Sisi Kanan: Alokasi & Ketersediaan Kamar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaBed style={{ color: 'var(--primary-color)' }} /> Alokasi Kamar & Biaya
                    </h3>

                    {stayNightsInForm <= 0 ? (
                      <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '0.8rem' }}>
                        <FaExclamationTriangle style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>Tanggal check-out harus setelah tanggal check-in!</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span>Durasi Menginap:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{stayNightsInForm} Malam</strong>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Pilih Nomor Kamar Tersedia *</label>
                          {availableRoomsForForm.length === 0 ? (
                            <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: '#F59E0B', fontSize: '0.8rem', textAlign: 'center' }}>
                              Tidak ada Kamar {formRoomType} yang kosong pada tanggal tersebut!
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }}>
                              {availableRoomsForForm.map(room => (
                                <button key={room.roomId} type="button" onClick={() => setFormRoomNumber(room.roomNumber)} style={{ padding: '8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: formRoomNumber === room.roomNumber ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', backgroundColor: formRoomNumber === room.roomNumber ? 'rgba(37,99,235,0.08)' : 'transparent', color: formRoomNumber === room.roomNumber ? 'var(--primary-color)' : 'var(--text-main)', transition: 'all 0.1s' }}>
                                  Room {room.roomNumber}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {formRoomNumber && (
                          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span>Tarif per malam:</span>
                              <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(selectedRoomPrice)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span>Subtotal Kamar ({stayNightsInForm} malam):</span>
                              <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(selectedRoomPrice * stayNightsInForm)}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bagian Layanan Tambahan */}
                  <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaCoffee style={{ color: 'var(--primary-color)' }} /> Layanan Tambahan (Opsional)
                    </h3>
                    
                    {servicesList.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada layanan tambahan aktif.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                        {servicesList.map(svc => {
                          const qty = formSelectedServices[svc.id] || 0;
                          return (
                            <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{svc.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatRupiah(svc.price)} / pax</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button type="button" onClick={() => setFormSelectedServices(prev => ({ ...prev, [svc.id]: Math.max(0, qty - 1) }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>-</button>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, width: '20px', textAlign: 'center', color: 'var(--text-main)' }}>{qty}</span>
                                <button type="button" onClick={() => setFormSelectedServices(prev => ({ ...prev, [svc.id]: qty + 1 }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
                      <span>Total Estimasi Bayar:</span>
                      <span style={{ color: 'var(--primary-color)' }}>{formatRupiah(totalCostInForm)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setViewMode("list")} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                    <button type="submit" disabled={stayNightsInForm <= 0 || !formRoomNumber} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '8px', opacity: (stayNightsInForm <= 0 || !formRoomNumber) ? 0.6 : 1 }}>Simpan Reservasi</button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Mode Detail Booking */}
          {viewMode === "detail" && activeReservation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => setViewMode("list")} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}><FaArrowLeft /></button>
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Reservasi: {activeReservation.bookingId}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Detail reservasi tamu aktif dan pelacakan lini masa.</p>
                  </div>
                </div>
                <div>
                  <span style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: getStatusStyle(activeReservation.status).bg, color: getStatusStyle(activeReservation.status).color, border: `1px solid ${getStatusStyle(activeReservation.status).color}30` }}>
                    Status: {activeReservation.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>
                    <FaUser style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Informasi Tamu & Pemesanan
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                      {activeReservation.guestName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{activeReservation.guestName}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NIK: {activeReservation.identityNumber}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}><FaPhone /> TELEPON / WA</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{activeReservation.phone}</div>
                    </div>
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}><FaEnvelope /> EMAIL RESMI</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>{activeReservation.email}</div>
                    </div>
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}><FaClock /> SUMBER</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{activeReservation.bookingSource}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>
                    <FaBed style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Rincian Alokasi Kamar & Menginap
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NOMOR KAMAR</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>Room {activeReservation.roomNumber}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipe: {activeReservation.roomType}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PERIODE CHECK-IN / OUT</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{activeReservation.checkIn} s/d {activeReservation.checkOut}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durasi: {getStayNights(activeReservation.checkIn, activeReservation.checkOut)} Malam</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>JUMLAH TAMU</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{activeReservation.adults} Dewasa</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeReservation.children} Anak-anak</span>
                    </div>
                  </div>

                  {activeReservation.specialRequest && (
                    <div style={{ padding: '12px 16px', backgroundColor: 'rgba(37,99,235,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>Catatan Khusus Tamu:</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>{activeReservation.specialRequest}</p>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>TOTAL PEMBAYARAN</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>{formatRupiah(activeReservation.totalPayment)}</span>
                  </div>
                </div>

                {/* Sisi Kanan Detail: Tindakan Operasional & Lini Masa */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="table-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)' }}>Tindakan Operasional Desk</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeReservation.status === "Menunggu Konfirmasi" && (
                        <>
                          <button onClick={() => updateReservationStatus(activeReservation.bookingId, "Dikonfirmasi", "Reservasi dikonfirmasi oleh staf hotel desk")} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}><FaCheckCircle /> Konfirmasi Reservasi</button>
                          <button onClick={() => updateReservationStatus(activeReservation.bookingId, "Dibatalkan", "Reservasi dibatalkan atas permintaan tamu")} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}><FaBan /> Batalkan Reservasi</button>
                        </>
                      )}

                      {activeReservation.status === "Dikonfirmasi" && (
                        <>
                          <button onClick={() => { setActiveCheckInRes(activeReservation); }} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#10B981', borderColor: '#10B981' }}><FaDoorOpen /> Check-in Tamu</button>
                          <button onClick={() => updateReservationStatus(activeReservation.bookingId, "Dibatalkan", "Reservasi dibatalkan (No-Show)")} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}><FaBan /> Batalkan Reservasi</button>
                        </>
                      )}

                      {activeReservation.status === "Check-in" && (
                        <>
                          <button onClick={() => { setActiveCheckOutRes(activeReservation); }} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}><FaDoorOpen /> Check-out Tamu</button>
                          <button onClick={() => setShowRoomChanger(!showRoomChanger)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}><FaBed /> Ubah Nomor Kamar</button>
                        </>
                      )}

                      {(activeReservation.status === "Check-out" || activeReservation.status === "Dibatalkan") && (
                        <div style={{ padding: '12px', backgroundColor: 'rgba(100, 116, 139, 0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.4 }}>
                          Reservasi ini telah selesai atau dibatalkan. Tidak ada tindakan operasional lebih lanjut.
                        </div>
                      )}
                    </div>

                    {showRoomChanger && activeReservation.status === "Check-in" && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Pilih Kamar {activeReservation.roomType} Pengganti:</label>
                        {availableRoomsForChanger.length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: '#F59E0B', padding: '6px', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '6px', textAlign: 'center' }}>Tidak ada kamar kosong!</div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '6px' }}>
                            {availableRoomsForChanger.map(room => (
                              <button key={room.roomId} type="button" onClick={() => handleChangeRoomNumber(room.roomNumber)} style={{ padding: '6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-main)' }}>Room {room.roomNumber}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lini Masa Audit Trail */}
                  <div className="table-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaHistory style={{ color: 'var(--primary-color)' }} /> Linimasa Log Perubahan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
                      {(statusHistory[activeReservation.bookingId] || []).map((log, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '2px solid var(--surface-color)', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 2px var(--border-color)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{log.status}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock size={10} /> {log.time}</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px', lineHeight: 1.3 }}>{log.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================== TAB 2: CHECK-IN HARI INI ==================== */}
      {activeTab === "checkin" && (
        <>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaDoorOpen /> Registrasi Check-in Tamu (Hari Ini)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Daftar tamu yang dijadwalkan tiba hari ini tanggal <strong>{todayStr}</strong>. Urut berdasarkan estimasi kedatangan.
            </p>
          </div>

          <div className="table-card">
            <div className="table-header">
              <span className="table-title">Daftar Kedatangan Tamu</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{checkInTodayList.length} kedatangan dijadwalkan</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="hotel-table">
                <thead>
                  <tr>
                    <th>Ref Booking</th>
                    <th>Nama Tamu</th>
                    <th>Alokasi Kamar</th>
                    <th>Rencana Tanggal Inap</th>
                    <th>Estimasi Tiba</th>
                    <th>Sumber</th>
                    <th style={{ textAlign: 'center' }}>Operasional</th>
                  </tr>
                </thead>
                <tbody>
                  {checkInTodayList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Tidak ada tamu yang dijadwalkan check-in hari ini.
                      </td>
                    </tr>
                  ) : (
                    checkInTodayList.map(res => (
                      <tr key={res.bookingId}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{res.bookingId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.06)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                              {res.guestName.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.guestName}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Room {res.roomNumber}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipe: {res.roomType}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          CI: {res.checkIn} s/d CO: {res.checkOut}
                        </td>
                        <td style={{ fontWeight: 700, color: '#F59E0B' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaClock size={12} /> {res.arrivalTime}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{res.bookingSource}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setActiveCheckInRes(res);
                              setCheckInDeposit(200000); // Default
                              setCheckInDepositMethod("Tunai");
                            }}
                            className="btn-primary"
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.8rem', 
                              backgroundColor: '#10B981',
                              borderColor: '#10B981',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaDoorOpen /> Proses Check-in
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================== TAB 3: CHECK-OUT HARI INI ==================== */}
      {activeTab === "checkout" && (
        <>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBroom /> Billing & Check-out Tamu (Hari Ini)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Daftar tamu yang dijadwalkan keluar dan melunasi tagihan kamar hari ini tanggal <strong>{todayStr}</strong>.
            </p>
          </div>

          <div className="table-card">
            <div className="table-header">
              <span className="table-title">Daftar Keberangkatan Tamu</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{checkOutTodayList.length} tamu menginap habis masa inap</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="hotel-table">
                <thead>
                  <tr>
                    <th>Ref Booking</th>
                    <th>Nama Tamu</th>
                    <th>Kamar Ditempati</th>
                    <th>Tanggal Inap</th>
                    <th>Total Tarif Kamar</th>
                    <th>Layanan Tambahan</th>
                    <th style={{ textAlign: 'center' }}>Operasional</th>
                  </tr>
                </thead>
                <tbody>
                  {checkOutTodayList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Tidak ada tamu menginap yang dijadwalkan check-out hari ini.
                      </td>
                    </tr>
                  ) : (
                    checkOutTodayList.map(res => (
                      <tr key={res.bookingId}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{res.bookingId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(100,116,139,0.06)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                              {res.guestName.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{res.guestName}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Room {res.roomNumber}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tipe: {res.roomType}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          CI: {res.checkIn} s/d CO: {res.checkOut}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(res.totalPayment)}</td>
                        <td style={{ color: '#EF4444', fontWeight: 700 }}>
                          {res.additionalServiceFee > 0 ? formatRupiah(res.additionalServiceFee) : "Rp 0"}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setActiveCheckOutRes(res);
                              setCheckOutPaymentMethod("Tunai");
                            }}
                            className="btn-primary"
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.8rem', 
                              backgroundColor: '#64748B',
                              borderColor: '#64748B',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaBroom /> Proses Check-out
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}


      {/* ========================================================================= */}
      {/* ==================== MODAL OVERLAY: PROSES CHECK-IN ===================== */}
      {activeCheckInRes && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.03)' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Proses Check-in Digital</h3>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Ref: {activeCheckInRes.bookingId}</span>
              </div>
              <button onClick={() => setActiveCheckInRes(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><FaTimes /></button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Info Tamu */}
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nama Tamu:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{activeCheckInRes.guestName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>NIK Verified:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{activeCheckInRes.identityNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kamar Alokasi:</span>
                  <strong style={{ color: 'var(--primary-color)' }}>Room {activeCheckInRes.roomNumber} ({activeCheckInRes.roomType})</strong>
                </div>
              </div>

              {/* Deposit Section */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Nominal Uang Jaminan (Deposit) *</label>
                <input 
                  type="number" 
                  value={checkInDeposit}
                  onChange={(e) => setCheckInDeposit(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Metode Pembayaran Deposit</label>
                <select 
                  value={checkInDepositMethod}
                  onChange={(e) => setCheckInDepositMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)', cursor: 'pointer' }}
                >
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Kartu Debit">Kartu Debit</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                </select>
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveCheckInRes(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Batal</button>
              <button onClick={handleProcessCheckInSubmit} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#10B981', borderColor: '#10B981', fontSize: '0.85rem' }}>Selesaikan Check-in</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== MODAL OVERLAY: WELCOME CARD POPUP =================== */}
      {showWelcomeCard && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '2px solid #10B981', overflow: 'hidden', color: '#1E293B', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Logo & Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #E2E8F0', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Selamat Datang</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#1E3A8A', margin: '4px 0' }}>Grand Vera Hotel & Resort</h2>
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Kartu Informasi Akses Digital</span>
            </div>

            {/* Rincian Welcome */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>NAMA TAMU</span>
                <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{showWelcomeCard.guestName}</strong>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>NOMOR KAMAR</span>
                  <strong style={{ fontSize: '1.2rem', color: '#10B981' }}>ROOM {showWelcomeCard.roomNumber}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>MASA MENGINAP</span>
                  <strong style={{ color: '#0F172A' }}>{showWelcomeCard.checkIn} s/d {showWelcomeCard.checkOut}</strong>
                </div>
              </div>

              {/* Fasilitas Wifi */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <FaWifi style={{ color: '#10B981', fontSize: '1.4rem' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700, display: 'block' }}>KONEKSI WI-FI KAMAR</span>
                  <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '2px' }}>
                    SSID: <strong>GrandVera_Guest</strong> <br />
                    Password: <strong>WiFiRoom{showWelcomeCard.roomNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Breakfast Info */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <FaCoffee style={{ color: '#64748B', fontSize: '1.2rem' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, display: 'block' }}>LAYANAN SARAPAN PAGI</span>
                  <span style={{ fontSize: '0.75rem', color: '#334155' }}>
                    Pukul <strong>06:00 - 10:00 WIB</strong> di Restoran Utama (Lantai 1).
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px dashed #E2E8F0', paddingTop: '16px' }}>
              <button 
                onClick={() => {
                  alert(`Mengirim Welcome Card Digital ke email ${showWelcomeCard.email}...`);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #10B981', backgroundColor: 'transparent', color: '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FaEnvelope /> Kirim Email
              </button>
              <button 
                onClick={() => setShowWelcomeCard(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#10B981', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== MODAL OVERLAY: PROSES CHECK-OUT ==================== */}
      {activeCheckOutRes && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(100,116,139,0.03)' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Proses Check-out & Rincian Tagihan</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ref: {activeCheckOutRes.bookingId}</span>
              </div>
              <button onClick={() => setActiveCheckOutRes(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}><FaTimes /></button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Summary Guest */}
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nama Tamu:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{activeCheckOutRes.guestName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Meninggalkan Kamar:</span>
                  <strong style={{ color: '#EF4444' }}>Room {activeCheckOutRes.roomNumber} ({activeCheckOutRes.roomType})</strong>
                </div>
              </div>

              {/* Rincian Tagihan */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>Rincian Biaya Transaksi</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sewa Kamar ({getStayNights(activeCheckOutRes.checkIn, activeCheckOutRes.checkOut)} malam):</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatRupiah(activeCheckOutRes.totalPayment)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Layanan Tambahan (Laundry & Mini-bar):</span>
                    <span style={{ color: '#EF4444', fontWeight: 600 }}>{formatRupiah(activeCheckOutRes.additionalServiceFee || 145000)}</span>
                  </div>

                  {/* Deposit Check */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px', color: '#10B981' }}>
                    <span>Deposit Awal Check-in (Dikembalikan):</span>
                    <span style={{ fontWeight: 700 }}>-{formatRupiah(depositRecords[activeCheckOutRes.bookingId]?.amount || 200000)}</span>
                  </div>

                  {/* Total Pelunasan */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    <span>Total Sisa Pelunasan:</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {formatRupiah(activeCheckOutRes.totalPayment + (activeCheckOutRes.additionalServiceFee || 145000) - (depositRecords[activeCheckOutRes.bookingId]?.amount || 200000))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pilihan Metode Pelunasan */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Metode Pelunasan Pembayaran</label>
                <select 
                  value={checkOutPaymentMethod}
                  onChange={(e) => setCheckOutPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', color: 'var(--text-main)', backgroundColor: 'var(--surface-color)', cursor: 'pointer' }}
                >
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Kartu Kredit">Kartu Kredit / Debit</option>
                </select>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveCheckOutRes(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Batal</button>
              <button onClick={handleProcessCheckOutSubmit} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#64748B', borderColor: '#64748B', fontSize: '0.85rem' }}>Selesaikan Check-out</button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== MODAL OVERLAY: PAYMENT RECEIPT POPUP =============== */}
      {showReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', width: '95%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden', color: '#1E293B', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Struk Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>Grand Vera Hotel & Resort</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '2px' }}>Jl. Merdeka No. 45, Bandung, Indonesia</span>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Telp: +62 22 1234567 | info@grandverahotel.com</span>
            </div>

            {/* Ringkasan Invoice */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.75rem', borderBottom: '1px dashed #E2E8F0', paddingBottom: '16px' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>NO. INVOICE</span>
                <strong style={{ color: '#0F172A' }}>INV-{showReceipt.bookingId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>TANGGAL CETAK</span>
                <strong style={{ color: '#0F172A' }}>14 Juni 2026, 12:05</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>NAMA TAMU</span>
                <strong style={{ color: '#0F172A' }}>{showReceipt.guestName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>ALOKASI KAMAR</span>
                <strong style={{ color: '#0F172A' }}>Room {showReceipt.roomNumber} ({showReceipt.roomType})</strong>
              </div>
            </div>

            {/* Rincian Rincian Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Sewa Kamar ({getStayNights(showReceipt.checkIn, showReceipt.checkOut)} malam)</span>
                <span style={{ fontWeight: 600 }}>{formatRupiah(showReceipt.roomFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Layanan Tambahan (Laundry/Minibar)</span>
                <span style={{ fontWeight: 600 }}>{formatRupiah(showReceipt.serviceFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                <span>Pengembalian Uang Deposit</span>
                <span style={{ fontWeight: 600 }}>-{formatRupiah(showReceipt.depositRefund)}</span>
              </div>
              
              {/* Total Bersih */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '8px', fontSize: '0.9rem', fontWeight: 800 }}>
                <span>Total Pelunasan Net:</span>
                <span style={{ color: '#2563EB' }}>
                  {formatRupiah(showReceipt.roomFee + showReceipt.serviceFee - showReceipt.depositRefund)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                <span>Metode Pembayaran:</span>
                <span>{showReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* Stamp LUNAS */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <div style={{ border: '3px double #10B981', color: '#10B981', padding: '6px 20px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', transform: 'rotate(-5deg)', letterSpacing: '0.15em', boxShadow: '0 0 10px rgba(16,185,129,0.1)' }}>
                Lunas / Paid
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '2px solid #E2E8F0', paddingTop: '16px' }}>
              <button 
                onClick={() => alert("Mencetak struk pembayaran...")}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #64748B', backgroundColor: 'transparent', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FaPrint /> Cetak
              </button>
              <button 
                onClick={() => setShowReceipt(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#64748B', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Tutup Struk
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}