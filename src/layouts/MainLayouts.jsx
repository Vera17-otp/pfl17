import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainLayouts() {
    return (
        <SidebarProvider>
            <div className="hotelify-layout flex w-full">
                <Sidebar />
                
                <SidebarInset className="hotelify-main">
                    <Header />
                    
                    <main className="hotelify-content flex-1 overflow-auto">
                        {/* PageHeader might need to be styled or removed based on specific page needs, but keeping it for compatibility */}
                        <PageHeader /> 
                        
                        <div style={{ marginTop: '24px' }}>
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}