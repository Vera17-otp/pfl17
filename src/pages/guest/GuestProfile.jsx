import { useState, useRef } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera,
  FaBed, FaSnowflake, FaBell, FaLock, FaTrash,
  FaCheck, FaTimes, FaEye, FaEyeSlash, FaToggleOn, FaToggleOff,
  FaWhatsapp, FaEdit, FaDesktop
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useGuestAuth } from "../../context/GuestAuthContext";
import PremiumLockOverlay from "../../components/ui/PremiumLockOverlay";

// ── Shared styles ──────────────────────────────────────────────────────────────
const card = {
  backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "24px",
  border: "1px solid #F0EAE0", boxShadow: "0 2px 12px rgba(30,58,95,0.05)",
  marginBottom: "20px",
};

const inputStyle = (err) => ({
  width: "100%", padding: "11px 14px", borderRadius: "10px",
  border: `1.5px solid ${err ? "#EF4444" : "#E8DCC8"}`,
  backgroundColor: "#FAFAFA", color: "#1A1A2E",
  fontSize: "0.88rem", outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s", boxSizing: "border-box",
});

const labelStyle = {
  display: "block", fontSize: "0.73rem", fontWeight: 700,
  color: "#1E3A5F", marginBottom: "5px",
  textTransform: "uppercase", letterSpacing: "0.5px",
};

