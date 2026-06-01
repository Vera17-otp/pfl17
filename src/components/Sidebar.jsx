import { NavLink } from "react-router-dom";
import { FaChartPie, FaBed, FaCalendarCheck, FaUsers, FaCog, FaPuzzlePiece } from "react-icons/fa";

export default function Sidebar() {
    const menuList = [
        { id: "dashboard", name: "Dashboard", icon: <FaChartPie />, to: "/" },
        { id: "reservations", name: "Reservations", icon: <FaCalendarCheck />, to: "/reservations" },
        { id: "guests", name: "Guest List", icon: <FaUsers />, to: "/guest" },
        { id: "rooms", name: "Rooms", icon: <FaBed />, to: "/rooms" },
        { id: "settings", name: "Settings", icon: <FaCog />, to: "/details" },
        { id: "components", name: "Components", icon: <FaPuzzlePiece />, to: "/components" },
    ];

    return (
        <aside className="hotelify-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span>Hotelify</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                {menuList.map((item) => (
                    <NavLink 
                        key={item.id}
                        to={item.to} 
                        className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}