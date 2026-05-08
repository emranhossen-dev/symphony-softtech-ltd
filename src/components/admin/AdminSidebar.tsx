"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import CallRecordingPanel from './CallRecordingPanel';
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  GraduationCap,
  Award,
  Target,
  BarChart3,
  FileText,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Building,
  Monitor,
  PlayCircle,
  Search,
  Bell,
  Activity,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: MenuItem[];
}

interface QuickStats {
  totalStudents: number;
  totalRevenue: number;
  activeCourses: number;
  pendingApplications: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const AdminSidebar = ({ isOpen, onClose, isMobile }: AdminSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['Categories']);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Extract category name from current path
    const pathMatch = pathname.match(/\/admin\/category\/([^\/]+)/);
    if (pathMatch) {
      setCategoryName(pathMatch[1]);
    } else {
      setCategoryName('');
    }
    
    // Fetch quick stats
    fetchQuickStats();
  }, [pathname]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuickStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchQuickStats = async () => {
    try {
      console.log('Fetching quick stats...');
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      console.log('Stats response:', data);
      
      if (data.success) {
        setQuickStats(data.stats.quickStats);
        setRecentActivities(data.stats.recentActivities);
      } else {
        console.error('Stats API returned error:', data);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      // Set default zero values on error
      setQuickStats({
        totalStudents: 0,
        totalRevenue: 0,
        activeCourses: 0,
        pendingApplications: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActiveRoute = (href: string) => {
    // Exact match for most routes
    if (href === pathname) return true;
    
    // Special handling for category routes - only match exact category page
    if (href.includes('/admin/category/') && pathname.includes('/admin/category/')) {
      return href === pathname;
    }
    
    // For other nested routes, be more specific
    if (href !== '/' && pathname.startsWith(href)) {
      // Make sure it's not a more specific route
      const remainingPath = pathname.replace(href, '');
      return remainingPath === '' || remainingPath.startsWith('?');
    }
    
    return false;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    try {
      // Get token from cookie first, then localStorage
      const token = localStorage.getItem('auth-token') || 
                   document.cookie.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];
      
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Search across multiple entities
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.results.length > 0) {
          // Navigate to first result or show search results
          const firstResult = data.results[0];
          
          // Navigate based on result type
          switch (firstResult.type) {
            case 'student':
              window.location.href = `/admin/students?search=${searchQuery.trim()}`;
              break;
            case 'mentor':
              window.location.href = `/admin/mentors?search=${searchQuery.trim()}`;
              break;
            case 'course':
              window.location.href = `/admin/courses?search=${searchQuery.trim()}`;
              break;
            case 'enrollment':
              window.location.href = `/admin/enrollments?search=${searchQuery.trim()}`;
              break;
            default:
              // Navigate to a general search results page
              window.location.href = `/admin/search?q=${encodeURIComponent(searchQuery.trim())}`;
          }
        } else {
          // Show no results message
          alert('No results found for your search');
        }
      } else {
        console.error('Search failed');
        alert('Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search error. Please try again.');
    }
  };

  // Context-aware menu items based on current category
  const getCategoryMenuItems = () => {
    if (!categoryName) return [];

    const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    
    return [
      {
        title: 'Overview',
        href: `/admin/category/${categoryName}`,
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        title: 'Create Course',
        href: `/admin/category/${categoryName}/courses/create`,
        icon: <Plus className="w-4 h-4" />,
        badge: 'Auto-assigned'
      },
      {
        title: 'All Courses',
        href: `/admin/category/${categoryName}/courses`,
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        title: 'Enrollments',
        href: `/admin/category/${categoryName}/enrollment`,
        icon: <Users className="w-4 h-4" />
      },
      {
        title: 'Mentors',
        href: `/admin/category/${categoryName}/mentors`,
        icon: <GraduationCap className="w-4 h-4" />
      }
    ];
  };

  const mainMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: <Target className="w-4 h-4" />,
      children: [
        {
          title: 'Government',
          href: '/admin/category/government',
          icon: <Building className="w-4 h-4" />
        },
        {
          title: 'Online',
          href: '/admin/category/online',
          icon: <Monitor className="w-4 h-4" />
        },
        {
          title: 'Offline',
          href: '/admin/category/offline',
          icon: <FileText className="w-4 h-4" />
        },
        {
          title: 'Recorded',
          href: '/admin/category/recorded',
          icon: <PlayCircle className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Courses',
      href: '/admin/courses',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      title: 'Students',
      href: '/admin/students',
      icon: <Users className="w-4 h-4" />
    },
    {
      title: 'Mentors',
      href: '/admin/mentors',
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      title: 'Seminars',
      href: '/admin/seminars',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      title: 'Enrollments',
      href: '/admin/enrollments',
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      children: [
        {
          title: 'Overview',
          href: '/admin/analytics',
          icon: <TrendingUp className="w-4 h-4" />
        },
        {
          title: 'Revenue',
          href: '/admin/analytics/revenue',
          icon: <DollarSign className="w-4 h-4" />
        },
        {
          title: 'Performance',
          href: '/admin/analytics/performance',
          icon: <Award className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
      children: [
        {
          title: 'General',
          href: '/admin/settings',
          icon: <Settings className="w-4 h-4" />
        },
        {
          title: 'Users',
          href: '/admin/settings/users',
          icon: <Users className="w-4 h-4" />
        },
        {
          title: 'System',
          href: '/admin/settings/system',
          icon: <Settings className="w-4 h-4" />
        }
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.title);

    return (
      <div key={item.title}>
        <Link
          href={item.href}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.title);
            }
            if (isMobile) {
              onClose();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </Link>

        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
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
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-orange-500 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Admin Panel</h1>
            <p className="text-gray-400 text-xs">Management System</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Quick Stats</h3>
            {loading && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">
                {loading ? (
                  <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  quickStats.totalStudents.toLocaleString()
                )}
              </div>
              <div className="text-xs text-gray-400">Students</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-orange-500">
                {loading ? (
                  <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  `৳${quickStats.totalRevenue.toLocaleString()}`
                )}
              </div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">
                {loading ? (
                  <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  quickStats.activeCourses
                )}
              </div>
              <div className="text-xs text-gray-400">Courses</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-red-500">
                {loading ? (
                  <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  quickStats.pendingApplications
                )}
              </div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
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
                    {categoryName === 'government' && <Building className="w-4 h-4" />}
                    {categoryName === 'online' && <Monitor className="w-4 h-4" />}
                    {categoryName === 'offline' && <FileText className="w-4 h-4" />}
                    {categoryName === 'recorded' && <PlayCircle className="w-4 h-4" />}
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
                {[
                  { name: 'Government', slug: 'government', icon: <Building className="w-4 h-4" /> },
                  { name: 'Online', slug: 'online', icon: <Monitor className="w-4 h-4" /> },
                  { name: 'Offline', slug: 'offline', icon: <FileText className="w-4 h-4" /> },
                  { name: 'Recorded', slug: 'recorded', icon: <PlayCircle className="w-4 h-4" /> }
                ].map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      router.push(`/admin/category/${category.slug}`);
                      setCategoriesDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-sm transition-all duration-200 ${
                      pathname === `/admin/category/${category.slug}`
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
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
            <div className="border-t border-gray-800 pt-4 mt-4">
              <div className="text-xs text-gray-500 px-3 mb-2">
                Context-aware: All actions are auto-assigned to {categoryName} category
              </div>
            </div>
          </div>
        )}

        {/* Main Menu */}
        {!categoryName && mainMenuItems.map((item) => renderMenuItem(item))}

        {/* Call Recording Section */}
        <CallRecordingPanel />

        {/* Recent Activities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activities
            </div>
            <button 
              onClick={fetchQuickStats}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-gray-800">
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="w-full h-3 bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div className="w-2/3 h-2 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'enrollment' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 line-clamp-2">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            © 2024 Training Center
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
