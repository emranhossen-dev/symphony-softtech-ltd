import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';
}

export interface RBACConfig {
  requiredRole?: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';
  allowedRoles?: ('ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT')[];
  redirectTo?: string;
  showToast?: boolean;
}

export function useRBAC(config: RBACConfig = {}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    requiredRole,
    allowedRoles,
    redirectTo = '/unauthorized',
    showToast = true
  } = config;

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const hasAccess = checkAccess(user);
      
      if (!hasAccess) {
        if (showToast) {
          toast.error('Access Denied: You are not authorized to view this page.', {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 'bold',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
          });
        }
        
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      }
    }
  }, [user, loading, showToast, redirectTo]);

  function checkAccess(user: User): boolean {
    if (requiredRole) {
      return user.role === requiredRole;
    }
    
    if (allowedRoles) {
      return allowedRoles.includes(user.role);
    }
    
    // Default path-based access control
    if (pathname.startsWith('/admin')) {
      return user.role === 'ADMIN';
    }
    
    if (pathname.startsWith('/student')) {
      return user.role === 'STUDENT';
    }
    
    if (pathname.startsWith('/mentor')) {
      return user.role === 'MENTOR';
    }
    
    if (pathname.startsWith('/employee')) {
      return user.role === 'EMPLOYEE';
    }
    
    return true; // Allow access to public routes
  }

  function canAccess(role: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT'): boolean {
    return user?.role === role;
  }

  function canAccessAny(roles: ('ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT')[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  function canAccessAll(roles: ('ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT')[]): boolean {
    return user ? roles.every(role => user.role === role) : false;
  }

  return {
    user,
    loading,
    hasAccess: user ? checkAccess(user) : false,
    canAccess,
    canAccessAny,
    canAccessAll,
    isAdmin: user?.role === 'ADMIN',
    isEmployee: user?.role === 'EMPLOYEE',
    isMentor: user?.role === 'MENTOR',
    isStudent: user?.role === 'STUDENT',
  };
}

