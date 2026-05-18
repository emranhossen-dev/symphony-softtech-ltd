"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Shield, Loader2 } from 'lucide-react';
import { User } from '@/hooks/useRBAC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT';
  allowedRoles?: ('ADMIN' | 'EMPLOYEE' | 'MENTOR' | 'STUDENT')[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

interface AuthResponse {
  user: User;
  success: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/unauthorized',
  fallback
}: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if not authenticated
            router.push('/login');
            return;
          }
          throw new Error('Failed to authenticate');
        }

        const data: AuthResponse = await response.json();
        setUser(data.user);

        // Check authorization
        let isAuthorized = false;

        if (requiredRole) {
          isAuthorized = data.user.role === requiredRole;
        } else if (allowedRoles) {
          isAuthorized = allowedRoles.includes(data.user.role);
        } else {
          // Default: allow all authenticated users
          isAuthorized = true;
        }

        if (!isAuthorized) {
          // Show error toast
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

          // Redirect to unauthorized page
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication failed. Please try again.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '14px',
          },
        });
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requiredRole, allowedRoles, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Access</h2>
          <p className="text-gray-600">Please wait while we check your permissions...</p>
        </div>
      </div>
    );
  }

  // Show custom fallback if provided
  if (!authorized && fallback) {
    return <>{fallback}</>;
  }

  // Show unauthorized state
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Redirecting...
          </p>
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="ADMIN" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function EmployeeOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="EMPLOYEE" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function MentorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="MENTOR" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function StudentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="STUDENT" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOrEmployee({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminOrMentor({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MENTOR']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
