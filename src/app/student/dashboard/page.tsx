'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, Bell, TrendingUp, Award, Users, PlayCircle, CheckCircle, XCircle, AlertCircle, Video, FileText, Download, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnrolledCourse {
  id: string;
  courseName: string;
  category: string;
  instructor: string;
  thumbnail?: string;
  description: string;
  enrolledAt: string;
  enrollmentStatus?: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    lastAccessed: string;
    timeSpent: number;
  };
  upcomingClasses: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    duration: number;
    type: 'LIVE' | 'RECORDED' | 'QUIZ' | 'ASSIGNMENT';
    meetingLink?: string;
  }>;
  materials: Array<{
    id: string;
    title: string;
    type: 'VIDEO' | 'PDF' | 'DOCUMENT' | 'LINK';
    url: string;
    size?: string;
  }>;
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
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      // Get email from localStorage or query params
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email') || localStorage.getItem('studentEmail');
      
      if (!email) {
        // If no email, redirect to home
        window.location.href = '/';
        return;
      }
      
      // Check if student has approved enrollments and password
      const statusResponse = await fetch(`/api/student/status?email=${encodeURIComponent(email)}`);
      const statusData = await statusResponse.json();
      
      setEnrollmentStatus(statusData.enrollmentStatus);
      setHasPassword(statusData.hasPassword);
      
      // If no approved enrollments or no password, show verification message
      if (!statusData.hasApprovedEnrollment || !statusData.hasPassword) {
        setLoading(false);
        return;
      }
      
      // If approved and has password, fetch dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const coursesResponse = await fetch('/api/student/courses');
      const coursesData = await coursesResponse.json();
      
      // Fetch notifications
      const notificationsResponse = await fetch('/api/student/notifications');
      const notificationsData = await notificationsResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch('/api/student/stats');
      const statsData = await statsResponse.json();
      
      setEnrolledCourses(coursesData.courses || []);
      setNotifications(notificationsData.notifications || []);
      setStats(statsData.stats || stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
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
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_PENDING': return 'bg-orange-100 text-orange-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'Approved - You can access this course';
      case 'PENDING_REVIEW': return 'Pending Admin Review';
      case 'PAYMENT_PENDING': return 'Payment Required';
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
      case 'ANNOUNCEMENT': return 'bg-blue-100 text-blue-600';
      case 'REMINDER': return 'bg-yellow-100 text-yellow-600';
      case 'GRADE': return 'bg-green-100 text-green-600';
      case 'ASSIGNMENT': return 'bg-purple-100 text-purple-600';
      case 'LIVE_CLASS': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show verification pending page if no approved enrollment or no password
  if (!hasPassword || !enrollmentStatus || enrollmentStatus !== 'APPROVED') {
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
                  enrollmentStatus === 'APPROVED' ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {enrollmentStatus === 'APPROVED' && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Admin Approval</h3>
                  <p className="text-sm text-gray-600">
                    {enrollmentStatus === 'APPROVED' 
                      ? 'Your enrollment has been approved by admin.'
                      : 'Waiting for admin to review and approve your enrollment.'
                    }
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
                      : 'You need to set your password to access the dashboard.'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                {!enrollmentStatus || enrollmentStatus !== 'APPROVED' && (
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
              {!hasPassword && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Password
                </button>
              )}
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
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your learning progress and upcoming activities</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Bell className="w-6 h-6 text-gray-600" />
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Hours</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalHours}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.averageProgress}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-red-600">{stats.upcomingClasses}</p>
            </div>
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-indigo-600">12</p>
            </div>
            <Award className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {stats.unreadNotifications > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                  <BookOpen className="w-16 h-16 text-white" />
                  {course.enrollmentStatus && course.enrollmentStatus !== 'APPROVED' && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.enrollmentStatus)}`}>
                        {getStatusMessage(course.enrollmentStatus)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{course.courseName}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.category}</p>
                  
                  {course.enrollmentStatus === 'PENDING_REVIEW' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Your enrollment is under review</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Admin will review and approve your enrollment shortly
                      </p>
                    </div>
                  )}

                  {course.enrollmentStatus === 'PAYMENT_PENDING' && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Payment required</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Complete payment to access this course
                      </p>
                    </div>
                  )}

                  {course.enrollmentStatus === 'REJECTED' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Enrollment rejected</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        Please contact support for more information
                      </p>
                    </div>
                  )}

                  {course.enrollmentStatus === 'APPROVED' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{course.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress.percentage)}`}
                          style={{ width: `${course.progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {course.progress.completedLessons} of {course.progress.totalLessons} lessons completed
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Instructor: {course.instructor}</span>
                    {course.enrollmentStatus === 'APPROVED' && (
                      <span className="text-gray-500">{course.progress.timeSpent}h spent</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

            {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {enrolledCourses.slice(0, 5).map((course) => (
              <div key={course.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                      <p className="text-sm text-gray-600">
                        Last accessed {new Date(course.progress.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {course.progress.percentage}% complete
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(course.progress.percentage)}`}
                        style={{ width: `${course.progress.percentage}%` }}
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
