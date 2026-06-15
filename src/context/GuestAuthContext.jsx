import { createContext, useContext, useState, useCallback, useEffect } from "react";

// ── Default guest profile ─────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  id: "GST-PORTAL-001",
  namaLengkap: "Budi Santoso",
  email: "budi.santoso@email.com",
  noHp: "081234567890",
  tanggalLahir: "1990-05-15",
  alamat: "Jl. Merdeka No. 10, Jakarta Selatan",
  foto: null,
  membership: "Gold",
  isPremium: false,
  premiumExpiry: null,
  poin: 2450,
  reservasiAktif: 2,
  keluhanAktif: 1,
  preferensi: {
    tipeKamar: "Deluxe Room",
    lantai: "Tinggi (lantai 4+)",
    bantal: "Lunak",
    suhuAC: "Sejuk (18-20°C)",
    permintaanKhusus: "Dekat lift, kamar non-smoking",
  },
  notifikasiSettings: {
    email: {
      konfirmasiBooking: true,
      reminderCheckIn: true,
      promo: false,
      updateKeluhan: true,
    },
    whatsapp: {
      konfirmasiBooking: true,
      reminderCheckIn: false,
      promo: false,
      updateKeluhan: true,
    },
  },
};

// ── Seed notifications ────────────────────────────────────────────────────────
const SEED_NOTIFS = [
  { id: "n1", tipe: "Reservasi", judul: "Booking Dikonfirmasi", isi: "Reservasi #BOK-5001 untuk Deluxe Room tanggal 20 Jun telah dikonfirmasi.", waktu: "2 jam lalu", dibaca: false },
  { id: "n2", tipe: "Promo", judul: "Promo Akhir Pekan 🎉", isi: "Dapatkan diskon 20% untuk menginap Sabtu-Minggu. Gunakan kode: WEEKEND20.", waktu: "5 jam lalu", dibaca: false },
  { id: "n3", tipe: "Keluhan", judul: "Keluhan Sedang Diproses", isi: "Tiket #TKT-0023 (AC bermasalah) sedang ditangani tim Maintenance.", waktu: "1 hari lalu", dibaca: true },
  { id: "n4", tipe: "Layanan", judul: "Room Service Tiba", isi: "Pesanan room service Anda (Nasi Goreng x1) telah diantarkan ke kamar 305.", waktu: "2 hari lalu", dibaca: true },
  { id: "n5", tipe: "Reservasi", judul: "Reminder Check-in Besok", isi: "Reservasi #BOK-5000 — check-in besok pukul 14:00 di Kamar 201.", waktu: "3 hari lalu", dibaca: true },
];

const LS_KEY = "hotelqu_guest_auth_v1";
const LS_NOTIF_KEY = "hotelqu_guest_notifs_v1";

// ── Context ───────────────────────────────────────────────────────────────────
const GuestAuthContext = createContext(null);

export function GuestAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${LS_KEY}_logged`)) || false; } catch { return false; }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULT_PROFILE;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_NOTIF_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return SEED_NOTIFS;
  });

  const [toast, setToast] = useState(null);

  // Persist
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(`${LS_KEY}_logged`, JSON.stringify(isLoggedIn)); }, [isLoggedIn]);

  // Toast helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const activeNotifications = notifications.filter(n => {
    if (profile.isPremium) return true;
    return ["Reservasi", "Keluhan", "Layanan"].includes(n.tipe);
  });

  const unreadCount = activeNotifications.filter(n => !n.dibaca).length;

  // Auth actions
  const login = useCallback((email, password) => {
    // Simulasi validasi
    if (!email || !password) return { ok: false, error: "Email dan kata sandi wajib diisi." };
    if (password.length < 6) return { ok: false, error: "Kata sandi minimal 6 karakter." };
    setIsLoggedIn(true);
    return { ok: true };
  }, []);

  const register = useCallback((data) => {
    if (!data.namaLengkap || !data.email || !data.noHp || !data.password)
      return { ok: false, error: "Semua field wajib diisi." };
    if (data.password !== data.konfirmasiPassword)
      return { ok: false, error: "Kata sandi dan konfirmasi tidak cocok." };
    if (data.password.length < 6)
      return { ok: false, error: "Kata sandi minimal 6 karakter." };
    setProfile(prev => ({ ...prev, ...data, konfirmasiPassword: undefined }));
    setIsLoggedIn(true);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const updateProfile = useCallback((data) => {
    setProfile(prev => ({ ...prev, ...data }));
    showToast("Profil berhasil diperbarui!");
  }, [showToast]);

  const updatePreferensi = useCallback((pref) => {
    setProfile(prev => ({ ...prev, preferensi: { ...prev.preferensi, ...pref } }));
    showToast("Preferensi kamar disimpan!");
  }, [showToast]);

  const updateNotifSettings = useCallback((settings) => {
    setProfile(prev => ({ ...prev, notifikasiSettings: settings }));
    showToast("Pengaturan notifikasi disimpan!");
  }, [showToast]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
  }, []);

  // Check premium status
  const checkIsPremium = useCallback(() => {
    if (!profile?.isPremium) return false;
    if (profile.premiumExpiry) {
      // Simulate checking against current date (June 14, 2026)
      const current = new Date("2026-06-14");
      const expiry = new Date(profile.premiumExpiry);
      if (expiry < current) return false;
    }
    return true;
  }, [profile]);

  return (
    <GuestAuthContext.Provider value={{
      isLoggedIn, profile, notifications: activeNotifications, unreadCount, toast,
      login, register, logout, updateProfile, updatePreferensi,
      updateNotifSettings, markAllRead, markOneRead, showToast, isPremium: checkIsPremium
    }}>
      {children}
    </GuestAuthContext.Provider>
  );
}

export function useGuestAuth() {
  return useContext(GuestAuthContext);
}
