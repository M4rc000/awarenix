// components/utils/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserSession } from '../context/UserSessionContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { user, isAuthenticated, loading: userSessionLoading } = useUserSession();
  const location = useLocation();
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);

  useEffect(() => {
    // Tunggu hingga user session dimuat
    if (!userSessionLoading) {
      setHasCheckedPermissions(true);
    }
  }, [userSessionLoading]);

  if (!isAuthenticated) {
    // Jika tidak terautentikasi, redirect ke login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Tampilkan loading atau null sementara data user sedang dimuat dari context
  if (userSessionLoading || !hasCheckedPermissions) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-gray-700">
        Loading user permissions...
      </div>
    );
  }

  // Jika user dan allowed_submenus sudah dimuat
  if (user && user.allowed_submenus) {
    // Daftar path yang selalu diizinkan, terlepas dari role, karena mereka adalah bagian dari struktur aplikasi dasar.
    // Misalnya, halaman profil atau dashboard default yang mungkin bisa diakses semua user yang login.
    const alwaysAllowedPaths = [
      '/profile',
      '/dashboard', // Dashboard dasar yang mungkin berbeda per role
      '/account-settings', // Akun settings user itu sendiri
      // Tambahkan path lain yang dianggap "public" untuk user yang terautentikasi di sini
    ];

    // Cek apakah path yang diakses saat ini ada di daftar allowed_submenus user
    const isPathAllowedByRole = user.allowed_submenus.includes(location.pathname);

    // Cek apakah path yang diakses selalu diizinkan
    const isAlwaysAllowed = alwaysAllowedPaths.includes(location.pathname);

    // Jika path tidak diizinkan oleh role DAN tidak termasuk dalam path yang selalu diizinkan
    if (!isPathAllowedByRole && !isAlwaysAllowed) {
      // Redirect ke halaman tidak berwenang (misal: 403 Forbidden)
      console.warn(`User with role ${user.role_name} attempted to access unauthorized path: ${location.pathname}`);
      return <Navigate to="/unauthorized" replace />; // Anda perlu membuat komponen/page Unauthorized
    }
  } else {
    // Ini seharusnya tidak terjadi jika userSessionLoading sudah false dan isAuthenticated true
    // Tapi sebagai fallback, jika user objeknya sendiri tidak ada allowed_submenus-nya
    console.error("User object or allowed_submenus is missing in session context.");
    // Bisa redirect ke halaman error umum atau login lagi
    return <Navigate to="/login" replace />;
  }

  // Jika semua pengecekan lolos, lanjutkan ke route yang diminta
  return <Outlet />;
};

export default ProtectedRoute;