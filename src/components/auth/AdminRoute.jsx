import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { checkIsAdmin } from "../../services/apiService";

export default function AdminRoute() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  if (isAdmin === null) return <div style={{ color: "var(--text-main)", padding: "20px" }}>Comprobando permisos...</div>;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}