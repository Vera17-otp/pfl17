import React, { useState, useMemo, useEffect } from "react";
import { 
  FaBed, 
  FaWifi, 
  FaTv, 
  FaBath, 
  FaGlassMartiniAlt, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaBroom, 
  FaTools, 
  FaUserCheck, 
  FaFilter, 
  FaTimes, 
  FaDollarSign, 
  FaDoorOpen, 
  FaSearch,
  FaFileInvoice
} from "react-icons/fa";

import { supabase } from "../lib/supabase";

// Import data asli
import { rooms as initialRooms } from "../data/rooms";
import { reservations } from "../data/reservations";

// Helper rupiah formatter
const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val);
};

export default function Rooms() {
  // 1. STATE INITIALIZATION (Supabase Integration)
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [resList] = useState(() => {
    const saved = localStorage.getItem("hotelify_reservations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal memuat reservasi dari localStorage", e);
      }
    }
    return reservations;
  });

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*");
      if (error) throw error;
      
      const formatted = data.map(rm => ({
        roomId: rm.id,
        roomNumber: rm.room_number,
        type: rm.room_type,
        price: Number(rm.price_per_night),
        capacity: rm.capacity,
        status: rm.status.charAt(0).toUpperCase() + rm.status.slice(1), // e.g. "available" -> "Available"
        description: rm.description,
        floor: rm.floor,
        facilities: rm.facilities || [],
        image: rm.image
      }));
      setRoomsList(formatted);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      showToast("Gagal memuat data kamar dari database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Toast & Alert State
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Semua Tipe");
  const [filterFloor, setFilterFloor] = useState("Semua Lantai");
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  // Modal Control States
  const [selectedRoom, setSelectedRoom] = useState(null); // Modal Detail Kamar
  const [showAddEditModal, setShowAddEditModal] = useState(false); // Modal Tambah/Edit
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingRoom, setEditingRoom] = useState(null); // Kamar yang sedang diedit

  // Form Fields State (Add/Edit)
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formType, setFormType] = useState("Standard");
  const [formFloor, setFormFloor] = useState("1");
  const [formCapacity, setFormCapacity] = useState("2");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formFacilities, setFormFacilities] = useState({
    WiFi: true,
    AC: true,
    TV: false,
    Bathtub: false,
    Minibar: false,
    "Extra Bed": false
  });

  // Facility Options List
  const facilityOptions = ["WiFi", "AC", "TV", "Bathtub", "Minibar", "Extra Bed"];

  // Unique lists for filters
  const roomTypesList = useMemo(() => {
    const types = roomsList.map(r => r.type);
    return ["Semua Tipe", ...new Set(types)];
  }, [roomsList]);

  const floorsList = useMemo(() => {
    const floors = roomsList.map(r => r.floor.toString());
    const sortedFloors = [...new Set(floors)].sort((a, b) => parseInt(a) - parseInt(b));
    return ["Semua Lantai", ...sortedFloors];
  }, [roomsList]);

  // 2. FILTERED ROOMS LIST
  const filteredRooms = useMemo(() => {
    return roomsList.filter(room => {
      // Search query (Room Number)
      if (searchQuery.trim()) {
        if (!room.roomNumber.includes(searchQuery.trim())) return false;
      }
      // Room Type
      if (filterType !== "Semua Tipe" && room.type !== filterType) return false;
      // Floor
      if (filterFloor !== "Semua Lantai" && room.floor.toString() !== filterFloor) return false;
      // Status
      if (filterStatus !== "Semua Status" && room.status !== filterStatus) return false;

      return true;
    }).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [roomsList, searchQuery, filterType, filterFloor, filterStatus]);

  // 3. STATS/REPORT (Tersedia, Terisi, Perlu Dibersihkan, Maintenance)
  const roomKPIs = useMemo(() => {
    let available = 0;
    let occupied = 0;
    let dirty = 0;
    let maintenance = 0;

    roomsList.forEach(room => {
      if (room.status === "Available") available++;
      else if (room.status === "Occupied") occupied++;
      else if (room.status === "Dirty") dirty++;
      else if (room.status === "Maintenance") maintenance++;
    });

    const total = roomsList.length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return { available, occupied, dirty, maintenance, total, occupancyRate };
  }, [roomsList]);

  // 4. FIND OCCUPANCY DETAIL (Current Guest)
  const getRoomOccupant = (roomNo) => {
    // Cari reservasi yang berstatus "Check-in" dan nomor kamar cocok
    const activeRes = resList.find(res => res.roomNumber === roomNo && res.status === "Check-in");
    return activeRes || null;
  };

  // 5. FIND ROOM USAGE HISTORY
  const getRoomUsageHistory = (roomNo) => {
    // Ambil semua reservasi selesai (Check-out atau Check-in) untuk kamar ini
    return resList
      .filter(res => res.roomNumber === roomNo && (res.status === "Check-out" || res.status === "Check-in"))
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  };

  // 6. HOUSEKEEPING / STATUS OVERRIDES
  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    const dbStatus = newStatus.toLowerCase(); // Map "Available" -> "available", "Dirty" -> "dirty", etc.
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: dbStatus })
        .eq("id", roomId);
      if (error) throw error;

      const updated = roomsList.map(rm => {
        if (rm.roomId === roomId) {
          return { ...rm, status: newStatus };
        }
        return rm;
      });
      setRoomsList(updated);
      showToast(`Status Kamar berhasil diubah menjadi ${newStatus === "Available" ? "Tersedia (Cleaned)" : newStatus}!`);
      
      // Update selectedRoom state if modal is open
      if (selectedRoom && selectedRoom.roomId === roomId) {
        setSelectedRoom(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating room status:", err);
      showToast("Gagal mengubah status kamar di database.");
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kamar #${roomNumber}?`)) {
      try {
        const { error } = await supabase
          .from("rooms")
          .delete()
          .eq("id", roomId);
        if (error) throw error;

        const updated = roomsList.filter(rm => rm.roomId !== roomId);
        setRoomsList(updated);
        setSelectedRoom(null);
        showToast(`Kamar #${roomNumber} berhasil dihapus dari database aset!`);
      } catch (err) {
        console.error("Error deleting room:", err);
        showToast("Gagal menghapus kamar dari database.");
      }
    }
  };

  // 7. ADD / EDIT SUBMIT HANDLERS
  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingRoom(null);
    setFormRoomNumber("");
    setFormType("Standard");
    setFormFloor("1");
    setFormCapacity("2");
    setFormPrice("");
    setFormImage("");
    setFormStatus("Available");
    setFormFacilities({
      WiFi: true,
      AC: true,
      TV: false,
      Bathtub: false,
      Minibar: false,
      "Extra Bed": false
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (room) => {
    setModalMode("edit");
    setEditingRoom(room);
    setFormRoomNumber(room.roomNumber);
    setFormType(room.type);
    setFormFloor(room.floor.toString());
    setFormCapacity(room.capacity.toString());
    setFormPrice(room.price.toString());
    setFormImage(room.image || "");
    setFormStatus(room.status);
    
    const facilitiesMap = {
      WiFi: false,
      AC: false,
      TV: false,
      Bathtub: false,
      Minibar: false,
      "Extra Bed": false
    };
    if (Array.isArray(room.facilities)) {
      room.facilities.forEach(fac => {
        facilitiesMap[fac] = true;
      });
    }
    setFormFacilities(facilitiesMap);
    setShowAddEditModal(true);
    setSelectedRoom(null); // Close detail modal
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formRoomNumber.trim() || !formPrice) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    // Check duplicate room number
    const duplicate = roomsList.find(rm => rm.roomNumber === formRoomNumber.trim() && (!editingRoom || rm.roomId !== editingRoom.roomId));
    if (duplicate) {
      alert(`Nomor kamar ${formRoomNumber} sudah digunakan oleh kamar lain!`);
      return;
    }

    const priceNum = parseInt(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Harga kamar harus berupa angka positif!");
      return;
    }

    const activeFacilities = Object.keys(formFacilities).filter(fac => formFacilities[fac]);
    const defaultImage = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop";

    if (modalMode === "add") {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .insert([{
            room_number: formRoomNumber.trim(),
            room_type: formType,
            floor: parseInt(formFloor),
            capacity: parseInt(formCapacity),
            facilities: activeFacilities,
            price_per_night: priceNum,
            status: formStatus.toLowerCase(),
            image: formImage.trim() || defaultImage
          }])
          .select()
          .single();
        if (error) throw error;

        const newRoom = {
          roomId: data.id,
          roomNumber: data.room_number,
          type: data.room_type,
          floor: data.floor,
          capacity: data.capacity,
          facilities: data.facilities || [],
          price: Number(data.price_per_night),
          status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          image: data.image
        };
        setRoomsList(prev => [...prev, newRoom]);
        showToast(`Kamar #${newRoom.roomNumber} baru berhasil ditambahkan!`);
      } catch (err) {
        console.error("Error adding room:", err);
        alert(`Gagal menyimpan kamar ke database: ${err.message}`);
        return;
      }
    } else {
      try {
        const { error } = await supabase
          .from("rooms")
          .update({
            room_number: formRoomNumber.trim(),
            room_type: formType,
            floor: parseInt(formFloor),
            capacity: parseInt(formCapacity),
            facilities: activeFacilities,
            price_per_night: priceNum,
            status: formStatus.toLowerCase(),
            image: formImage.trim() || editingRoom.image
          })
          .eq("id", editingRoom.roomId);
        if (error) throw error;

        const updated = roomsList.map(rm => {
          if (rm.roomId === editingRoom.roomId) {
            return {
              ...rm,
              roomNumber: formRoomNumber.trim(),
              type: formType,
              floor: parseInt(formFloor),
              capacity: parseInt(formCapacity),
              facilities: activeFacilities,
              price: priceNum,
              status: formStatus,
              image: formImage.trim() || rm.image
            };
          }
          return rm;
        });
        setRoomsList(updated);
        showToast(`Data Kamar #${formRoomNumber} berhasil diperbarui!`);
      } catch (err) {
        console.error("Error updating room:", err);
        alert(`Gagal menyimpan perubahan kamar ke database: ${err.message}`);
        return;
      }
    }

    setShowAddEditModal(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Available":
        return { bg: "#10B981", color: "#FFFFFF", label: "Tersedia", textClass: "text-success", bgLight: "rgba(16, 185, 129, 0.1)" };
      case "Occupied":
        return { bg: "#EF4444", color: "#FFFFFF", label: "Terisi", textClass: "text-danger", bgLight: "rgba(239, 68, 68, 0.1)" };
      case "Dirty":
        return { bg: "#F59E0B", color: "#FFFFFF", label: "Perlu Dibersihkan", textClass: "text-warning", bgLight: "rgba(245, 158, 11, 0.1)" };
      case "Maintenance":
        return { bg: "#64748B", color: "#FFFFFF", label: "Maintenance", textClass: "text-muted", bgLight: "rgba(100, 116, 139, 0.1)" };
      default:
        return { bg: "#94A3B8", color: "#FFFFFF", label: "Unknown", textClass: "text-muted", bgLight: "rgba(148, 163, 184, 0.1)" };
    }
  };

  const getFacilityIcon = (facility) => {
    switch (facility) {
      case "WiFi":
        return <FaWifi title="WiFi" />;
      case "AC":
        return <FaBed title="AC" />; // fallback
      case "TV":
        return <FaTv title="TV" />;
      case "Bathtub":
        return <FaBath title="Bathtub" />;
      case "Minibar":
        return <FaGlassMartiniAlt title="Minibar" />;
      default:
        return <FaInfoCircle title={facility} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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
          boxShadow: 'var(--shadow-lg)',
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

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaBed style={{ color: 'var(--primary-color)' }} /> Manajemen & Status Kamar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Pemantauan status ketersediaan kamar, manajemen pembersihan housekeeping, dan pemeliharaan fasilitas (maintenance).
          </p>
        </div>
        <button className="btn-primary" onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> <span>Tambah Kamar Baru</span>
        </button>
      </div>

      {/* WIDGET LAPORAN SINGKAT (KPI CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        
        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FaBed size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ASET KAMAR</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{roomKPIs.total} Kamar</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10B981' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FaCheckCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TERSEDIA (READY)</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>{roomKPIs.available} Kamar</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FaDoorOpen size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TERISI (OCCUPIED)</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444' }}>{roomKPIs.occupied} ({roomKPIs.occupancyRate}%)</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FaBroom size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DIRTY (HOUSEKEEPING)</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B' }}>{roomKPIs.dirty} Kamar</h3>
          </div>
        </div>

        <div className="table-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #64748B' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#64748B', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <FaTools size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MAINTENANCE</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#64748B' }}>{roomKPIs.maintenance} Kamar</h3>
          </div>
        </div>

      </div>

      {/* FILTER & FILTER PANEL */}
      <div className="table-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
          <FaFilter style={{ color: 'var(--primary-color)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Pencarian & Penyaringan Kamar</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor kamar..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-color)'
              }}
            />
          </div>

          {/* Tipe Kamar Filter */}
          <div style={{ width: '180px' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface-color)',
                cursor: 'pointer'
              }}
            >
              {roomTypesList.map((type, idx) => (
                <option key={idx} value={type}>{type === "Semua Tipe" ? "Semua Tipe Kamar" : type}</option>
              ))}
            </select>
          </div>

          {/* Lantai Filter */}
          <div style={{ width: '150px' }}>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface-color)',
                cursor: 'pointer'
              }}
            >
              {floorsList.map((fl, idx) => (
                <option key={idx} value={fl}>{fl === "Semua Lantai" ? "Semua Lantai" : `Lantai ${fl}`}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ width: '180px' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--surface-color)',
                cursor: 'pointer'
              }}
            >
              <option value="Semua Status">Semua Status Kamar</option>
              <option value="Available">Available (Tersedia)</option>
              <option value="Occupied">Occupied (Terisi)</option>
              <option value="Dirty">Dirty (Perlu Bersih)</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Reset button */}
          {(searchQuery || filterType !== "Semua Tipe" || filterFloor !== "Semua Lantai" || filterStatus !== "Semua Status") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType("Semua Tipe");
                setFilterFloor("Semua Lantai");
                setFilterStatus("Semua Status");
              }}
              style={{
                padding: '9px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--danger-color)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Hapus Filter
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC ROOM VISUAL GRID */}
      {filteredRooms.length === 0 ? (
        <div className="table-card" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <FaBed size={40} style={{ color: 'var(--text-muted)' }} />
          <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Tidak Ada Kamar Sesuai Kriteria</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px' }}>
            Ubah kata kunci pencarian atau bersihkan filter di atas untuk menampilkan seluruh aset kamar hotel.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {filteredRooms.map(room => {
            const currentOccupant = room.status === "Occupied" ? getRoomOccupant(room.roomNumber) : null;
            const statusStyle = getStatusStyles(room.status);
            
            return (
              <div 
                key={room.roomId} 
                className="table-card"
                onClick={() => setSelectedRoom(room)}
                style={{ 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer',
                  borderTop: `6px solid ${statusStyle.bg}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                
                {/* Room Floor Badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#FFF', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', zIndex: 1 }}>
                  Lantai {room.floor}
                </div>

                {/* Small preview image */}
                <div style={{ height: '110px', overflow: 'hidden', position: 'relative', backgroundColor: '#E2E8F0' }}>
                  <img 
                    src={room.image} 
                    alt={`Room ${room.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Status Banner */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(3px)',
                    color: '#FFF',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Room {room.roomNumber}</span>
                    <span style={{ color: statusStyle.bg }}>● {statusStyle.label}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{room.type}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>{formatRupiah(room.price)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Kapasitas: {room.capacity} Orang</span>
                  </div>

                  {/* Icon Facilities */}
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    {room.facilities.slice(0, 4).map((fac, idx) => (
                      <span key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        {getFacilityIcon(fac)}
                      </span>
                    ))}
                    {room.facilities.length > 4 && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'var(--bg-color)', padding: '1px 4px', borderRadius: '3px' }}>
                        +{room.facilities.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Current Occupant Details (if occupied) */}
                  {room.status === "Occupied" && currentOccupant && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px dashed rgba(239, 68, 68, 0.2)',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      <FaUserCheck style={{ color: '#EF4444' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentOccupant.guestName}
                      </span>
                    </div>
                  )}

                  {/* Dirty Room - Quick clean action */}
                  {room.status === "Dirty" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateRoomStatus(room.roomId, "Available");
                      }}
                      className="btn-primary"
                      style={{
                        padding: '6px',
                        fontSize: '0.75rem',
                        marginTop: '4px',
                        backgroundColor: '#F59E0B',
                        borderColor: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaBroom /> <span>Set Ready (Cleaned)</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: DETAIL KAMAR */}
      {selectedRoom && (
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
          
          <div className="table-card" style={{ width: '100%', maxWidth: '680px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBed style={{ color: 'var(--primary-color)' }} /> Detail Spesifikasi Kamar {selectedRoom.roomNumber}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleOpenEditModal(selectedRoom)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--primary-color)'
                  }}
                >
                  <FaEdit /> Edit Kamar
                </button>
                <button 
                  onClick={() => handleDeleteRoom(selectedRoom.roomId, selectedRoom.roomNumber)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #FCA5A5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#EF4444'
                  }}
                >
                  <FaTrash /> Hapus
                </button>
                <button onClick={() => setSelectedRoom(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 6px' }}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Grid content */}
            <div style={{ display: 'grid', gridTemplateColumns: '4fr 5fr', gap: '20px' }}>
              
              {/* Left Column: Image & specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img 
                    src={selectedRoom.image} 
                    alt={`Room ${selectedRoom.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tipe Kamar:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedRoom.type}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lantai:</span>
                    <strong style={{ color: 'var(--text-main)' }}>Lantai {selectedRoom.floor}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Kapasitas Maks:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedRoom.capacity} Tamu</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Harga Sewa:</span>
                    <strong style={{ color: 'var(--primary-color)' }}>{formatRupiah(selectedRoom.price)} / Malam</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status Kamar:</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      backgroundColor: getStatusStyles(selectedRoom.status).bgLight,
                      color: getStatusStyles(selectedRoom.status).bg
                    }}>
                      {getStatusStyles(selectedRoom.status).label}
                    </span>
                  </div>
                </div>

                {/* Room Facilities */}
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Fasilitas Kamar:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedRoom.facilities.map((fac, idx) => (
                      <span key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        backgroundColor: 'var(--bg-color)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)'
                      }}>
                        {getFacilityIcon(fac)} <span>{fac}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Housekeeping Quick Action buttons */}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aksi Housekeeping / Status:</span>
                  
                  {selectedRoom.status === "Dirty" && (
                    <button
                      onClick={() => handleUpdateRoomStatus(selectedRoom.roomId, "Available")}
                      className="btn-primary"
                      style={{
                        padding: '8px',
                        fontSize: '0.8rem',
                        backgroundColor: '#10B981',
                        borderColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaBroom /> Selesaikan Pembersihan (Set Ready)
                    </button>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedRoom.status !== "Available" && selectedRoom.status !== "Occupied" && (
                      <button
                        onClick={() => handleUpdateRoomStatus(selectedRoom.roomId, "Available")}
                        style={{
                          flex: 1, padding: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          backgroundColor: 'transparent', color: '#10B981', border: '1px solid #10B981', borderRadius: '6px'
                        }}
                      >
                        Set Available
                      </button>
                    )}
                    {selectedRoom.status !== "Maintenance" && selectedRoom.status !== "Occupied" && (
                      <button
                        onClick={() => handleUpdateRoomStatus(selectedRoom.roomId, "Maintenance")}
                        style={{
                          flex: 1, padding: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          backgroundColor: 'transparent', color: '#64748B', border: '1px solid #64748B', borderRadius: '6px'
                        }}
                      >
                        Set Maintenance
                      </button>
                    )}
                    {selectedRoom.status !== "Dirty" && selectedRoom.status !== "Occupied" && (
                      <button
                        onClick={() => handleUpdateRoomStatus(selectedRoom.roomId, "Dirty")}
                        style={{
                          flex: 1, padding: '6px', fontSize: '0.75rem', cursor: 'pointer',
                          backgroundColor: 'transparent', color: '#F59E0B', border: '1px solid #F59E0B', borderRadius: '6px'
                        }}
                      >
                        Set Dirty
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Guest Info & Usage History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
                
                {/* 1. Tamu Menginap Saat Ini */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUserCheck style={{ color: '#EF4444' }} /> Tamu Menginap Saat Ini
                  </h4>

                  {selectedRoom.status === "Occupied" && getRoomOccupant(selectedRoom.roomNumber) ? (
                    (() => {
                      const guest = getRoomOccupant(selectedRoom.roomNumber);
                      return (
                        <div style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.03)',
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          borderRadius: '8px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: '0.78rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Nama Tamu:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{guest.guestName}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>No. HP / NIK:</span>
                            <span>{guest.phone} / {guest.identityNumber || "-"}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                            <span>{guest.email}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Ref Booking:</span>
                            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{guest.bookingId}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Periode Tinggal:</span>
                            <strong style={{ color: '#EF4444' }}>{guest.checkIn} s/d {guest.checkOut}</strong>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      textAlign: 'center'
                    }}>
                      Kamar sedang kosong (tidak dihuni tamu).
                    </div>
                  )}
                </div>

                {/* 2. Riwayat Penggunaan Kamar */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaFileInvoice style={{ color: 'var(--primary-color)' }} /> Riwayat Penggunaan Kamar
                  </h4>

                  {getRoomUsageHistory(selectedRoom.roomNumber).length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                      Belum ada riwayat check-in tercatat untuk kamar ini.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {getRoomUsageHistory(selectedRoom.roomNumber).map((history, idx) => (
                        <div key={idx} style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{history.guestName}</strong>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {history.checkIn} s/d {history.checkOut}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontWeight: 600 }}>{formatRupiah(history.totalPayment)}</span>
                            <span style={{ 
                              fontSize: '0.6rem', 
                              fontWeight: 700, 
                              padding: '1px 4px', 
                              borderRadius: '3px',
                              backgroundColor: history.status === "Check-in" ? "rgba(239, 68, 68, 0.1)" : "rgba(37, 99, 235, 0.1)",
                              color: history.status === "Check-in" ? "#EF4444" : "#2563EB"
                            }}>
                              {history.status === "Check-in" ? "Sedang Menginap" : "Selesai"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL: TAMBAH & EDIT KAMAR FORM */}
      {showAddEditModal && (
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
          
          <div className="table-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBed style={{ color: 'var(--primary-color)' }} /> {modalMode === "add" ? "Tambah Kamar Baru" : `Edit Data Kamar #${editingRoom?.roomNumber}`}
              </span>
              <button onClick={() => setShowAddEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Nomor Kamar*</label>
                  <input 
                    type="text" 
                    required
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    placeholder="Contoh: 101, 305"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Tipe Kamar*</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Lantai*</label>
                  <select
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="1">Lantai 1</option>
                    <option value="2">Lantai 2</option>
                    <option value="3">Lantai 3</option>
                    <option value="4">Lantai 4</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Kapasitas (Orang)*</label>
                  <select
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4">4 Orang</option>
                    <option value="6">6 Orang</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Status Awal*</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'var(--surface-color)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Available">Available (Tersedia)</option>
                    <option value="Occupied">Occupied (Terisi)</option>
                    <option value="Dirty">Dirty (Perlu Bersih)</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Harga Per Malam (IDR)*</label>
                <input 
                  type="number" 
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Contoh: 450000"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-main)',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Foto Kamar (URL)</label>
                <input 
                  type="text" 
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Kosongkan untuk menggunakan gambar default..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Facilities Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Fasilitas Kamar:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {facilityOptions.map((fac) => (
                    <label key={fac} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={formFacilities[fac] || false}
                        onChange={(e) => {
                          setFormFacilities({
                            ...formFacilities,
                            [fac]: e.target.checked
                          });
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddEditModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                >
                  Simpan Aset Kamar
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
}