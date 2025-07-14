// src/contexts/UserSessionContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchUserPermissions } from "../../services/menuServices";

// 1. Tipe data user session yang diperbarui
export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: number;
  role_name: string; // Penting untuk filter di frontend
  position: string;
  company: string;
  country: string;
  last_login?: string;
  // Ini akan disimpan di localStorage dan diakses oleh AppSidebar
  allowed_menus?: string[];
  allowed_submenus?: string[];
};

// 2. Tipe context
type UserSessionContextType = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  isLoadingPermissions: boolean; // Tambahkan loading state
};

// 3. Context default value
const UserSessionContext = createContext<UserSessionContextType>({
  user: null,
  setUser: () => {},
  isLoadingPermissions: false,
});

// 4. Hook pemanggil context
export const useUserSession = () => useContext(UserSessionContext);

// 5. Provider
export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // 6. Inisialisasi pertama dari localStorage dan fetch permissions
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser: SessionUser = JSON.parse(storedUser);
        
        // Cek apakah permissions sudah ada di localStorage
        if (parsedUser.allowed_menus && parsedUser.allowed_submenus) {
          // Jika permissions sudah ada, langsung set user
          setUser(parsedUser);
          console.log("User loaded from localStorage with permissions:", parsedUser);
        } else if (parsedUser.role_name) {
          // Jika permissions belum ada, fetch dari API
          console.log("Fetching permissions for role:", parsedUser.role_name);
          setIsLoadingPermissions(true);
          
          fetchUserPermissions(parsedUser.role_name)
            .then(permissions => {
              // Update user object dengan permissions yang baru difetch
              const updatedUser = {
                ...parsedUser,
                allowed_menus: permissions.allowed_menus,
                allowed_submenus: permissions.allowed_submenus,
              };
              
              setUser(updatedUser);
              // Update localStorage dengan permissions yang baru
              localStorage.setItem("user", JSON.stringify(updatedUser));
              console.log("Permissions fetched and user updated:", updatedUser);
            })
            .catch(error => {
              console.error("Error fetching permissions:", error);
              // Tetap set user tanpa permissions jika fetch gagal
              setUser(parsedUser);
            })
            .finally(() => {
              setIsLoadingPermissions(false);
            });
        } else {
          // Jika tidak ada role_name, set user tanpa permissions
          console.log("User loaded without role_name:", parsedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []); // [] agar hanya berjalan sekali saat komponen di-mount

  // 7. Sinkronisasi user -> localStorage (hanya jika user sudah complete)
  useEffect(() => {
    if (user && user.allowed_menus && user.allowed_submenus) {
      localStorage.setItem("user", JSON.stringify(user));
    } else if (user === null) {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserSessionContext.Provider value={{ user, setUser, isLoadingPermissions }}>
      {children}
    </UserSessionContext.Provider>
  );
};