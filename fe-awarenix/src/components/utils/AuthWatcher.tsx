import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

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
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
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
    title: '🔐 Session is Expired',
    text: 'Your session is expired. please log in to continue.',
    icon: 'warning',
    showDenyButton: false,
    showCancelButton: false,
    confirmButtonText: 'Login',
    width: 400,
    padding: '2rem',
    backdrop: `rgba(15, 23, 42, 0.8)`,
    customClass: {
      popup: 'swal-dark-theme',
      title: 'swal-title-custom',
      content: 'swal-content-custom',
      confirmButton: 'swal-confirm-custom'
    },
    didOpen: () => {
      // Apply custom styles
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
        popup.style.border = '1px solid #475569';
        popup.style.borderRadius = '1rem';
        popup.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
      }
      
      const title = Swal.getTitle();
      if (title) {
        title.style.color = '#f1f5f9';
        title.style.fontSize = '1.5rem';
        title.style.fontWeight = '600';
        title.style.marginBottom = '1rem';
      }
      
      const content = Swal.getHtmlContainer();
      if (content) {
        content.style.color = '#cbd5e1';
        content.style.fontSize = '1rem';
        content.style.lineHeight = '1.6';
      }
      
      const confirmButton = Swal.getConfirmButton();
      if (confirmButton) {
        confirmButton.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '0.5rem';
        confirmButton.style.padding = '0.75rem 1.5rem';
        confirmButton.style.fontSize = '1rem';
        confirmButton.style.fontWeight = '500';
        confirmButton.style.color = '#ffffff';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.transition = 'all 0.2s ease';
        
        confirmButton.addEventListener('mouseenter', () => {
          confirmButton.style.transform = 'translateY(-1px)';
          confirmButton.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
        });
        
        confirmButton.addEventListener('mouseleave', () => {
          confirmButton.style.transform = 'translateY(0)';
          confirmButton.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
        });
      }
    }
  }).then(() => {});
}

/**
 * Clears user session data from localStorage
 */
function clearUserSession(): void {
  const itemsToRemove = ["token", "user", "refreshToken", "sessionId"];
  itemsToRemove.forEach(item => {
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
    let intervalId: NodeJS.Timeout;

    const checkAuthStatus = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        // Only check if user data exists
        if (token && user) {
          const isValid = isTokenValid(token);
          
          if (!isValid) {
            // Clear interval to prevent multiple checks
            clearInterval(intervalId);
            
            // Perform logout API call
            await performLogout(token);
            
            // Show user-friendly alert
            await showSessionExpiredAlert();
            
            // Clear user session
            clearUserSession();
            
            // Redirect to login
            navigate("/login", { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    // Initial check
    checkAuthStatus();

    // Set up periodic checking (every 30 seconds)
    intervalId = setInterval(checkAuthStatus, 30000);

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [navigate]);

  // No UI rendered - this is a background service component
  return null;
}