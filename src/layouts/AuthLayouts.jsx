import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
            {/* Main Container */}
            <div className="bg-white w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden">
                
                {/* SISI KIRI: Image Section (Dengan border ungu tebal sesuai gambar) */}
                <div className="hidden md:block md:w-[45%] p-6">
                    <div className="w-full h-[650px] border-[3px] border-purple-500 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
                            alt="Interior" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* SISI KANAN: Form Section */}
                <div className="w-full md:w-[55%] flex flex-col justify-center px-8 md:px-16 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-5xl font-semibold text-[#6395f9] mb-2">Login</h2>
                        <p className="text-slate-400 text-sm">please enter your login detail to sign in</p>
                    </div>

                    {/* Outlet untuk form Login */}
                    <Outlet />

                    {/* Footer / Social Login */}
                    <div className="mt-10">
                        <div className="relative flex items-center mb-8">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-xs text-slate-400">or continue with</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>
                        
                        <div className="flex justify-center gap-6">
                            {/* Icon Buttons (Mocking the icons in image) */}
                            {['apple', 'google', 'twitter', 'facebook'].map((brand) => (
                                <button key={brand} className="w-12 h-12 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all">
                                    <img 
                                        src={`https://cdn-icons-png.flaticon.com/512/732/7322${brand === 'apple' ? '00' : brand === 'google' ? '45' : brand === 'twitter' ? '51' : '02'}.png`} 
                                        className="w-6 h-6 opacity-80" 
                                        alt={brand} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}