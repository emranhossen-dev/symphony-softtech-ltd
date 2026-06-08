"use client";

import { useState } from "react";
import { Menu, X, LogOut, User, Bell, Award, Video } from "lucide-react";

interface MentorHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const MentorHeader = ({ onSidebarToggle, sidebarOpen }: MentorHeaderProps) => {
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
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-purple-600 font-bold text-xs sm:text-sm">MT</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Mentor Dashboard</h1>
                <p className="text-xs text-purple-100 hidden sm:block">Symphony Institute of Technology</p>
              </div>
            </div>
          </div>

          {/* Center - Title for mobile */}
          <div className="sm:hidden">
            <h1 className="text-sm font-semibold text-white">Mentor Panel</h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full text-white hover:bg-slate-700 relative">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Live Session Indicator */}
            <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1.5 rounded-full border border-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white hidden sm:inline">Live</span>
            </div>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center p-2 rounded-full text-white hover:bg-slate-700 transition-colors border border-slate-600">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MentorHeader;
