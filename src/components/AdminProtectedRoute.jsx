import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * AdminProtectedRoute — wraps admin-only routes.
 * Checks live Supabase Auth session and validates role === "admin".
 * Redirects to /login if not authenticated or not an admin.
 */
export default function AdminProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Verify profile role is admin
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (!error && profile && profile.role === "admin") {
            localStorage.setItem("adminSession", JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              status: "active",
              role: "admin"
            }));
            setStatus("ok");
            return;
          }
        }

        // Fallback: check localStorage adminSession
        const stored = localStorage.getItem("adminSession");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.id) {
              const { data: { session: restoredSession }, error } = await supabase.auth.getSession();
              if (!error && restoredSession && restoredSession.user.id === parsed.id) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("role")
                  .eq("id", restoredSession.user.id)
                  .single();

                if (profile && profile.role === "admin") {
                  setStatus("ok");
                  return;
                }
              }
            }
          } catch { /* invalid stored session */ }
        }

        // Not authenticated or not an admin
        localStorage.removeItem("adminSession");
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
        justifyContent: "center", backgroundColor: "#0B132B",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "#3B82F6", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#94A3B8", fontSize: "0.88rem", fontFamily: "'Inter', sans-serif" }}>
            Memverifikasi hak akses admin...
          </p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

