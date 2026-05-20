"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  User, 
  Calendar, 
  Award, 
  Settings, 
  LogOut, 
  Menu, 
  Home,
  Download,
  FileText,
  BarChart3,
  Bell,
  Video,
  Circle,
  Clock
} from "lucide-react";
import OnlineClassModal from "./OnlineClassModal";

interface StudentSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isOnlineClass?: boolean;
}

const studentSidebarItems: StudentSidebarItem[] = [
  { name: "Dashboard", href: "/student", icon: <Home className="w-5 h-5" /> },
  { name: "My Courses", href: "/student/courses", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Online Classes", href: "/student/online-classes", icon: <Video className="w-5 h-5" />, isOnlineClass: true, badge: "Live" },
  { name: "Homework", href: "/student/homework", icon: <FileText className="w-5 h-5" /> },
  { name: "All Notes", href: "/student/notes", icon: <FileText className="w-5 h-5" /> },
  { name: "Certificates", href: "/student/certificates", icon: <Download className="w-5 h-5" /> },
  { name: "Notifications", href: "/student/notifications", icon: <Bell className="w-5 h-5" />, badge: "3" },
  { name: "Profile", href: "/student/profile", icon: <User className="w-5 h-5" /> },
];

interface StudentSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const StudentSidebar = ({ isOpen = true, onClose }: StudentSidebarProps) => {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [showOnlineClassModal, setShowOnlineClassModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoinOnlineClass = () => {
    setShowOnlineClassModal(true);
  };

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
        fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-gradient-to-b from-gray-900 to-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:inset-y-0 lg:left-0
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-white">Student Panel</h2>
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

        {/* Online Class Banner */}
        <div className="mx-4 mt-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Circle className="w-3 h-3 text-white animate-pulse mr-2" />
              <div>
                <p className="text-white font-semibold text-sm">Live Class</p>
                <p className="text-red-100 text-xs">Starting in 15 mins</p>
              </div>
            </div>
            <button 
              onClick={handleJoinOnlineClass}
              className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-colors"
            >
              Join
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {studentSidebarItems.map((item) => {
            // Enhanced active route detection
            const isActive = 
              pathname === item.href || 
              (item.href === "/student/courses" && pathname.startsWith("/student/course")) ||
              (item.href !== "/student" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="ml-3">{item.name}</span>
                </div>
                
                {item.badge && (
                  <div className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${item.isOnlineClass 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-600 text-gray-200'
                    }
                  `}>
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-xs text-gray-400">Current Time</span>
              </div>
            </div>
            <p className="text-white font-semibold text-lg">
              {mounted ? currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              }) : currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
            <p className="text-gray-400 text-sm">
              {mounted ? currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              }) : currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center mt-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Student Portal</p>
              <p className="text-xs text-gray-400">Version 2.0</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Online Class Modal */}
      <OnlineClassModal 
        isOpen={showOnlineClassModal}
        onClose={() => setShowOnlineClassModal(false)}
      />
    </>
  );
};

export default StudentSidebar;
