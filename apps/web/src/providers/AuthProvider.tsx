'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { User, AuthResponse } from '@tfe/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await apiFetch<{ user: User; profile: unknown }>('/profile/me', { token: t });
      setUser(res.user);
      setToken(t);
    } catch {
      // Token invalid, clear everything
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const t = token || localStorage.getItem('token');
    if (t) {
      await fetchUser(t);
    }
  }, [token, fetchUser]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      fetchUser(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const sendOtp = async (phone: string) => {
    await apiFetch('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  };

  const login = async (phone: string, otp: string) => {
    const res = await apiFetch<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, sendOtp, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
