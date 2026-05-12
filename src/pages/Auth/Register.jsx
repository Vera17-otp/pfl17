import { HiOutlineUserAdd, HiOutlineMail, HiOutlineKey, HiOutlineSparkles } from "react-icons/hi";
import { Link } from "react-router-dom"; // Jika menggunakan React Router

export default function Register() {
    return (
        <div className="relative font-sans text-slate-900">
            {/* --- TOP HEADER: HOTEL BRANDING --- */}
            <div className="text-center mb-10">
                {/* ICON USER ADD WITH AMBER GLOW */}
                <div className="relative w-20 h-20 bg-slate-900 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-amber-500/20">
                    <HiOutlineUserAdd className="text-4xl" />
                    <HiOutlineSparkles className="absolute -top-2 -right-2 text-amber-400 text-xl animate-pulse" />
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
                    Staf Onboarding
                </h2>
                <p className="text-slate-400 text-sm mt-3 font-medium uppercase tracking-[0.15em]">
                    Create Internal Account
                </p>
            </div>

            {/* --- REGISTRATION FORM --- */}
            <form className="space-y-6">
                {/* FULL NAME FIELD */}
                <div className="group">
                    <label 
                        htmlFor="name"
                        className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-amber-600"
                    >
                        Legal Full Name
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="name"
                            required
                            className="w-full bg-slate-50 border-none rounded-[1.5rem] px-7 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/10 focus:bg-white shadow-inner transition-all placeholder:text-slate-300"
                            placeholder="e.g. Jonathan Wick"
                        />
                    </div>
                </div>

                {/* EMAIL FIELD */}
                <div className="group">
                    <label 
                        htmlFor="email"
                        className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-amber-600"
                    >
                        Corporate Email Identity
                    </label>
                    <div className="relative">
                        <HiOutlineMail className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="email"
                            id="email"
                            required
                            className="w-full bg-slate-50 border-none rounded-[1.5rem] pl-16 pr-7 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/10 focus:bg-white shadow-inner transition-all placeholder:text-slate-300"
                            placeholder="staff.name@luxuryhotel.com"
                        />
                    </div>
                </div>

                {/* PASSWORD & CONFIRM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label 
                            htmlFor="password"
                            className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-amber-600"
                        >
                            Secure Key
                        </label>
                        <div className="relative">
                            <HiOutlineKey className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="password"
                                id="password"
                                required
                                className="w-full bg-slate-50 border-none rounded-[1.5rem] pl-16 pr-7 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/10 focus:bg-white shadow-inner transition-all placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label 
                            htmlFor="confirmPassword"
                            className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-amber-600"
                        >
                            Verify Key
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="confirmPassword"
                                required
                                className="w-full bg-slate-50 border-none rounded-[1.5rem] px-7 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/10 focus:bg-white shadow-inner transition-all placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-amber-600 shadow-2xl shadow-slate-200 hover:shadow-amber-100 transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-[0.2em] text-xs"
                    >
                        Register Internal Profile
                    </button>
                </div>
            </form>

            {/* --- FOOTER: LOGIN LINK --- */}
            <div className="mt-12 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    Already authorized? <Link to="/login" className="font-black text-amber-600 hover:text-slate-900 transition-colors">Sign in to Portal</Link>
                </p>
            </div>
        </div>
    );
}