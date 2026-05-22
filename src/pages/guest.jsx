import { useState } from "react";
import { guests } from "../data/guest";
import { HiSearch, HiFilter, HiOutlineCloudDownload } from "react-icons/hi";
import { FaPaw, FaUserPlus } from "react-icons/fa";

export default function Guests() {
    const [search, setSearch] = useState("");
    const guestList = Array.isArray(guests) ? guests : [];
    
    const filteredGuests = guestList.filter(g => 
        g?.guestName?.toLowerCase().includes(search.toLowerCase()) ||
        g?.email?.toLowerCase().includes(search.toLowerCase())
    );

    // Generate random totalStay untuk contoh (karena di data gak ada)
    const getRandomStay = (id) => {
        const stays = [2, 3, 5, 7, 10, 14];
        return stays[id % stays.length];
    };

    return (
        <div className="bg-[#EBF6FA] min-h-screen p-3"> {/* Background sky blue sangat muda */}
            {/* Header */}
            <div className="mb-3">
                <h1 className="text-base font-bold text-[#2C7A8C]">Guest Directory</h1> {/* Sky blue tua */}
                <p className="text-[9px] text-[#76D1E3]">Management / Guests</p> {/* Sky blue utama */}
            </div>

            {/* Search + Actions */}
            <div className="flex justify-between items-center mb-3">
                <div className="relative w-56">
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search guests..."
                        className="w-full bg-white border border-[#C5EAF2] rounded-md py-1 pl-7 text-[10px] focus:outline-none focus:border-[#76D1E3] focus:ring-1 focus:ring-[#D4F1F8]"
                    />
                    <HiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[#76D1E3] text-[10px]" />
                </div>
                <div className="flex gap-1.5">
                    <div className="bg-[#D4F1F8] text-[#2C7A8C] px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
                        <FaPaw size={8} /> +12%
                    </div>
                    <button className="bg-white border border-[#C5EAF2] px-2 py-0.5 rounded text-[8px] font-bold text-[#5EC4D9] hover:bg-[#EBF6FA] transition-all">
                        FILTER
                    </button>
                    <button className="bg-white border border-[#C5EAF2] px-2 py-0.5 rounded text-[8px] font-bold text-[#5EC4D9] hover:bg-[#EBF6FA] transition-all">
                        EXPORT
                    </button>
                    <button className="bg-[#76D1E3] text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 hover:bg-[#5EC4D9] transition-all shadow-sm">
                        <FaUserPlus size={8} /> ADD
                    </button>
                </div>
            </div>

            {/* Guest Cards - Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredGuests.map((g, idx) => (
                    <div key={g?.guestId} className="bg-white rounded-md border border-[#C5EAF2] p-2 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-[#D4F1F8] flex items-center justify-center text-[#2C7A8C] font-bold text-xs">
                                {g?.guestName?.charAt(0) || "?"}
                            </div>
                            <div>
                                <div className="font-bold text-slate-700 text-xs">{g?.guestName || "Unknown"}</div>
                                <div className="text-[7px] text-[#76D1E3]">ID: {g?.guestId || "-"}</div>
                            </div>
                        </div>
                        <div className="mt-1.5 pt-1.5 border-t border-[#D4F1F8] flex justify-between items-center">
                            <div>
                                <span className={`text-[6px] font-bold px-1 py-0.5 rounded ${
                                    g?.membership === 'Platinum' ? 'bg-[#2C7A8C] text-white' :
                                    g?.membership === 'Gold' ? 'bg-[#FEF3C7] text-[#92400E]' :
                                    g?.membership === 'Silver' ? 'bg-[#C5EAF2] text-[#2C7A8C]' : 'bg-[#D4F1F8] text-[#5EC4D9]'
                                }`}>
                                    {g?.membership || "Basic"}
                                </span>
                                <span className="text-[7px] text-[#76D1E3] ml-1.5">{getRandomStay(idx)} nights</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-[6px] text-[#76D1E3]">{g?.origin?.slice(0,3) || "IDN"}</span>
                                <button className="text-[#76D1E3] text-[7px] font-bold hover:text-[#2C7A8C] transition-all">Send →</button>
                            </div>
                        </div>
                        {/* Email dan Phone - tambahan info */}
                        <div className="mt-1 text-[6px] text-[#76D1E3] truncate">
                            {g?.email} | {g?.phone}
                        </div>
                    </div>
                ))}
            </div>

            {/* Jika tidak ada data */}
            {filteredGuests.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-[10px] text-[#76D1E3]">No guests found</p>
                </div>
            )}
        </div>
    );
}