const sectionTitle = {
  fontSize: "1rem", fontWeight: 800, color: "#1E3A5F",
  margin: "0 0 20px", display: "flex", alignItems: "center", gap: "8px",
};

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      style={{
        width: "44px", height: "24px", borderRadius: "99px", border: "none", cursor: "pointer",
        backgroundColor: checked ? "#1E3A5F" : "#E8DCC8",
        position: "relative", transition: "background-color 0.25s", flexShrink: 0,
      }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", backgroundColor: checked ? "#C9A84C" : "#FFFFFF",
        position: "absolute", top: "3px", left: checked ? "23px" : "3px",
        transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ── Section 1: Foto & Info Dasar ───────────────────────────────────────────────
function ProfileInfoSection({ profile, onUpdate }) {
  const photoRef = useRef();
  const [form, setForm] = useState({ namaLengkap: profile.namaLengkap, email: profile.email, noHp: profile.noHp, alamat: profile.alamat || "" });
  const [foto, setFoto] = useState(profile.foto);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: "" })); };

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (!form.namaLengkap.trim()) e.namaLengkap = "Nama wajib diisi";
    if (!form.email) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format tidak valid";
    if (!form.noHp) e.noHp = "No. HP wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdate({ ...form, foto });
    setSaving(false);
  }

  const initials = form.namaLengkap?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div style={card}>
      <h2 style={sectionTitle}><FaUser style={{ color: "#C9A84C" }} /> Data Diri</h2>

      {/* Foto profil */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", padding: "16px", backgroundColor: "#F5EDD8", borderRadius: "12px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#E8DCC8", border: "3px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {foto ? <img src={foto} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "#C9A84C" }}>{initials}</span>}
          </div>
          <button onClick={() => photoRef.current.click()} style={{ position: "absolute", bottom: "0", right: "0", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#1E3A5F", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <FaCamera style={{ fontSize: "0.6rem", color: "#fff" }} />
          </button>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1E3A5F" }}>{form.namaLengkap}</p>
          <p style={{ margin: "0 0 6px", fontSize: "0.8rem", color: "#6B7280" }}>{form.email}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", backgroundColor: "#C9A84C", borderRadius: "99px", padding: "2px 10px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#1E3A5F" }}>⭐ {profile.membership}</span>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Nama Lengkap *</label>
          <div style={{ position: "relative" }}>
            <FaUser style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
            <input value={form.namaLengkap} onChange={e => set("namaLengkap", e.target.value)} style={{ ...inputStyle(errors.namaLengkap), paddingLeft: "30px" }} />
          </div>
          {errors.namaLengkap && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.namaLengkap}</p>}
        </div>
        <div>
          <label style={labelStyle}>Alamat Email *</label>
          <div style={{ position: "relative" }}>
            <FaEnvelope style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} style={{ ...inputStyle(errors.email), paddingLeft: "30px" }} />
          </div>
          {errors.email && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.email}</p>}
        </div>
        <div>
          <label style={labelStyle}>Nomor HP *</label>
          <div style={{ position: "relative" }}>
            <FaPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
            <input type="tel" value={form.noHp} onChange={e => set("noHp", e.target.value)} style={{ ...inputStyle(errors.noHp), paddingLeft: "30px" }} />
          </div>
          {errors.noHp && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.noHp}</p>}
        </div>
        <div>
          <label style={labelStyle}>Alamat Lengkap</label>
          <div style={{ position: "relative" }}>
            <FaMapMarkerAlt style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
            <input value={form.alamat} onChange={e => set("alamat", e.target.value)} placeholder="Jl. Merdeka No. 10..." style={{ ...inputStyle(), paddingLeft: "30px" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "11px 28px", borderRadius: "10px", backgroundColor: "#1E3A5F", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontFamily: "inherit", opacity: saving ? 0.8 : 1 }}>
          {saving ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <FaCheck />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

// ── Section 2: Preferensi Kamar ────────────────────────────────────────────────
function RoomPreferencesSection({ profile, onUpdate }) {
  const [pref, setPref] = useState({ ...profile.preferensi });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setPref(p => ({ ...p, [k]: v }));

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onUpdate(pref);
    setSaving(false);
  }

  const selectStyle = { ...inputStyle(), appearance: "none" };

  const prefOptions = {
    tipeKamar: ["Standard Room", "Deluxe Room", "Junior Suite", "Suite", "Family Room"],
    lantai: ["Rendah (lantai 1-3)", "Tengah (lantai 4-6)", "Tinggi (lantai 4+)", "Tidak ada preferensi"],
    bantal: ["Keras", "Lunak", "Tidak ada preferensi"],
    suhuAC: ["Dingin (16-18°C)", "Sejuk (18-20°C)", "Normal (20-22°C)", "Hangat (22-24°C)"],
  };

  return (
    <div style={card}>
      <h2 style={sectionTitle}><FaBed style={{ color: "#C9A84C" }} /> Preferensi Kamar</h2>
      <p style={{ margin: "0 0 20px", fontSize: "0.83rem", color: "#6B7280" }}>Pengaturan ini membantu kami menyiapkan kamar sesuai keinginan Anda.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}><FaBed style={{ marginRight: "4px" }} />Tipe Kamar Favorit</label>
          <select value={pref.tipeKamar} onChange={e => set("tipeKamar", e.target.value)} style={selectStyle}>
            {prefOptions.tipeKamar.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>🏢 Preferensi Lantai</label>
          <select value={pref.lantai} onChange={e => set("lantai", e.target.value)} style={selectStyle}>
            {prefOptions.lantai.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>🛏️ Jenis Bantal</label>
          <select value={pref.bantal} onChange={e => set("bantal", e.target.value)} style={selectStyle}>
            {prefOptions.bantal.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}><FaSnowflake style={{ marginRight: "4px" }} />Suhu AC</label>
          <select value={pref.suhuAC} onChange={e => set("suhuAC", e.target.value)} style={selectStyle}>
            {prefOptions.suhuAC.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>📝 Permintaan Khusus</label>
          <textarea value={pref.permintaanKhusus} onChange={e => set("permintaanKhusus", e.target.value)}
            placeholder="Contoh: Kamar non-smoking, dekat lift, dll."
            style={{ ...inputStyle(), resize: "vertical", minHeight: "72px" }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "10px 24px", borderRadius: "10px", backgroundColor: "#C9A84C", color: "#1E3A5F", border: "none", fontWeight: 800, fontSize: "0.87rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
          {saving ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <FaCheck />}
          {saving ? "Menyimpan..." : "Simpan Preferensi"}
        </button>
      </div>
    </div>
  );
}

// ── Section 3: Pengaturan Notifikasi ──────────────────────────────────────────
function NotificationSettingsSection({ profile, onUpdate }) {
  const [settings, setSettings] = useState({ ...profile.notifikasiSettings });
  const [saving, setSaving] = useState(false);

  function toggleChannel(channel, key) {
    setSettings(s => ({ ...s, [channel]: { ...s[channel], [key]: !s[channel][key] } }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    onUpdate(settings);
    setSaving(false);
  }

  const notifKeys = [
    { key: "konfirmasiBooking", label: "Konfirmasi Booking", desc: "Saat reservasi dikonfirmasi" },
    { key: "reminderCheckIn", label: "Reminder Check-in", desc: "H-1 sebelum check-in" },
    { key: "promo", label: "Promo & Penawaran", desc: "Diskon dan paket spesial" },
    { key: "updateKeluhan", label: "Update Keluhan", desc: "Status tiket berubah" },
  ];

  return (
    <div style={card}>
      <h2 style={sectionTitle}><FaBell style={{ color: "#C9A84C" }} /> Pengaturan Notifikasi</h2>
      <p style={{ margin: "0 0 20px", fontSize: "0.83rem", color: "#6B7280" }}>Pilih jenis notifikasi dan channel yang Anda inginkan.</p>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: "12px", padding: "10px 0", borderBottom: "2px solid #F5EDD8", marginBottom: "4px" }}>
        <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Jenis Notifikasi</span>
        <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><FaEnvelope /> Email</span>
        <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><FaWhatsapp style={{ color: "#10B981" }} /> WA</span>
      </div>

      {notifKeys.map(({ key, label, desc }) => (
        <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: "12px", padding: "14px 0", borderBottom: "1px solid #F5EDD8", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "0.88rem", fontWeight: 700, color: "#1E3A5F" }}>{label}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#94A3B8" }}>{desc}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Toggle checked={settings.email[key]} onChange={() => toggleChannel("email", key)} />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Toggle checked={settings.whatsapp[key]} onChange={() => toggleChannel("whatsapp", key)} />
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "10px 24px", borderRadius: "10px", backgroundColor: "#1E3A5F", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.87rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
          {saving ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <FaCheck />}
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}

// ── Section 4: Keamanan & Akun ─────────────────────────────────────────────────
function SecuritySection({ showToast }) {
  const { profile } = useGuestAuth();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function validate() {
    const e = {};
    if (!form.oldPassword) e.oldPassword = "Kata sandi lama wajib diisi";
    if (!form.newPassword) e.newPassword = "Kata sandi baru wajib diisi";
    else if (form.newPassword.length < 6) e.newPassword = "Minimal 6 karakter";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Tidak cocok";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleChangePassword() {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    showToast("Kata sandi berhasil diubah!");
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
  }

  const passInp = (key, show, setShow, err) => (
    <div style={{ position: "relative" }}>
      <FaLock style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
      <input type={show ? "text" : "password"} value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors(er => ({ ...er, [key]: "" })); }}
        style={{ ...inputStyle(err), paddingLeft: "30px", paddingRight: "36px" }} />
      <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "0.85rem" }}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );

  return (
    <>
      <div style={card}>
        <h2 style={sectionTitle}><FaLock style={{ color: "#C9A84C" }} /> Keamanan Akun</h2>

        <PremiumLockOverlay>
          <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#D1FAE5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                <FaDesktop />
              </div>
              <div>
                <p style={{ margin: "0 0 3px", fontWeight: 800, color: "#166534", fontSize: "0.9rem" }}>Sinkronisasi Premium Aktif</p>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#15803D" }}>Akun Anda terhubung di 2 perangkat. Riwayat selalu up-to-date.</p>
              </div>
            </div>
            <button style={{ padding: "8px 14px", backgroundColor: "transparent", color: "#166534", border: "1px solid #86EFAC", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Kelola</button>
          </div>
        </PremiumLockOverlay>

        {/* Change password */}
        <div style={{ backgroundColor: "#F5EDD8", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "0.92rem", fontWeight: 800, color: "#1E3A5F" }}>🔑 Ganti Kata Sandi</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Kata Sandi Lama</label>
              {passInp("oldPassword", showOld, setShowOld, errors.oldPassword)}
              {errors.oldPassword && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.oldPassword}</p>}
            </div>
            <div>
              <label style={labelStyle}>Kata Sandi Baru</label>
              {passInp("newPassword", showNew, setShowNew, errors.newPassword)}
              {errors.newPassword && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.newPassword}</p>}
            </div>
            <div>
              <label style={labelStyle}>Konfirmasi Kata Sandi Baru</label>
              {passInp("confirmPassword", showConfirm, setShowConfirm, errors.confirmPassword)}
              {errors.confirmPassword && <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#EF4444" }}>{errors.confirmPassword}</p>}
            </div>
          </div>
          <button onClick={handleChangePassword} disabled={saving}
            style={{ marginTop: "14px", padding: "10px 22px", borderRadius: "9px", backgroundColor: "#1E3A5F", color: "#fff", border: "none", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
            {saving ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <FaCheck />}
            Ubah Kata Sandi
          </button>
        </div>

        {/* Hapus akun */}
        <div style={{ border: "1.5px solid #FCA5A5", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontWeight: 700, color: "#DC2626", fontSize: "0.9rem" }}>🗑️ Hapus Akun</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#6B7280" }}>Tindakan ini permanen dan tidak dapat dibatalkan.</p>
          </div>
          <button onClick={() => setShowDeleteModal(true)}
            style={{ padding: "9px 16px", borderRadius: "9px", backgroundColor: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FCA5A5", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" }}>
            Hapus Akun
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "32px", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 8px" }}>Hapus Akun?</h3>
            <p style={{ fontSize: "0.85rem", color: "#6B7280", marginBottom: "24px", lineHeight: 1.6 }}>
              Semua data akun Anda termasuk riwayat reservasi dan poin loyalitas akan dihapus permanen.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #E8DCC8", backgroundColor: "transparent", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Batal</button>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", backgroundColor: "#EF4444", color: "#fff", cursor: "pointer", fontWeight: 800, fontFamily: "inherit" }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  );
}

// ── Halaman Profil Utama ───────────────────────────────────────────────────────
export default function GuestProfile() {
  const { profile, updateProfile, updatePreferensi, updateNotifSettings, showToast } = useGuestAuth();
  const [activeTab, setActiveTab] = useState("profil");

  const tabs = [
    { key: "profil", label: "Data Diri", icon: <FaUser /> },
    { key: "preferensi", label: "Preferensi Kamar", icon: <FaBed /> },
    { key: "notifikasi", label: "Notifikasi", icon: <FaBell /> },
    { key: "keamanan", label: "Keamanan", icon: <FaLock /> },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1E3A5F", margin: "0 0 4px" }}>Profil Saya</h1>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#6B7280" }}>Kelola informasi pribadi dan preferensi akun Anda</p>
        </div>
        
        {/* Tombol Kelola Langganan */}
        <button 
          onClick={() => window.location.href = "/guest/langganan"} 
          style={{ padding: "8px 16px", borderRadius: "10px", backgroundColor: "#F8FAFC", border: "1px solid #C9A84C", color: "#1E3A5F", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FaCrown style={{ color: "#C9A84C" }} />
          Kelola Langganan
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid #F0EAE0", marginBottom: "24px", overflowX: "auto", paddingBottom: "2px" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 18px", cursor: "pointer", fontFamily: "inherit",
              fontSize: "0.85rem", fontWeight: activeTab === tab.key ? 800 : 500,
              color: activeTab === tab.key ? "#1E3A5F" : "#94A3B8",
              border: "none", borderBottom: `2px solid ${activeTab === tab.key ? "#C9A84C" : "transparent"}`,
              backgroundColor: "transparent", marginBottom: "-2px",
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profil" && <ProfileInfoSection profile={profile} onUpdate={updateProfile} />}
      {activeTab === "preferensi" && <RoomPreferencesSection profile={profile} onUpdate={updatePreferensi} />}
      {activeTab === "notifikasi" && <NotificationSettingsSection profile={profile} onUpdate={updateNotifSettings} />}
      {activeTab === "keamanan" && <SecuritySection showToast={showToast} />}
    </div>
  );
}
