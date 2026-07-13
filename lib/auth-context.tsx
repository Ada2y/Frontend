'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {ApiClient, type UserProfile} from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const me = await ApiClient.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await ApiClient.logout();
    setUser(null);
    window.location.href = '/login';
  }

  async function refreshUser() {
    await fetchUser();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await ApiClient.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, logout, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
}
