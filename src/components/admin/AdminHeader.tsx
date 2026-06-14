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
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleMenuToggle = () => {
    if (!userMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="bg-gray-950 shadow-sm border-b border-gray-800 h-16">
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
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>

            {/* Category Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => router.push(`/admin/category/${category.slug}`)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentCategory === category.slug
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
              className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-colors group"
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
                type="button"
                ref={buttonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuToggle();
                }}
                className="flex items-center p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'fixed',
                    top: `${menuPosition.top}px`,
                    right: `${menuPosition.right}px`,
                  }}
                  className="w-[240px] bg-gray-900 rounded-lg shadow-xl py-2 z-[9999] border border-gray-700"
                >
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user?.role === 'EMPLOYEE'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-br from-green-600 to-orange-500'
                      }`}>
                        <span className="text-white font-bold text-xs">
                          {(user?.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[140px]">{user?.name || 'Admin'}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          user?.role === 'EMPLOYEE'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user?.role === 'EMPLOYEE' ? 'Employee' : 'Admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/admin/profile');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium text-white">Profile</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/admin/settings');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <ChevronDown className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium text-white">Settings</span>
                      </div>
                    </button>
                  </div>

                  <hr className="my-2 border-gray-700" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogoutClick();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 transition-colors flex items-center cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="font-medium text-white">Logout</span>
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
