"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!authLoading) {
      if (!isAuthenticated || !user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on error
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  // Show loading state while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sidebar for all admin pages except main dashboard
  const shouldShowSidebar = pathname !== '/admin' && pathname.startsWith('/admin/');
  
  return (
    <div className="admin-main-container min-h-screen bg-gray-50 h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <AdminSidebar
            isOpen={true}
            onClose={() => {}}
            isMobile={false}
          />
        )}

        {/* Main Content */}
        <div className={`admin-main-content flex-1 ${shouldShowSidebar ? 'lg:ml-64 admin-layout-with-sidebar' : ''} transition-all duration-300 flex flex-col h-full`}>
          <AdminHeader
            onSidebarToggle={() => {}}
            sidebarOpen={shouldShowSidebar}
            user={user}
            onLogout={handleLogout}
          />
          
          {/* Page Content with proper scrolling */}
          <main className="admin-main-content flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
