'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Users, Eye, RefreshCw } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  enrolledStudents: number;
  isActive: boolean;
  thumbnail?: string;
}

export default function MentorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mentor/courses', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleViewDetails = (courseId: string) => {
    console.log('View course details:', courseId);
    // TODO: Implement navigation to course details
    alert(`Viewing details for course ${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-gray-300 mt-1">Manage your assigned courses and track student progress.</p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Course Thumbnail */}
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-90"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white opacity-50" />
              </div>
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  course.isActive
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              {/* Course Title */}
              <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>

              {/* Course Category */}
              <p className="text-sm text-gray-400 mb-3">{course.category}</p>

              {/* Course Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>

              {/* Students Count */}
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{course.enrolledStudents} students enrolled</span>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => handleViewDetails(course.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No courses assigned</h3>
          <p className="text-gray-400">You haven't been assigned any courses yet.</p>
        </div>
      )}
    </div>
  );
}
