"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Play, 
  FileText,
  Lock,
  Unlock,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Star,
  Award,
  PlayCircle,
  CheckSquare
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
  completed?: boolean;
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

interface Progress {
  completedModules: string[];
  totalModules: number;
  completionPercentage: number;
}

const StudentLearnPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    fetchCourse();
    fetchModules();
    fetchProgress();
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
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);
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

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/student/course/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleModuleComplete = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/student/course/${courseId}/module/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update modules with completion status
        setModules(prev => prev.map(module => 
          module.id === moduleId ? { ...module, completed: true } : module
        ));
        fetchProgress(); // Refresh overall progress
      }
    } catch (error) {
      console.error('Error completing module:', error);
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
      'RECORDED': <Play className="w-6 h-6" />
    };
    return icons[category] || <BookOpen className="w-6 h-6" />;
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
      {/* Course Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/student/dashboard'}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200/60"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryColor(course.category)}`}>
                    {getCategoryIcon(course.category)}
                    {getCategoryName(course.category)}
                  </div>
                  {progress && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {progress.completionPercentage}% Complete
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-gray-600" />
                  Your Progress
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {progress && (
                  <>
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#3b82f6"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress.completionPercentage / 100)}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {progress.completionPercentage}%
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        {progress.completedModules.length} of {progress.totalModules} modules completed
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className={`h-24 ${getCategoryColor(course.category)} relative`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-lg font-bold">{course.title}</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Mentor */}
                {course.mentor && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course.mentor.name}</p>
                      <p className="text-xs text-gray-600">Instructor</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-gray-600" />
                    Course Modules
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {modules.length === 0 
                      ? 'No modules available yet.'
                      : `${modules.length} module${modules.length > 1 ? 's' : ''} in this course`
                    }
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Modules Available</h3>
                    <p className="text-gray-600">This course doesn't have any modules yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className={`group relative rounded-xl border transition-all duration-300 overflow-hidden ${
                          module.completed 
                            ? 'bg-green-50 border-green-200 hover:border-green-300' 
                            : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        {/* Module Number */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          module.completed 
                            ? 'bg-gradient-to-b from-green-500 to-green-600' 
                            : 'bg-gradient-to-b from-blue-500 to-purple-600'
                        }`}></div>
                        
                        <div className="p-6">
                          <div className="flex items-start gap-6">
                            {/* Module Number Circle */}
                            <div className={`w-16 h-16 text-white rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xl ${
                              module.completed 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}>
                              {module.completed ? <CheckCircle className="w-8 h-8" /> : module.order}
                            </div>
                            
                            {/* Module Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-gray-900 truncate">
                                  {module.title}
                                </h3>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {module.completed ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Completed
                                      </div>
                                    </Badge>
                                  ) : (
                                    <Badge className={module.isLocked ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                                      <div className="flex items-center gap-2">
                                        {module.isLocked ? (
                                          <>
                                            <Lock className="w-4 h-4" />
                                            Locked
                                          </>
                                        ) : (
                                          <>
                                            <Unlock className="w-4 h-4" />
                                            Available
                                          </>
                                        )}
                                      </div>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Video URL */}
                              {module.videoUrl && !module.isLocked && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                  <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  <a 
                                    href={module.videoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 truncate flex-1 font-medium"
                                  >
                                    Watch Video
                                  </a>
                                </div>
                              )}
                              
                              {/* Homework */}
                              {module.homework && !module.isLocked && (
                                <div className="text-sm text-gray-600 p-4 bg-purple-50 rounded-xl border border-purple-200 mb-4">
                                  <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="line-clamp-3 flex-1 whitespace-pre-wrap font-medium">{module.homework}</p>
                                  </div>
                                </div>
                              )}

                              {/* Locked Content Message */}
                              {module.isLocked && (
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600 font-medium">This module is locked</p>
                                  <p className="text-sm text-gray-500">Complete previous modules to unlock</p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {!module.completed && !module.isLocked && (
                                <div className="flex gap-3">
                                  {module.videoUrl && (
                                    <Button
                                      onClick={() => window.open(module.videoUrl, '_blank')}
                                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <PlayCircle className="w-4 h-4" />
                                      Watch
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleModuleComplete(module.id)}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                    Mark Complete
                                  </Button>
                                </div>
                              )}
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
    </div>
  );
};

export default StudentLearnPage;
