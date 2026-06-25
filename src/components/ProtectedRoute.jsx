import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * ProtectedRoute — wraps member-only routes.
 * Checks both localStorage memberSession and live Supabase Auth session.
 * Redirects to /guest/login if not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    async function checkSession() {
      try {
        // Check Supabase Auth session (handles token refresh automatically)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Sync memberSession in localStorage
          localStorage.setItem("memberSession", JSON.stringify(session));
          setStatus("ok");
          return;
        }

        // Fallback: check localStorage memberSession
        const stored = localStorage.getItem("memberSession");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.access_token) {
              // Try to restore via Supabase
              const { error } = await supabase.auth.setSession({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token,
              });
              if (!error) {
                setStatus("ok");
                return;
              }
            }
          } catch { /* invalid stored session */ }
        }

        // Not authenticated
        localStorage.removeItem("memberSession");
        localStorage.removeItem("memberData");
        setStatus("denied");
      } catch {
        setStatus("denied");
      }
    }

    checkSession();
  }, []);

  if (status === "checking") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: "#FDF8F2",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", border: "4px solid #E8DCC8",
            borderTopColor: "#1E3A5F", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#94A3B8", fontSize: "0.88rem", fontFamily: "'Inter', sans-serif" }}>
            Memverifikasi sesi...
          </p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/guest/login" replace />;
  }

  return children;
}
