'use client';

import { useState, useEffect } from 'react';
import ModuleList from './ModuleList';
import VideoPlayer from './VideoPlayer';
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
}

interface CourseViewProps {
  course: Course & {
    modules: Module[];
  };
}

export default function CourseView({ course }: CourseViewProps) {
  const [modulesWithProgress, setModulesWithProgress] = useState<Module[]>(course.modules);
  const [activeModuleId, setActiveModuleId] = useState<string>(
    course.modules.length > 0 ? course.modules[0].id : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch module progress on component mount
  useEffect(() => {
    fetchModuleProgress();
  }, [course.id]);

  const fetchModuleProgress = async () => {
    try {
      const response = await fetch(`/api/student/module/progress?courseId=${course.id}`);
      const data = await response.json();
      
      if (data.success) {
        setModulesWithProgress(data.course.modules);
        
        // Set active module to first unlocked module
        const firstUnlockedModule = data.course.modules.find((m: Module) => m.isUnlocked);
        if (firstUnlockedModule) {
          setActiveModuleId(firstUnlockedModule.id);
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
    }
  };

  const activeModule = modulesWithProgress.find(module => module.id === activeModuleId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-[280px] bg-gray-100 border-r border-gray-200 overflow-y-auto hidden lg:block">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h2>
          <ModuleList
            modules={modulesWithProgress}
            activeModuleId={activeModuleId}
            onModuleSelect={handleModuleSelect}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden w-full bg-gray-100 border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h2>
        <ModuleList
          modules={modulesWithProgress}
          activeModuleId={activeModuleId}
          onModuleSelect={handleModuleSelect}
        />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeModule ? (
            <>
              {/* Module Title */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {activeModule.title}
                </h2>
              </div>

              {/* Video Player */}
              <VideoPlayer videoUrl={activeModule.videoUrl} />

              {/* Homework Section */}
              <HomeworkSection 
                homework={activeModule.homework} 
                moduleId={activeModule.id}
                courseId={course.id}
              />

              {/* Mark as Complete Button */}
              {!activeModule.isCompleted && (
                <div className="mt-6">
                  <button
                    onClick={handleModuleComplete}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? 'Marking as Complete...' : 'Mark as Complete'}
                  </button>
                </div>
              )}

              {activeModule.isCompleted && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    ✓ Module completed on {new Date(activeModule.completedAt || '').toLocaleDateString()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No modules available for this course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
