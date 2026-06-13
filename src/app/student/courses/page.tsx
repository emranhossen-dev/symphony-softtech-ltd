"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  instructor?: string;
  thumbnail?: string;
  description: string;
  duration: string;
  enrolledAt: string;
  lastAccessed?: string;
  enrollmentStatus: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  attendancePercentage?: number;
  canReceiveCertificate?: boolean;
  certificateEligible?: boolean;
  certificate?: any;
}

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/student/dashboard', { 
        credentials: 'include' 
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Courses found:', data.courses?.length || 0);
        setCourses(data.courses || []);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'PROGRAMMING': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'DESIGN': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'BUSINESS': 'bg-green-500/20 text-green-300 border-green-500/30',
      'MARKETING': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'DATA_SCIENCE': 'bg-red-500/20 text-red-300 border-red-500/30',
      'GOVERNMENT': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'ONLINE': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'OFFLINE': 'bg-green-500/20 text-green-300 border-green-500/30',
      'RECORDED': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'ADMITTED': 'bg-blue-500',
      'APPLIED': 'bg-yellow-500',
      'COMPLETED': 'bg-green-500',
      'REJECTED': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  const handleCourseAction = (courseId: string, enrollmentStatus: string) => {
    const course = courses.find(c => c.id === courseId);
    const courseSlug = course?.slug || courseId;

    if (enrollmentStatus === 'COMPLETED' || (enrollmentStatus === 'ADMITTED' && course?.progress === 100)) {
      // Navigate to certificates page or view certificate
      window.location.href = `/student/certificates`;
    } else if (enrollmentStatus === 'ADMITTED') {
      // Navigate to learn page for course content using slug
      window.location.href = `/student/learn/${courseSlug}`;
    } else {
      // For applied/pending courses, show course details
      window.location.href = `/student/course/${courseId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-300">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-300 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">{courses.length}</span> courses enrolled
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md border border-purple-500/20"
            onClick={() => window.location.href = '/courses'}
          >
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold text-white mt-1">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {courses.filter(c => c.enrollmentStatus === 'COMPLETED' || (c.enrollmentStatus === 'ADMITTED' && c.progress === 100)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Award className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">In Progress</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">
                  {courses.filter(c => c.enrollmentStatus === 'ADMITTED' && c.progress < 100).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">
                  {courses.length > 0 ? Math.round(courses.reduce((acc, course) => acc + (course.progress || 0), 0) / courses.length) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mb-6 border border-purple-500/20">
              <BookOpen className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No courses enrolled yet</h3>
            <p className="text-gray-300 mb-8 text-lg">You haven't enrolled in any courses yet.</p>
            <p className="text-sm text-gray-400 mb-4">Check the browser console for debugging information.</p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg border border-purple-500/30"
              onClick={() => window.location.href = '/courses'}
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
          <Card key={course.id} className="glass-card overflow-hidden hover:shadow-lg transition-shadow">
            {/* Course Image */}
            <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 relative">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                  <BookOpen className="w-16 h-16 text-purple-400 opacity-50" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className={`${getCategoryColor(course.category)} backdrop-blur-sm border`}>
                  {course.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={
                  course.enrollmentStatus === 'ADMITTED' ? 'bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm' :
                  course.enrollmentStatus === 'APPLIED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm' :
                  course.enrollmentStatus === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-sm' :
                  'bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm'
                }>
                  {course.enrollmentStatus}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <Users className="w-4 h-4 mr-1 text-purple-400" />
                  <span className="mr-4">{course.instructor}</span>
                  <Clock className="w-4 h-4 mr-1 text-purple-400" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="font-medium text-white">{course.completedModules || 0}/{course.totalModules || 0}</span>
                    <span className="text-gray-400 ml-1">modules</span>
                  </div>
                  <span className="text-gray-400">{course.enrollmentStatus}</span>
                </div>
              </div>

              {/* Progress Bar - Only show for admitted courses */}
              {course.enrollmentStatus === 'ADMITTED' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-medium text-white">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(course.enrollmentStatus)}`}
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md border border-purple-500/20"
                variant={course.enrollmentStatus === 'COMPLETED' || (course.enrollmentStatus === 'ADMITTED' && course.progress === 100) ? 'outline' : 'default'}
                onClick={() => handleCourseAction(course.id, course.enrollmentStatus)}
              >
                {course.enrollmentStatus === 'COMPLETED' || (course.enrollmentStatus === 'ADMITTED' && course.progress === 100) ? (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    View Certificate
                  </>
                ) : course.enrollmentStatus === 'ADMITTED' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </>
                ) : course.enrollmentStatus === 'APPLIED' ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Application Under Review
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {course.enrollmentStatus}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}
