"use client";

import { useState, useEffect } from "react";
import { useOptimizedFetch } from '@/hooks/useOptimizedFetch';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  UserCheck,
  Activity,
  Settings,
  BookOpen,
  Shield,
  UserPlus,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Search,
  PlusCircle,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Download,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatBDT } from "@/lib/currency";

interface DashboardStats {
  totalEnrollments: number;
  pendingApprovals: number;
  paymentPending: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  enrollmentGrowth: number;
  totalCourses: number;
  totalModules: number;
  completionRate: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "payment" | "approval" | "rejection" | "course_created" | "module_added";
  description: string;
  user: string;
  timestamp: string;
  formattedTimestamp?: string;
  amount?: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d, all
  const [exporting, setExporting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Use optimized fetch for dashboard data
  const { data: dashboardData, loading: dataLoading, error, refetch } = useOptimizedFetch<DashboardResponse>("/api/admin/dashboard", {
    showLoading: true,
    loadingMessage: 'Loading dashboard...',
    cacheTime: 3 * 60 * 1000, // 3 minutes cache
    retryCount: 2
  });

  // Extract data from the fetch response
  const stats: DashboardStats = dashboardData?.stats || {
    totalEnrollments: 0,
    pendingApprovals: 0,
    paymentPending: 0,
    activeStudents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    enrollmentGrowth: 0,
    totalCourses: 0,
    totalModules: 0,
    completionRate: 0,
  };

  const recentActivities: RecentActivity[] = dashboardData?.recentActivities || [];

  const quickActions: QuickAction[] = [
    {
      title: "Manage Users",
      description: "Create and manage admin & employee accounts",
      icon: <UserPlus className="w-5 h-5" />,
      href: "/admin/users",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Create Course",
      description: "Add new courses to the system",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/admin/courses/create",
      color: "from-green-500 to-green-600",
    },
    {
      title: "View Reports",
      description: "Generate detailed reports and analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin/analytics",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: <Settings className="w-5 h-5" />,
      href: "/admin/settings",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const filteredActivities = recentActivities.filter((activity) =>
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      const dataToExport = {
        stats,
        activities: recentActivities,
        exportDate: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color, 
    trend,
    subtitle,
    loading
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: React.ReactNode; 
    color: string; 
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    loading?: boolean;
  }) => (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      <CardContent className="p-6 relative">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3`}>
                {icon}
              </div>
              {change !== undefined && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                  trend === 'up' ? 'bg-green-100 text-green-700' : 
                  trend === 'down' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : 
                   trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
                   null}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Training Centre Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-600" />
              </Button>
              
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 px-3 py-2 text-sm"
              >
                <Download className={`w-4 h-4 ${exporting ? "animate-spin" : ""}`} />
              </Button>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-40 lg:w-48"
                />
              </div>
              <Button
                onClick={refetch}
                disabled={dataLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 px-4 py-2 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {dataLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{greeting}!</h2>
                    <p className="text-blue-100">Here's what's happening with your training center today</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                    <div className="text-xs text-blue-100">Total Enrollments</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold">{stats.activeStudents}</div>
                    <div className="text-xs text-blue-100">Active Students</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold">{stats.totalCourses}</div>
                    <div className="text-xs text-blue-100">Active Courses</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold">{formatBDT(stats.totalRevenue)}</div>
                    <div className="text-xs text-blue-100">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Enrollments"
                value={stats.totalEnrollments.toLocaleString()}
                change={stats.enrollmentGrowth}
                icon={<Users className="w-7 h-7" />}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                trend={stats.enrollmentGrowth > 0 ? 'up' : stats.enrollmentGrowth < 0 ? 'down' : 'neutral'}
                subtitle="All time"
                loading={dataLoading}
              />
              <StatCard
                title="Active Students"
                value={stats.activeStudents.toLocaleString()}
                icon={<UserCheck className="w-7 h-7" />}
                color="bg-gradient-to-r from-green-500 to-green-600"
                subtitle="Currently active"
                loading={dataLoading}
              />
              <StatCard
                title="Total Revenue"
                value={formatBDT(stats.totalRevenue)}
                change={stats.revenueGrowth}
                icon={<DollarSign className="w-7 h-7" />}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                trend={stats.revenueGrowth > 0 ? 'up' : stats.revenueGrowth < 0 ? 'down' : 'neutral'}
                subtitle="All time"
                loading={dataLoading}
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon={<AlertCircle className="w-7 h-7" />}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                subtitle="Requires attention"
                loading={dataLoading}
              />
            </div>

            {/* Revenue & Growth Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  {dataLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                      <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium mb-1">Monthly Revenue</p>
                          <p className="text-4xl font-bold">{formatBDT(stats.monthlyRevenue)}</p>
                          <p className="text-emerald-200 text-xs mt-1">This month</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        <span>{stats.revenueGrowth > 0 ? 'Growing' : 'Stable'} compared to last month</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  {dataLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                      <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-violet-100 text-sm font-medium mb-1">Course Completion Rate</p>
                          <p className="text-4xl font-bold">{stats.completionRate}%</p>
                          <p className="text-violet-200 text-xs mt-1">Average across all courses</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-violet-100">
                        <CheckCircle className="w-4 h-4" />
                        <span>Students are completing courses successfully</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index}
                    className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 cursor-pointer overflow-hidden bg-white"
                    onClick={() => router.push(action.href)}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${action.color}`}></div>
                    <CardContent className="p-6 relative">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mb-4`}>
                        {action.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Activities
                  </CardTitle>
                  <span className="text-sm text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                    {filteredActivities.length} of {recentActivities.length} activities
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        When students enroll, make payments, or when courses are created, activities will appear here.
                      </p>
                    </div>
                  ) : (
                    filteredActivities.slice(0, 10).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 to-indigo-50 transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-blue-200"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 ${
                          activity.type === 'enrollment' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          activity.type === 'payment' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                          activity.type === 'approval' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                          activity.type === 'rejection' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          activity.type === 'course_created' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' :
                          activity.type === 'module_added' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                          'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}>
                          {activity.type === 'enrollment' && <Users className="w-6 h-6 text-white" />}
                          {activity.type === 'payment' && <span className="text-xl font-bold text-white">৳</span>}
                          {activity.type === 'approval' && <UserCheck className="w-6 h-6 text-white" />}
                          {activity.type === 'rejection' && <AlertCircle className="w-6 h-6 text-white" />}
                          {activity.type === 'course_created' && <BookOpen className="w-6 h-6 text-white" />}
                          {activity.type === 'module_added' && <PlusCircle className="w-6 h-6 text-white" />}
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold mb-1">{activity.description}</p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <UserPlus className="w-3 h-3 text-gray-400" />
                              {activity.user}
                            </span>
                            {activity.amount && (
                              <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatBDT(activity.amount)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
