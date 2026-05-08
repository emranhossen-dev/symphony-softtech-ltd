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
  
  const [searchQuery, setSearchQuery] = useState("");

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
      href: "/admin/reports",
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

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: React.ReactNode; 
    color: string; 
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Training Centre Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Students"
                value={stats.totalEnrollments.toLocaleString()}
                change={stats.enrollmentGrowth}
                icon={<Users className="w-6 h-6" />}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                trend={stats.enrollmentGrowth > 0 ? 'up' : stats.enrollmentGrowth < 0 ? 'down' : 'neutral'}
              />
              <StatCard
                title="Active Students"
                value={stats.activeStudents.toLocaleString()}
                icon={<UserCheck className="w-6 h-6" />}
                color="bg-gradient-to-r from-green-500 to-green-600"
              />
              <StatCard
                title="Total Revenue"
                value={formatBDT(stats.totalRevenue)}
                change={stats.revenueGrowth}
                icon={<span className="text-2xl font-bold text-white">৳</span>}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                trend={stats.revenueGrowth > 0 ? 'up' : stats.revenueGrowth < 0 ? 'down' : 'neutral'}
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon={<AlertCircle className="w-6 h-6" />}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 border-0 cursor-pointer overflow-hidden"
                    onClick={() => router.push(action.href)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-600" />
                    Recent Activities
                  </CardTitle>
                  <span className="text-sm text-gray-500">
                    {filteredActivities.length} of {recentActivities.length} activities
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                      <p className="text-gray-500">
                        When students enroll, make payments, or when courses are created, activities will appear here.
                      </p>
                    </div>
                  ) : (
                    filteredActivities.slice(0, 8).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'enrollment' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                          activity.type === 'approval' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'rejection' ? 'bg-red-100 text-red-600' :
                          activity.type === 'course_created' ? 'bg-indigo-100 text-indigo-600' :
                          activity.type === 'module_added' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'enrollment' && <Users className="w-5 h-5" />}
                          {activity.type === 'payment' && <span className="text-xl font-bold text-green-600">৳</span>}
                          {activity.type === 'approval' && <UserCheck className="w-5 h-5" />}
                          {activity.type === 'rejection' && <AlertCircle className="w-5 h-5" />}
                          {activity.type === 'course_created' && <BookOpen className="w-5 h-5" />}
                          {activity.type === 'module_added' && <PlusCircle className="w-5 h-5" />}
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">{activity.user}</span>
                            {activity.amount && (
                              <span className="text-sm font-medium text-green-600">
                                {formatBDT(activity.amount)}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
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
