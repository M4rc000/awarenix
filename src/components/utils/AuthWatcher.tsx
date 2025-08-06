import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * Validates JWT token expiration
 * @param token - JWT token string
 * @returns boolean indicating if token is valid
 */
function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp && payload.exp > now;
  } catch (error) {
    console.warn("Invalid token format:", error);
    return false;
  }
}

/**
 * Performs secure logout by calling API and clearing storage
 * @param token - JWT token for authorization
 */
async function performLogout(token: string): Promise<void> {
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.warn("Logout API call failed:", error);
  }
}

/**
 * Shows styled session expiration alert
 * @returns Promise that resolves when user confirms
 */
function showSessionExpiredAlert(): Promise<void> {
  return Swal.fire({
    title: "🔐 Session is Expired",
    text: "Your session is expired. Please log in to continue.",
    icon: "warning",
    confirmButtonText: "Login",
    width: 400,
    padding: "2rem",
    backdrop: `rgba(15, 23, 42, 0.8)`,
    customClass: {
      popup: "swal-dark-theme",
      title: "swal-title-custom",
      htmlContainer: "swal-content-custom",
      confirmButton: "swal-confirm-custom",
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.background = "linear-gradient(135deg, #1e293b 0%, #334155 100%)";
        popup.style.border = "1px solid #475569";
        popup.style.borderRadius = "1rem";
        popup.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)";
      }

      const title = Swal.getTitle();
      if (title) {
        title.style.color = "#f1f5f9";
        title.style.fontSize = "1.5rem";
        title.style.fontWeight = "600";
        title.style.marginBottom = "1rem";
      }

      const content = Swal.getHtmlContainer();
      if (content) {
        content.style.color = "#cbd5e1";
        content.style.fontSize = "1rem";
        content.style.lineHeight = "1.6";
      }

      const confirmButton = Swal.getConfirmButton();
      if (confirmButton) {
        confirmButton.style.background = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)";
        confirmButton.style.border = "none";
        confirmButton.style.borderRadius = "0.5rem";
        confirmButton.style.padding = "0.75rem 1.5rem";
        confirmButton.style.fontSize = "1rem";
        confirmButton.style.fontWeight = "500";
        confirmButton.style.color = "#ffffff";
        confirmButton.style.cursor = "pointer";
        confirmButton.style.transition = "all 0.2s ease";

        confirmButton.addEventListener("mouseenter", () => {
          confirmButton.style.transform = "translateY(-1px)";
          confirmButton.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.3)";
        });

        confirmButton.addEventListener("mouseleave", () => {
          confirmButton.style.transform = "translateY(0)";
          confirmButton.style.boxShadow = "0 4px 8px rgba(59, 130, 246, 0.2)";
        });
      }
    },
  }).then(() => {});
}

/**
 * Clears user session data from localStorage
 */
function clearUserSession(): void {
  const itemsToRemove = ["token", "user", "refreshToken", "sessionId"];
  itemsToRemove.forEach((item) => {
    localStorage.removeItem(item);
  });
}

/**
 * AuthWatcher Component - Monitors user session validity
 * Automatically checks token expiration every 30 seconds
 * Handles logout and redirect on session expiry
 */
export default function AuthWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          const isValid = isTokenValid(token);

          if (!isValid) {
            clearInterval(intervalId);
            await performLogout(token);
            await showSessionExpiredAlert();
            clearUserSession();
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuthStatus();
    const intervalId = setInterval(checkAuthStatus, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [navigate]);

  return null;
}
