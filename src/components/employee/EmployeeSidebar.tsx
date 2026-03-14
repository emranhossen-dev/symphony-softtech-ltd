"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  Home,
  Briefcase,
  FileText,
  Calendar,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronRight,
  Target,
  Building,
  Monitor,
  PlayCircle
} from "lucide-react";

interface EmployeeSidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const employeeSidebarItems: EmployeeSidebarItem[] = [
  { name: "Dashboard", href: "/employee", icon: <Home className="w-5 h-5" /> },
  { name: "Enrollments", href: "/employee/enrollments", icon: <Briefcase className="w-5 h-5" /> },
  { name: "Follow-up", href: "/employee/followup", icon: <Calendar className="w-5 h-5" /> },
  { name: "Profile", href: "/employee/profile", icon: <Users className="w-5 h-5" /> },
];

interface EmployeeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const EmployeeSidebar = ({ isOpen, onClose, isMobile = false }: EmployeeSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    // Extract category name from current path
    const pathMatch = pathname.match(/\/employee\/category\/([^\/]+)/);
    if (pathMatch) {
      setCategoryName(pathMatch[1]);
    } else {
      setCategoryName('');
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    // Implementation for toggle if needed
  };

  const isActiveRoute = (href: string) => {
    if (href === pathname) return true;
    if (href.includes('/employee/category/') && pathname.includes('/employee/category/')) {
      return href === pathname;
    }
    if (href !== '/employee' && pathname.startsWith(href)) {
      const remainingPath = pathname.replace(href, '');
      return remainingPath === '' || remainingPath.startsWith('?');
    }
    return false;
  };

  const getCategoryMenuItems = () => {
    if (!categoryName) return [];

    const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    
    return [
      {
        title: 'Overview',
        href: `/employee/category/${categoryName}`,
        iconType: 'home'
      },
      {
        title: 'Enrollments',
        href: `/employee/category/${categoryName}/enrollments`,
        iconType: 'briefcase'
      }
    ];
  };

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'briefcase': return <Briefcase className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const categories = [
    { name: 'Government', slug: 'government', iconType: 'building' },
    { name: 'Online', slug: 'online', iconType: 'monitor' },
    { name: 'Offline', slug: 'offline', iconType: 'filetext' },
    { name: 'Recorded', slug: 'recorded', iconType: 'playcircle' }
  ];

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'building': return <Building className="w-4 h-4" />;
      case 'monitor': return <Monitor className="w-4 h-4" />;
      case 'filetext': return <FileText className="w-4 h-4" />;
      case 'playcircle': return <PlayCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const renderMenuItem = (item: any, level: number = 0) => {
    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        <Link
          href={item.href}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.title);
            }
            if (window.innerWidth < 1024 && onClose) {
              onClose();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0">
              {item.iconType ? getIconComponent(item.iconType) : <Home className="w-4 h-4" />}
            </span>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          )}
        </Link>
      </div>
    );
  };

  return (
    <div className={`sidebar-container fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out flex flex-col ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } ${isMobile ? 'lg:hidden' : 'lg:translate-x-0'}`}>
      
      {/* Mobile close button */}
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden z-10"
        >
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      )}

      {/* Fixed Header */}
      <div className="flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">EP</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Employee Panel</h1>
            <p className="text-gray-400 text-xs">Symphony Institute</p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {/* Category Selection - Always visible */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            Categories
          </div>
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {categoryName ? (
                  <>
                    {categoryName === 'government' && getCategoryIcon('building')}
                    {categoryName === 'online' && getCategoryIcon('monitor')}
                    {categoryName === 'offline' && getCategoryIcon('filetext')}
                    {categoryName === 'recorded' && getCategoryIcon('playcircle')}
                    <span className="capitalize">{categoryName}</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Select Category</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                categoriesDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Dropdown Menu */}
            {categoriesDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {categories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      router.push(`/employee/category/${category.slug}`);
                      setCategoriesDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-sm transition-all duration-200 ${
                      pathname === `/employee/category/${category.slug}`
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {getCategoryIcon(category.iconType)}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Context-aware Category Menu */}
        {categoryName && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <Target className="w-4 h-4" />
              {categoryName} Category
            </div>
            <div className="space-y-1">
              {getCategoryMenuItems().map((item) => renderMenuItem(item))}
            </div>
          </div>
        )}

        {/* Main Menu - Only show when not in a category */}
        {!categoryName && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              Main Menu
            </div>
            {employeeSidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/employee" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }
                  `}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="ml-3">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">EP</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Employee Portal</p>
            <p className="text-xs text-gray-400">Symphony Institute</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
