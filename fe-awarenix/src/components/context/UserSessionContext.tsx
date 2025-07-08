import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 1. Tipe data user session
export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  company: string;
  country: string;
};

// 2. Tipe context
type UserSessionContextType = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
};

// 3. Context default value
const UserSessionContext = createContext<UserSessionContextType>({
  user: null,
  setUser: () => {},
});

// 4. Hook pemanggil context
export const useUserSession = () => useContext(UserSessionContext);

// 5. Provider
export const UserSessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);

  // 6. Inisialisasi pertama dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // 7. Sinkronisasi user -> localStorage (opsional)
  // Kalau ingin selalu update localStorage saat setUser dipanggil:
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserSessionContext.Provider value={{ user, setUser }}>
      {children}
    </UserSessionContext.Provider>
  );
};
