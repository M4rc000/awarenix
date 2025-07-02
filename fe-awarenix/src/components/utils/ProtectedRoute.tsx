import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import SessionChecker from "./SessionChecker";

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
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  useEffect(() => {
    // if (isTokenValid(token)) {
    if (isTokenValid(token) && user) {
      setAuthorized(true);
    } else {
      localStorage.removeItem("token_expired");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthorized(false);
    }

    setChecking(false);
  }, []);

  if (checking) return <SessionChecker />;

  return authorized ? <Outlet /> : <Navigate to="/login" replace />;
}
