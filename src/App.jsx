import React, { Suspense, useState, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Mengimpor CSS utama (yang berisi konfigurasi Font & Tailwind)
import "./assets/tailwind.css";

// Komponen Loading Global
import Loading from "./components/Loading";

// Lazy Loading untuk Optimasi Performa
const MainLayouts = lazy(() => import("./layouts/MainLayouts"));
const AuthLayout = lazy(() => import("./layouts/AuthLayouts"));

// Pages - Management System
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reservations = lazy(() => import("./pages/reservations")); // Sesuaikan huruf kapital sesuai folder
const Guest = lazy(() => import("./pages/guest"));
const Rooms = lazy(() => import("./pages/rooms"));
const Details = lazy(() => import("./pages/Details"));

// Pages - Authentication
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Forgot = lazy(() => import("./pages/Auth/Forgot"));

// Komponen Pendukung
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();

    // Daftar route yang valid agar sistem bisa menentukan kapan menampilkan NotFound
    const validRoutes = [
        "/", 
        "/reservations", 
        "/guest", 
        "/rooms", 
        "/details",
        "/login", 
        "/register", 
        "/forgot"
    ];
    
    const isErrorPage = !validRoutes.includes(location.pathname);

    // Tampilkan NotFound jika URL tidak dikenal
    if (isErrorPage) {
        return (
            <Suspense fallback={<Loading />}>
                <NotFound />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* --- GRUP LAYOUT UTAMA (Dengan Sidebar & Header Hotel) --- */}
                <Route element={<MainLayouts />}>
                    <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/guest" element={<Guest />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/details" element={<Details />} />
                </Route>

                {/* --- GRUP LAYOUT AUTH (Halaman Login/Register Tanpa Sidebar) --- */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot" element={<Forgot />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;