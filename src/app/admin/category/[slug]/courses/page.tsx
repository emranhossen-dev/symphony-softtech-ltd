"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Video,
  FileText,
  Star,
  TrendingUp,
  Award,
  Play
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  duration?: string;
  thumbnail?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchCourses();
  }, [slug, searchTerm, filterStatus]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: slug.toUpperCase(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { isActive: filterStatus === 'active' ? 'true' : 'false' })
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

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GOVERNMENT': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'ONLINE': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'OFFLINE': 'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'RECORDED': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'GOVERNMENT': <Award className="w-4 h-4" />,
      'ONLINE': <Play className="w-4 h-4" />,
      'OFFLINE': <BookOpen className="w-4 h-4" />,
      'RECORDED': <Video className="w-4 h-4" />
    };
    return icons[category] || <BookOpen className="w-4 h-4" />;
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
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
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                        (filterStatus === 'active' && course.isActive) ||
                        (filterStatus === 'inactive' && !course.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-200/90 via-gray-100 to-purple-200/90 backdrop-blur-lg border-b border-gray-300/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-6">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}`)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {getCategoryName(slug)} Courses
              </Button>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${getCategoryColor(slug)} flex items-center justify-center shadow-lg`}>
                    {getCategoryIcon(slug)}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {getCategoryName(slug)} Courses
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white ${getCategoryColor(slug)} shadow-md`}>
                    {getCategoryIcon(slug)}
                    {getCategoryName(slug)}
                  </div>
                                  </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push(`/admin/category/${slug}/courses/create`)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 px-6 py-3"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
                className={filterStatus === 'active' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40 px-5 py-2.5 rounded-lg transition-all duration-200' 
                  : 'bg-white/95 backdrop-blur-sm border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 hover:shadow-md px-5 py-2.5 rounded-lg transition-all duration-200'
                }
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
                className={filterStatus === 'inactive' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/40 px-5 py-2.5 rounded-lg transition-all duration-200' 
                  : 'bg-white/95 backdrop-blur-sm border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 hover:shadow-md px-5 py-2.5 rounded-lg transition-all duration-200'
                }
              >
                Inactive
              </Button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCourses}
              disabled={loading}
              className="bg-white/95 backdrop-blur-sm border-gray-300 hover:bg-white hover:border-gray-400 hover:shadow-md px-4 py-2.5 rounded-lg transition-all duration-200 text-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with proper spacing */}
      <div className="relative">
        {/* Spacer to account for header height */}
        <div className="lg:hidden h-32"></div>
        <div className="hidden lg:block h-28"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Filters and Search */}
          <div className="bg-gradient-to-br from-gray-100 via-blue-100/70 to-purple-100/70 backdrop-blur-lg border-b border-gray-300/60 shadow-lg rounded-2xl mx-6 my-8">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm || filterStatus !== 'all' ? 'No courses found' : 'No courses yet'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by creating your first course and see your students succeed.'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button
                    onClick={() => router.push(`/admin/category/${slug}/courses/create`)}
                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Course
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <div key={course.id} className="group">
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(course.category).replace('text-white', 'to-transparent opacity-10')} pointer-events-none`}></div>
                  
                  {/* Header */}
                  <div className={`relative p-6 pb-4 ${getCategoryColor(course.category)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(course.category)}
                        <span className="text-white font-semibold text-sm">
                          {getCategoryName(course.category)}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.isActive 
                          ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30' 
                          : 'bg-red-500/80 text-white backdrop-blur-sm border border-red-400/50'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white line-clamp-2 mb-2 group-hover:text-white/95 transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-white/80 text-sm line-clamp-2">
                      {course.shortDescription || course.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 pt-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <span className="text-xl text-blue-600 mx-auto mb-1 block">৳</span>
                        <p className="font-bold text-blue-900">৳{course.price.toLocaleString()}</p>
                        <p className="text-xs text-blue-600">Price</p>
                      </div>
                      
                      {course.duration && (
                        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                          <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                          <p className="font-bold text-green-900 text-sm">{course.duration}</p>
                          <p className="text-xs text-green-600">Duration</p>
                        </div>
                      )}
                    </div>

                    {/* Mentor */}
                    {course.mentor && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-purple-900 truncate">{course.mentor.name}</p>
                          <p className="text-xs text-purple-600 truncate">{course.mentor.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 mb-6">
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{course._count?.enrollments || 0}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900">{course._count?.modules || 0}</p>
                        <p className="text-xs text-gray-600">Modules</p>
                      </div>
                      <div className="text-center">
                        <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Rating</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Course
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules`)}
                        className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="bg-white/70 backdrop-blur-sm hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 border-gray-200/60"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default CoursesPage;
