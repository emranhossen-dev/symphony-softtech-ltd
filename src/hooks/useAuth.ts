import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STUDENT' | 'MENTOR' | 'EMPLOYEE';
  isActive: boolean;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getToken = () => {
    return document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1] || localStorage.getItem('auth-token');
  };

  const validateToken = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Clear invalid token
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
      router.push('/login');
    }
  };

  const refreshToken = async () => {
    await validateToken();
  };

  useEffect(() => {
    validateToken();
  }, []);

  // Auto-refresh token every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshToken
  };
}

export default useAuth;
