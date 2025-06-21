import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SessionChecker from "./SessionChecker";

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isValid = isTokenValid(token);
    if (isValid) setShouldRedirect(true);
    setChecking(false);
  }, []);

  if (checking) return <SessionChecker />;
  if (shouldRedirect) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
