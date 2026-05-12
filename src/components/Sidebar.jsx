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
        <aside className="w-52 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
            {/* Logo - Ukuran sedang */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <FaHome size={14} />
                    </div>
                    <div>
                        {/* Teks GroomFolio DIKECILKAN */}
                        
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[8px] font-medium text-slate-400">Vera Zakia</span>
                            <span className="text-[6px] bg-slate-200 px-1 rounded font-bold text-slate-500">MGR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu - 5 Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
                <ul className="space-y-1">
                    {menuList.map((item) => (
                        <li key={item.id}>
                            <NavLink 
                                to={item.to} 
                                className={({ isActive }) => `
                                    flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[10px] font-medium
                                    ${isActive 
                                        ? "bg-blue-500 text-white shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-500"}
                                `}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Tombol ADD */}
            <div className="p-3 mt-auto border-t border-slate-100">
                <button className="w-full flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[8px] font-bold py-2 rounded-lg transition-all">
                    <FaPlus size={8} /> ADD RESERVATION
                </button>
                <p className="text-center text-[6px] font-bold text-slate-300 mt-2">v2.0</p>
            </div>
        </aside>
    );
}