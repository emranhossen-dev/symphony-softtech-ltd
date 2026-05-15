"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  FileText,
  Lightbulb,
  ListPlus,
  Lock,
  Plus,
  Save,
  Trash2,
  Unlock,
  Video
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface ModuleData {
  id: string;
  title: string;
  videoUrl: string;
  homework: string;
  isLocked: boolean;
  order: number;
  duration?: string;
  description?: string;
  resources?: string[];
}

const CreateModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [modules, setModules] = useState<ModuleData[]>([
    {
      id: Date.now().toString(),
      title: '',
      videoUrl: '',
      homework: '',
      isLocked: false,
      order: 1
    }
  ]);

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModules = async (modules: ModuleData[]) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'create',
          modules: modules.map(m => ({
            title: m.title,
            videoUrl: m.videoUrl,
            homework: m.homework,
            isLocked: m.isLocked,
            order: m.order
          }))
        }),
      });

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : { success: false, error: 'Empty server response' };

      if (data.success) {
        router.push(`/admin/category/${slug}/courses/${courseId}`);
      } else {
        throw new Error(data.error || 'Failed to create modules');
      }
    } catch (error) {
      throw error;
    }
  };

  const updateModule = (id: string, field: keyof ModuleData, value: string | boolean) => {
    setModules(prev => prev.map(module => (
      module.id === id ? { ...module, [field]: value } : module
    )));
  };

  const addModule = () => {
    setModules(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        videoUrl: '',
        homework: '',
        isLocked: true,
        order: prev.length + 1
      }
    ]);
  };

  const removeModule = (id: string) => {
    if (modules.length === 1) {
      toast.error('At least one module is required');
      return;
    }

    setModules(prev => {
      return prev
        .filter(module => module.id !== id)
        .map((module, index) => ({ ...module, order: index + 1 }));
    });
  };

  const parseBulkModules = (text: string) => {
    const moduleHeadingRegex = /^\s*Module\s+\d+\s*:\s*(.+)$/gim;
    const matches = Array.from(text.matchAll(moduleHeadingRegex));

    if (matches.length === 0) {
      return text
        .split('\n')
        .map(title => title.trim())
        .filter(Boolean)
        .map(title => ({ title, homework: '' }));
    }

    return matches.map((match, index) => {
      const title = match[1].trim();
      const contentStart = (match.index || 0) + match[0].length;
      const contentEnd = matches[index + 1]?.index ?? text.length;
      const homework = text.slice(contentStart, contentEnd).trim();

      return { title, homework };
    });
  };

  const addBulkModules = () => {
    const parsedModules = parseBulkModules(bulkText);

    if (parsedModules.length === 0) {
      toast.error('Write at least one module title');
      return;
    }

    const existingModules = modules.filter(module => module.title.trim() || module.videoUrl.trim() || module.homework.trim());

    setModules([
      ...existingModules,
      ...parsedModules.map((module, index) => ({
        id: `${Date.now()}-${index}`,
        title: module.title,
        videoUrl: '',
        homework: module.homework,
        isLocked: existingModules.length + index > 0,
        order: existingModules.length + index + 1
      }))
    ].map((module, index) => ({ ...module, order: index + 1 })));

    setBulkText('');
    setShowBulkAdd(false);
    toast.success(`${parsedModules.length} modules added`);
  };

  const applyExample = () => {
    setModules([
      {
        id: 'example-1',
        title: 'Introduction & Course Overview',
        videoUrl: '',
        homework: 'Watch the intro video and write down 3 learning goals for this course.',
        isLocked: false,
        order: 1
      },
      {
        id: 'example-2',
        title: 'Core Lesson & Practice',
        videoUrl: '',
        homework: 'Complete the practice task and submit your work before the next class.',
        isLocked: true,
        order: 2
      }
    ]);
  };

  const handleSubmit = async () => {
    const validModules = modules.filter(module => module.title.trim());

    if (validModules.length === 0) {
      toast.error('Please add at least one module title');
      return;
    }

    setSaving(true);

    try {
      await handleSaveModules(validModules.map((module, index) => ({ ...module, order: index + 1 })));
      toast.success(`${validModules.length} module${validModules.length > 1 ? 's' : ''} created successfully`);
    } catch (error) {
      console.error('Error creating modules:', error);
      toast.error('Failed to create modules');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/category/${slug}/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load course information.</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <button
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Add modules</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{course.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create one module or add multiple lesson titles at once. Video and homework can be added now or edited later.</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Creating...' : `Create ${modules.filter(module => module.title.trim()).length || 1} Module`}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:py-8">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Module Details</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Fill title first. Other fields are optional.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkAdd(!showBulkAdd)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ListPlus className="h-4 w-4" />
                  Bulk Add
                </button>
                <button
                  onClick={addModule}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Another
                </button>
              </div>
            </div>

            {showBulkAdd && (
              <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <label className="mb-2 block text-sm font-black text-blue-950">Paste full module outline</label>
                <p className="mb-3 text-sm font-medium leading-6 text-blue-800">Use format like <span className="font-black">Module 1: Python Basics</span>. Everything until the next module heading will be saved as that module's instructions.</p>
                <textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  rows={5}
                  placeholder="Module 1: Python Basics&#10;&#10;Topics:&#10;Variables&#10;Functions&#10;&#10;Module 2: Web Fundamentals&#10;&#10;Topics:&#10;HTML&#10;CSS"
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={addBulkModules}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-blue-700"
                  >
                    Add Modules
                  </button>
                  <button
                    onClick={() => setShowBulkAdd(false)}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={module.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">{index + 1}</div>
                      <div>
                        <p className="font-black text-slate-950">Module {index + 1}</p>
                        <p className="text-xs font-bold text-slate-500">{module.isLocked ? 'Locked for students' : 'Open for students'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateModule(module.id, 'isLocked', !module.isLocked)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-colors ${module.isLocked ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {module.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        {module.isLocked ? 'Locked' : 'Open'}
                      </button>
                      <button
                        onClick={() => removeModule(module.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600 ring-1 ring-slate-200 transition-colors hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        Module Title
                      </label>
                      <input
                        value={module.title}
                        onChange={(event) => updateModule(module.id, 'title', event.target.value)}
                        placeholder="Example: Introduction to Government Job Preparation"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                        <Video className="h-4 w-4 text-purple-600" />
                        Video URL
                      </label>
                      <input
                        value={module.videoUrl}
                        onChange={(event) => updateModule(module.id, 'videoUrl', event.target.value)}
                        placeholder="YouTube, Vimeo, or uploaded video link"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        Homework / Instructions
                      </label>
                      <textarea
                        value={module.homework}
                        onChange={(event) => updateModule(module.id, 'homework', event.target.value)}
                        rows={4}
                        placeholder="Write class task, assignment, deadline, or notes for students"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-950">Preview</h2>
            </div>
            <div className="space-y-3">
              {modules.filter(module => module.title.trim()).length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-500">Start typing a module title to see preview here.</p>
              ) : (
                modules.filter(module => module.title.trim()).map((module, index) => (
                  <div key={module.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-black text-slate-950">{module.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {module.videoUrl && <span className="rounded-lg bg-purple-50 px-2 py-1 text-xs font-black text-purple-700">Video</span>}
                          {module.homework && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Homework</span>}
                          <span className={`rounded-lg px-2 py-1 text-xs font-black ${module.isLocked ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{module.isLocked ? 'Locked' : 'Open'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-950">Easy Tips</h2>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p><span className="font-black text-slate-950">Title first:</span> only title is required.</p>
              <p><span className="font-black text-slate-950">First module open:</span> good for demo or intro class.</p>
              <p><span className="font-black text-slate-950">Bulk add:</span> paste multiple titles to create a course outline fast.</p>
            </div>
            <button
              onClick={applyExample}
              className="mt-5 w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 transition-colors hover:bg-amber-100"
            >
              Use Example Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateModulePage;
