import { useState } from "react";
import { Link } from "react-router-dom";
import { ImSpinner2 } from "react-icons/im";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function Forgot() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const validate = () => {
        if (!email.trim()) {
            setError("Email wajib diisi.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Format email tidak valid.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            // Check if admin email exists
            const { data, error: queryError } = await supabase
                .from("Admin")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (queryError) {
                setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
                setLoading(false);
                return;
            }

            if (!data) {
                setError("Email tidak ditemukan dalam sistem.");
                setLoading(false);
                return;
            }

            // Email exists — instruct to contact admin (do not expose password)
            setMessage("Email ditemukan. Silakan hubungi administrator sistem untuk mereset password Anda.");
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <FaLock size={26} color="#fff" />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Security Recovery</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Enter your corporate email to verify your identity.</p>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>⚠️ {error}</span>
                </div>
            )}

            {message && (
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FaCheckCircle color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label className="glass-label">Corporate Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        disabled={loading}
                        className="glass-input"
                        placeholder="staff.identity@luxuryhotel.com"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="glass-button"
                    style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? <ImSpinner2 className="animate-spin" /> : "Request Reset Link"}
                </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                <Link to="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>
                    Back to Portal
                </Link>
            </div>

            <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Contact Concierge if you have trouble <br />
                Technical Support: +62 812-3456-789
            </p>
        </>
    );
}