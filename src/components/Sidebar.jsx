import { NavLink } from "react-router-dom";
import { FaChartPie, FaBed, FaCalendarCheck, FaUsers, FaCog, FaChartBar, FaConciergeBell, FaBell, FaFileInvoiceDollar, FaChartLine, FaBullhorn, FaSmile, FaComments, FaTasks, FaTags } from "react-icons/fa";
import { useChat } from "../context/ChatContext";

export default function Sidebar() {
    const { setPanelOpen, panelOpen, totalUnread } = useChat();

    const menuList = [
        { id: "dashboard", name: "Dashboard", icon: <FaChartPie />, to: "/" },
        { id: "reservations", name: "Reservasi", icon: <FaCalendarCheck />, to: "/reservations" },
        { id: "rooms", name: "Data Kamar", icon: <FaBed />, to: "/rooms" },
        { id: "guests", name: "Data Tamu", icon: <FaUsers />, to: "/guests" },
        { id: "helpdesk", name: "Help Desk", icon: <FaConciergeBell />, to: "/helpdesk" },
        { id: "notifications", name: "Notifikasi", icon: <FaBell />, to: "/notifications" },
        { id: "payments", name: "Keuangan", icon: <FaFileInvoiceDollar />, to: "/payments" },
        { id: "reports", name: "Laporan", icon: <FaChartBar />, to: "/reports" },
        { id: "forecasting", name: "Forecasting", icon: <FaChartLine />, to: "/forecasting" },
        { id: "marketing", name: "Pemasaran", icon: <FaBullhorn />, to: "/marketing" },
        { id: "feedback", name: "Kepuasan Tamu", icon: <FaSmile />, to: "/feedback" },
        { id: "tasks", name: "Tugas Staf", icon: <FaTasks />, to: "/tasks" },
        { id: "services", name: "Layanan", icon: <FaTags />, to: "/services" },
        { id: "settings", name: "Pengaturan", icon: <FaCog />, to: "/details" },
    ];


    return (
        <aside className="hotelify-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span>HotelQu</span>
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

                {/* Tombol Komunikasi Internal — buka panel chat */}
                <button
                    onClick={() => setPanelOpen(!panelOpen)}
                    className={`menu-item${panelOpen ? " active" : ""}`}
                    style={{
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        position: "relative",
                    }}
                >
                    <FaComments />
                    <span>Komunikasi</span>
                    {totalUnread > 0 && (
                        <span style={{
                            marginLeft: "auto",
                            minWidth: "18px",
                            height: "18px",
                            borderRadius: "9px",
                            backgroundColor: "var(--danger-color)",
                            color: "#fff",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 4px",
                        }}>
                            {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                    )}
                </button>
            </nav>
        </aside>
    );
}
