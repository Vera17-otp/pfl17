import axios from "axios";
import { useState } from "react";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
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
        axios.post("https://dummyjson.com/user/login", {
            username: dataForm.username,
            password: dataForm.password,
        })
        .then(() => navigate("/"))
        .catch((err) => setError(err.response?.data?.message || "Authentication failed"))
        .finally(() => setLoading(false));
    };

    return (
        <>
            {error && (
                <div className="bg-rose-50 border border-rose-100 mb-4 p-3 rounded-lg flex items-center gap-2">
                    <BsFillExclamationDiamondFill className="text-rose-500" />
                    <p className="text-xs font-medium text-rose-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email/Username Field */}
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            name="username"
                            onChange={handleChange}
                            type="text"
                            required
                            placeholder="Email Address"
                            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-[#6395f9] placeholder-slate-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            name="password"
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-400 placeholder-slate-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6395f9]"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Checkbox & Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#6395f9] focus:ring-[#6395f9]" />
                        <span className="text-xs text-slate-400">Keep me logged in</span>
                    </label>
                    <button type="button" className="text-xs text-[#6395f9] font-medium hover:underline">
                        Forgot password ?
                    </button>
                </div>

                {/* Login Button - Warna Biru Soft sesuai gambar */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6c9cf9] hover:bg-[#5a8be5] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? <ImSpinner2 className="animate-spin" /> : "Log in"}
                </button>
            </form>

            <div className="mt-6">
                <p className="text-sm text-slate-400">
                    Dont have an account ?{' '}
                    <button onClick={() => navigate("/register")} className="text-[#3c5a99] font-bold hover:underline">
                        Sign in
                    </button>
                </p>
            </div>
        </>
    );
}