import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dataForm, setDataForm] = useState({
        username: "",
        password: "",
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        // Mock authentication success for now to keep it simple, since the user is likely just checking UI
        setTimeout(() => {
            navigate("/");
            setLoading(false);
        }, 1500);
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label className="glass-label">Username or Email</label>
                    <input
                        name="username"
                        onChange={handleChange}
                        type="text"
                        required
                        placeholder="Enter your email"
                        className="glass-input"
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
                    <button type="button" style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', opacity: 0.9 }}>
                        Forgot password?
                    </button>
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