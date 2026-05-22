import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { reservations } from "../data/reservations";
import { 
    HiPlus, 
    HiOutlineSearch, 
    HiOutlineDocumentDownload, 
    HiDotsHorizontal,
    HiOutlineCube
} from "react-icons/hi";

export default function Reservations({ searchTerm = "" }) {
    const [showModal, setShowModal] = useState(false);

    const filtered = reservations.filter((res) =>
        res.guestName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#EBF6FA] p-4 md:p-6"> {/* Background sky blue sangat muda */}
            
            <div className="relative z-10 max-w-full mx-auto">
                
                <PageHeader
                    title="Reservations"
                    breadcrumb={["Operations", "Reservations"]}
                >
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#C5EAF2] text-slate-500 rounded-lg hover:text-[#76D1E3] transition-all text-xs font-bold">
                            <HiOutlineDocumentDownload className="text-base" />
                            Report
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="group flex items-center gap-2 px-5 py-2 bg-[#76D1E3] text-white rounded-lg hover:bg-[#5EC4D9] transition-all text-xs font-bold shadow-sm"
                        >
                            <HiPlus className="text-base" />
                            Create Order
                        </button>
                    </div>
                </PageHeader>

                {/* TABLE */}
                <div className="mt-4 bg-white rounded-xl border border-[#C5EAF2] overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[#D4F1F8] bg-[#F0F9FC]">
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#5EC4D9]">Order Ref</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#5EC4D9]">Client</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#5EC4D9] text-center">Status</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#5EC4D9] text-right">Revenue</th>
                                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#5EC4D9] text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D4F1F8]">
                                {filtered.length > 0 ? (
                                    filtered.map((res) => (
                                        <tr key={res.bookingId} className="group hover:bg-[#EBF6FA] transition-all">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#76D1E3]">
                                                    <span className="w-2 h-2 bg-[#76D1E3] rounded-full"></span>
                                                    {res.bookingId}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#D4F1F8] flex items-center justify-center font-bold text-[#2C7A8C] text-xs">
                                                        {res.guestName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{res.guestName}</div>
                                                        <div className="text-[9px] text-[#76D1E3] mt-0.5">{res.checkIn}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase
                                                    ${res.status === 'Check-in' 
                                                        ? 'bg-[#CCFBF1] text-[#0F766E]' 
                                                        : res.status === 'Booked' 
                                                        ? 'bg-[#FEF3C7] text-[#92400E]' 
                                                        : 'bg-[#D4F1F8] text-[#2C7A8C]'}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-[#2C7A8C] text-sm">
                                                Rp {(res.totalPayment / 1000).toFixed(0)}k
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="p-1.5 text-[#76D1E3] hover:text-[#2C7A8C] rounded-lg hover:bg-[#D4F1F8] transition-all">
                                                    <HiDotsHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center opacity-50">
                                                <HiOutlineCube className="text-4xl mb-2 text-[#76D1E3]" />
                                                <p className="text-xs font-bold uppercase text-[#76D1E3]">No Data</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL - WARNA SKY BLUE */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></div>
                        
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="mb-5 text-center">
                                <div className="w-14 h-14 bg-[#76D1E3] text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <HiPlus className="text-2xl" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Register Order</h2>
                                <p className="text-xs text-[#76D1E3] mt-1">Initialize a new transaction</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-bold uppercase text-[#5EC4D9] mb-1.5">Customer Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Full Name" 
                                        className="w-full bg-slate-50 border border-[#C5EAF2] rounded-lg px-4 py-2.5 text-sm focus:border-[#76D1E3] focus:ring-2 focus:ring-[#D4F1F8] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold uppercase text-[#5EC4D9] mb-1.5">Room Number</label>
                                    <input 
                                        type="text"
                                        placeholder="Room No" 
                                        className="w-full bg-slate-50 border border-[#C5EAF2] rounded-lg px-4 py-2.5 text-sm focus:border-[#76D1E3] focus:ring-2 focus:ring-[#D4F1F8] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-[#76D1E3] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#5EC4D9] transition-all shadow-sm"
                                >
                                    CONFIRM
                                </button>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 text-slate-500 font-bold text-sm hover:text-rose-500 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}