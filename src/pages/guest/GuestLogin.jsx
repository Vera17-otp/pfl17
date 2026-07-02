import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

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
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: "", password: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.email) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.password) e.password = "Kata sandi wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      // Sign in via Supabase Auth using the useAuth hook
      const { data, error: authError } = await signIn(form.email, form.password);

      if (authError) {
        console.error("Auth error during login:", authError);
        setErrors({ global: authError.message === "Invalid login credentials" ? "Email atau kata sandi salah." : authError.message });
        setLoading(false);
        return;
      }
      
      if (!data.user) {
        console.error("No user data returned from login");
        setErrors({ global: "Email atau kata sandi salah." });
        setLoading(false);
        return;
      }

      // Fetch member profile
      const { data: memberData, error: memberError } = await supabase
        .from("profiles")
        .select("*, member_tiers(*)")
        .eq("id", data.user.id)
        .single();

      if (memberError || !memberData) {
        setErrors({ global: "Profil anggota tidak ditemukan. Hubungi administrator." });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Save sessions to localStorage
      localStorage.setItem("memberSession", JSON.stringify(data.session));
      localStorage.setItem("memberData", JSON.stringify(memberData));

      navigate("/guest/dashboard", { replace: true });
    } catch (err) {
      setErrors({ global: "Terjadi kesalahan. Silakan coba lagi." });
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Card */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "36px 32px", boxShadow: "0 4px 32px rgba(30,58,95,0.08)", border: "1px solid #F0EAE0" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 4px" }}>Selamat Datang</h2>
        <p style={{ fontSize: "0.88rem", color: "#6B7280", margin: "0 0 28px" }}>Masuk ke akun tamu Anda</p>

        {/* Error global */}
        {errors.global && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "0.83rem", color: "#DC2626" }}>
            ⚠️ {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Alamat Email"
            icon={<FaEnvelope />}
            type="email"
            placeholder="email@contoh.com"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            error={errors.email}
            disabled={loading}
          />

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: "0.9rem" }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                disabled={loading}
                style={{ ...inp(errors.password), paddingLeft: "38px", paddingRight: "44px", boxSizing: "border-box", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "0.95rem" }}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#EF4444" }}>{errors.password}</p>}
          </div>

          {/* Lupa password */}
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link to="/guest/lupa-password" style={{ fontSize: "0.82rem", color: "#C9A84C", fontWeight: 600, textDecoration: "none" }}>
              Lupa kata sandi?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #1E3A5F, #2E5490)",
              color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontFamily: "inherit", transition: "opacity 0.2s",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><span>Masuk</span><FaArrowRight /></>}
          </button>
        </form>

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
