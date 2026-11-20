import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickSwitchRole: (role: 'OWNER' | 'TENANT' | 'ADMIN') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rentease_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.me();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        localStorage.removeItem('rentease_token');
        setToken(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      // Default auto-login as Owner for instant preview capability
      quickSwitchRole('OWNER');
    }
  }, []);

  const login = async (email: string, password = 'RentEase@2026'): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('rentease_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('rentease_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (role: 'OWNER' | 'TENANT' | 'ADMIN') => {
    setLoading(true);
    let email = 'venkat.rao@gmail.com';
    if (role === 'TENANT') email = 'rahul.varma@gmail.com';
    if (role === 'ADMIN') email = 'admin@rentease.com';

    await login(email, 'RentEase@2026');
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        quickSwitchRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
