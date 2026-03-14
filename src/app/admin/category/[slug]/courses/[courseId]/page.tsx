"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  FileText,
  Lock,
  Unlock,
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Eye,
  Settings,
  Star,
  Award,
  Play,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface Module {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  homework?: string;
  order: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

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
}

const CourseDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');

  useEffect(() => {
    fetchCourseDetails();
    fetchModules();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`);
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GOVERNMENT': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'ONLINE': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'OFFLINE': 'bg-gradient-to-r from-green-500 to-green-600',
      'RECORDED': 'bg-gradient-to-r from-orange-500 to-orange-600'
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'GOVERNMENT': <Award className="w-6 h-6" />,
      'ONLINE': <Play className="w-6 h-6" />,
      'OFFLINE': <BookOpen className="w-6 h-6" />,
      'RECORDED': <Video className="w-6 h-6" />
    };
    return icons[category] || <BookOpen className="w-6 h-6" />;
  };

  const openVideoModal = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setCurrentVideoUrl('');
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
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
          <div className="relative bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
            <Button 
              onClick={() => router.push(`/admin/category/${slug}`)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-200/90 via-gray-100 to-purple-200/90 backdrop-blur-lg border-b border-gray-300/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Mobile Layout */}
          <div className="flex flex-col lg:hidden gap-3 w-full">
            <div className="flex items-center justify-between w-full min-w-0">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses`)}
                className="flex items-center gap-1 bg-white/90 hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 hover:text-gray-900 text-xs py-2 px-2 flex-shrink-0"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <Button
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 px-3 py-2 text-xs flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
            
            <div className="space-y-2 w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${getCategoryColor(course.category)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  {getCategoryIcon(course.category)}
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-2 break-words min-w-0 flex-1">
                  {course.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(course.category)} shadow-md`}>
                  {getCategoryIcon(course.category)}
                  {getCategoryName(course.category)}
                </div>
                <Badge className={course.isActive ? 'bg-green-100 text-green-800 border-green-200 text-xs' : 'bg-red-100 text-red-800 border-red-200 text-xs'}>
                  <div className="flex items-center gap-1">
                    {course.isActive ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    {course.isActive ? 'Active' : 'Inactive'}
                  </div>
                </Badge>
                {modules.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                    {modules.length} mod{modules.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules`)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 text-xs py-1.5 px-2"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Modules
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/students`)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 text-xs py-1.5 px-2"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Students
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-col gap-4 w-full">
            {/* Top Row - Back Button and Add Module */}
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses`)}
                className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 hover:text-gray-900 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Back to {getCategoryName(slug)} Courses
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules`)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 group"
                >
                  <Settings className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Manage Modules
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/students`)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-200 text-gray-800 group"
                >
                  <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Preview Students
                </Button>
                <Button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 px-6 py-3 group hover:scale-105"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  Add Module
                </Button>
              </div>
            </div>

            {/* Bottom Row - Course Title and Info */}
            <div className="flex items-center gap-6 w-full">
              <div className={`w-12 h-12 rounded-xl ${getCategoryColor(course.category)} flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                {getCategoryIcon(course.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-2 break-words">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white ${getCategoryColor(course.category)} shadow-md hover:shadow-lg transition-all duration-200`}>
                    {getCategoryIcon(course.category)}
                    {getCategoryName(course.category)}
                  </div>
                  <Badge className={course.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    <div className="flex items-center gap-1">
                      {course.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {course.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </Badge>
                  {modules.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                      {modules.length} module{modules.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-8 bg-gradient-to-br from-white/50 via-transparent to-white/50 backdrop-blur-sm rounded-3xl mx-6 my-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className={`h-32 ${getCategoryColor(course.category)} relative`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(course.category)}
                    <span className="font-semibold">{getCategoryName(course.category)}</span>
                  </div>
                  <h3 className="text-xl font-bold">{course.title}</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Price */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <span className="text-2xl text-blue-600 mx-auto mb-2 block">৳</span>
                  <p className="text-2xl font-bold text-blue-900">৳{course.price.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Course Price</p>
                </div>
                
                {/* Duration */}
                {course.duration && (
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-900">{course.duration}</p>
                    <p className="text-sm text-green-600">Duration</p>
                  </div>
                )}
                
                {/* Mentor */}
                {course.mentor && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-900">{course.mentor.name}</p>
                        <p className="text-sm text-purple-600 truncate">{course.mentor.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Created Date */}
                <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Created</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-12 px-4 text-gray-700 hover:text-gray-900"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/edit`)}
                >
                  <Edit className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600" />
                  <span className="truncate font-medium text-gray-700">Edit Course</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-12 px-4 text-gray-700 hover:text-gray-900"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules`)}
                >
                  <Settings className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600" />
                  <span className="truncate font-medium text-gray-700">Manage Modules</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-12 px-4 text-gray-700 hover:text-gray-900"
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/students`)}
                >
                  <Users className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600" />
                  <span className="truncate font-medium text-gray-700">Preview Students</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-12 px-4 text-gray-700 hover:text-gray-900"
                  onClick={() => window.open(`/student/course-view/${courseId}`, '_blank')}
                >
                  <Eye className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600" />
                  <span className="truncate font-medium text-gray-700">Preview as Student</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-gray-600" />
                      Course Modules
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {modules.length === 0 
                        ? 'No modules yet. Create your first module to get started.'
                        : `${modules.length} module${modules.length > 1 ? 's' : ''} in this course`
                      }
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
                      <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Modules Yet</h3>
                        <p className="text-gray-600 mb-6">Start by creating your first module.</p>
                        <Button
                          onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Module
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        {/* Module Number */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                        
                        <div className="p-8">
                          <div className="flex items-start gap-6">
                            {/* Module Number Circle */}
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xl">
                              {module.order}
                            </div>
                            
                            {/* Module Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-gray-900 truncate">
                                  {module.title}
                                </h3>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <Badge className={module.isLocked ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
                                    <div className="flex items-center gap-2">
                                      {module.isLocked ? (
                                        <>
                                          <Lock className="w-4 h-4" />
                                          Locked
                                        </>
                                      ) : (
                                        <>
                                          <Unlock className="w-4 h-4" />
                                          Unlocked
                                        </>
                                      )}
                                    </div>
                                  </Badge>
                                  {module.title.includes('Demo') || module.title.includes('Introduction') ? (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      Demo
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                              
                              {/* Video URL */}
                              {module.videoUrl && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                  <Video className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-600 font-medium truncate mb-1">Video available</p>
                                    <p className="text-gray-500 text-xs truncate">{module.videoUrl}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => openVideoModal(module.videoUrl!)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Play
                                  </Button>
                                </div>
                              )}
                              
                              {/* Homework */}
                              {module.homework && (
                                <div className="text-sm text-gray-600 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                  <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="line-clamp-3 flex-1 whitespace-pre-wrap font-medium">{module.homework}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-6">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/${module.id}/edit`)}
                                className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-10 px-4"
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeVideoModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Video Player</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={closeVideoModal}
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Video Container */}
            <div className="p-6">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={currentVideoUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Course Video"
                />
              </div>
              
              {/* Video Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Video URL:</span> {currentVideoUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="h-8"></div> {/* Bottom spacing */}
    </div>
  );
};

export default CourseDetailsPage;
