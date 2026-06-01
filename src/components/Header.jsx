import { useState } from "react";
import { FaBell, FaSearch, FaEnvelope } from "react-icons/fa";
import Input from "./ui/form/Input";
import Avatar from "./ui/basic/Avatar";

export default function Header({ searchTerm, setSearchTerm }) {
    return (
        <header className="hotelify-header">
            <div style={{ width: '350px' }}>
                <Input 
                    icon={<FaSearch />}
                    type="text" 
                    placeholder="Search bookings, guests, or rooms..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                    style={{ backgroundColor: 'transparent', border: 'none', width: '100%', outline: 'none' }}
                />
            </div>

            <div className="header-actions">
                <button className="icon-btn">
                    <FaEnvelope />
                    <span className="badge">3</span>
                </button>
                <button className="icon-btn">
                    <FaBell />
                    <span className="badge">5</span>
                </button>
                
                <div className="user-profile">
                    <div className="user-info" style={{ textAlign: 'right' }}>
                        <span className="user-name">Vera Zakia</span>
                        <span className="user-role">General Manager</span>
                    </div>
                    <Avatar fallback="VZ" />
                </div>
            </div>
        </header>
    );
}