import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ── Seed notifications (UI-level only, not from DB) ───────────────────────────
const SEED_NOTIFS = [
  { id: "n1", tipe: "Reservasi", judul: "Booking Dikonfirmasi", isi: "Reservasi #BOK-5001 untuk Deluxe Room tanggal 20 Jun telah dikonfirmasi.", waktu: "2 jam lalu", dibaca: false },
  { id: "n2", tipe: "Promo", judul: "Promo Akhir Pekan 🎉", isi: "Dapatkan diskon 20% untuk menginap Sabtu-Minggu. Gunakan kode: WEEKEND20.", waktu: "5 jam lalu", dibaca: false },
  { id: "n3", tipe: "Keluhan", judul: "Keluhan Sedang Diproses", isi: "Tiket #TKT-0023 (AC bermasalah) sedang ditangani tim Maintenance.", waktu: "1 hari lalu", dibaca: true },
  { id: "n4", tipe: "Layanan", judul: "Room Service Tiba", isi: "Pesanan room service Anda (Nasi Goreng x1) telah diantarkan ke kamar 305.", waktu: "2 hari lalu", dibaca: true },
  { id: "n5", tipe: "Reservasi", judul: "Reminder Check-in Besok", isi: "Reservasi #BOK-5000 — check-in besok pukul 14:00 di Kamar 201.", waktu: "3 hari lalu", dibaca: true },
];

const LS_NOTIF_KEY = "hotelqu_guest_notifs_v1";

// ── Helper: load profile from localStorage ────────────────────────────────────
function loadProfileFromStorage() {
  try {
    const raw = localStorage.getItem("memberData");
    if (raw) {
      const data = JSON.parse(raw);
      return {
        id: data.user_id || data.id || null,
        namaLengkap: data.full_name || "",
        email: "",
        noHp: data.phone_number || "",
        alamat: data.address || "",
        foto: data.avatar_url || null,
        membership: data.membership_type || "Regular",
        isPremium: data.membership_type === "Platinum" || data.membership_type === "Gold",
        premiumExpiry: null,
        poin: 0,
        reservasiAktif: 0,
        keluhanAktif: 0,
        preferensi: {
          tipeKamar: "",
          lantai: "",
          bantal: "",
          suhuAC: "",
          permintaanKhusus: "",
        },
        notifikasiSettings: {
          email: { konfirmasiBooking: true, reminderCheckIn: true, promo: false, updateKeluhan: true },
          whatsapp: { konfirmasiBooking: true, reminderCheckIn: false, promo: false, updateKeluhan: true },
        },
        // raw members table data for reference
        _raw: data,
      };
    }
  } catch { /* ignore */ }
  return null;
}

// ── Context ───────────────────────────────────────────────────────────────────
const GuestAuthContext = createContext(null);

export function GuestAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_NOTIF_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return SEED_NOTIFS;
  });

  const [toast, setToast] = useState(null);

  // ── On mount: restore session from Supabase Auth ──────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Load profile from localStorage (set during login)
          const storedProfile = loadProfileFromStorage();
          if (storedProfile) {
            setProfile(storedProfile);
            setIsLoggedIn(true);
          } else {
            // Fetch fresh from DB if localStorage is missing
            const { data: memberData } = await supabase
              .from("members")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
            if (memberData) {
              localStorage.setItem("memberData", JSON.stringify(memberData));
              setProfile(loadProfileFromStorage() || null);
              setIsLoggedIn(true);
            } else {
              // No profile found — sign out
              await supabase.auth.signOut();
              setIsLoggedIn(false);
            }
          }
        } else {
          // No active session
          localStorage.removeItem("memberSession");
          localStorage.removeItem("memberData");
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setSessionChecked(true);
      }
    }

    restoreSession();

    // Listen for auth state changes (e.g. token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        localStorage.setItem("memberSession", JSON.stringify(session));
        const storedProfile = loadProfileFromStorage();
        if (storedProfile) {
          setProfile(storedProfile);
          setIsLoggedIn(true);
        }
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("memberSession");
        localStorage.removeItem("memberData");
        setIsLoggedIn(false);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Toast helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const activeNotifications = notifications.filter(n => {
    const isPlatinum = profile?.membership === "Platinum";
    const isGold = profile?.membership === "Gold";
    if (isPlatinum || isGold) return true;
    return ["Reservasi", "Keluhan", "Layanan"].includes(n.tipe);
  });

  const unreadCount = activeNotifications.filter(n => !n.dibaca).length;

  // ── Auth actions ──────────────────────────────────────────────────────────

  /**
   * login() — kept for API compatibility but no longer used by GuestLogin.
   * GuestLogin now calls Supabase directly and updates localStorage.
   * This function rehydrates state from localStorage after login.
   */
  const login = useCallback(() => {
    const storedProfile = loadProfileFromStorage();
    if (storedProfile) {
      setProfile(storedProfile);
      setIsLoggedIn(true);
      return { ok: true };
    }
    return { ok: false, error: "Profil tidak ditemukan." };
  }, []);

  /**
   * register() — kept for API compatibility, no longer used by GuestRegister.
   */
  const register = useCallback(() => {
    return { ok: false, error: "Gunakan halaman registrasi resmi." };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    localStorage.removeItem("memberSession");
    localStorage.removeItem("memberData");
    setIsLoggedIn(false);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    // Update in DB
    const currentData = profile?._raw;
    if (currentData?.id) {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: data.namaLengkap || currentData.full_name,
          phone_number: data.noHp || currentData.phone_number,
          address: data.alamat || currentData.address,
          avatar_url: data.foto || currentData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentData.id);

      if (!error) {
        const updated = { ...currentData, full_name: data.namaLengkap || currentData.full_name, phone_number: data.noHp || currentData.phone_number, address: data.alamat || currentData.address, avatar_url: data.foto || currentData.avatar_url };
        localStorage.setItem("memberData", JSON.stringify(updated));
      }
    }
    setProfile(prev => ({ ...prev, ...data }));
    showToast("Profil berhasil diperbarui!");
  }, [profile, showToast]);

  const updatePreferensi = useCallback((pref) => {
    setProfile(prev => ({ ...prev, preferensi: { ...prev?.preferensi, ...pref } }));
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

  const checkIsPremium = useCallback(() => {
    if (!profile?.isPremium) return false;
    if (profile.premiumExpiry) {
      const expiry = new Date(profile.premiumExpiry);
      if (expiry < new Date()) return false;
    }
    return true;
  }, [profile]);

  // Don't render children until session check is complete (avoids flash of login redirect)
  if (!sessionChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FDF8F2" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #E8DCC8", borderTopColor: "#1E3A5F", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      </div>
    );
  }

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
