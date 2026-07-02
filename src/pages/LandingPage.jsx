import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import PublicNavbar from "../components/landing/PublicNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import StatsSection from "../components/landing/StatsSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import TestimonialSection from "../components/landing/TestimonialSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect guard: if user is logged in as admin, redirect to dashboard
    async function checkSession() {
      const stored = localStorage.getItem("adminSession");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) {
            navigate("/admin/dashboard", { replace: true });
            return;
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }
    checkSession();
  }, [navigate]);

  if (loading) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#0B132B" }} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#0B132B", color: "#FFFFFF", overflowX: "hidden" }}>
      <PublicNavbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <StatsSection />
        <HowItWorksSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
