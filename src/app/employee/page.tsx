'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Phone, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Target,
  Award,
  Star,
  Activity,
  BarChart3,
  Zap,
  Rocket,
  Crown,
  Shield,
  Globe,
  MessageSquare,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Bell,
  Settings,
  User,
  Mail,
  MapPin,
  Building,
  Monitor,
  Smartphone,
  GraduationCap
} from 'lucide-react';

interface Enrollment {
  id: string;
  studentName: string;
  course: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
  phone?: string;
  email?: string;
}

interface QuickStats {
  totalEnrollments: number;
  pendingFollowups: number;
  todayCalls: number;
  completedCalls: number;
  monthlyRevenue: number;
  conversionRate: number;
}

interface Activity {
  id: string;
  type: 'call' | 'enrollment' | 'followup' | 'status_update';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalEnrollments: 0,
    pendingFollowups: 0,
    todayCalls: 0,
    completedCalls: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample data
  const enrollments: Enrollment[] = [
    {
      id: '1',
      studentName: 'Rahul Kumar',
      course: 'Government Job Preparation',
      category: 'GOVERNMENT',
      status: 'pending',
      enrolledAt: '2024-01-15T10:30:00Z',
      phone: '+880 1234-567890',
      email: 'rahul@email.com'
    },
    {
      id: '2',
      studentName: 'Priya Sharma',
      course: 'Full Stack Web Development',
      category: 'RECORDED',
      status: 'approved',
      enrolledAt: '2024-01-15T09:15:00Z',
      phone: '+880 2345-678901',
      email: 'priya@email.com'
    },
    {
      id: '3',
      studentName: 'Amit Singh',
      course: 'Live Full Stack Bootcamp',
      category: 'ONLINE',
      status: 'pending',
      enrolledAt: '2024-01-14T16:45:00Z',
      phone: '+880 3456-789012',
      email: 'amit@email.com'
    },
    {
      id: '4',
      studentName: 'Neha Gupta',
      course: 'Classroom Full Stack Training',
      category: 'OFFLINE',
      status: 'rejected',
      enrolledAt: '2024-01-14T14:20:00Z',
      phone: '+880 4567-890123',
      email: 'neha@email.com'
    },
    {
      id: '5',
      studentName: 'Vikram Reddy',
      course: 'Data Science & Machine Learning',
      category: 'RECORDED',
      status: 'approved',
      enrolledAt: '2024-01-13T11:30:00Z',
      phone: '+880 5678-901234',
      email: 'vikram@email.com'
    }
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setQuickStats({
        totalEnrollments: 156,
        pendingFollowups: 24,
        todayCalls: 12,
        completedCalls: 8,
        monthlyRevenue: 2340000,
        conversionRate: 68.5
      });

      setRecentActivities([
        {
          id: '1',
          type: 'enrollment',
          title: 'New Enrollment',
          description: 'Rahul Kumar enrolled in Government Job Preparation',
          timestamp: '2 minutes ago',
          icon: <Users className="w-4 h-4" />
        },
        {
          id: '2',
          type: 'call',
          title: 'Call Completed',
          description: 'Spoke with Priya Sharma about course details',
          timestamp: '15 minutes ago',
          icon: <Phone className="w-4 h-4" />
        },
        {
          id: '3',
          type: 'followup',
          title: 'Follow-up Scheduled',
          description: 'Follow-up with Amit Singh scheduled for tomorrow',
          timestamp: '1 hour ago',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          id: '4',
          type: 'status_update',
          title: 'Status Updated',
          description: 'Neha Gupta application status updated',
          timestamp: '2 hours ago',
          icon: <CheckCircle className="w-4 h-4" />
        }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <CheckCircle className="w-3 h-3" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs font-semibold shadow-lg">
            <XCircle className="w-3 h-3" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GOVERNMENT': return <GraduationCap className="w-4 h-4" />;
      case 'RECORDED': return <Monitor className="w-4 h-4" />;
      case 'ONLINE': return <Smartphone className="w-4 h-4" />;
      case 'OFFLINE': return <Building className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GOVERNMENT': return 'from-orange-500 to-red-500';
      case 'RECORDED': return 'from-purple-500 to-pink-500';
      case 'ONLINE': return 'from-blue-500 to-cyan-500';
      case 'OFFLINE': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleCall = (enrollmentId: string, studentName: string) => {
    console.log('Calling student:', studentName);
    // TODO: Implement CRM logic
  };

  const handleUpdateStatus = (enrollmentId: string) => {
    console.log('Updating status for enrollment:', enrollmentId);
    // TODO: Implement CRM logic
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Employee Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Welcome back! Here's your professional workspace overview.
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-gray-300 text-sm">Current Time</p>
                <p className="text-white text-2xl font-bold">
                  {mounted ? currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  }) : ''}
                </p>
                <p className="text-gray-400 text-sm">
                  {mounted ? currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Enrollments */}
          <div className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-1 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gray-900 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  12%
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Total Enrollments</h3>
              <p className="text-white text-3xl font-bold">{quickStats.totalEnrollments}</p>
              <p className="text-gray-500 text-sm mt-1">This month</p>
            </div>
          </div>

          {/* Pending Follow-ups */}
          <div className="group relative bg-gradient-to-br from-orange-600 to-red-600 p-1 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gray-900 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-orange-400 text-sm animate-pulse">
                  <Bell className="w-4 h-4 mr-1" />
                  {quickStats.pendingFollowups}
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Pending Follow-ups</h3>
              <p className="text-white text-3xl font-bold">{quickStats.pendingFollowups}</p>
              <p className="text-gray-500 text-sm mt-1">Require attention</p>
            </div>
          </div>

          {/* Today's Calls */}
          <div className="group relative bg-gradient-to-br from-green-600 to-emerald-600 p-1 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gray-900 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <Play className="w-4 h-4 mr-1" />
                  {quickStats.completedCalls}/{quickStats.todayCalls}
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Today's Calls</h3>
              <p className="text-white text-3xl font-bold">{quickStats.todayCalls}</p>
              <p className="text-gray-500 text-sm mt-1">{quickStats.completedCalls} completed</p>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="group relative bg-gradient-to-br from-purple-600 to-pink-600 p-1 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="bg-gray-900 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  8%
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Monthly Revenue</h3>
              <p className="text-white text-3xl font-bold">৳{(quickStats.monthlyRevenue / 100000).toFixed(1)}L</p>
              <p className="text-gray-500 text-sm mt-1">Conversion: {quickStats.conversionRate}%</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Enrollments */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Recent Enrollments
                  </h2>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View All →
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getCategoryColor(enrollment.category)} flex items-center justify-center`}>
                            {getCategoryIcon(enrollment.category)}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{enrollment.studentName}</p>
                            <p className="text-gray-400 text-sm">{enrollment.course}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(enrollment.category)} text-white`}>
                                {enrollment.category}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(enrollment.status)}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCall(enrollment.id, enrollment.studentName)}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Call Student"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(enrollment.id)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="Update Status"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activities
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-white/10 rounded-lg text-blue-400">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{activity.description}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Start Call Session
                </button>
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Follow-up
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
