import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { supabase } from "../../lib/supabase";

const inp = (err) => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${err ? "#EF4444" : "#E8DCC8"}`,
  backgroundColor: "#FFFFFF",
  color: "#1A1A2E",
  fontSize: "0.88rem",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
});

function PasswordStrength({ password }) {
  const score = [
    /.{6,}/,
    /[A-Z]/,
    /[0-9]/,
    /[^A-Za-z0-9]/,
  ].filter((rule) => rule.test(password)).length;

  const labels = ["", "Lemah", "Cukup", "Bagus", "Kuat"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "3px" }}>
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "99px",
              backgroundColor:
                item <= score ? colors[score] : "#E8DCC8",
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </div>

      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: colors[score],
        }}
      >
        {labels[score]}
      </span>
    </div>
  );
}

export default function GuestRegister() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    namaLengkap: "",
    email: "",
    noHp: "",
    address: "",
    password: "",
    konfirmasiPassword: "",
  });

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  function validate() {
    const e = {};

    if (!form.namaLengkap.trim()) {
      e.namaLengkap = "Nama lengkap wajib diisi";
    }

    if (!form.email.trim()) {
      e.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Format email tidak valid";
    }

    if (!form.noHp.trim()) {
      e.noHp = "Nomor HP wajib diisi";
    } else if (!/^[0-9]{10,13}$/.test(form.noHp.trim())) {
      e.noHp = "Format HP tidak valid (10-13 digit)";
    }

    if (!form.address.trim()) {
      e.address = "Alamat wajib diisi";
    }

    if (!form.password) {
      e.password = "Kata sandi wajib diisi";
    } else if (form.password.length < 6) {
      e.password = "Minimal 6 karakter";
    }

    if (!form.konfirmasiPassword) {
      e.konfirmasiPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (form.password !== form.konfirmasiPassword) {
      e.konfirmasiPassword = "Kata sandi tidak cocok";
    }

    if (!agree) {
      e.agree = "Anda harus menyetujui syarat & ketentuan";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. Membuat akun pada Supabase Authentication
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.namaLengkap.trim(),
            },
          },
        });

      if (authError) {
        const errorText = authError.message?.toLowerCase() || "";

        if (
          errorText.includes("already registered") ||
          errorText.includes("already exists")
        ) {
          throw new Error(
            "Email sudah terdaftar. Gunakan email lain atau login."
          );
        }

        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Gagal membuat akun. User tidak ditemukan.");
      }

      // Jika Email Confirmation aktif, session bisa null.
      // Tetapi user_id tetap tersedia dari authData.user.id.
      const memberPayload = {
        user_id: authData.user.id,
        full_name: form.namaLengkap.trim(),
        phone_number: form.noHp.trim(),
        address: form.address.trim(),
        avatar_url: null,
        membership_type: "Regular",
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 2. Simpan profil tambahan ke tabel members
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert([memberPayload])
        .select()
        .single();

      if (memberError) {
        console.error("DETAIL ERROR INSERT MEMBERS:", memberError);

        throw new Error(
          `Gagal menyimpan profil: ${memberError.message}`
        );
      }

      console.log("Member berhasil dibuat:", memberData);

      // 3. Logout agar user login manual setelah register
      await supabase.auth.signOut();

      setErrors({
        success:
          "Akun dan profil berhasil dibuat! Silakan login menggunakan email dan kata sandi Anda.",
      });

      setTimeout(() => {
        navigate("/guest/login", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setErrors({
        global: err.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow: "0 4px 32px rgba(30,58,95,0.08)",
          border: "1px solid #F0EAE0",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#1E3A5F",
            margin: "0 0 4px",
          }}
        >
          Buat Akun Baru
        </h2>

        <p
          style={{
            fontSize: "0.88rem",
            color: "#6B7280",
            margin: "0 0 28px",
          }}
        >
          Daftar dan nikmati layanan eksklusif tamu
        </p>

        {errors.global && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "0.83rem",
              color: "#DC2626",
            }}
          >
            ⚠️ {errors.global}
          </div>
        )}

        {errors.success && (
          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "0.83rem",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaCheck /> {errors.success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Nama Lengkap *</label>

            <div style={{ position: "relative" }}>
              <FaUser style={inputIconStyle} />

              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.namaLengkap}
                onChange={(e) => set("namaLengkap", e.target.value)}
                disabled={loading}
                style={{
                  ...inp(errors.namaLengkap),
                  paddingLeft: "36px",
                }}
              />
            </div>

            {errors.namaLengkap && (
              <p style={errorTextStyle}>{errors.namaLengkap}</p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div>
              <label style={labelStyle}>Email *</label>

              <div style={{ position: "relative" }}>
                <FaEnvelope
                  style={{
                    ...inputIconStyle,
                    left: "10px",
                    fontSize: "0.8rem",
                  }}
                />

                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={loading}
                  style={{
                    ...inp(errors.email),
                    paddingLeft: "32px",
                  }}
                />
              </div>

              {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
            </div>

            <div>
              <label style={labelStyle}>No. HP *</label>

              <div style={{ position: "relative" }}>
                <FaPhone
                  style={{
                    ...inputIconStyle,
                    left: "10px",
                    fontSize: "0.8rem",
                  }}
                />

                <input
                  type="tel"
                  placeholder="081234567890"
                  value={form.noHp}
                  onChange={(e) =>
                    set("noHp", e.target.value.replace(/\D/g, ""))
                  }
                  disabled={loading}
                  style={{
                    ...inp(errors.noHp),
                    paddingLeft: "32px",
                  }}
                />
              </div>

              {errors.noHp && <p style={errorTextStyle}>{errors.noHp}</p>}
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Alamat *</label>

            <div style={{ position: "relative" }}>
              <FaMapMarkerAlt
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "14px",
                  color: "#94A3B8",
                  fontSize: "0.85rem",
                }}
              />

              <textarea
                placeholder="Masukkan alamat lengkap"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                disabled={loading}
                rows={2}
                style={{
                  ...inp(errors.address),
                  paddingLeft: "36px",
                  resize: "none",
                }}
              />
            </div>

            {errors.address && (
              <p style={errorTextStyle}>{errors.address}</p>
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Kata Sandi *</label>

            <div style={{ position: "relative" }}>
              <FaLock style={inputIconStyle} />

              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 karakter"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                disabled={loading}
                style={{
                  ...inp(errors.password),
                  paddingLeft: "36px",
                  paddingRight: "40px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPass((prev) => !prev)}
                style={showPasswordButtonStyle}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <PasswordStrength password={form.password} />

            {errors.password && (
              <p style={errorTextStyle}>{errors.password}</p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Konfirmasi Kata Sandi *</label>

            <div style={{ position: "relative" }}>
              <FaLock style={inputIconStyle} />

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi kata sandi"
                value={form.konfirmasiPassword}
                onChange={(e) =>
                  set("konfirmasiPassword", e.target.value)
                }
                disabled={loading}
                style={{
                  ...inp(errors.konfirmasiPassword),
                  paddingLeft: "36px",
                  paddingRight: "40px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                style={showPasswordButtonStyle}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {form.konfirmasiPassword &&
              form.password === form.konfirmasiPassword && (
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "0.73rem",
                    color: "#10B981",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaCheck /> Kata sandi cocok
                </p>
              )}

            {errors.konfirmasiPassword && (
              <p style={errorTextStyle}>{errors.konfirmasiPassword}</p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => {
                  setAgree(e.target.checked);

                  if (errors.agree) {
                    setErrors((prev) => ({
                      ...prev,
                      agree: "",
                    }));
                  }
                }}
                style={{
                  marginTop: "2px",
                  accentColor: "#1E3A5F",
                  width: "16px",
                  height: "16px",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#6B7280",
                  lineHeight: 1.5,
                }}
              >
                Saya menyetujui{" "}
                <a
                  href="#"
                  style={{
                    color: "#C9A84C",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Syarat & Ketentuan
                </a>{" "}
                serta{" "}
                <a
                  href="#"
                  style={{
                    color: "#C9A84C",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Kebijakan Privasi
                </a>{" "}
                HotelQu
              </span>
            </label>

            {errors.agree && (
              <p
                style={{
                  margin: "3px 0 0 26px",
                  fontSize: "0.73rem",
                  color: "#EF4444",
                }}
              >
                {errors.agree}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #1E3A5F, #2E5490)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontFamily: "inherit",
              opacity: loading ? 0.8 : 1,
              marginBottom: "16px",
            }}
          >
            {loading ? (
              <ImSpinner2
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <>
                <span>Buat Akun</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "0.85rem",
            color: "#6B7280",
          }}
        >
          Sudah punya akun?{" "}
          <Link
            to="/guest/login"
            style={{
              color: "#1E3A5F",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#1E3A5F",
  marginBottom: "5px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputIconStyle = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94A3B8",
  fontSize: "0.85rem",
};

const errorTextStyle = {
  margin: "3px 0 0",
  fontSize: "0.73rem",
  color: "#EF4444",
};

const showPasswordButtonStyle = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#94A3B8",
  cursor: "pointer",
};