import { Navigate } from "react-router-dom";

/**
 * AdminProtectedRoute — wraps admin-only routes.
 * Checks adminSession from localStorage and validates status === "active".
 * Redirects to /login if not authenticated or account is inactive.
 */
export default function AdminProtectedRoute({ children }) {
  const stored = localStorage.getItem("adminSession");

  if (!stored) {
    return <Navigate to="/login" replace />;
  }

  try {
    const session = JSON.parse(stored);

    if (!session || !session.id) {
      localStorage.removeItem("adminSession");
      return <Navigate to="/login" replace />;
    }

    if (session.status !== "active") {
      localStorage.removeItem("adminSession");
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("adminSession");
    return <Navigate to="/login" replace />;
  }
}
