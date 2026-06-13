"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Award, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  Home,
  Star,
  Video,
  FileText,
  User
} from "lucide-react";

interface MentorSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const mentorSidebarItems: MentorSidebarItem[] = [
  { name: "Dashboard", href: "/mentor", icon: <Home className="w-5 h-5" /> },
  { name: "Courses", href: "/mentor/courses", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Live Classes", href: "/mentor/live-classes", icon: <Video className="w-5 h-5" /> },
  { name: "Homework", href: "/mentor/homework", icon: <FileText className="w-5 h-5" /> },
  { name: "Certificates", href: "/mentor/certificates", icon: <Award className="w-5 h-5" /> },
  { name: "Attendance", href: "/mentor/attendance", icon: <Calendar className="w-5 h-5" /> },
  { name: "Profile", href: "/mentor/profile", icon: <User className="w-5 h-5" /> },
];

interface MentorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MentorSidebar = ({ isOpen = true, onClose }: MentorSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-gradient-to-b from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:inset-y-0 lg:left-0
        border-r border-purple-500/30
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-purple-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">MT</span>
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-white">Mentor Panel</h2>
              <p className="text-xs text-gray-400">Symphony Institute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {mentorSidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mentor" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-purple-500/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MT</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Mentor Portal</p>
              <p className="text-xs text-gray-400">Symphony Institute</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorSidebar;
