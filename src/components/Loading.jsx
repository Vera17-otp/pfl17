export default function Loading() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#F8FAFC]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-900 font-bold text-sm tracking-widest animate-pulse">PREPARING YOUR DASHBOARD...</p>
        </div>
    );
}