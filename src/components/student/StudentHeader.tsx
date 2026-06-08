"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, User, ChevronDown, Settings, Award, BookOpen } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";

interface StudentHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const StudentHeader = ({ onSidebarToggle, sidebarOpen }: StudentHeaderProps) => {
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
              className="lg:hidden p-2 rounded-md text-white hover:bg-green-700 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
            <div className="hidden sm:flex items-center ml-2 sm:ml-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-green-600 font-bold text-xs sm:text-sm">ST</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Student Dashboard</h1>
                <p className="text-xs text-green-100 hidden sm:block">Symphony Institute of Technology</p>
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
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all duration-200 border border-slate-600"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown menu */}
              <div className={`absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transition-all duration-200 ${profileDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}`}>
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">Student User</p>
                  <p className="text-xs text-gray-500 truncate">student@example.com</p>
                </div>
                
                <Link href="/student/dashboard" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-50 transition-colors">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Dashboard
                </Link>
                
                <Link href="/student/profile" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-50 transition-colors">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  My Profile
                </Link>
                
                <Link href="/student/courses" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-50 transition-colors">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  My Courses
                </Link>
                
                <Link href="/student/certificates" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-50 transition-colors">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Certificates
                </Link>
                
                <Link href="/student/settings" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-50 transition-colors">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-gray-400" />
                  Settings
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors"
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
