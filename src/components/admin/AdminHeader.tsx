"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Target, Building, Monitor, FileText, PlayCircle, Bell, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AdminHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
  sidebarCollapsed?: boolean;
  user?: any;
  onLogout?: () => void;
}

const AdminHeader = ({ onSidebarToggle, sidebarOpen, sidebarCollapsed = false, user, onLogout }: AdminHeaderProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch unread WhatsApp messages count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages?unread=true&limit=100');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.messages?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('/category/')) {
      const category = pathname.split('/')[3];
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';
    }
    if (pathname.includes('/mentors')) return 'Mentors';
    if (pathname.includes('/students')) return 'Students';
    if (pathname.includes('/courses')) return 'Courses';
    if (pathname.includes('/analytics')) return 'Analytics';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Admin Dashboard';
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Categories for navigation
  const categories = [
    { name: 'Government', slug: 'government', icon: <Building className="w-4 h-4" /> },
    { name: 'Online', slug: 'online', icon: <Monitor className="w-4 h-4" /> },
    { name: 'Offline', slug: 'offline', icon: <FileText className="w-4 h-4" /> },
    { name: 'Recorded', slug: 'recorded', icon: <PlayCircle className="w-4 h-4" /> }
  ];

  // Get current category from pathname
  const getCurrentCategory = () => {
    if (pathname.includes('/category/')) {
      const category = pathname.split('/')[3];
      return category || null;
    }
    return null;
  };

  const currentCategory = getCurrentCategory();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Title and Category Navigation */}
          <div className="flex items-center space-x-6">
            {/* Dashboard Button - Hide on dashboard page */}
            {pathname !== '/admin/dashboard' && (
              <button
                onClick={() => router.push('/admin/dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin/dashboard'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>

            {/* Category Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => router.push(`/admin/category/${category.slug}`)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentCategory === category.slug
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Notifications and User menu */}
          <div className="flex items-center space-x-4">
            {/* WhatsApp Messages Notification */}
            <button
              onClick={() => router.push('/admin/whatsapp-messages')}
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors group"
            >
              <Bell className="w-5 h-5 group-hover:animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(user?.name || 'Admin').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                        <p className="text-xs text-green-600 font-medium">Administrator</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <div className="py-2">
                    <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">Profile</div>
                          <div className="text-xs text-gray-500">Update personal information</div>
                        </div>
                      </div>
                    </a>
                    <a href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">Settings</div>
                          <div className="text-xs text-gray-500">System preferences</div>
                        </div>
                      </div>
                    </a>
                  </div>
                  
                  <hr className="my-2" />
                  
                  {/* Logout */}
                  <button 
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Logout</div>
                      <div className="text-xs text-red-400">Sign out of account</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
