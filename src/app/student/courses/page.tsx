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
      'PROGRAMMING': 'bg-blue-100 text-blue-700 border-blue-200',
      'DESIGN': 'bg-purple-100 text-purple-700 border-purple-200',
      'BUSINESS': 'bg-green-100 text-green-700 border-green-200',
      'MARKETING': 'bg-orange-100 text-orange-700 border-orange-200',
      'DATA_SCIENCE': 'bg-red-100 text-red-700 border-red-200',
      'GOVERNMENT': 'bg-gray-100 text-gray-700 border-gray-200',
      'ONLINE': 'bg-blue-100 text-blue-700 border-blue-200',
      'OFFLINE': 'bg-green-100 text-green-700 border-green-200',
      'RECORDED': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">{courses.length}</span> courses enrolled
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.enrollmentStatus === 'COMPLETED' || (c.enrollmentStatus === 'ADMITTED' && c.progress === 100)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(c => c.enrollmentStatus === 'ADMITTED' && c.progress < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.length > 0 ? Math.round(courses.reduce((acc, course) => acc + (course.progress || 0), 0) / courses.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Card className="bg-white border-0 shadow-lg rounded-2xl">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No courses enrolled yet</h3>
            <p className="text-gray-500 mb-8 text-lg">You haven't enrolled in any courses yet.</p>
            <p className="text-sm text-gray-400 mb-4">Check the browser console for debugging information.</p>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg shadow-lg">
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Course Image */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
                  <BookOpen className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className={getCategoryColor(course.category)}>
                  {course.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={
                  course.enrollmentStatus === 'ADMITTED' ? 'bg-green-100 text-green-800' :
                  course.enrollmentStatus === 'APPLIED' ? 'bg-yellow-100 text-yellow-800' :
                  course.enrollmentStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }>
                  {course.enrollmentStatus}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="mr-4">{course.instructor}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="font-medium">{course.completedModules || 0}/{course.totalModules || 0}</span>
                    <span className="text-gray-400 ml-1">modules</span>
                  </div>
                  <span className="text-gray-500">{course.enrollmentStatus}</span>
                </div>
              </div>

              {/* Progress Bar - Only show for admitted courses */}
              {course.enrollmentStatus === 'ADMITTED' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(course.enrollmentStatus)}`}
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                className="w-full"
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
