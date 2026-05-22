import { NavLink } from "react-router-dom";
import { FaHome, FaBed, FaCalendarCheck, FaUsers, FaInfoCircle, FaPlus } from "react-icons/fa";

export default function Sidebar() {
    const menuList = [
        { id: "dashboard", name: "Dashboard", icon: <FaHome size={13} />, to: "/" },
        { id: "rooms", name: "Room List", icon: <FaBed size={13} />, to: "/rooms" },
        { id: "reservations", name: "Reservations", icon: <FaCalendarCheck size={13} />, to: "/reservations" },
        { id: "guests", name: "Guest List", icon: <FaUsers size={13} />, to: "/guest" },
        { id: "details", name: "Details", icon: <FaInfoCircle size={13} />, to: "/details" },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 font-sans">
            {/* Header - Vera Zakia MGR */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[13px] font-semibold text-gray-800">Vera Zakia</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">MGR</div>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">Dashboard</div>
                </div>
            </div>

            {/* GroomFolio dengan LISTING On */}
            <div className="px-5 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="text-[18px] font-bold text-gray-800 tracking-wide">GroomFolio</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">LISTING</span>
                        <div className="w-7 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white">On</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Occupants label */}
            <div className="px-5 pt-4 pb-1">
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Occupants</span>
            </div>

            {/* Menu - HANYA 5 MENU, tidak ada yang lain */}
            <nav className="flex-1 overflow-y-auto px-3 py-1">
                <ul className="space-y-0.5">
                    {menuList.map((item) => (
                        <li key={item.id}>
                            <NavLink 
                                to={item.to} 
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 text-[13px] font-medium
                                    ${isActive 
                                        ? "bg-blue-50 text-blue-600" 
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                                `}
                            >
                                <span className={({ isActive }) => isActive ? "text-blue-500" : "text-gray-400"}>
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Tombol ADD RESERVATION */}
            <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold py-2.5 rounded-md transition-all shadow-sm">
                    <FaPlus size={10} /> ADD RESERVATION
                </button>
                <p className="text-center text-[8px] font-medium text-gray-300 mt-3">v2.0</p>
            </div>
        </aside>
    );
}