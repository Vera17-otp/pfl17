import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaPhone, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { useGuestAuth } from "../../context/GuestAuthContext";

// ── Shared input style ─────────────────────────────────────────────────────────
const inp = (err) => ({
  width: "100%", padding: "12px 14px", borderRadius: "10px",
  border: `1.5px solid ${err ? "#EF4444" : "#E8DCC8"}`,
  backgroundColor: "#FFFFFF", color: "#1A1A2E",
  fontSize: "0.9rem", outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

function InputField({ label, icon, error, ...props }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.9rem" }}>{icon}</span>}
        <input style={{ ...inp(error), paddingLeft: icon ? "38px" : "14px" }} {...props} />
      </div>
      {error && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

// ── Komponen Utama Login ────────────────────────────────────────────────────────
export default function GuestLogin() {
  const { login, showToast } = useGuestAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("email"); // "email" | "otp"
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({ email: "", password: "", noHp: "", otp: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (mode === "email") {
      if (!form.email) e.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
      if (!form.password) e.password = "Kata sandi wajib diisi";
    } else {
      if (!form.noHp) e.noHp = "Nomor HP wajib diisi";
      if (otpSent && !form.otp) e.otp = "Masukkan kode OTP";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = login(form.email || `${form.noHp}@otp.com`, form.password || "123456");
    if (result.ok) {
      showToast("Selamat datang kembali! 🎉");
      navigate("/guest/dashboard");
    } else {
      setErrors({ global: result.error });
    }
    setLoading(false);
  }

  function handleSendOtp() {
    if (!form.noHp) { setErrors({ noHp: "Nomor HP wajib diisi" }); return; }
    setOtpSent(true);
    setOtpCountdown(60);
    showToast("OTP dikirim ke " + form.noHp);
    const interval = setInterval(() => {
      setOtpCountdown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  }

  function handleGoogle() {
    setLoading(true);
    setTimeout(() => {
      login("google@gmail.com", "googleauth");
      navigate("/guest/dashboard");
    }, 1000);
  }

  return (
    <div>
      {/* Card */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "36px 32px", boxShadow: "0 4px 32px rgba(30,58,95,0.08)", border: "1px solid #F0EAE0" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 4px" }}>Selamat Datang</h2>
        <p style={{ fontSize: "0.88rem", color: "#6B7280", margin: "0 0 28px" }}>Masuk ke akun tamu Anda</p>

        {/* Mode toggle */}
        <div style={{ display: "flex", backgroundColor: "#F5EDD8", borderRadius: "10px", padding: "4px", marginBottom: "24px" }}>
          {[{ key: "email", label: "Email", icon: <FaEnvelope /> }, { key: "otp", label: "OTP via HP", icon: <FaPhone /> }].map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); setErrors({}); }}
              style={{
                flex: 1, padding: "9px", borderRadius: "8px", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                fontSize: "0.83rem", fontWeight: 700, transition: "all 0.2s", fontFamily: "inherit",
                backgroundColor: mode === m.key ? "#1E3A5F" : "transparent",
                color: mode === m.key ? "#fff" : "#6B7280",
              }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Error global */}
        {errors.global && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.83rem", color: "#DC2626" }}>
            ⚠️ {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "email" ? (
            <>
              <InputField label="Alamat Email" icon={<FaEnvelope />} type="email" placeholder="email@contoh.com"
                value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} />
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kata Sandi</label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.9rem" }} />
                  <input type={showPass ? "text" : "password"} placeholder="Masukkan kata sandi"
                    value={form.password} onChange={e => set("password", e.target.value)}
                    style={{ ...inp(errors.password), paddingLeft: "38px", paddingRight: "44px", boxSizing: "border-box", width: "100%" }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "0.95rem" }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#EF4444" }}>{errors.password}</p>}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nomor HP</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="tel" placeholder="081234567890" value={form.noHp}
                    onChange={e => set("noHp", e.target.value)}
                    style={{ ...inp(errors.noHp), flex: 1, boxSizing: "border-box" }} />
                  <button type="button" onClick={handleSendOtp} disabled={otpCountdown > 0}
                    style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: otpCountdown > 0 ? "#E8DCC8" : "#C9A84C", color: otpCountdown > 0 ? "#94A3B8" : "#fff", border: "none", cursor: otpCountdown > 0 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                    {otpCountdown > 0 ? `${otpCountdown}s` : "Kirim OTP"}
                  </button>
                </div>
                {errors.noHp && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#EF4444" }}>{errors.noHp}</p>}
              </div>
              {otpSent && (
                <InputField label="Kode OTP" icon={<FaLock />} type="text" placeholder="Masukkan 6 digit OTP"
                  maxLength={6} value={form.otp} onChange={e => set("otp", e.target.value)} error={errors.otp} />
              )}
            </>
          )}

          {/* Lupa password */}
          {mode === "email" && (
            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <Link to="/guest/lupa-password" style={{ fontSize: "0.82rem", color: "#C9A84C", fontWeight: 600, textDecoration: "none" }}>
                Lupa kata sandi?
              </Link>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #1E3A5F, #2E5490)",
              color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "inherit", transition: "opacity 0.2s",
              opacity: loading ? 0.8 : 1,
            }}>
            {loading ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><span>Masuk</span><FaArrowRight /></>}
          </button>
        </form>

        {/* Google */}
        <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#F0EAE0" }} />
          <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>atau</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#F0EAE0" }} />
        </div>
        <button onClick={handleGoogle}
          style={{
            width: "100%", padding: "12px", borderRadius: "12px",
            border: "1.5px solid #E8DCC8", backgroundColor: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#1A1A2E",
            fontFamily: "inherit", transition: "background-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FDF8F2"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}>
          <FaGoogle style={{ color: "#EA4335", fontSize: "1rem" }} />
          Masuk dengan Google
        </button>

        {/* Link register */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.85rem", color: "#6B7280" }}>
          Belum punya akun?{" "}
          <Link to="/guest/register" style={{ color: "#1E3A5F", fontWeight: 700, textDecoration: "none" }}>
            Daftar Sekarang
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
