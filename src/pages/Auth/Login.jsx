import axios from "axios";
import { useState } from "react";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dataForm, setDataForm] = useState({
        username: "",  // <-- PAKAI username, BUKAN email
        password: "",
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        axios
            .post("https://dummyjson.com/user/login", {
                username: dataForm.username,  // <-- username, BUKAN email
                password: dataForm.password,
            })
            .then((response) => {
                if (response.status !== 200) {
                    setError(response.data.message);
                    return;
                }
                navigate("/");
            })
            .catch((err) => {
                const msg = err.response?.data?.message || err.message || "Authentication failed";
                setError(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            {/* Error Notification */}
            {error && (
                <div className="bg-rose-50 border border-rose-100 mb-4 p-3 rounded-xl flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                        <BsFillExclamationDiamondFill size={10} />
                    </div>
                    <p className="text-[9px] font-bold text-rose-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username Field */}
                <div>
                    <label className="block text-[9px] font-semibold text-slate-600 mb-1">
                        Username
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaUser size={12} />
                        </div>
                        <input
                            name="username"
                            onChange={handleChange}
                            type="text"
                            required
                            placeholder="emilys"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-[9px] font-semibold text-slate-600 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaLock size={12} />
                        </div>
                        <input
                            name="password"
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="emilyspass"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-9 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
                        </button>
                    </div>
                    <div className="text-right mt-1">
                        <button 
                            type="button" 
                            onClick={() => navigate("/forgot")}
                            className="text-[8px] text-blue-500 hover:text-blue-600 font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-semibold py-2 rounded-lg transition-all shadow-md shadow-blue-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <ImSpinner2 className="animate-spin text-xs" />
                            Authenticating...
                        </>
                    ) : (
                        "Sign in"
                    )}
                </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-[8px] text-slate-400 mt-3">
                Don't have an account yet?{' '}
                <button 
                    type="button" 
                    onClick={() => navigate("/register")}
                    className="text-blue-500 font-semibold hover:underline"
                >
                    Register for free
                </button>
            </p>
        </>
    );
}