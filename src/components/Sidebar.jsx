import { NavLink } from "react-router-dom";
import { FaChartPie, FaBed, FaCalendarCheck, FaUsers, FaCog, FaPuzzlePiece } from "react-icons/fa";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

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
        <ShadcnSidebar className="hotelify-sidebar">
            <SidebarHeader className="sidebar-header p-4 border-b">
                <div className="sidebar-logo font-bold text-xl text-blue-600">
                    <span>Hotelify</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuList.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton asChild>
                                        <NavLink 
                                            to={item.to} 
                                            className={({ isActive }) => `flex items-center gap-3 py-2 ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-900"}`}
                                        >
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </ShadcnSidebar>
    );
}