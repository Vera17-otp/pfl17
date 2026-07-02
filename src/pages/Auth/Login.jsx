import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dataForm, setDataForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
        setError("");
    };

    const validateForm = () => {
        if (!dataForm.email.trim()) {
            setError("Email wajib diisi.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dataForm.email)) {
            setError("Format email tidak valid.");
            return false;
        }
        if (!dataForm.password) {
            setError("Password wajib diisi.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: dataForm.email,
                password: dataForm.password,
            });

            if (authError || !data.user) {
                setError(authError ? "Email atau password salah." : "Login gagal.");
                setLoading(false);
                return;
            }

            // Fetch role from profiles
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*, member_tiers(*)")
                .eq("id", data.user.id)
                .single();

            if (profileError || !profile) {
                setError("Profil tidak ditemukan. Hubungi administrator.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (profile.role === "admin") {
                // Save admin session to localStorage
                localStorage.setItem("adminSession", JSON.stringify({
                    id: profile.id,
                    email: dataForm.email,
                    status: "active",
                    role: "admin",
                    full_name: profile.full_name,
                }));
                setSuccess("Login Admin berhasil! Mengalihkan...");
                setTimeout(() => {
                    navigate("/");
                }, 800);
            } else {
                // Save member session to localStorage
                localStorage.setItem("memberSession", JSON.stringify(data.session));
                localStorage.setItem("memberData", JSON.stringify(profile));
                setSuccess("Login Member berhasil! Mengalihkan...");
                setTimeout(() => {
                    navigate("/guest/dashboard", { replace: true });
                }, 800);
            }
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Sign in to continue to Hotelify</p>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BsFillExclamationDiamondFill color="#ff8a8a" />
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>{error}</span>
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
                    <label className="glass-label">Email</label>
                    <input
                        name="email"
                        onChange={handleChange}
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="glass-input"
                        value={dataForm.email}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="glass-label">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            name="password"
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Enter your password"
                            className="glass-input"
                            style={{ paddingRight: '40px' }}
                            value={dataForm.password}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.9)' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary-color)' }} />
                        Remember me
                    </label>
                    <Link to="/forgot" style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', opacity: 0.9 }}>
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="glass-button"
                    style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? <ImSpinner2 className="animate-spin" /> : "Sign In"}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>
                    Create one
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}></div>
                <span style={{ padding: '0 10px', fontSize: '0.8rem' }}>or continue with</span>
                <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {['google', 'apple', 'twitter'].map(brand => (
                    <button key={brand} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        <img
                            src={`https://cdn-icons-png.flaticon.com/512/732/7322${brand === 'apple' ? '00' : brand === 'google' ? '45' : '51'}.png`}
                            alt={brand}
                            style={{ width: '20px', height: '20px', filter: brand !== 'google' ? 'brightness(0) invert(1)' : 'none', opacity: 0.9 }}
                        />
                    </button>
                ))}
            </div>
        </>
    );
}