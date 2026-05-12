import { useState } from "react";
import { HiOutlineKey, HiOutlineHomeModern, HiOutlineShieldCheck, HiOutlineWifi } from "react-icons/hi2";
import { FaBed, FaWifi, FaUsers } from "react-icons/fa";

export default function Rooms() {
    const [rooms, setRooms] = useState([
        { id: 1, type: "Presidential Suite", roomNo: "101", price: 12500000, status: "Ready", capacity: 4, bed: "King", size: 120 },
        { id: 2, type: "Executive King", roomNo: "305", price: 4200000, status: "Occupied", capacity: 2, bed: "King", size: 65 },
        { id: 3, type: "Deluxe Family", roomNo: "212", price: 2800000, status: "Cleaning", capacity: 4, bed: "Queen + Single", size: 55 },
        { id: 4, type: "Luxury Twin", roomNo: "408", price: 3500000, status: "Ready", capacity: 2, bed: "Twin", size: 48 },
    ]);

    const formatPrice = (price) => {
        return `Rp ${(price / 1000).toFixed(0)}k`;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Ready': return 'bg-emerald-100 text-emerald-700';
            case 'Occupied': return 'bg-blue-100 text-blue-700';
            case 'Cleaning': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="bg-[#F0F4F8] min-h-screen p-3">
            {/* Header Compact */}
            <div className="mb-4">
                <h1 className="font-heading text-xl font-bold text-slate-800">Room Assets</h1>
                <p className="text-[9px] text-slate-400 mt-0.5">Groom Room / Inventory</p>
            </div>

            {/* Room Grid - 2 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map((room) => (
                    <div 
                        key={room.id}
                        className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Header Card */}
                        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FaBed size={14} />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700 text-sm">Room {room.roomNo}</span>
                                    <p className="text-[8px] text-slate-400">{room.type}</p>
                                </div>
                            </div>
                            <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${getStatusColor(room.status)}`}>
                                {room.status}
                            </span>
                        </div>

                        {/* Body Card */}
                        <div className="p-4">
                            {/* Price */}
                            <div className="mb-3">
                                <span className="text-lg font-black text-slate-800">{formatPrice(room.price)}</span>
                                <span className="text-[8px] text-slate-400 ml-1">/ night</span>
                            </div>

                            {/* Facilities Icons */}
                            <div className="flex gap-3 mb-3 pb-3 border-b border-slate-50">
                                <div className="flex items-center gap-1">
                                    <FaUsers size={10} className="text-slate-400" />
                                    <span className="text-[9px] text-slate-500">{room.capacity} guests</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaBed size={10} className="text-slate-400" />
                                    <span className="text-[9px] text-slate-500">{room.bed}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaWifi size={10} className="text-slate-400" />
                                    <span className="text-[9px] text-slate-500">Free WiFi</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-[9px] font-bold py-2 rounded-lg transition-all">
                                    + ADD RESERVATION
                                </button>
                                <button className="px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 hover:bg-slate-50 transition-all">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-slate-100 shadow-sm">
                    <p className="text-lg font-black text-slate-800">4</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase">Total Rooms</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slate-100 shadow-sm">
                    <p className="text-lg font-black text-emerald-600">2</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase">Ready</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-slate-100 shadow-sm">
                    <p className="text-lg font-black text-blue-600">84%</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase">Occupancy</p>
                </div>
            </div>
        </div>
    );
}