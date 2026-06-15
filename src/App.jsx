import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Mengimpor CSS utama (yang berisi konfigurasi Font & Tailwind)
import "./assets/tailwind.css";

// Komponen Loading Global
import Loading from "./components/Loading";

// Lazy Loading untuk Optimasi Performa
const MainLayouts = lazy(() => import("./layouts/MainLayouts"));
const AuthLayout = lazy(() => import("./layouts/AuthLayouts"));
const GuestAuthLayout = lazy(() => import("./layouts/GuestAuthLayout"));
const GuestLayout = lazy(() => import("./layouts/GuestLayout"));

// Pages - Management System
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reservations = lazy(() => import("./pages/reservations")); // Sesuaikan huruf kapital sesuai folder
const Guest = lazy(() => import("./pages/guest"));
const Rooms = lazy(() => import("./pages/rooms"));
const Details = lazy(() => import("./pages/Details"));
const ComponentLibrary = lazy(() => import("./pages/ComponentLibrary"));
const Reports = lazy(() => import("./pages/reports"));
const HelpDesk = lazy(() => import("./pages/helpdesk"));
const Payments = lazy(() => import("./pages/payments"));
const Notifications = lazy(() => import("./pages/notifications"));
const Forecasting = lazy(() => import("./pages/forecasting"));
const Marketing = lazy(() => import("./pages/marketing"));
const Feedback = lazy(() => import("./pages/feedback"));
const Tasks = lazy(() => import("./pages/tasks"));

// Pages - Authentication
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Forgot = lazy(() => import("./pages/Auth/Forgot"));

// Pages - Guest Portal
const GuestLogin = lazy(() => import("./pages/guest/GuestLogin"));
const GuestRegister = lazy(() => import("./pages/guest/GuestRegister"));
const GuestForgot = lazy(() => import("./pages/guest/GuestForgot"));
const GuestDashboard = lazy(() => import("./pages/guest/GuestDashboard"));
const GuestProfile = lazy(() => import("./pages/guest/GuestProfile"));
const GuestHomepage = lazy(() => import("./pages/guest/GuestHomepage"));
const GuestRoomDetail = lazy(() => import("./pages/guest/GuestRoomDetail"));
const GuestBooking = lazy(() => import("./pages/guest/GuestBooking"));
const GuestReservations = lazy(() => import("./pages/guest/GuestReservations"));
const GuestReservationDetail = lazy(() => import("./pages/guest/GuestReservationDetail"));
const GuestPreCheckIn = lazy(() => import("./pages/guest/GuestPreCheckIn"));
const GuestAddOns = lazy(() => import("./pages/guest/GuestAddOns"));
const GuestRoomService = lazy(() => import("./pages/guest/GuestRoomService"));
const GuestHousekeeping = lazy(() => import("./pages/guest/GuestHousekeeping"));
const GuestReportIssue = lazy(() => import("./pages/guest/GuestReportIssue"));
const GuestChat = lazy(() => import("./pages/guest/GuestChat"));
const GuestFacilities = lazy(() => import("./pages/guest/GuestFacilities"));
const GuestBilling = lazy(() => import("./pages/guest/GuestBilling"));
const GuestInvoice = lazy(() => import("./pages/guest/GuestInvoice"));
const GuestHistory = lazy(() => import("./pages/guest/GuestHistory"));
const GuestSurvey = lazy(() => import("./pages/guest/GuestSurvey"));
const GuestLoyalty = lazy(() => import("./pages/guest/GuestLoyalty"));
const GuestPromo = lazy(() => import("./pages/guest/GuestPromo"));
const GuestLayanan = lazy(() => import("./pages/guest/GuestLayanan"));
const GuestMembership = lazy(() => import("./pages/guest/GuestMembership"));
const GuestMembershipPayment = lazy(() => import("./pages/guest/GuestMembershipPayment"));
const GuestAnalytics = lazy(() => import("./pages/guest/GuestAnalytics"));
const GuestSubscription = lazy(() => import("./pages/guest/GuestSubscription"));

