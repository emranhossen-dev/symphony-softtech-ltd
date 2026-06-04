"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Play,
  Clock,
  Award,
  TrendingUp,
  User,
  GraduationCap,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface Course {
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
  enrolledAt: string;
  lastAccessed?: string;
  enrollmentStatus?: string;
  attendancePercentage?: number;
  certificateEligible?: boolean;
  certificate?: any;
}

interface StudentStats {
  totalEnrolled: number;
  totalCompleted: number;
  totalInProgress: number;
  averageProgress: number;
  totalHours: number;
  completedModules: number;
  totalModules: number;
  upcomingClasses: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalEnrolled: 0,
    totalCompleted: 0,
    totalInProgress: 0,
    averageProgress: 0,
    totalHours: 0,
    completedModules: 0,
    totalModules: 0,
    upcomingClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to /student/dashboard
    router.push('/student/dashboard');
  }, [router]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'PROGRAMMING': 'bg-blue-100 text-blue-700 border-blue-200',
      'DESIGN': 'bg-purple-100 text-purple-700 border-purple-200',
      'BUSINESS': 'bg-green-100 text-green-700 border-green-200',
      'MARKETING': 'bg-orange-100 text-orange-700 border-orange-200',
      'DATA_SCIENCE': 'bg-red-100 text-red-700 border-red-200',
      'GOVERNMENT': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const continueCourse = (courseId: string, courseSlug: string) => {
    // Navigate directly to the course learning page using slug
    window.location.href = `/student/learn/${courseSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e]">
      {/* Neon Blobs Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="neon-blob neon-blob-1"></div>
        <div className="neon-blob neon-blob-2"></div>
        <div className="neon-blob neon-blob-3"></div>
        <div className="neon-blob neon-blob-4"></div>
      </div>

      {/* Header */}
      <div className="glass-nav relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                <p className="text-sm text-gray-300">Welcome back, {user?.name || 'Student'}! Continue your learning journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</p>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">Welcome to Your Learning Journey, {user?.name || 'Student'}!</h2>
              <p className="text-gray-300 mb-4">You're making great progress. Keep up the excellent work!</p>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-gray-400 text-sm">Learning Hours</p>
                  <p className="text-2xl font-bold text-white">{stats.totalHours}h</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Modules Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completedModules}/{stats.totalModules}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Progress</p>
                  <p className="text-2xl font-bold text-white">{stats.averageProgress}%</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Award className="w-16 h-16 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Enrolled</p>
                  <p className="text-3xl font-bold text-white">{stats.totalEnrolled}</p>
                  <p className="text-xs text-purple-400 mt-1">+2 this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCompleted}</p>
                  <p className="text-xs text-green-400 mt-1">Great progress!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">In Progress</p>
                  <p className="text-3xl font-bold text-white">{stats.totalInProgress}</p>
                  <p className="text-xs text-orange-400 mt-1">Keep going!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Avg Progress</p>
                  <p className="text-3xl font-bold text-white">{stats.averageProgress}%</p>
                  <p className="text-xs text-pink-400 mt-1">Above average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">My Courses</h2>
              <p className="text-gray-400 text-sm mt-1">Continue your learning journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{courses.length} courses enrolled</span>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                Browse All Courses
              </Button>
            </div>
          </div>

          {courses.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No courses enrolled yet</h3>
                <p className="text-gray-400 mb-8 text-lg">Start your learning journey by enrolling in a course</p>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Course Thumbnail */}
                  <div className="h-56 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getCategoryColor(course.category)} border backdrop-blur-sm`}>
                        {course.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    {course.enrollmentStatus === 'ADMITTED' && course.progress >= 80 && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          Almost Done
                        </div>
                      </div>
                    )}
                    {course.enrollmentStatus !== 'ADMITTED' && (
                      <div className="absolute top-4 right-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.enrollmentStatus === 'APPLIED' ? 'bg-yellow-500 text-white' :
                          course.enrollmentStatus === 'WAITING' ? 'bg-orange-500 text-white' :
                          course.enrollmentStatus === 'REJECTED' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {course.enrollmentStatus}
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400 mb-3">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                        <div>
                          {course.enrollmentStatus === 'ADMITTED' ? (
                            <>
                              <span className="font-medium">{course.completedModules}/{course.totalModules}</span>
                              <span className="text-gray-400 ml-1">modules</span>
                            </>
                          ) : (
                            <span className="text-gray-400">Status: {course.enrollmentStatus}</span>
                          )}
                        </div>
                        {course.enrollmentStatus === 'ADMITTED' && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="font-medium text-purple-400">{course.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar - Only show for admitted courses */}
                    {course.enrollmentStatus === 'ADMITTED' && (
                      <div className="mb-6">
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Continue Button - Only show for admitted courses */}
                    {course.enrollmentStatus === 'ADMITTED' ? (
                      <Button 
                        onClick={() => continueCourse(course.id, course.slug)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    ) : (
                      <div className="w-full p-3 bg-gray-800/50 text-gray-300 rounded-lg text-center text-sm">
                        {course.enrollmentStatus === 'APPLIED' && 'Application under review'}
                        {course.enrollmentStatus === 'WAITING' && 'Payment required'}
                        {course.enrollmentStatus === 'REJECTED' && 'Enrollment rejected'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
