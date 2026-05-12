import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center relative">
            {/* Background Image Hotel */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070" 
                    alt="Hotel Background" 
                    className="w-full h-full object-cover"
                />
                {/* Overlay gelap agar teks terbaca */}
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Card Login - di tengah */}
            <div className="relative z-10 w-full max-w-sm mx-auto p-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                    
                    {/* Header with Logo */}
                    <div className="px-5 pt-5 pb-3 text-center border-b border-slate-100">
                        <div className="flex justify-center mb-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">G</span>
                            </div>
                        </div>
                        <h1 className="text-base font-bold text-slate-800">Login</h1>
                        <p className="text-[9px] text-slate-400 mt-0.5">Welcome back! Please login to your account</p>
                    </div>

                    {/* Form Area */}
                    <div className="px-4 py-4">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-slate-50/80 text-center border-t border-slate-100">
                        <p className="text-[7px] text-slate-400">
                            © 2026 GroomFolio Hospitality
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}