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
            case 'Ready': return 'bg-[#D4F1F8] text-[#2C7A8C]'; // Sky blue sangat muda
            case 'Occupied': return 'bg-[#E0F2FE] text-[#1E3A8A]';
            case 'Cleaning': return 'bg-[#FEF3C7] text-[#92400E]';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="bg-[#EBF6FA] min-h-screen p-3"> {/* Background sky blue sangat muda */}
            {/* Header Compact */}
            <div className="mb-4">
                <h1 className="font-heading text-xl font-bold text-[#2C7A8C]">Room Assets</h1> {/* Sky blue tua */}
                <p className="text-[9px] text-[#76D1E3] mt-0.5">Groom Room / Inventory</p> {/* Sky blue utama */}
            </div>

            {/* Room Grid - 2 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map((room) => (
                    <div 
                        key={room.id}
                        className="bg-white rounded-xl border border-[#C5EAF2] overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Header Card - GRADIENT SKY BLUE */}
                        <div className="px-4 py-3 bg-gradient-to-r from-[#76D1E3] to-[#5EC4D9] border-b border-[#A4DDEB] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[#D4F1F8] flex items-center justify-center text-[#2C7A8C]">
                                    <FaBed size={14} />
                                </div>
                                <div>
                                    <span className="font-bold text-white text-sm">Room {room.roomNo}</span>
                                    <p className="text-[8px] text-[#D4F1F8]">{room.type}</p>
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
                                <span className="text-lg font-black text-[#2C7A8C]">{formatPrice(room.price)}</span>
                                <span className="text-[8px] text-[#76D1E3] ml-1">/ night</span>
                            </div>

                            {/* Facilities Icons */}
                            <div className="flex gap-3 mb-3 pb-3 border-b border-[#D4F1F8]">
                                <div className="flex items-center gap-1">
                                    <FaUsers size={10} className="text-[#76D1E3]" />
                                    <span className="text-[9px] text-[#2C7A8C]">{room.capacity} guests</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaBed size={10} className="text-[#76D1E3]" />
                                    <span className="text-[9px] text-[#2C7A8C]">{room.bed}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaWifi size={10} className="text-[#76D1E3]" />
                                    <span className="text-[9px] text-[#2C7A8C]">Free WiFi</span>
                                </div>
                            </div>

                            {/* Action Buttons - WARNA SKY BLUE */}
                            <div className="flex gap-2">
                                <button className="flex-1 bg-[#76D1E3] hover:bg-[#5EC4D9] text-white text-[9px] font-bold py-2 rounded-lg transition-all">
                                    + ADD RESERVATION
                                </button>
                                <button className="px-3 py-2 border border-[#76D1E3] rounded-lg text-[9px] font-bold text-[#2C7A8C] hover:bg-[#D4F1F8] transition-all">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Stats - WARNA SKY BLUE */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-lg font-black text-[#2C7A8C]">4</p>
                    <p className="text-[7px] font-bold text-[#76D1E3] uppercase">Total Rooms</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-lg font-black text-[#76D1E3]">2</p>
                    <p className="text-[7px] font-bold text-[#76D1E3] uppercase">Ready</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-lg font-black text-[#76D1E3]">84%</p>
                    <p className="text-[7px] font-bold text-[#76D1E3] uppercase">Occupancy</p>
                </div>
            </div>
        </div>
    );
}