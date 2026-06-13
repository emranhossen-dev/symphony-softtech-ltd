'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, Bell, TrendingUp, Award, Users, PlayCircle, CheckCircle, XCircle, AlertCircle, Video, FileText, Download, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import EnhancedCourseCard from '@/components/student/EnhancedCourseCard';

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  category: string;
  duration: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  attendancePercentage: number;
  canReceiveCertificate: boolean;
  certificateEligible: boolean;
  certificate?: {
    id: string;
    certificateUrl: string;
    verificationId: string;
    issuedAt: string;
  };
  enrolledAt: string;
  lastAccessed: string;
  enrollmentStatus: string;
}

interface Notification {
  id: string;
  type: 'ANNOUNCEMENT' | 'REMINDER' | 'GRADE' | 'ASSIGNMENT' | 'LIVE_CLASS';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  averageProgress: number;
  upcomingClasses: number;
  unreadNotifications: number;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0,
    upcomingClasses: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  const [hasPassword, setHasPassword] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data with user information
      const dashboardResponse = await fetch('/api/student/dashboard', { credentials: 'include' });
      const dashboardData = await dashboardResponse.json();

      console.log('Dashboard API Response:', dashboardData);

      if (dashboardData.success) {
        // Set user information
        setUserName(dashboardData.user?.name || 'Student');

        // Set courses data
        setEnrolledCourses(dashboardData.courses || []);

        // Set stats
        setStats(dashboardData.stats || stats);

        // Set enrollment status based on first active enrollment
        const activeCourse = dashboardData.courses?.find(
          (c: any) => c.enrollmentStatus === 'ADMITTED' || c.enrollmentStatus === 'APPROVED'
        );
        setEnrollmentStatus(activeCourse ? activeCourse.enrollmentStatus : 'PENDING');
        setHasPassword(true);
      } else {
        console.error('Dashboard API error:', dashboardData.error);
        toast.error(dashboardData.error || 'Failed to load dashboard data');
      }

      // Fetch notifications separately
      const notificationsResponse = await fetch('/api/student/notifications', { credentials: 'include' });
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData.notifications || []);

      setLoading(false);
      console.log('Dashboard - Data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/student/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/student/notifications/read-all', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setStats(prev => ({ ...prev, unreadNotifications: 0 }));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-100 text-green-800';
      case 'APPLIED': return 'bg-yellow-100 text-yellow-800';
      case 'WAITING': return 'bg-orange-100 text-orange-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case 'ADMITTED': return 'Admitted - You can access this course';
      case 'APPLIED': return 'Pending Admin Review';
      case 'WAITING': return 'Payment Required';
      case 'REJECTED': return 'Enrollment Rejected';
      default: return 'Status Unknown';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getClassIcon = (type: string) => {
    switch (type) {
      case 'LIVE': return <Video className="w-4 h-4" />;
      case 'RECORDED': return <PlayCircle className="w-4 h-4" />;
      case 'QUIZ': return <FileText className="w-4 h-4" />;
      case 'ASSIGNMENT': return <FileText className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <Bell className="w-5 h-5" />;
      case 'REMINDER': return <Clock className="w-5 h-5" />;
      case 'GRADE': return <Award className="w-5 h-5" />;
      case 'ASSIGNMENT': return <FileText className="w-5 h-5" />;
      case 'LIVE_CLASS': return <Video className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'REMINDER': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'GRADE': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'ASSIGNMENT': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'LIVE_CLASS': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show verification pending page if no approved enrollment or no password
  // Disabled - user is already authenticated and logged in
  if (false && (!hasPassword || !enrollmentStatus || enrollmentStatus !== 'ADMITTED')) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Pending</h1>

          <div className="bg-white rounded-lg shadow-lg p-8 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  enrollmentStatus === 'ADMITTED' ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {enrollmentStatus === 'ADMITTED' && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Admin Approval</h3>
                  <p className="text-sm text-gray-600">
                    {enrollmentStatus === 'ADMITTED'
                      ? 'Your enrollment has been approved by admin.'
                      : 'Waiting for admin to review and approve your enrollment.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  hasPassword ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {hasPassword && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Password Setup</h3>
                  <p className="text-sm text-gray-600">
                    {hasPassword
                      ? 'You have successfully set your password.'
                      : 'You need to set your password to access the dashboard.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                {!enrollmentStatus || enrollmentStatus !== 'ADMITTED' && (
                  <li>• Wait for admin approval of your enrollment</li>
                )}
                {!hasPassword && (
                  <li>• Check your email for password setup link</li>
                )}
                <li>• Complete both steps to access your dashboard</li>
              </ol>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {userName}!</h1>
          <p className="text-gray-300 mt-1">Track your learning progress and upcoming activities</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-slate-800 border border-slate-700 rounded-lg shadow hover:bg-slate-700 transition-colors"
          >
            <Bell className="w-6 h-6 text-white" />
            {stats.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Total Courses</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalCourses}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Completed</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{stats.completedCourses}</p>
          </div>
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Learning Hours</p>
            <p className="text-3xl font-bold text-purple-400 mt-1">{stats.totalHours}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Avg Progress</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.averageProgress}%</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Upcoming</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{stats.upcomingClasses}</p>
          </div>
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
            <Calendar className="w-6 h-6 text-red-400" />
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Achievements</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">12</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-16 w-96 bg-[#0d1b3e] border border-purple-500/30 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">Notifications</h3>
              {stats.unreadNotifications > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-purple-500/10">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-500/10' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <EnhancedCourseCard
                key={course.id}
                course={course}
                onContinue={(courseId, courseSlug) => window.location.href = `/student/learn/${courseSlug}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-purple-500/10">
            {enrolledCourses.slice(0, 5).map((course) => (
              <div key={course.id} className="p-6 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{course.title}</h3>
                      <p className="text-sm text-gray-400">
                        Last accessed {new Date(course.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-300">
                      {course.progress}% complete
                    </div>
                    <div className="w-16 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
