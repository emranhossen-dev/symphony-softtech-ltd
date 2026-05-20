"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { JWTPayload } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';
  phone?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      console.log('AuthContext - Checking auth via /api/auth/me...');

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('AuthContext - Response status:', response.status);
      console.log('AuthContext - Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext - User data received:', data.user);
        setUser(data.user);
      } else {
        console.log('AuthContext - Auth check failed:', response.status);
        // Try to get error message from response
        try {
          const errorData = await response.text();
          console.log('AuthContext - Error response:', errorData);
        } catch (e) {
          console.log('AuthContext - Could not read error response');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext - Auth check failed:', error);
      console.error('AuthContext - Error details:', error instanceof Error ? error.message : 'Unknown error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('AuthContext - useEffect triggered');
      checkAuth();
    }
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<string> => {
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
    console.log('AuthContext - Redirect URL:', data.redirect);
    
    // Return redirect URL so the calling component can handle navigation
    return data.redirect;
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

  const hasPermission = useCallback((permission: string) => {
    // Admins have all permissions
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    // Check if user has the specific permission
    console.log('hasPermission check:', permission, 'user permissions:', user.permissions);
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    hasPermission,
  }), [user, loading, login, logout, hasRole, hasAnyRole, hasPermission]);

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
