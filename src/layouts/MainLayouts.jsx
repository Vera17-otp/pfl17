import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function MainLayouts() {
    return (
        <div className="hotelify-layout">
            <Sidebar />
            
            <div className="hotelify-main">
                <Header />
                
                <main className="hotelify-content">
                    {/* PageHeader might need to be styled or removed based on specific page needs, but keeping it for compatibility */}
                    <PageHeader /> 
                    
                    <div style={{ marginTop: '24px' }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}