import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserSession } from '../context/UserSessionContext'; // Pastikan path ini benar
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { user, isAuthenticated, loading: userSessionLoading } = useUserSession();
  const location = useLocation();
  // State untuk melacak apakah pengecekan awal otentikasi telah selesai
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Setelah userSessionLoading menjadi false, artinya sesi sudah dimuat
    if (!userSessionLoading) {
      setInitialAuthCheckComplete(true);
    }
  }, [userSessionLoading]);

  // Tampilkan loading screen sampai pengecekan awal selesai
  if (!initialAuthCheckComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <svg
            className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          {/* Text */}
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 font-medium">
            Loading user session...
          </p>
        </div>
      </div>

    );
  }

  // Jika tidak terautentikasi setelah pengecekan awal, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika user dan allowed_submenus sudah dimuat
  if (user && user.allowed_submenus) {
    const alwaysAllowedPaths = [
      '/profile',
      '/dashboard',
      '/account-settings',
    ];

    const isPathAllowedByRole = user.allowed_submenus.includes(location.pathname);
    const isAlwaysAllowed = alwaysAllowedPaths.includes(location.pathname);

    // Jika path tidak diizinkan oleh role DAN tidak termasuk dalam path yang selalu diizinkan
    if (!isPathAllowedByRole && !isAlwaysAllowed) {
      console.warn(`User with role ${user.role_name} attempted to access unauthorized path: ${location.pathname}`);
      return <Navigate to="/unauthorized" replace />;
    }
  } else {
    // Ini adalah kasus fallback jika data user tidak lengkap setelah autentikasi
    // Seharusnya jarang terjadi jika UserSessionContext berfungsi dengan baik.
    console.error("User object or allowed_submenus is missing in session context after authentication.");
    return <Navigate to="/login" replace />;
  }

  // Jika semua pengecekan lolos, lanjutkan ke route yang diminta
  return <Outlet />;
};

export default ProtectedRoute;