"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
        fetchModules(data.course.id);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-10 py-8 shadow-xl border border-slate-100">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading course workspace...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xl max-w-md w-full">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-slate-950 mb-3">Course Not Found</h2>
          <p className="text-slate-500 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/admin/category/${slug}/courses`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-lg shadow-blue-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses`)}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </button>
              
              <h1 className="truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                {course.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  course.isActive 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  <Tag className="h-3.5 w-3.5" />
                  {course.category || slug}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-100">
                  <Layers className="h-3.5 w-3.5" />
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ClipboardList className="w-4 h-4" />
                Modules
              </button>
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/edit`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules/create`)}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-950">{modules.length}</p>
            <p className="text-sm font-medium text-slate-500">Total modules</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Video className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-950">{videoModules}</p>
            <p className="text-sm font-medium text-slate-500">With video</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-950">{homeworkModules}</p>
            <p className="text-sm font-medium text-slate-500">Homework</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Lock className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-950">{lockedModules}</p>
            <p className="text-sm font-medium text-slate-500">Locked</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {course.thumbnail && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-72">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="mb-2 text-sm font-bold uppercase tracking-wide text-white/80">Course thumbnail</p>
                    <h2 className="line-clamp-2 text-2xl font-black text-white">{course.title}</h2>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-950">Course Description</h2>
              </div>
              <p className="whitespace-pre-wrap leading-8 text-slate-600">
                {course.description || 'No description added yet.'}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Course Modules</h2>
                    <p className="text-sm font-medium text-slate-500">Ordered lesson flow for this course</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules/create`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>
              
              {modules.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Video className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950">No modules yet</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Create the first module with video, homework and lock settings so students can start learning step by step.</p>
                  <button
                    onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules/create`)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.id} className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-lg font-black text-slate-950 transition-colors group-hover:text-blue-700">
                                {module.title}
                              </h3>
                              <p className="mt-1 text-sm font-medium text-slate-500">Order {module.order}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules/${module.id}/edit`)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules`)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                          {module.videoUrl && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                              <Video className="w-3.5 h-3.5" />
                              Video
                            </span>
                          )}
                          {module.homework && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-bold text-purple-700 ring-1 ring-purple-100">
                              <FileText className="w-3.5 h-3.5" />
                              Homework
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ring-1 ${
                            module.isLocked 
                              ? 'bg-orange-50 text-orange-700 ring-orange-100' 
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          }`}>
                            {module.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            {module.isLocked ? 'Locked' : 'Unlocked'}
                          </span>
                          </div>

                          {module.homework && (
                            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 line-clamp-3">
                              {module.homework}
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Tag className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-950">Course Summary</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-bold text-slate-500">Current Price</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                {course.regularPrice && course.offerPrice && course.regularPrice > course.offerPrice ? (
                  <>
                          <span className="text-lg font-bold text-slate-400 line-through">
                      ৳{course.regularPrice.toLocaleString()}
                    </span>
                          <span className="text-3xl font-black text-emerald-600">
                      ৳{course.offerPrice.toLocaleString()}
                    </span>
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-200">
                      {Math.round(((course.regularPrice - course.offerPrice) / course.regularPrice) * 100)}% OFF
                    </span>
                  </>
                ) : course.offerPrice ? (
                        <span className="text-3xl font-black text-emerald-600">
                    ৳{course.offerPrice.toLocaleString()}
                  </span>
                ) : course.regularPrice ? (
                        <span className="text-3xl font-black text-slate-950">
                    ৳{course.regularPrice.toLocaleString()}
                  </span>
                ) : (
                        <span className="text-3xl font-black text-emerald-600">Free</span>
                )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Duration
                    </span>
                    <span className="text-sm font-black text-slate-950">{course.duration || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      Created
                    </span>
                    <span className="text-sm font-black text-slate-950">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Status
                    </span>
                    <span className="text-sm font-black text-slate-950">{course.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-950">Quick Actions</h2>
              </div>
              <div className="grid gap-3">
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/edit`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="flex items-center gap-3">
                    <Edit className="w-5 h-5" />
                    Edit Course
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/modules`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                >
                  <span className="flex items-center gap-3">
                    <Video className="w-5 h-5" />
                    Manage Modules
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/admin/category/${slug}/courses/${course.id}/students`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    View Students
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(`/student/course-view/${course.id}`, '_blank')}
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
