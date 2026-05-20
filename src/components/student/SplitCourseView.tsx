'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Search, Lock, Play, BookOpen, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SimpleVideoPlayer from './SimpleVideoPlayer';

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
  const [activeTab, setActiveTab] = useState<'notes' | 'homework' | 'resources' | 'practice'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

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
  const currentModuleIndex = modulesWithProgress.findIndex(m => m.id === activeModuleId);
  const previousModule = currentModuleIndex > 0 ? modulesWithProgress[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < modulesWithProgress.length - 1 ? modulesWithProgress[currentModuleIndex + 1] : null;

  // Add demo video URLs if modules don't have them
  const modulesWithVideos = modulesWithProgress.map(module => ({
    ...module,
    videoUrl: module.videoUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
  }));

  const filteredModules = modulesWithVideos.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNote = () => {
    if (noteText.trim()) {
      setSavedNotes([...savedNotes, noteText.trim()]);
      setNoteText('');
    }
  };

  const handlePreviousModule = () => {
    console.log('Previous button clicked');
    console.log('Previous module:', previousModule);
    if (previousModule && previousModule.isUnlocked) {
      console.log('Navigating to previous module:', previousModule.id);
      setActiveModuleId(previousModule.id);
    } else {
      console.log('No previous module available or locked');
    }
  };

  const handleNextModule = () => {
    console.log('Next button clicked');
    console.log('Next module:', nextModule);
    if (nextModule && nextModule.isUnlocked) {
      console.log('Navigating to next module:', nextModule.id);
      setActiveModuleId(nextModule.id);
    } else {
      console.log('No next module available or locked');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Back Button */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="flex h-screen">
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player - Responsive Height */}
          <div className="h-96 bg-black">
            {activeModule && !activeModule.isLocked ? (
              <SimpleVideoPlayer
                videoUrl={modulesWithVideos.find(m => m.id === activeModuleId)?.videoUrl || ''}
                title={activeModule.title}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                onPrevious={handlePreviousModule}
                onNext={handleNextModule}
                hasPrevious={!!previousModule && previousModule.isUnlocked}
                hasNext={!!nextModule && nextModule.isUnlocked}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">
                    {activeModule?.isLocked ? 'Module Locked' : 'No video available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Module Controls */}
          {activeModule && (
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {activeModule.order}. {activeModule.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {activeModule.isCompleted && (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                  {activeModule.isLocked && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <AlertCircle className="w-4 h-4" />
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Previous/Next Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousModule}
                  disabled={!previousModule || !previousModule.isUnlocked}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={handleNextModule}
                  disabled={!nextModule || !nextModule.isUnlocked}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tabs Section */}
          {activeModule && (
            <div className="bg-gray-800 border-t border-gray-700">
              <div className="flex border-b border-gray-700">
                {['notes', 'homework', 'resources', 'practice'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Add Notes</h3>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Type your notes here..."
                        className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleSaveNote}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Save Note
                      </button>
                    </div>

                    {/* Saved Notes */}
                    {savedNotes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">YOUR SAVED NOTES</h3>
                        <div className="space-y-3">
                          {savedNotes.map((note, index) => (
                            <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                              <p className="text-gray-300">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'homework' && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Homework</h3>
                    {activeModule.homework ? (
                      <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                        <p className="text-gray-300 whitespace-pre-wrap">{activeModule.homework}</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">No homework assigned for this module.</p>
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Resources</h3>
                    <p className="text-gray-400">No resources available for this module.</p>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Practice</h3>
                    <p className="text-gray-400">No practice exercises available for this module.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Modules */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Module Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-2">Module {activeModule?.order}: {activeModule?.title}</h2>
            
            {/* Overall Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-gray-300">
                  {Math.round((modulesWithProgress.filter(m => m.isCompleted).length / modulesWithProgress.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(modulesWithProgress.filter(m => m.isCompleted).length / modulesWithProgress.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                onClick={() => module.isUnlocked && setActiveModuleId(module.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  module.id === activeModuleId
                    ? 'bg-blue-600 text-white'
                    : module.isUnlocked
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-sm font-medium">
                      {module.isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : module.isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Play className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{module.order}. {module.title}</p>
                      {module.id === activeModuleId && (
                        <p className="text-xs text-blue-200">Playing</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Download Syllabus Button */}
          <div className="p-4 border-t border-gray-700">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download Syllabus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
