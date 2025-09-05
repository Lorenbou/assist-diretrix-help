import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

interface User {
  username: string;
  role: 'admin' | 'client';
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const isAuth = storage.isAuthenticated();
    const currentUser = storage.getCurrentUser();
    setIsAuthenticated(isAuth);
    setUser(currentUser);
  }, []);

  const login = (username: string, password: string): boolean => {
    const result = storage.login(username, password);
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};