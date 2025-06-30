import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import SessionChecker from "./SessionChecker"; // Komponen loading minimal

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch (err) {
    console.log("Token parsing error:", err);
    return false;
  }
}

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem('user');

    // if (isTokenValid(token)) {
    if (isTokenValid(token) && user !== null && user !== '') {
      setAuthorized(true);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthorized(false);
    }

    setChecking(false);
  }, []);

  if (checking) return <SessionChecker />;

  return authorized ? <Outlet /> : <Navigate to="/login" replace />;
}
