"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, isAuthenticated, logout, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Allow admins or employees with dashboard permission
      if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
        router.push('/login');
        return;
      }

      // If employee, check if they have any permission
      if (user.role === 'EMPLOYEE') {
        // Employees can access admin panel if they have permissions
        // The sidebar will filter based on actual permissions
        console.log('Employee accessing admin panel with permissions:', user.permissions);
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

  // Show beautiful loading state while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          {/* Admin Logo/Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield className="w-12 h-12 text-white animate-pulse" />
            </div>
            {/* Rotating Ring */}
            <div className="absolute -inset-2 border-2 border-white/20 rounded-2xl animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -inset-4 border border-white/10 rounded-2xl animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
            <p className="text-purple-200">Loading your dashboard...</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-80 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 loading-progress-bar"></div>
          </div>
          
          {/* Animated Dots */}
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Loading Spinner */}
          <div className="relative">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Show sidebar for all admin pages except main dashboard
  const shouldShowSidebar = pathname !== '/admin' && pathname.startsWith('/admin/');
  
  return (
    <div className="admin-main-container min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <AdminSidebar
            isOpen={true}
            onClose={() => {}}
            isMobile={false}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Main Content */}
        <div className={`admin-main-content flex-1 ${shouldShowSidebar ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72') : ''} transition-all duration-500 flex flex-col h-full`}>
          <AdminHeader
            onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            sidebarOpen={shouldShowSidebar}
            sidebarCollapsed={isSidebarCollapsed}
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
