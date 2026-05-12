import { HiOutlineMail, HiOutlineArrowLeft } from "react-icons/hi";
import { Link } from "react-router-dom"; // Jika menggunakan React Router

export default function Forgot() {
    return (
        <div className="relative">
            {/* BACK BUTTON - Small & Elegant */}
            <Link 
                to="/login" 
                className="absolute -top-12 left-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-600 transition-colors"
            >
                <HiOutlineArrowLeft className="text-sm" />
                Back to Portal
            </Link>

            <div className="text-center mb-10">
                {/* ICON ENVELOPE WITH GLOW */}
                <div className="w-16 h-16 bg-slate-900 text-amber-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 border border-amber-500/20">
                    <HiOutlineMail className="text-3xl" />
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                    Security Recovery
                </h2>
                <p className="text-slate-400 text-sm mt-3 font-medium">
                    Enter your credentials to receive a secure <br /> authentication link.
                </p>
            </div>

            <form className="space-y-6">
                <div className="group">
                    <label 
                        htmlFor="email"
                        className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-2 transition-colors group-focus-within:text-amber-600"
                    >
                        Corporate Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            className="w-full bg-slate-50 border-none rounded-[1.2rem] px-6 py-4 text-slate-700 font-bold focus:ring-4 focus:ring-amber-500/10 focus:bg-white shadow-inner transition-all placeholder:text-slate-300"
                            placeholder="staff.identity@luxuryhotel.com"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-amber-600 shadow-2xl shadow-amber-100 transition-all hover:-translate-y-1 active:translate-y-0 uppercase tracking-[0.1em] text-xs"
                    >
                        Request Reset Link
                    </button>
                </div>
            </form>

            {/* FOOTER NOTE */}
            <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Contact Concierge if you have trouble <br /> 
                <span className="text-slate-300">Technical Support: +62 812-3456-789</span>
            </p>
        </div>
    );
}