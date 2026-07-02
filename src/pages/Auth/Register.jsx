import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImSpinner2 } from "react-icons/im";
import { FaCheckCircle, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const validate = () => {
        if (!form.username.trim()) {
            setError("Username wajib diisi.");
            return false;
        }
        if (!form.email.trim()) {
            setError("Email wajib diisi.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("Format email tidak valid.");
            return false;
        }
        if (!form.password) {
            setError("Password wajib diisi.");
            return false;
        }
        if (form.password.length < 6) {
            setError("Password minimal 6 karakter.");
            return false;
        }
        if (form.password !== form.confirmPassword) {
            setError("Konfirmasi password tidak cocok.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.username,
                    }
                }
            });

            if (signUpError) {
                console.error("Sign up error:", signUpError);
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            setSuccess("Akun berhasil dibuat! Silakan cek email Anda (jika konfirmasi email aktif) atau login.");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <FaUserPlus size={28} color="#fff" />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Staf Onboarding</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Create Internal Account</p>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>⚠️ {error}</span>
                </div>
            )}

            {success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCheckCircle color="#6ee7b7" />
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label className="glass-label">Username</label>
                    <input
                        name="username"
                        onChange={handleChange}
                        type="text"
                        required
                        placeholder="johan"
                        className="glass-input"
                        value={form.username}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="glass-label">Corporate Email Identity</label>
                    <input
                        name="email"
                        onChange={handleChange}
                        type="email"
                        required
                        placeholder="johan@hotelify.com"
                        className="glass-input"
                        value={form.email}
                        disabled={loading}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label className="glass-label">Secure Key</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="password"
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="glass-input"
                                style={{ paddingRight: '36px' }}
                                value={form.password}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="glass-label">Verify Key</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="confirmPassword"
                                onChange={handleChange}
                                type={showConfirm ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="glass-input"
                                style={{ paddingRight: '36px' }}
                                value={form.confirmPassword}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                            >
                                {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="glass-button"
                    style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? <ImSpinner2 className="animate-spin" /> : "Register Internal Profile"}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                Already authorized?{' '}
                <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>
                    Sign in to Portal
                </Link>
            </div>
        </>
    );
}