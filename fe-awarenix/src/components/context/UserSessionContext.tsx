import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; 

interface UserData {
  id: number;
  name: string;
  email: string;
  role: number; // role_id
  role_name: string;
  position?: string;
  company?: string;
  country?: string;
  last_login?: string;
  allowed_menus: string[]; 
  allowed_submenus: string[]; 
}

interface UserSessionContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (userData: UserData | null) => void;
  logout: () => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export const UserSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const decodedToken: any = jwtDecode(token);
        const expiresAt = decodedToken.exp * 1000; // Konversi ke milidetik

        if (expiresAt > Date.now()) {
          const storedUser: UserData = JSON.parse(userString);
          setUserState(storedUser);
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('token_expired');
          localStorage.removeItem('user');
          setUserState(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error decoding token or parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('token_expired');
        localStorage.removeItem('user');
        setUserState(null);
        setIsAuthenticated(false);
      }
    } else {
      setUserState(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    setIsAuthenticated(!!userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expired');
    localStorage.removeItem('user');
    setUserState(null);
    setIsAuthenticated(false);
    // Optionally, call logout API
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (!res.ok) console.error("Logout API call failed");
    }).catch(err => console.error("Error during logout API call", err));
  };

  return (
    <UserSessionContext.Provider value={{ user, isAuthenticated, loading, setUser, logout }}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
};