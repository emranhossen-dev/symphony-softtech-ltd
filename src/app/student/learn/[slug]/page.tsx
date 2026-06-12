"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, FileText, Download, BookOpen, Play, Menu, X } from 'lucide-react';

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

export default function CourseLearnPage() {
  const params = useParams();
  const courseSlug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null); // 'homework' | 'notes' | 'resources' | null
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [unlockedModules, setUnlockedModules] = useState<Set<number>>(new Set([0])); // Module 0 is always unlocked
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseSlug]);

  useEffect(() => {
    if (course?.slug) {
      fetchModules();
      // Load saved progress from localStorage
      const savedProgress = localStorage.getItem(`course-progress-${course.slug}`);
      const savedUnlocked = localStorage.getItem(`course-unlocked-${course.slug}`);
      if (savedProgress) {
        setCurrentModuleIndex(parseInt(savedProgress, 10));
      }
      if (savedUnlocked) {
        setUnlockedModules(new Set(JSON.parse(savedUnlocked)));
      }
    }
  }, [course]);

  // Save current module index to localStorage
  useEffect(() => {
    if (course?.slug) {
      localStorage.setItem(`course-progress-${course.slug}`, currentModuleIndex.toString());
    }
  }, [currentModuleIndex, course?.slug]);

  // Save unlocked modules to localStorage
  useEffect(() => {
    if (course?.slug) {
      localStorage.setItem(`course-unlocked-${course.slug}`, JSON.stringify(Array.from(unlockedModules)));
    }
  }, [unlockedModules, course?.slug]);

  const fetchCourse = async () => {
    if (!courseSlug) {
      console.log('No courseSlug available to fetch course');
      return;
    }
    try {
      console.log('Fetching course with slug:', courseSlug);
      const response = await fetch(`/api/courses/${courseSlug}`, {
        credentials: 'include'
      });
      const data = await response.json();

      console.log('Course response:', data);

      if (data.success) {
        console.log('Course loaded:', data.course);
        setCourse(data.course);
      } else {
        console.error('Course API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchModules = async () => {
    try {
      if (!course?.slug) {
        console.log('Course slug not available, skipping module fetch');
        return;
      }
      const response = await fetch(`/api/courses/${course.slug}/modules`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const sortedModules = data.modules.sort((a: Module, b: Module) => a.order - b.order);
        console.log('Loaded modules:', sortedModules);
        setModules(sortedModules);
      } else {
        console.error('Failed to load modules:', data.error);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed duplicate useEffect hooks to prevent redundant API fetches

  const handleBack = () => {
    window.location.href = '/student/dashboard';
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      const nextIndex = currentModuleIndex + 1;
      // Unlock next module and move to it
      if (!unlockedModules.has(nextIndex)) {
        setUnlockedModules(prev => new Set([...prev, nextIndex]));
        showToast(`Module ${modules[nextIndex].order} unlocked!`, 'success');
      }
      setCurrentModuleIndex(nextIndex);
    }
  };

  const handleModuleClick = (index: number) => {
    // Check if module is locked (can only access if previous module is unlocked locally or it's the first module)
    const isPreviousUnlocked = index === 0 || unlockedModules.has(index - 1);
    
    if (!isPreviousUnlocked) {
      setToast({ message: `Please unlock Module ${modules[index - 1].order} first to unlock this module`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    // If previous is unlocked, unlock this module locally and access it
    if (index > 0 && isPreviousUnlocked && !unlockedModules.has(index)) {
      setUnlockedModules(prev => new Set([...prev, index]));
      showToast(`Module ${modules[index].order} unlocked!`, 'success');
    }
    setCurrentModuleIndex(index);
  };

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markModuleComplete = () => {
    if (currentModule) {
      setCompletedModules(prev => new Set([...prev, currentModule.id]));
      // Unlock next module by updating the module's isLocked status
      setModules(prev => prev.map((mod, idx) => {
        if (idx === currentModuleIndex + 1) {
          return { ...mod, isLocked: false };
        }
        return mod;
      }));
    }
  };

  const isModuleLocked = (index: number) => {
    // First module is never locked
    if (index === 0) return false;
    // Module is locked if previous module is not unlocked locally
    return !unlockedModules.has(index - 1);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    setIsSavingNote(true);

    try {
      const response = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          courseId: course?.id,
          moduleId: currentModule?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Note saved successfully!', 'success');
        setNoteTitle('');
        setNoteContent('');
      } else {
        showToast(data.error || 'Failed to save note', 'error');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Failed to save note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return `https://www.youtube.com/embed/${urlParams.get('v')}`;
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return url;
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentModule = modules[currentModuleIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent absolute top-0"></div>
        </div>
        <p className="absolute mt-32 text-gray-300">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Course Not Found</h2>
          <p className="text-gray-400">The course you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
      {/* Header */}
      <div className="glass-nav border-b border-purple-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="mr-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors md:hidden"
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">{course.title}</h1>
            <h1 className="text-lg font-bold text-white sm:hidden">{course.title.substring(0, 20)}...</h1>
          </div>
          <div className="text-gray-400 text-sm">
            Module {currentModuleIndex + 1} of {modules.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-73px)]">
        {/* Left Side - Video Player */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto order-1 md:order-1">
          {/* Video Container */}
          <div className="h-64 sm:h-96 bg-black rounded-2xl overflow-hidden relative flex-shrink-0">
            {currentModule?.videoUrl ? (
              isYouTubeUrl(currentModule.videoUrl) ? (
                <iframe
                  key={currentModule.id}
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(currentModule.videoUrl)}
                  title="Course video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col relative">
                  <video
                    key={currentModule.id}
                    className="flex-1 object-contain"
                    controls
                    autoPlay
                    onError={() => {
                      console.error('Video failed to load. URL:', currentModule.videoUrl);
                      setVideoError('Failed to load video');
                    }}
                    onLoadStart={() => {
                      console.log('Video loading started:', currentModule.videoUrl);
                      setVideoError(null);
                    }}
                  >
                    <source src={currentModule.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center text-white">
                        <p className="text-lg font-semibold">{videoError}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No video available for this module</p>
                  {currentModule && !currentModule.videoUrl && (
                    <p className="text-sm mt-2 text-gray-500">Video URL is empty</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Module Title */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white">{currentModule?.title || 'No module selected'}</h2>
          </div>

          {/* Toggle Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActivePanel(activePanel === 'homework' ? null : 'homework')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activePanel === 'homework'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Homework</span>
            </button>
            <button
              onClick={() => setActivePanel(activePanel === 'notes' ? null : 'notes')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activePanel === 'notes'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Notes</span>
            </button>
            <button
              onClick={() => setActivePanel(activePanel === 'resources' ? null : 'resources')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                activePanel === 'resources'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Resources</span>
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentModuleIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Previous</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentModuleIndex === modules.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Panels */}
          {activePanel && (
            <div className="mt-4 bg-gray-800/50 border border-purple-500/30 rounded-xl p-4">
              {activePanel === 'homework' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Homework</h3>
                  {currentModule?.homework ? (
                    <div>
                      <p className="text-gray-300 whitespace-pre-wrap mb-4">{currentModule.homework}</p>
                      <button
                        onClick={() => {
                          const courseId = currentModule.courseId || course?.id;
                          console.log('Module ID:', currentModule.id);
                          console.log('Course ID from module:', currentModule.courseId);
                          console.log('Course ID from course object:', course?.id);
                          console.log('Final Course ID:', courseId);
                          window.location.href = `/student/playground?moduleId=${currentModule.id}&courseId=${courseId}&courseSlug=${course?.slug}`;
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Start Homework
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400">No homework assigned for this module.</p>
                  )}
                </div>
              )}
              {activePanel === 'notes' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
                  <p className="text-gray-300">Take notes for this module here...</p>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full mt-2 bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Note title..."
                  />
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full mt-2 bg-gray-900/50 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    rows={4}
                    placeholder="Write your notes here..."
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              )}
              {activePanel === 'resources' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Resources</h3>
                  <p className="text-gray-300">Downloadable resources for this module...</p>
                  <div className="mt-2 text-gray-400 italic">
                    No resources available for this module yet.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Course Modules */}
        <div className={`w-full md:w-96 bg-gray-900/50 border-l border-purple-500/30 flex flex-col ${mobileSidebarOpen ? 'block' : 'hidden'} md:block order-2 md:order-2 border-t md:border-t-0 md:border-l`}>
          {/* Search Bar */}
          <div className="p-4 border-b border-purple-500/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredModules.map((module, index) => {
              const isLocked = isModuleLocked(index);

              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    currentModuleIndex === index
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : isLocked
                      ? 'bg-gray-900/30 text-gray-500 hover:bg-gray-900/50'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium opacity-70 mr-2">
                          Module {module.order}
                        </span>
                        {isLocked && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{module.title}</h3>
                    </div>
                    {isLocked && (
                      <div className="ml-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredModules.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>No modules found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
