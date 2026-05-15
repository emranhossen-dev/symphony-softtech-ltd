"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, User, Bell, Settings, ChevronDown, Target, GraduationCap, Monitor, Smartphone, Building, Plus, Phone, Search } from "lucide-react";

interface EmployeeHeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const EmployeeHeader = ({ onSidebarToggle, sidebarOpen }: EmployeeHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const categories = [
    { name: 'Government', slug: 'government', icon: <GraduationCap className="w-4 h-4" />, color: 'from-orange-500 to-red-500' },
    { name: 'Recorded', slug: 'recorded', icon: <Monitor className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Online', slug: 'online', icon: <Smartphone className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Offline', slug: 'offline', icon: <Building className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' }
  ];

  const getCurrentCategory = () => {
    const pathMatch = pathname.match(/\/employee\/category\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : null;
  };

  const currentCategory = getCurrentCategory();
  
  // Get current category display name
  const getCurrentCategoryDisplay = () => {
    if (!currentCategory) return null;
    const category = categories.find(c => c.slug === currentCategory);
    return category ? category.name : null;
  };
  
  const currentCategoryDisplay = getCurrentCategoryDisplay();
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border-b border-white/20 shadow-2xl employee-header relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
      </div>
      
      <div className="relative px-2 sm:px-4 lg:px-6 h-full">
        <div className="flex items-center justify-between h-full min-h-16">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          {/* Center - Category Navigation and Search */}
          <div className="flex-1 flex items-center justify-center min-w-0 max-w-2xl mx-auto">
            {/* Mobile Layout */}
            <div className="flex items-center space-x-2 w-full sm:hidden">
              {/* Category Dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-white/20 border border-white/30 text-white/90 rounded-lg hover:bg-white/30 transition-all duration-300 text-xs font-medium backdrop-blur-sm"
                >
                  {currentCategoryDisplay ? (
                    (() => {
                      const category = categories.find(c => c.slug === currentCategory);
                      return category ? (
                        <>
                          <div className={`p-1 rounded bg-white/20`}>
                            {category.icon}
                          </div>
                          <span className="font-medium">{currentCategoryDisplay.slice(0, 1)}</span>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <>
                      <Target className="w-3 h-3" />
                      <span className="font-medium">Cat</span>
                    </>
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Mobile Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white/90 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-xs backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tablet Layout */}
            <div className="hidden sm:flex items-center space-x-3 w-full md:hidden">
              {/* Category Dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 border border-white/30 text-white/90 rounded-lg hover:bg-white/30 transition-all duration-300 text-sm font-medium backdrop-blur-sm"
                >
                  {currentCategoryDisplay ? (
                    (() => {
                      const category = categories.find(c => c.slug === currentCategory);
                      return category ? (
                        <>
                          <div className={`p-1.5 rounded bg-white/20`}>
                            {category.icon}
                          </div>
                          <span className="font-medium">{currentCategoryDisplay}</span>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Categories</span>
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Tablet Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students, courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white/90 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center space-x-4 w-full">
              {/* Category Dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onMouseEnter={() => setCategoryDropdownOpen(true)}
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 text-white/90 rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium backdrop-blur-sm"
                >
                  {currentCategoryDisplay ? (
                    (() => {
                      const category = categories.find(c => c.slug === currentCategory);
                      return category ? (
                        <>
                          <div className={`p-1.5 rounded-lg bg-white/20 backdrop-blur-sm`}>
                            {category.icon}
                          </div>
                          <span className="font-medium">{currentCategoryDisplay}</span>
                        </>
                      ) : null;
                    })()
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Categories</span>
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students, courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-white/90 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Quick Actions - Hidden on small mobile */}
            <div className="hidden sm:flex">
              <button
                onClick={() => router.push('/employee/enrollments?action=new')}
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/20 border border-white/30 text-white/90 rounded-lg hover:bg-white/30 transition-all duration-300 text-xs font-semibold backdrop-blur-sm"
              >
                <Plus className="w-3 h-3" />
                <span className="font-medium hidden xl:inline">Quick Action</span>
              </button>
            </div>

            {/* Mobile Quick Action */}
            <div className="sm:hidden">
              <button
                onClick={() => router.push('/employee/enrollments?action=new')}
                className="p-1.5 rounded-full bg-white/20 border border-white/30 text-white/90 hover:bg-white/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={() => router.push('/admin/whatsapp-messages')}
              className="p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 relative transition-all duration-200 group"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center p-1.5 sm:p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu - Responsive */}
        {categoryDropdownOpen && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 px-2 sm:px-4 lg:px-6 z-50"
          >
            <div className="bg-white/20 border border-white/30 rounded-2xl shadow-2xl py-2 max-w-4xl mx-auto backdrop-blur-xl">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Quick Access</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-3">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      router.push(`/employee/category/${category.slug}`);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      currentCategory === category.slug
                        ? 'bg-white/30 text-blue-400 border-2 border-blue-400'
                        : 'text-white/90 hover:bg-white/30 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white shadow-lg`}>
                      {category.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-xs sm:text-sm">{category.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-700">
                <button
                  onClick={() => {
                    router.push('/employee/enrollments');
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-white/90 hover:bg-white/30 rounded-xl transition-colors font-medium"
                >
                  <Target className="w-4 h-4" />
                  <span>All Enrollments</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmployeeHeader;