// Komponen Pendukung
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
    const location = useLocation();

    // Daftar route yang valid agar sistem bisa menentukan kapan menampilkan NotFound
    const validRoutes = [
        "/", 
        "/reservations", 
        "/guests", 
        "/rooms", 
        "/details",
        "/components",
        "/reports",
        "/helpdesk",
        "/payments",
        "/notifications",
        "/forecasting",
        "/marketing",
        "/feedback",
        "/tasks",
        "/login", 
        "/register", 
        "/forgot"
    ];
    
    const isErrorPage = !validRoutes.includes(location.pathname)
        && !location.pathname.startsWith("/guest/")
        && location.pathname !== "/beranda";

    // Tampilkan NotFound jika URL tidak dikenal
    if (isErrorPage) {
        // Fallback untuk route guest yang tidak ditemukan
        if (location.pathname.startsWith("/guest")) {
            return (
                <Suspense fallback={<Loading />}>
                    <Navigate to="/guest" replace />
                </Suspense>
            );
        }
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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/guests" element={<Guest />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/details" element={<Details />} />
                    <Route path="/components" element={<ComponentLibrary />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/helpdesk" element={<HelpDesk />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/forecasting" element={<Forecasting />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/tasks" element={<Tasks />} />
                </Route>

                {/* --- GRUP LAYOUT AUTH (Halaman Login/Register Tanpa Sidebar) --- */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot" element={<Forgot />} />
                </Route>

                {/* --- GUEST PORTAL AUTH (Halaman Login/Register Tamu) --- */}
                <Route element={<GuestAuthLayout />}>
                    <Route path="/guest/login" element={<GuestLogin />} />
                    <Route path="/guest/register" element={<GuestRegister />} />
                    <Route path="/guest/lupa-password" element={<GuestForgot />} />
                </Route>

                {/* --- BERANDA PUBLIK TAMU (Tanpa Auth, Layout Mandiri) --- */}
                <Route path="/beranda" element={<GuestHomepage />} />
                <Route path="/guest/beranda" element={<GuestHomepage />} />
                <Route path="/guest" element={<GuestHomepage />} />
                <Route path="/guest/kamar/:roomId" element={<GuestRoomDetail />} />
                <Route path="/guest/booking/:roomId" element={<GuestBooking />} />
                <Route path="/guest/booking" element={<GuestHomepage />} />

                {/* --- GUEST PORTAL APP (Halaman Tamu Terautentikasi) --- */}
                <Route element={<GuestLayout />}>
                    <Route path="/guest/dashboard" element={<GuestDashboard />} />
                    <Route path="/guest/profil" element={<GuestProfile />} />
                    <Route path="/guest/reservasi" element={<GuestReservations />} />
                    <Route path="/guest/reservasi/:bookingId" element={<GuestReservationDetail />} />
                    <Route path="/guest/pre-checkin/:bookingId" element={<GuestPreCheckIn />} />
                    <Route path="/guest/tambah-layanan/:bookingId" element={<GuestAddOns />} />
                    <Route path="/guest/layanan" element={<GuestLayanan />} />
                    <Route path="/guest/layanan/makanan" element={<GuestRoomService />} />
                    <Route path="/guest/layanan/housekeeping" element={<GuestHousekeeping />} />
                    <Route path="/guest/keluhan" element={<GuestReportIssue />} />
                    <Route path="/guest/chat" element={<GuestChat />} />
                    <Route path="/guest/fasilitas" element={<GuestFacilities />} />
                    <Route path="/guest/tagihan" element={<GuestBilling />} />
                    <Route path="/guest/invoice/:bookingId" element={<GuestInvoice />} />
                    <Route path="/guest/riwayat-inap" element={<GuestHistory />} />
                    <Route path="/guest/survei/:bookingId" element={<GuestSurvey />} />
                    <Route path="/guest/loyalitas" element={<GuestLoyalty />} />
                    <Route path="/guest/riwayat" element={<GuestDashboard />} />
                    <Route path="/guest/promo" element={<GuestPromo />} />
                    <Route path="/guest/layanan-utama" element={<GuestLayanan />} />
                    <Route path="/guest/membership" element={<GuestMembership />} />
                    <Route path="/guest/membership/pembayaran" element={<GuestMembershipPayment />} />
                    <Route path="/guest/analitik" element={<GuestAnalytics />} />
                    <Route path="/guest/langganan" element={<GuestSubscription />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;