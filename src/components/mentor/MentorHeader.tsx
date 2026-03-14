"use client";

import { useState } from "react";
import { Menu, X, LogOut, User, Bell, Award, Video } from "lucide-react";

interface MentorHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const MentorHeader = ({ onSidebarToggle, sidebarOpen }: MentorHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Center - Title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900">Mentor Dashboard</h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Live Session Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <User className="w-6 h-6" />
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Earnings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <hr className="my-1" />
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MentorHeader;
