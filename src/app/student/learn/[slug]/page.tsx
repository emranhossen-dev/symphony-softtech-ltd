"use client";

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, FileText, Download, BookOpen, Play } from 'lucide-react';

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

export default function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const courseSlug = resolvedParams.slug;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseSlug]);

  useEffect(() => {
    if (course?.slug) {
      fetchModules();
    }
  }, [course]);

  const fetchCourse = async () => {
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

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  useEffect(() => {
    if (course?.slug) {
      fetchModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

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
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const handleModuleClick = (index: number) => {
    setCurrentModuleIndex(index);
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
      {/* Header */}
      <div className="glass-nav border-b border-purple-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">{course.title}</h1>
          </div>
          <div className="text-gray-400 text-sm">
            Module {currentModuleIndex + 1} of {modules.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Side - Video Player */}
        <div className="flex-1 flex flex-col p-6">
          {/* Video Container */}
          <div className="flex-1 bg-black rounded-2xl overflow-hidden relative">
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
                <div className="w-full h-full flex flex-col">
                  <video
                    key={currentModule.id}
                    className="flex-1 object-contain"
                    controls
                    autoPlay
                    onError={() => {
                      console.error('Video failed to load. URL:', currentModule.videoUrl);
                      setVideoError(`Failed to load video. URL: ${currentModule.videoUrl}`);
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
                    <div className="bg-red-900/80 p-4 text-white text-sm">
                      <p className="font-semibold">Video Error</p>
                      <p className="mt-1">{videoError}</p>
                      <p className="mt-2 text-xs opacity-70">Video URL: {currentModule.videoUrl}</p>
                      <button
                        onClick={() => window.open(currentModule.videoUrl, '_blank')}
                        className="mt-3 px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-100 transition-colors"
                      >
                        Open in new tab
                      </button>
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

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                {/* Left side buttons - Notes, Resources, Homework */}
                <div className="flex space-x-2">
                  <button className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-xl text-white hover:bg-purple-700 transition-colors shadow-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Notes</span>
                  </button>
                  <button className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-xl text-white hover:bg-purple-700 transition-colors shadow-lg flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-medium">Resources</span>
                  </button>
                  <button className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-xl text-white hover:bg-purple-700 transition-colors shadow-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-medium">Homework</span>
                  </button>
                </div>

                {/* Right side buttons - Previous, Next */}
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentModuleIndex === 0}
                    className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-xl text-white hover:bg-gray-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentModuleIndex === modules.length - 1}
                    className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-xl text-white hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Module Title */}
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-white">{currentModule?.title || 'No module selected'}</h2>
            {/* Debug info */}
            <div className="mt-2 text-sm text-gray-400">
              <p>Total modules: {modules.length}</p>
              {currentModule?.videoUrl && (
                <p className="text-xs truncate">Video URL: {currentModule.videoUrl}</p>
              )}
              {videoError && (
                <p className="text-red-400 mt-1">Error: {videoError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Course Modules */}
        <div className="w-96 bg-gray-900/50 border-l border-purple-500/30 flex flex-col">
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
            {filteredModules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(index)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  currentModuleIndex === index
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-medium opacity-70 mr-2">
                        Module {module.order}
                      </span>
                      {module.completed && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{module.title}</h3>
                  </div>
                  {module.isLocked && (
                    <div className="ml-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
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
