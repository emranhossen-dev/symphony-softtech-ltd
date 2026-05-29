"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminVideoPlayer from '@/components/admin/AdminVideoPlayer';
import { 
  Plus, 
  Edit, 
  ArrowLeft,
  Clock,
  Eye,
  Users,
  Lock,
  Unlock,
  Video,
  FileText,
  BookOpen,
  Layers,
  CheckCircle,
  Tag,
  CalendarDays,
  ClipboardList,
  ArrowUpRight
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
  regularPrice?: number;
  offerPrice?: number;
  duration?: string;
  thumbnail?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const CourseDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const lockedModules = modules.filter((module) => module.isLocked).length;
  const videoModules = modules.filter((module) => module.videoUrl).length;
  const homeworkModules = modules.filter((module) => module.homework).length;

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
        fetchModules(courseId); // Use the courseId parameter directly
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      setLoading(false);
    }
  };

  const fetchModules = async (resolvedCourseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${resolvedCourseId}/modules`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gray-800 px-10 py-8 shadow-xl border border-gray-700">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-400"></div>
          <p className="text-sm font-medium text-gray-400">Loading course workspace...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-3xl p-10 border border-gray-700 text-center shadow-xl max-w-md w-full">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-white mb-3">Course Not Found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/admin/category/${slug}/courses`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses`)}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-blue-400"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </button>
              
              <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {course.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  course.isActive 
                    ? 'bg-emerald-900/50 text-emerald-400 ring-1 ring-emerald-700' 
                    : 'bg-rose-900/50 text-rose-400 ring-1 ring-rose-700'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/50 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-700">
                  <Tag className="h-3.5 w-3.5" />
                  {course.category || slug}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-900/50 px-3 py-1 text-xs font-bold text-purple-400 ring-1 ring-purple-700">
                  <Layers className="h-3.5 w-3.5" />
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-300 shadow-sm transition-all hover:border-blue-500 hover:bg-gray-700 hover:text-blue-400"
              >
                <ClipboardList className="w-4 h-4" />
                Modules
              </button>
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/edit`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-300 shadow-sm transition-all hover:border-blue-500 hover:bg-gray-700 hover:text-blue-400"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules/edit`)}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 sm:col-span-1"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/50 text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{modules.length}</p>
            <p className="text-sm font-medium text-gray-400">Total modules</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400">
              <Video className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{videoModules}</p>
            <p className="text-sm font-medium text-gray-400">With video</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/50 text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{homeworkModules}</p>
            <p className="text-sm font-medium text-gray-400">Homework</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-900/50 text-orange-400">
              <Lock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{lockedModules}</p>
            <p className="text-sm font-medium text-gray-400">Locked</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {course.thumbnail && (
              <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-800 shadow-sm">
                <div className="relative h-72">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="mb-2 text-sm font-bold uppercase tracking-wide text-white/80">Course thumbnail</p>
                    <h2 className="line-clamp-2 text-2xl font-black text-white">{course.title}</h2>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-700 text-gray-300">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-white">Course Description</h2>
              </div>
              <p className="whitespace-pre-wrap leading-8 text-gray-400">
                {course.description || 'No description added yet.'}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/50 text-blue-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Course Modules</h2>
                    <p className="text-sm font-medium text-gray-400">Ordered lesson flow for this course</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules/edit`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>
              
              {modules.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-600 bg-gray-700/50 px-6 py-14 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">
                    <Video className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-white">No modules yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">Create the first module with video, homework and lock settings so students can start learning step by step.</p>
                  <button
                    onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules/edit`)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.id} className="group rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-lg font-black text-white transition-colors group-hover:text-blue-400">
                                {module.title}
                              </h3>
                              <p className="mt-1 text-sm font-medium text-gray-400">Order {module.order}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules/${module.id}/edit`)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-600 bg-gray-800 text-gray-300 transition-colors hover:border-blue-500 hover:bg-gray-700 hover:text-blue-400"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules`)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-600 bg-gray-800 text-gray-300 transition-colors hover:border-purple-500 hover:bg-gray-700 hover:text-purple-400"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                          {module.videoUrl && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900/50 px-3 py-1.5 text-sm font-bold text-blue-400 ring-1 ring-blue-700">
                              <Video className="w-3.5 h-3.5" />
                              Video
                            </span>
                          )}
                          {module.homework && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-900/50 px-3 py-1.5 text-sm font-bold text-purple-400 ring-1 ring-purple-700">
                              <FileText className="w-3.5 h-3.5" />
                              Homework
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ring-1 ${
                            module.isLocked 
                              ? 'bg-orange-900/50 text-orange-400 ring-orange-700' 
                              : 'bg-emerald-900/50 text-emerald-400 ring-emerald-700'
                          }`}>
                            {module.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            {module.isLocked ? 'Locked' : 'Unlocked'}
                          </span>
                          </div>

                          {module.homework && (
                            <div className="mt-4 rounded-xl bg-gray-700 p-4 text-sm leading-6 text-gray-400 line-clamp-3">
                              {module.homework}
                            </div>
                          )}

                          {module.videoUrl && (
                            <div className="mt-4">
                              <h4 className="text-sm font-bold text-gray-300 mb-2">Video Content</h4>
                              <AdminVideoPlayer 
                                videoUrl={module.videoUrl} 
                                title={module.title}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/50 text-emerald-400">
                  <Tag className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-white">Course Summary</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-2xl font-bold text-white">Current Price</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                {course.regularPrice && course.offerPrice && course.regularPrice > course.offerPrice ? (
                  <>
                          <span className="text-lg font-bold text-gray-400 line-through">
                      ৳{course.regularPrice.toLocaleString()}
                    </span>
                          <span className="text-3xl font-black text-emerald-400">
                      ৳{course.offerPrice.toLocaleString()}
                    </span>
                          <span className="rounded-full bg-rose-900/50 px-3 py-1 text-xs font-black text-rose-400 ring-1 ring-rose-700">
                      {Math.round(((course.regularPrice - course.offerPrice) / course.regularPrice) * 100)}% OFF
                    </span>
                  </>
                ) : course.offerPrice ? (
                        <span className="text-3xl font-black text-emerald-400">
                    ৳{course.offerPrice.toLocaleString()}
                  </span>
                ) : course.regularPrice ? (
                        <span className="text-3xl font-black text-white">
                    ৳{course.regularPrice.toLocaleString()}
                  </span>
                ) : (
                        <span className="text-3xl font-black text-emerald-400">Free</span>
                )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-gray-700 pt-5">
                  <div className="flex items-center justify-between rounded-2xl bg-gray-700 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Duration
                    </span>
                    <span className="text-sm font-black text-white">{course.duration || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-700 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      Created
                    </span>
                    <span className="text-sm font-black text-white">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-700 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-400">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Status
                    </span>
                    <span className="text-sm font-black text-white">{course.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/50 text-blue-400">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-white">Quick Actions</h2>
              </div>
              <div className="grid gap-3">
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/edit`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-600 bg-gray-800 px-5 py-4 text-left font-bold text-gray-300 transition-all hover:border-blue-500 hover:bg-gray-700 hover:text-blue-400"
                >
                  <span className="flex items-center gap-3">
                    <Edit className="w-5 h-5" />
                    Edit Course
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/modules`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-600 bg-gray-800 px-5 py-4 text-left font-bold text-gray-300 transition-all hover:border-purple-500 hover:bg-gray-700 hover:text-purple-400"
                >
                  <span className="flex items-center gap-3">
                    <Video className="w-5 h-5" />
                    Manage Modules
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.slug || course.id}/students`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-600 bg-gray-800 px-5 py-4 text-left font-bold text-gray-300 transition-all hover:border-emerald-500 hover:bg-gray-700 hover:text-emerald-400"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    View Students
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(`/student/course-view/${course.slug || course.id}`, '_blank')}
                  className="flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left font-bold text-white transition-all hover:bg-slate-800"
                >
                  <span className="flex items-center gap-3">
                    <Eye className="w-5 h-5" />
                    Preview as Student
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
