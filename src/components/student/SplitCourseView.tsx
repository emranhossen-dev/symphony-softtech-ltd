'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import ModuleSidebar from './ModuleSidebar';
import EnhancedVideoPlayer from './EnhancedVideoPlayer';
import HomeworkSection from './HomeworkSection';

interface Module {
  id: string;
  title: string;
  order: number;
  isLocked: boolean;
  videoUrl?: string | null;
  homework?: string | null;
  isCompleted?: boolean;
  isUnlocked?: boolean;
  completedAt?: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  modules: Module[];
}

interface SplitCourseViewProps {
  course: Course;
  onBack?: () => void;
}

export default function SplitCourseView({ course, onBack }: SplitCourseViewProps) {
  const [modulesWithProgress, setModulesWithProgress] = useState<Module[]>(course.modules);
  const [activeModuleId, setActiveModuleId] = useState<string>(
    course.modules.length > 0 ? course.modules[0].id : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Fetch module progress on component mount
  useEffect(() => {
    fetchModuleProgress();
  }, [course.id]);

  const fetchModuleProgress = async () => {
    try {
      const response = await fetch(`/api/student/module/progress?courseId=${course.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setModulesWithProgress(data.course.modules);
        
        // Set active module to first unlocked module
        const firstUnlockedModule = data.course.modules.find((m: Module) => m.isUnlocked);
        if (firstUnlockedModule) {
          setActiveModuleId(firstUnlockedModule.id);
        } else {
          // Fallback to first module if no unlocked modules found
          if (data.course.modules.length > 0) {
            setActiveModuleId(data.course.modules[0].id);
          }
        }
      } else {
        // Fallback to first module
        if (course.modules.length > 0) {
          setActiveModuleId(course.modules[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching module progress:', error);
      // Fallback to first module if progress fetch fails
      if (course.modules.length > 0) {
        setActiveModuleId(course.modules[0].id);
      }
    }
  };

  const handleModuleComplete = async () => {
    const activeModule = modulesWithProgress.find(m => m.id === activeModuleId);
    if (!activeModule || activeModule.isCompleted) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/student/module/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: activeModuleId,
          courseId: course.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh module progress
        await fetchModuleProgress();
        
        // Auto-select next unlocked module
        if (data.unlockedModuleId) {
          setActiveModuleId(data.unlockedModuleId);
        }
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    const module = modulesWithProgress.find(m => m.id === moduleId);
    if (module && module.isUnlocked) {
      setActiveModuleId(moduleId);
      setVideoProgress(0); // Reset video progress when switching modules
    }
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
  };

  const handleVideoComplete = () => {
    // Could mark video as watched or trigger other actions
    console.log('Video completed');
  };

  const activeModule = modulesWithProgress.find(module => module.id === activeModuleId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Modules */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <ModuleSidebar
          modules={modulesWithProgress}
          activeModuleId={activeModuleId}
          onModuleSelect={handleModuleSelect}
        />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">{course.category} • {course.duration}</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                {modulesWithProgress.filter(m => m.isCompleted).length} of {modulesWithProgress.length} completed
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ 
                    width: `${(modulesWithProgress.filter(m => m.isCompleted).length / modulesWithProgress.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeModule ? (
            <div className="p-6 space-y-6">
              {/* Module Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Module {activeModule.order}: {activeModule.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {activeModule.isCompleted && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                      {activeModule.isLocked && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          Locked
                        </div>
                      )}
                      {videoProgress > 0 && (
                        <div className="text-blue-600">
                          Video: {Math.round(videoProgress)}% watched
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              {activeModule.videoUrl && !activeModule.isLocked && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Video Content</h3>
                  <EnhancedVideoPlayer
                    videoUrl={activeModule.videoUrl}
                    title={activeModule.title}
                    onProgress={handleVideoProgress}
                    onComplete={handleVideoComplete}
                  />
                </div>
              )}

              {/* Homework Section */}
              <HomeworkSection 
                homework={activeModule.homework} 
                moduleId={activeModule.id}
                courseId={course.id}
              />

              {/* Mark as Complete Button */}
              {!activeModule.isCompleted && !activeModule.isLocked && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Module Actions</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Mark this module as complete when you're ready to move to the next one
                      </p>
                    </div>
                    <button
                      onClick={handleModuleComplete}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Marking as Complete...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Mark as Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Completion Status */}
              {activeModule.isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-medium">Module Completed</h3>
                      <p className="text-sm text-green-700">
                        Completed on {new Date(activeModule.completedAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Locked Module Message */}
              {activeModule.isLocked && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 text-orange-800">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                      <h3 className="font-medium">Module Locked</h3>
                      <p className="text-sm text-orange-700">
                        Complete the previous modules to unlock this content
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Module Selected</h3>
                <p className="text-gray-600">Select a module from the sidebar to begin learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
