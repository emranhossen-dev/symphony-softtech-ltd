'use client';

import { BookOpen, Users, Eye } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  enrolledStudents: number;
  status: 'active' | 'inactive';
  progress: number;
  thumbnail: string;
}

export default function MentorCourses() {
  const courses: Course[] = [
    {
      id: '1',
      name: 'Web Development Basics',
      category: 'Web Development',
      description: 'Learn HTML, CSS, and JavaScript fundamentals',
      enrolledStudents: 25,
      status: 'active',
      progress: 75,
      thumbnail: '/api/placeholder/400/250'
    },
    {
      id: '2',
      name: 'React Advanced Concepts',
      category: 'Web Development',
      description: 'Advanced React patterns and best practices',
      enrolledStudents: 18,
      status: 'active',
      progress: 60,
      thumbnail: '/api/placeholder/400/250'
    },
    {
      id: '3',
      name: 'Node.js Backend Development',
      category: 'Backend',
      description: 'Building scalable backend applications with Node.js',
      enrolledStudents: 22,
      status: 'active',
      progress: 45,
      thumbnail: '/api/placeholder/400/250'
    },
    {
      id: '4',
      name: 'Database Design Fundamentals',
      category: 'Database',
      description: 'Principles of database design and SQL',
      enrolledStudents: 15,
      status: 'inactive',
      progress: 90,
      thumbnail: '/api/placeholder/400/250'
    },
    {
      id: '5',
      name: 'Python Programming',
      category: 'Programming',
      description: 'Complete Python guide from basics to advanced',
      enrolledStudents: 30,
      status: 'active',
      progress: 80,
      thumbnail: '/api/placeholder/400/250'
    },
    {
      id: '6',
      name: 'Mobile App Development',
      category: 'Mobile',
      description: 'Build native mobile applications with React Native',
      enrolledStudents: 12,
      status: 'active',
      progress: 35,
      thumbnail: '/api/placeholder/400/250'
    }
  ];

  const handleViewDetails = (courseId: string) => {
    console.log('View course details:', courseId);
    // TODO: Implement navigation to course details
    alert(`Viewing details for course ${courseId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Courses</h1>
        <p className="text-gray-300 mt-1">Manage your assigned courses and track student progress.</p>
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
                  course.status === 'active'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {course.status}
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
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{course.enrolledStudents} students enrolled</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
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
