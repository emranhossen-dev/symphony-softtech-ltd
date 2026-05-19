"use client";

import { useState, useEffect } from 'react';
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

  const continueCourse = (courseSlug: string) => {
    // Navigate to course player page
    window.location.href = `/student/course/${courseSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Student'}! Continue your learning journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Your Learning Journey, {user?.name || 'Student'}!</h2>
              <p className="text-green-100 mb-4">You're making great progress. Keep up the excellent work!</p>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-green-100 text-sm">Learning Hours</p>
                  <p className="text-2xl font-bold">{stats.totalHours}h</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Modules Completed</p>
                  <p className="text-2xl font-bold">{stats.completedModules}/{stats.totalModules}</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm">Avg Progress</p>
                  <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Award className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEnrolled}</p>
                  <p className="text-xs text-green-600 mt-1">+2 this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCompleted}</p>
                  <p className="text-xs text-green-600 mt-1">Great progress!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInProgress}</p>
                  <p className="text-xs text-orange-600 mt-1">Keep going!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</p>
                  <p className="text-xs text-purple-600 mt-1">Above average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <p className="text-gray-500 text-sm mt-1">Continue your learning journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{courses.length} courses enrolled</span>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                Browse All Courses
              </Button>
            </div>
          </div>

          {courses.length === 0 ? (
            <Card className="bg-white border-0 shadow-lg rounded-2xl">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No courses enrolled yet</h3>
                <p className="text-gray-500 mb-8 text-lg">Start your learning journey by enrolling in a course</p>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Course Thumbnail */}
                  <div className="h-56 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 relative">
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
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div>
                          {course.enrollmentStatus === 'ADMITTED' ? (
                            <>
                              <span className="font-medium">{course.completedModules}/{course.totalModules}</span>
                              <span className="text-gray-400 ml-1">modules</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Status: {course.enrollmentStatus}</span>
                          )}
                        </div>
                        {course.enrollmentStatus === 'ADMITTED' && (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="font-medium text-green-600">{course.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar - Only show for admitted courses */}
                    {course.enrollmentStatus === 'ADMITTED' && (
                      <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
                        onClick={() => continueCourse(course.slug)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    ) : (
                      <div className="w-full p-3 bg-gray-100 text-gray-600 rounded-lg text-center text-sm">
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
