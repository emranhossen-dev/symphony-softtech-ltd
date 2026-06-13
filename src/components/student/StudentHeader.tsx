"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, User, ChevronDown, Settings, Award, BookOpen } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface StudentHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const StudentHeader = ({ onSidebarToggle, sidebarOpen }: StudentHeaderProps) => {
  const { user } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-slate-900 shadow-lg border-b border-purple-600 h-16">
      <div className="px-3 sm:px-4 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Mobile menu button and Logo */}
          <div className="flex items-center">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-white hover:bg-purple-700 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
            <div className="hidden sm:flex items-center ml-2 sm:ml-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-md">
                <span className="text-white font-bold text-xs sm:text-sm">ST</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Student Dashboard</h1>
                <p className="text-xs text-purple-100 hidden sm:block">Symphony Institute of Technology</p>
              </div>
            </div>
          </div>

          {/* Center - Title for mobile */}
          <div className="sm:hidden">
            <h1 className="text-sm font-semibold text-white">Student Panel</h1>
          </div>

          {/* Right side - Notifications and User menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <NotificationBell />
            </div>

            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 hover:text-purple-300 transition-all duration-200 border border-slate-700 h-10 px-3 flex-shrink-0"
              >
                <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30 overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <span className="hidden md:inline text-xs font-semibold max-w-[120px] truncate">{user?.name || 'Student'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu */}
              <div className={`absolute right-0 mt-2 w-48 sm:w-56 bg-[#0d1b3e] border border-purple-500/30 rounded-xl shadow-2xl py-2 z-50 transition-all duration-200 ${profileDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-purple-500/20">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{user?.name || 'Student User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || 'student@example.com'}</p>
                </div>
                
                <Link href="/student/dashboard" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-slate-800/80 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Dashboard
                </Link>
                
                <Link href="/student/profile" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-slate-800/80 hover:text-white transition-colors">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  My Profile
                </Link>
                
                <Link href="/student/courses" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-slate-800/80 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  My Courses
                </Link>
                
                <Link href="/student/certificates" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-slate-800/80 hover:text-white transition-colors">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Certificates
                </Link>
                
                <Link href="/student/settings" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-slate-800/80 hover:text-white transition-colors">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Settings
                </Link>
                
                <div className="border-t border-purple-500/20 mt-2 pt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
