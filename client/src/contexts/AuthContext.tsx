import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<User>;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
  companyName?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  const refresh = async () => {
    try {
      const me = await get<User>('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await post<User>('/auth/login', { email, password });
    setUser(u);
    queryClient.clear();
    return u;
  };

  const register = async (payload: RegisterPayload) => {
    const u = await post<User>('/auth/register', payload);
    setUser(u);
    queryClient.clear();
    return u;
  };

  const logout = async () => {
    try {
      await post('/auth/logout');
    } finally {
      setUser(null);
      queryClient.clear();
    }
  };

  const updateProfile = async (patch: Partial<User>) => {
    const u = await put<User>('/auth/me', patch);
    setUser((prev) => (prev ? { ...prev, ...u } : u));
    return u;
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, ready, login, register, logout, refresh, updateProfile }),
    [user, loading, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}