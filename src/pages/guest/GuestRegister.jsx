import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaCamera, FaUser, FaEnvelope, FaPhone, FaCalendar, FaLock, FaArrowRight, FaCheck } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useGuestAuth } from "../../context/GuestAuthContext";

const inp = (err) => ({
  width: "100%", padding: "12px 14px", borderRadius: "10px",
  border: `1.5px solid ${err ? "#EF4444" : "#E8DCC8"}`,
  backgroundColor: "#FFFFFF", color: "#1A1A2E",
  fontSize: "0.88rem", outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s", boxSizing: "border-box",
});

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ["", "Lemah", "Cukup", "Bagus", "Kuat"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  if (!password) return null;
  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: "3px", borderRadius: "99px", backgroundColor: s <= score ? colors[score] : "#E8DCC8", transition: "background-color 0.3s" }} />
        ))}
      </div>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function GuestRegister() {
  const { register, showToast } = useGuestAuth();
  const navigate = useNavigate();
  const photoRef = useRef();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const [form, setForm] = useState({
    namaLengkap: "", email: "", noHp: "", tanggalLahir: "",
    password: "", konfirmasiPassword: "", foto: null,
  });
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: "" })); };

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      set("foto", ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (!form.namaLengkap.trim()) e.namaLengkap = "Nama lengkap wajib diisi";
    if (!form.email) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.noHp) e.noHp = "Nomor HP wajib diisi";
    else if (!/^[0-9]{10,13}$/.test(form.noHp)) e.noHp = "Format HP tidak valid (10-13 digit)";
    if (!form.tanggalLahir) e.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!form.password) e.password = "Kata sandi wajib diisi";
    else if (form.password.length < 6) e.password = "Minimal 6 karakter";
    if (!form.konfirmasiPassword) e.konfirmasiPassword = "Konfirmasi kata sandi wajib diisi";
    else if (form.password !== form.konfirmasiPassword) e.konfirmasiPassword = "Kata sandi tidak cocok";
    if (!agree) e.agree = "Anda harus menyetujui syarat & ketentuan";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    const result = register(form);
    if (result.ok) {
      showToast("Akun berhasil dibuat! Selamat datang 🎉");
      navigate("/guest/dashboard");
    } else {
      setErrors({ global: result.error });
    }
    setLoading(false);
  }

  const initials = form.namaLengkap?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "36px 32px", boxShadow: "0 4px 32px rgba(30,58,95,0.08)", border: "1px solid #F0EAE0" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 4px" }}>Buat Akun Baru</h2>
        <p style={{ fontSize: "0.88rem", color: "#6B7280", margin: "0 0 28px" }}>Daftar dan nikmati layanan eksklusif tamu</p>

        {/* Error global */}
        {errors.global && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.83rem", color: "#DC2626" }}>
            ⚠️ {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Foto profil */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => photoRef.current.click()}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#F5EDD8", border: "3px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {photoPreview ? <img src={photoPreview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#C9A84C" }}>{initials}</span>}
              </div>
              <div style={{ position: "absolute", bottom: "0", right: "0", width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#1E3A5F", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                <FaCamera style={{ fontSize: "0.65rem", color: "#fff" }} />
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#94A3B8", marginBottom: "24px", marginTop: "-16px" }}>Klik untuk upload foto profil (opsional)</p>

          {/* Nama lengkap */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nama Lengkap *</label>
            <div style={{ position: "relative" }}>
              <FaUser style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
              <input type="text" placeholder="Masukkan nama lengkap" value={form.namaLengkap}
                onChange={e => set("namaLengkap", e.target.value)}
                style={{ ...inp(errors.namaLengkap), paddingLeft: "36px" }} />
            </div>
            {errors.namaLengkap && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.namaLengkap}</p>}
          </div>

          {/* Email + No HP */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email *</label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
                <input type="email" placeholder="email@contoh.com" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  style={{ ...inp(errors.email), paddingLeft: "32px" }} />
              </div>
              {errors.email && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.email}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>No. HP *</label>
              <div style={{ position: "relative" }}>
                <FaPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.8rem" }} />
                <input type="tel" placeholder="081234567890" value={form.noHp}
                  onChange={e => set("noHp", e.target.value)}
                  style={{ ...inp(errors.noHp), paddingLeft: "32px" }} />
              </div>
              {errors.noHp && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.noHp}</p>}
            </div>
          </div>

          {/* Tanggal lahir */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tanggal Lahir *</label>
            <div style={{ position: "relative" }}>
              <FaCalendar style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
              <input type="date" value={form.tanggalLahir}
                onChange={e => set("tanggalLahir", e.target.value)}
                style={{ ...inp(errors.tanggalLahir), paddingLeft: "36px" }} />
            </div>
            {errors.tanggalLahir && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.tanggalLahir}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kata Sandi *</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
              <input type={showPass ? "text" : "password"} placeholder="Min. 6 karakter" value={form.password}
                onChange={e => set("password", e.target.value)}
                style={{ ...inp(errors.password), paddingLeft: "36px", paddingRight: "40px" }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
            {errors.password && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.password}</p>}
          </div>

          {/* Konfirmasi password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Konfirmasi Kata Sandi *</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.85rem" }} />
              <input type={showConfirm ? "text" : "password"} placeholder="Ulangi kata sandi" value={form.konfirmasiPassword}
                onChange={e => set("konfirmasiPassword", e.target.value)}
                style={{ ...inp(errors.konfirmasiPassword), paddingLeft: "36px", paddingRight: "40px" }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {form.konfirmasiPassword && form.password === form.konfirmasiPassword && (
              <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}><FaCheck /> Kata sandi cocok</p>
            )}
            {errors.konfirmasiPassword && <p style={{ margin: "3px 0 0", fontSize: "0.73rem", color: "#EF4444" }}>{errors.konfirmasiPassword}</p>}
          </div>

          {/* Checkbox persetujuan */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={agree} onChange={e => { setAgree(e.target.checked); if (errors.agree) setErrors(er => ({ ...er, agree: "" })); }}
                style={{ marginTop: "2px", accentColor: "#1E3A5F", width: "16px", height: "16px", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#6B7280", lineHeight: 1.5 }}>
                Saya menyetujui{" "}
                <a href="#" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>Syarat & Ketentuan</a>{" "}
                serta{" "}
                <a href="#" style={{ color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</a>{" "}
                HotelQu
              </span>
            </label>
            {errors.agree && <p style={{ margin: "3px 0 0 26px", fontSize: "0.73rem", color: "#EF4444" }}>{errors.agree}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #1E3A5F, #2E5490)",
              color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "inherit", opacity: loading ? 0.8 : 1, marginBottom: "16px",
            }}>
            {loading ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><span>Buat Akun</span><FaArrowRight /></>}
          </button>

          {/* Google */}
          <button type="button"
            style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid #E8DCC8", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#1A1A2E", fontFamily: "inherit" }}>
            <FaGoogle style={{ color: "#EA4335" }} />
            Daftar dengan Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.85rem", color: "#6B7280" }}>
          Sudah punya akun?{" "}
          <Link to="/guest/login" style={{ color: "#1E3A5F", fontWeight: 700, textDecoration: "none" }}>Masuk di sini</Link>
        </p>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
