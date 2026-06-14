"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuth } from "@/contexts/AuthContext";
import OnlineClassModal from "./OnlineClassModal";

interface StudentSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isOnlineClass?: boolean;
}

const studentSidebarItems: StudentSidebarItem[] = [
  { name: "Dashboard", href: "/student/dashboard", icon: <Home className="w-5 h-5" /> },
  { name: "My Courses", href: "/student/courses", icon: <BookOpen className="w-5 h-5" /> },
  { name: "Online Classes", href: "/student/online-classes", icon: <Video className="w-5 h-5" />, isOnlineClass: true, badge: "Live" },
  { name: "Homework", href: "/student/homework", icon: <FileText className="w-5 h-5" /> },
  { name: "All Notes", href: "/student/notes", icon: <FileText className="w-5 h-5" /> },
  { name: "Certificates", href: "/student/certificates", icon: <Download className="w-5 h-5" /> },
  { name: "Quiz", href: "/student/quiz", icon: <FileText className="w-5 h-5" /> },
  { name: "Notifications", href: "/student/notifications", icon: <Bell className="w-5 h-5" />, badge: "3" },
  { name: "Profile", href: "/student/profile", icon: <User className="w-5 h-5" /> },
];

interface StudentSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const StudentSidebar = ({ isOpen = true, onClose }: StudentSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [showOnlineClassModal, setShowOnlineClassModal] = useState(false);

  // Live classes states
  const [activeSession, setActiveSession] = useState<any>(null);
  const [nextUpcomingSession, setNextUpcomingSession] = useState<any>(null);
  const [countdownText, setCountdownText] = useState<string>("");

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch('/api/student/online-classes');
      const data = await res.json();
      if (data.success && data.classes) {
        const classes = data.classes;
        
        // Find active live class
        const active = classes.find((c: any) => c.isActive);
        setActiveSession(active || null);
        
        // Find nearest upcoming live class
        const now = new Date();
        const upcoming = classes
          .filter((c: any) => !c.isActive && new Date(c.scheduledAt) > now)
          .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        
        setNextUpcomingSession(upcoming[0] || null);
      }
    } catch (err) {
      console.error("Error fetching live classes for sidebar banner:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Initial fetch
    fetchLiveClasses();
    
    // Poll for live classes list every 15 seconds to keep it sync
    const liveClassesPollInterval = setInterval(() => {
      fetchLiveClasses();
    }, 15000);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(liveClassesPollInterval);
      clearInterval(timer);
    };
  }, []);

  // Update countdown text dynamically
  useEffect(() => {
    if (activeSession) {
      setCountdownText("Live now!");
      return;
    }
    
    if (!nextUpcomingSession) {
      setCountdownText("");
      return;
    }
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventTime = new Date(nextUpcomingSession.scheduledAt).getTime();
      const diffMs = eventTime - now;
      
      if (diffMs <= 0) {
        setCountdownText("Starting now");
        return;
      }
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) {
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setCountdownText(`Starts in ${diffSecs}s`);
      } else if (diffMins < 60) {
        setCountdownText(`Starts in ${diffMins} mins`);
      } else if (diffHrs < 24) {
        const remainingMins = diffMins % 60;
        setCountdownText(`Starts in ${diffHrs}h ${remainingMins}m`);
      } else {
        const eventDate = new Date(nextUpcomingSession.scheduledAt);
        setCountdownText(`Starts: ${eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`);
      }
    };
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [activeSession, nextUpcomingSession]);

  const handleJoinOnlineClass = () => {
    router.push('/student/online-classes');
    if (onClose) onClose();
  };

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('');

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
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-purple-500/30">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/Logo.jpeg"
                alt="Symphony Institute of Technology"
                className="h-11 w-auto object-contain rounded-lg shadow-lg bg-white p-0.5"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight group-hover:text-purple-300 transition-colors">Symphony Institute</h2>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">of Technology</p>
            </div>
          </Link>
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
        {(activeSession || nextUpcomingSession) && (
          <div className={`mx-4 mt-6 p-4 rounded-xl shadow-lg border transition-all duration-300 ${
            activeSession 
              ? 'bg-gradient-to-r from-red-500 via-pink-600 to-red-600 border-red-400/30 text-white animate-pulse-slow' 
              : 'bg-gradient-to-r from-[#1e1b4b]/80 to-[#111827]/80 border-purple-500/30 text-gray-200 hover:border-purple-500/50'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center min-w-0 flex-1">
                {activeSession ? (
                  <Circle className="w-2.5 h-2.5 text-white animate-pulse mr-2.5 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-purple-400 mr-2.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs sm:text-sm truncate">
                    {activeSession ? activeSession.title : nextUpcomingSession.title}
                  </p>
                  <p className={`text-[10px] sm:text-xs truncate ${activeSession ? 'text-red-100 font-medium' : 'text-purple-300'}`}>
                    {countdownText}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleJoinOnlineClass}
                className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-all duration-200 shrink-0 ${
                  activeSession 
                    ? 'bg-white text-red-600 hover:bg-red-50' 
                    : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white border border-purple-500/30'
                }`}
              >
                {activeSession ? 'Join' : 'View'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {studentSidebarItems.map((item) => {
            // Enhanced active route detection
            const isActive = 
              pathname === item.href || 
              (item.href === "/student/dashboard" && (pathname === "/student" || pathname === "/student/dashboard")) ||
              (item.href === "/student/courses" && pathname.startsWith("/student/course")) ||
              (item.href !== "/student/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
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
        <div className="p-4 border-t border-purple-500/30">
          <div className="bg-gray-800/50 rounded-xl p-4">
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
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{user?.name ? getInitials(user.name) : 'ST'}</span>
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Student Portal'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'Version 2.0'}</p>
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
