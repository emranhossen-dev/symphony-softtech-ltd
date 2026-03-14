"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft,
  Play,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  Lock,
  Unlock,
  Video,
  FileText,
  User,
  Star,
  Award,
  TrendingUp,
  Download,
  Share2,
  Heart,
  MessageCircle,
  ChevronRight,
  Shield,
  Target,
  Zap,
  Eye
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
  category: string;
  price: number;
  duration?: string;
  thumbnail?: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    expertise?: string[];
    rating?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    modules: number;
  };
}

const StudentCourseView = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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
      console.error('Error fetching course:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`);
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules.sort((a: Module, b: Module) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    setEnrolled(true);
    setShowEnrollModal(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GOVERNMENT':
        return 'from-green-500 to-emerald-600';
      case 'ONLINE':
        return 'from-blue-500 to-indigo-600';
      case 'OFFLINE':
        return 'from-purple-500 to-pink-600';
      case 'RECORDED':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GOVERNMENT':
        return <Award className="w-5 h-5" />;
      case 'ONLINE':
        return <Video className="w-5 h-5" />;
      case 'OFFLINE':
        return <Users className="w-5 h-5" />;
      case 'RECORDED':
        return <Clock className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.close()}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200/60"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Student Preview</h1>
                  <p className="text-sm text-gray-600">See how students view this course</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowEnrollModal(true)}
                disabled={enrolled}
                className={`flex items-center gap-2 ${
                  enrolled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                } text-white border-0 shadow-lg`}
              >
                {enrolled ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enrolled
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Enroll Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Hero Section */}
      <div className="relative">
        <div className={`h-96 bg-gradient-to-r ${getCategoryColor(course.category)} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(course.category)}
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {getCategoryName(course.category)} Course
                </span>
                {course.isActive && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {course.shortDescription || course.description}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {course.price === 0 ? 'Free' : `৳${course.price.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl">{course.duration}</span>
                </div>
                {course._count && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xl">{course._count.modules} modules</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  About This Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Modules */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Course Modules
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {modules.length} modules
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Yet</h3>
                    <p className="text-gray-600">Modules will be available soon.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className={`border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                          selectedModule?.id === module.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedModule(module)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                            {module.order}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {module.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {module.isLocked ? (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <Unlock className="w-3 h-3" />
                                    Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {module.videoUrl && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Video className="w-4 h-4" />
                                <span className="truncate">Video lesson available</span>
                              </div>
                            )}
                            
                            {module.homework && (
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4" />
                                  <span>Homework assignment</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Module Details */}
            {selectedModule && (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {selectedModule.title}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedModule(null)}
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedModule.videoUrl && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video Lesson
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <a
                            href={selectedModule.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {selectedModule.videoUrl}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {selectedModule.homework && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Homework Assignment
                        </h4>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedModule.homework}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {new Date(selectedModule.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Info Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Instructor</h4>
                  {course.mentor ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.mentor.name}</p>
                        <p className="text-sm text-gray-600">{course.mentor.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Instructor information not available</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">Course Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modules:</span>
                      <span className="font-medium">{course._count?.modules || modules.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{course._count?.enrollments || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowEnrollModal(true)}
                  disabled={enrolled}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {enrolled ? 'Manage Enrollment' : 'Enroll Now'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: course.title,
                        text: course.shortDescription || course.description,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Course
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Comprehensive course materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Expert instructor guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Practical assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Certificate of completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Lifetime access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Enroll in Course</h2>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-blue-700">
                    {course.shortDescription || course.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="font-medium">Price:</span>
                    <span className="font-bold text-blue-900">
                      {course.price === 0 ? 'Free' : `৳${course.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleEnroll}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Confirm Enrollment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEnrollModal(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourseView;
