import { useState } from "react";
import { FaPlus, FaStar, FaBed, FaUserFriends, FaSearch, FaWifi } from "react-icons/fa";

export default function RoomManagement() {
    const [rooms] = useState([
        { id: 1, name: "Presidential Suite", price: 4500000, stock: 2, rating: 5.0, status: "Premium", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400", beds: "King Size", guests: 4 },
        { id: 2, name: "Deluxe Ocean View", price: 1250000, stock: 15, rating: 4.9, status: "Best Seller", img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=400", beds: "King Size", guests: 2 },
        { id: 3, name: "Family Garden Wing", price: 1850000, stock: 5, rating: 4.8, status: "Spacious", img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=400", beds: "Queen Size", guests: 4 },
        { id: 4, name: "Superior Urban", price: 850000, stock: 24, rating: 4.7, status: "New", img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=400", beds: "Single Bed", guests: 2 },
    ]);

    const formatPrice = (price) => {
        return `Rp ${price.toLocaleString('id-ID')}`;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Premium': return 'bg-amber-500 text-white';
            case 'Best Seller': return 'bg-[#76D1E3] text-white'; // Sky blue
            case 'Spacious': return 'bg-[#2C7A8C] text-white'; // Sky blue tua
            default: return 'bg-[#5EC4D9] text-white'; // Sky blue medium
        }
    };

    return (
        <div className="bg-[#EBF6FA] min-h-screen p-3"> {/* Background sky blue sangat muda */}
            {/* Header Compact */}
            <div className="mb-3">
                <h1 className="font-heading text-base font-bold text-[#2C7A8C]">Room Management</h1> {/* Sky blue tua */}
                <p className="text-[9px] text-[#76D1E3]">Inventory / Room List</p> {/* Sky blue utama */}
            </div>

            {/* Search Bar */}
            <div className="flex justify-between items-center gap-3 mb-3">
                <div className="relative flex-1 max-w-xs">
                    <input 
                        type="text" 
                        placeholder="Search room type..."
                        className="w-full bg-white border border-[#C5EAF2] rounded-md py-1.5 pl-7 pr-3 text-[10px] focus:border-[#76D1E3] focus:ring-1 focus:ring-[#D4F1F8] outline-none"
                    />
                    <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-[#76D1E3] text-[9px]" />
                </div>
                <button className="bg-[#76D1E3] hover:bg-[#5EC4D9] text-white text-[9px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-sm transition-all">
                    <FaPlus size={9} /> ADD ROOM
                </button>
            </div>

            {/* Room Grid - 2 kolom agar rapi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-lg border border-[#C5EAF2] overflow-hidden shadow-sm hover:shadow-md transition-all">
                        
                        {/* Image + Info Row */}
                        <div className="flex gap-3 p-3">
                            {/* Gambar - ukuran kecil */}
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                    src={room.img} 
                                    alt={room.name} 
                                    className="w-full h-full object-cover"
                                />
                                {/* Status Badge kecil */}
                                <div className="absolute top-1 left-1">
                                    <span className={`text-[6px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(room.status)}`}>
                                        {room.status}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm truncate">{room.name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <FaStar className="text-amber-400 text-[8px]" />
                                            <span className="text-[9px] font-medium text-slate-600">{room.rating}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-[#76D1E3]">{room.stock} left</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mt-1">
                                    <span className="text-sm font-black text-[#2C7A8C]">{formatPrice(room.price)}</span>
                                    <span className="text-[7px] text-[#76D1E3] ml-0.5">/night</span>
                                </div>

                                {/* Facilities */}
                                <div className="flex gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                        <FaBed size={9} className="text-[#76D1E3]" />
                                        <span className="text-[8px] text-[#5EC4D9]">{room.beds}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaUserFriends size={9} className="text-[#76D1E3]" />
                                        <span className="text-[8px] text-[#5EC4D9]">{room.guests}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaWifi size={9} className="text-[#76D1E3]" />
                                        <span className="text-[8px] text-[#5EC4D9]">WiFi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 p-3 pt-0">
                            <button className="flex-1 bg-[#76D1E3] hover:bg-[#5EC4D9] text-white text-[8px] font-bold py-1.5 rounded-md transition-all shadow-sm">
                                + ADD RESERVATION
                            </button>
                            <button className="px-3 py-1.5 border border-[#C5EAF2] rounded-md text-[8px] font-bold text-[#5EC4D9] hover:bg-[#EBF6FA] transition-all">
                                Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Stats - WARNA SKY BLUE */}
            <div className="mt-3 grid grid-cols-4 gap-2">
                <div className="bg-white rounded-md p-2 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-sm font-black text-[#2C7A8C]">4</p>
                    <p className="text-[6px] font-bold text-[#76D1E3] uppercase">Room Types</p>
                </div>
                <div className="bg-white rounded-md p-2 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-sm font-black text-[#2C7A8C]">46</p>
                    <p className="text-[6px] font-bold text-[#76D1E3] uppercase">Total Units</p>
                </div>
                <div className="bg-white rounded-md p-2 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-sm font-black text-[#76D1E3]">24</p>
                    <p className="text-[6px] font-bold text-[#76D1E3] uppercase">Available</p>
                </div>
                <div className="bg-white rounded-md p-2 text-center border border-[#C5EAF2] shadow-sm">
                    <p className="text-sm font-black text-[#76D1E3]">84%</p>
                    <p className="text-[6px] font-bold text-[#76D1E3] uppercase">Occupancy</p>
                </div>
            </div>
        </div>
    );
}