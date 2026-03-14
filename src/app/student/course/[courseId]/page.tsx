"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  BookOpen,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Users
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

const StudentCourseRedirectPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    checkEnrollment();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/student/course/${courseId}/enrollment`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.enrolled) {
        setEnrolled(true);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleGoToLearning = () => {
    window.location.href = `/student/learn/${courseId}`;
  };

  const handleViewCourseDetails = () => {
    window.location.href = `/course/${courseId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/student/dashboard'}
              className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200/60"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge className={course.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                <div className="flex items-center gap-1">
                  {course.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {course.isActive ? 'Active' : 'Inactive'}
                </div>
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {course.category}
              </Badge>
            </div>

            {enrolled ? (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-green-900 mb-2">You're Enrolled!</h2>
                  <p className="text-green-700">You have access to this course. Start learning now.</p>
                </div>
                
                <Button
                  onClick={handleGoToLearning}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg mx-auto"
                  size="lg"
                >
                  <PlayCircle className="w-5 h-5" />
                  Start Learning
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-yellow-900 mb-2">Not Enrolled Yet</h2>
                  <p className="text-yellow-700">You need to enroll in this course to access the learning materials.</p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleViewCourseDetails}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Course Details
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = `/course/${courseId}`}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    Enroll Now
                  </Button>
                </div>
              </div>
            )}

            {/* Course Mentor Info */}
            {course.mentor && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Instructor:</span> {course.mentor.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseRedirectPage;
