'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, BookOpen, Calendar, Clock, CheckCircle } from 'lucide-react';

interface CourseDetails {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string;
  enrolledStudents: number;
  isActive: boolean;
  modules?: any[];
  enrollments?: any[];
}

export default function CourseDetails() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/mentor/courses/${courseId}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setCourse(data.course);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="glass-card p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">Course not found</h3>
        <p className="text-gray-400">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                course.isActive
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {course.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{course.name || course.title}</h1>
            <p className="text-gray-300">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400">Enrolled Students</span>
          </div>
          <p className="text-2xl font-bold text-white">{course.enrolledStudents}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">Modules</span>
          </div>
          <p className="text-2xl font-bold text-white">{course.modules?.length || 0}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">Enrollments</span>
          </div>
          <p className="text-2xl font-bold text-white">{course.enrollments?.length || 0}</p>
        </div>
      </div>

      {/* Enrolled Students List */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Enrolled Students</h2>
        {course.enrollments && course.enrollments.length > 0 ? (
          <div className="space-y-3">
            {course.enrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {enrollment.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{enrollment.fullName}</p>
                    <p className="text-sm text-gray-400">{enrollment.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  enrollment.enrollmentStatus === 'ADMITTED' || enrollment.enrollmentStatus === 'APPLIED'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {enrollment.enrollmentStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">No students enrolled yet</p>
          </div>
        )}
      </div>

      {/* Modules List */}
      {course.modules && course.modules.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Course Modules</h2>
          <div className="space-y-3">
            {course.modules.map((module: any) => (
              <div key={module.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{module.title}</p>
                  <p className="text-sm text-gray-400">{module.description}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  module.isLocked
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {module.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
