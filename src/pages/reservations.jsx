import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { reservations } from "../data/reservations"; // <-- GANTI dari orders ke reservations
import { 
    HiPlus, 
    HiOutlineSearch, 
    HiOutlineDocumentDownload, 
    HiDotsHorizontal,
    HiOutlineCube
} from "react-icons/hi";

export default function Reservations({ searchTerm = "" }) {  // <-- GANTI nama component
    const [showModal, setShowModal] = useState(false);

    const filtered = reservations.filter((res) =>  // <-- GANTI dari orders ke reservations
        res.guestName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F0F4F8] p-3">
            
            <div className="relative z-10 max-w-full mx-auto">
                
                <PageHeader
                    title="Reservations"
                    breadcrumb={["Operations", "Reservations"]}
                >
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-md hover:text-blue-500 transition-all text-[9px] font-bold">
                            <HiOutlineDocumentDownload className="text-sm" />
                            Report
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="group flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all text-[9px] font-bold"
                        >
                            <HiPlus className="text-sm" />
                            Create Order
                        </button>
                    </div>
                </PageHeader>

                {/* TABLE */}
                <div className="mt-3 bg-white rounded-md border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-3 py-2 text-[8px] uppercase font-bold text-slate-400">Order Ref</th>
                                    <th className="px-3 py-2 text-[8px] uppercase font-bold text-slate-400">Client</th>
                                    <th className="px-3 py-2 text-[8px] uppercase font-bold text-slate-400 text-center">Status</th>
                                    <th className="px-3 py-2 text-[8px] uppercase font-bold text-slate-400 text-right">Revenue</th>
                                    <th className="px-3 py-2 text-[8px] uppercase font-bold text-slate-400 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length > 0 ? (
                                    filtered.map((res) => (
                                        <tr key={res.bookingId} className="group hover:bg-slate-50 transition-all">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-blue-500">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                    {res.bookingId}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-[9px]">
                                                        {res.guestName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-[10px]">{res.guestName}</div>
                                                        <div className="text-[7px] text-slate-400">{res.checkIn}</div>
                                                    </div>
                                                </div>
                                             </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[7px] font-bold uppercase
                                                    ${res.status === 'Check-in' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : res.status === 'Booked' 
                                                        ? 'bg-amber-100 text-amber-600' 
                                                        : 'bg-slate-100 text-slate-500'}`}>
                                                    {res.status}
                                                </span>
                                             </td>
                                            <td className="px-3 py-2 text-right font-bold text-slate-700 text-[9px]">
                                                Rp {(res.totalPayment / 1000).toFixed(0)}k
                                             </td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="p-1 text-slate-300 hover:text-slate-600 rounded">
                                                    <HiDotsHorizontal size={12} />
                                                </button>
                                             </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-8 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <HiOutlineCube className="text-3xl mb-1" />
                                                <p className="text-[9px] font-bold uppercase">No Data</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></div>
                        
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-5">
                            <div className="mb-4 text-center">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <HiPlus className="text-xl" />
                                </div>
                                <h2 className="text-base font-bold text-slate-800">Register Order</h2>
                                <p className="text-[9px] text-slate-400 mt-0.5">Initialize a new transaction</p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[7px] font-bold uppercase text-slate-400 mb-1">Customer Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Full Name" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[10px] focus:border-blue-400 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[7px] font-bold uppercase text-slate-400 mb-1">Room Number</label>
                                    <input 
                                        type="text"
                                        placeholder="Room No" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[10px] focus:border-blue-400 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-blue-500 text-white font-bold py-2 rounded-md text-[9px] hover:bg-blue-600"
                                >
                                    CONFIRM
                                </button>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 text-slate-400 font-bold text-[9px] hover:text-rose-500"
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