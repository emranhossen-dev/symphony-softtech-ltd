"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  Clock,
  Eye,
  RefreshCw,
  Users,
  BookOpen
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  regularPrice?: number;
  offerPrice?: number;
  duration?: string;
  thumbnail?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    enrollments: number;
    modules: number;
  };
}

const CoursesPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [slug, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: slug.toUpperCase(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/courses?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        toast.error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    return course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push(`/admin/category/${slug}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Category
              </button>
              
              <h1 className="text-3xl font-bold text-white">
                {slug.toUpperCase()} Courses
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your courses in this category
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCourses}
                disabled={loading}
                className="p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-400"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/create`)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white transition-all"
          />
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-400">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-800 rounded-2xl p-12 border border-gray-700">
              <p className="text-6xl mb-4">📚</p>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by creating your first course.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/create`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow relative">
                {/* Thumbnail */}
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    {course.regularPrice && course.offerPrice && course.regularPrice > course.offerPrice ? (
                      <>
                        <span className="text-lg font-bold text-gray-400 line-through">
                          ৳{course.regularPrice.toLocaleString()}
                        </span>
                        <span className="text-xl font-bold text-green-400">
                          ৳{course.offerPrice.toLocaleString()}
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {Math.round(((course.regularPrice - course.offerPrice) / course.regularPrice) * 100)}% OFF
                        </span>
                      </>
                    ) : course.offerPrice ? (
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ৳{course.offerPrice.toLocaleString()}
                      </span>
                    ) : course.regularPrice ? (
                      <span className="text-xl font-bold text-white">
                        ৳{course.regularPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">Free</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course._count?.modules || 0} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    
                    <button
                      onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/edit`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 p-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-400"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-red-700 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
