"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { JWTPayload } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Remove the console.log to reduce noise in development
  // console.log('AuthContext - Provider rendered');

  const checkAuth = useCallback(async () => {
    try {
      // Use the /api/auth/me endpoint which can read httpOnly cookies server-side
      console.log('AuthContext - Checking auth via /api/auth/me...');
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext - User data received:', data.user);
        setUser(data.user);
      } else {
        console.log('AuthContext - Auth check failed:', response.status);
      }
    } catch (error) {
      console.error('AuthContext - Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    console.log('AuthContext - useEffect triggered');
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    
    // Token is stored in HTTP-only cookie by the server
    // No need to store in localStorage
    console.log('AuthContext - Login successful, user:', data.user);
  }, []);


  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
    } finally {
      setUser(null);
      // Clear all possible token storage
      localStorage.removeItem('token');
      localStorage.removeItem('auth-token');
      // Cookie will be cleared by the server
    }
  }, []);

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'STUDENT': 0,
      'MENTOR': 1,
      'EMPLOYEE': 2,
      'ADMIN': 3
    };

    return roleHierarchy[user.role] >= roleHierarchy[role as keyof typeof roleHierarchy];
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  }), [user, loading, login, logout, hasRole, hasAnyRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
