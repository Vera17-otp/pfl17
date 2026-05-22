import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function MainLayouts() {
    return (
        <div className="flex h-screen w-full bg-[#F0F4F8] font-sans text-slate-700 overflow-hidden">
            {/* Sidebar tetap di kiri */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Utama (Navigasi Atas) */}
                <Header />

                {/* Area Konten Utama */}
                <main className="flex-1 overflow-y-auto p-6"> 
                    {/* 1. PageHeader dipanggil di sini agar muncul */}
                    <PageHeader /> 

                    {/* 2. Beri jarak antara PageHeader dan Konten (Outlet) */}
                    <div className="mt-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}