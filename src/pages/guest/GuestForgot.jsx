import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { supabase } from "../../lib/supabase";

export default function GuestForgot() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError("Email wajib diisi"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Format email tidak valid"); return; }
    setError("");
    setLoading(true);

    try {
      // Use Supabase Auth to send password reset email
      // We do not reveal whether the email is registered or not on error
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        // Still show success to not reveal if email is registered
        console.error("Reset error:", resetError.message);
      }

      // Always show success to avoid exposing registered emails
      setSent(true);
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "40px 32px", boxShadow: "0 4px 32px rgba(30,58,95,0.08)", border: "1px solid #F0EAE0", textAlign: "center" }}>

        {!sent ? (
          <>
            {/* Icon */}
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #F5EDD8, #E8D4A0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2rem" }}>
              🔐
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 8px" }}>Lupa Kata Sandi?</h2>
            <p style={{ fontSize: "0.88rem", color: "#6B7280", margin: "0 0 32px", lineHeight: 1.6 }}>
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan link untuk reset kata sandi Anda.
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#1E3A5F", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Alamat Email</label>
              <div style={{ position: "relative", marginBottom: "6px" }}>
                <FaEnvelope style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  style={{ width: "100%", padding: "12px 14px 12px 38px", borderRadius: "10px", border: `1.5px solid ${error ? "#EF4444" : "#E8DCC8"}`, backgroundColor: "#FAFAFA", color: "#1A1A2E", fontSize: "0.88rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              {error && <p style={{ margin: "0 0 16px", fontSize: "0.75rem", color: "#EF4444" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #1E3A5F, #2E5490)", color: "#fff", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit", marginTop: "12px", opacity: loading ? 0.8 : 1 }}
              >
                {loading ? <ImSpinner2 style={{ animation: "spin 1s linear infinite" }} /> : <><FaPaperPlane /><span>Kirim Link Reset</span></>}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2.2rem" }}>
              ✅
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1E3A5F", margin: "0 0 8px" }}>Email Terkirim!</h2>
            <p style={{ fontSize: "0.88rem", color: "#6B7280", lineHeight: 1.7, margin: "0 0 12px" }}>
              Jika email Anda terdaftar, link reset kata sandi telah dikirim ke
            </p>
            <div style={{ backgroundColor: "#F5EDD8", borderRadius: "10px", padding: "10px 16px", display: "inline-block", marginBottom: "24px" }}>
              <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: "0.9rem" }}>{email}</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#94A3B8", lineHeight: 1.6 }}>
              Periksa folder spam jika tidak muncul di inbox. Link berlaku selama 30 menit.
            </p>
          </>
        )}

        <Link to="/guest/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "28px", fontSize: "0.85rem", color: "#1E3A5F", fontWeight: 700, textDecoration: "none" }}>
          <FaArrowLeft /> Kembali ke halaman login
        </Link>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
