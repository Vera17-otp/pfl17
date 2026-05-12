import { useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { SlSettings } from "react-icons/sl";

export default function Header({ searchTerm, setSearchTerm }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="h-12 flex justify-between items-center px-4 bg-white border-b border-slate-100 sticky top-0 z-50">
                
                <div className="relative w-64">
                    <input
                        onClick={() => setShowModal(true)}
                        readOnly
                        type="text"
                        placeholder="Search hotel occupants..."
                        className="bg-slate-50 border border-slate-200 text-[10px] px-3 py-1.5 pl-8 w-full rounded-md outline-none focus:border-blue-400 cursor-pointer"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors relative">
                            <FaBell size={14} />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white"></span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                            <SlSettings size={14} />
                        </button>
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-700">Vera Zakia</p>
                            <p className="text-[7px] text-blue-500 font-bold uppercase tracking-wider">Manager</p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">
                            VZ
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-start justify-center z-[999] pt-20 p-4">
                    <div className="bg-white p-4 rounded-lg w-full max-w-md shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">SEARCH OCCUPANTS</h2>
                            <button onClick={() => setShowModal(false)} className="text-[8px] font-bold text-slate-400 hover:text-rose-500">ESC</button>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find guest by name or room..."
                            className="w-full bg-slate-50 p-2 rounded-md text-xs border border-slate-200 focus:border-blue-400 outline-none transition-all"
                        />
                        <div className="mt-3 flex justify-end">
                            <button onClick={() => setShowModal(false)} className="bg-blue-500 text-white px-4 py-1.5 rounded-md font-bold text-[9px]">Search</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}