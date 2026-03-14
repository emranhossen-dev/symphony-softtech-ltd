'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Lock, Unlock, CheckCircle, Circle, Volume2, Maximize, SkipForward, SkipBack, Settings, FileText, Download, Eye, EyeOff, Shield, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Module {
  id: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT';
  duration?: number;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  content?: {
    videoUrl?: string;
    pdfUrl?: string;
    quizQuestions?: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    assignmentDetails?: string;
  };
  resources?: Array<{
    id: string;
    title: string;
    type: 'PDF' | 'LINK' | 'DOCUMENT';
    url: string;
    downloadable: boolean;
  }>;
}

interface CourseProgress {
  totalModules: number;
  completedModules: number;
  overallProgress: number;
  totalTimeSpent: number;
  lastAccessed: string;
}

export default function RecordedLMS() {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    totalModules: 0,
    completedModules: 0,
    overallProgress: 0,
    totalTimeSpent: 0,
    lastAccessed: ''
  });
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [securityEnabled, setSecurityEnabled] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCourseData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && currentModule?.type === 'VIDEO') {
      progressIntervalRef.current = setInterval(() => {
        setWatchTime(prev => prev + 1);
        setTotalWatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentModule]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch('/api/student/lms/course');
      const data = await response.json();
      
      setModules(data.modules || []);
      setCourseProgress(data.progress || courseProgress);
      
      // Set first unlocked module as current
      const firstUnlocked = data.modules?.find((m: Module) => !m.isLocked);
      if (firstUnlocked) {
        setCurrentModule(firstUnlocked);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: Module) => {
    if (module.isLocked) {
      toast.error('Complete previous modules to unlock this content');
      return;
    }
    
    setCurrentModule(module);
    setVideoProgress(module.progress);
    setWatchTime(0);
    setIsPlaying(false);
    
    // Update last accessed
    updateModuleProgress(module.id, 0);
  };

  const updateModuleProgress = async (moduleId: string, progress: number) => {
    try {
      const response = await fetch('/api/student/lms/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, progress, watchTime })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.progress);
        
        // Update module in local state
        setModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, progress, isCompleted: progress >= 90 } : m
        ));
        
        // Unlock next module if this one is completed
        if (progress >= 90) {
          unlockNextModule(moduleId);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const unlockNextModule = async (completedModuleId: string) => {
    try {
      const response = await fetch('/api/student/lms/unlock-next', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: completedModuleId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules);
        toast.success('Next module unlocked!');
      }
    } catch (error) {
      console.error('Error unlocking next module:', error);
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setVideoProgress((newTime / videoRef.current.duration) * 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
      
      // Auto-save progress every 10%
      if (Math.floor(progress) % 10 === 0 && currentModule) {
        updateModuleProgress(currentModule.id, progress);
      }
    }
  };

  const handleVideoEnded = () => {
    if (currentModule) {
      updateModuleProgress(currentModule.id, 100);
      setIsPlaying(false);
      toast.success('Module completed! Next module unlocked.');
    }
  };

  const handleQuizSubmit = () => {
    if (currentModule?.content?.quizQuestions) {
      const correctAnswers = currentModule.content.quizQuestions.filter((q, index) => 
        quizAnswers[index] === q.correctAnswer
      ).length;
      
      const score = (correctAnswers / currentModule.content.quizQuestions.length) * 100;
      
      if (score >= 70) {
        updateModuleProgress(currentModule.id, 100);
        toast.success(`Quiz passed with ${score}%!`);
      } else {
        toast.error(`Quiz failed with ${score}%. Try again!`);
      }
      
      setShowQuizResults(true);
    }
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    if (securityEnabled) {
      e.preventDefault();
    }
  };

  const preventKeyboardShortcuts = (e: React.KeyboardEvent) => {
    if (securityEnabled) {
      // Prevent common video shortcuts
      if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }
  };

  const getModuleIcon = (type: string, isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-5 h-5 text-gray-400" />;
    if (isCompleted) return <CheckCircle className="w-5 h-5 text-green-500" />;
    
    switch (type) {
      case 'VIDEO': return <Play className="w-5 h-5 text-blue-500" />;
      case 'PDF': return <FileText className="w-5 h-5 text-red-500" />;
      case 'QUIZ': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'ASSIGNMENT': return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recorded LMS System</h1>
          <p className="text-gray-600 mt-1">Secure learning platform with progress tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Security: {securityEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <button
            onClick={() => setSecurityEnabled(!securityEnabled)}
            className={`px-3 py-1 rounded-lg text-sm ${
              securityEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {securityEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Course Progress</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{courseProgress.completedModules}</span> of {courseProgress.totalModules} modules
            </div>
            <div className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              {Math.floor(courseProgress.totalTimeSpent / 60)}h {courseProgress.totalTimeSpent % 60}m
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${courseProgress.overallProgress}%` }}
          ></div>
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-gray-900">{courseProgress.overallProgress}%</span>
          <span className="text-sm text-gray-600 ml-2">Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Modules</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  onClick={() => handleModuleSelect(module)}
                  className={`p-4 cursor-pointer transition-colors ${
                    currentModule?.id === module.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                  } ${module.isLocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getModuleIcon(module.type, module.isCompleted, module.isLocked)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Module {index + 1}</span>
                        {module.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${module.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{module.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {currentModule ? (
            <div className="space-y-6">
              {/* Current Module Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentModule.title}</h2>
                    <p className="text-gray-600 mt-1">{currentModule.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentModule.isCompleted ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Player */}
              {currentModule.type === 'VIDEO' && currentModule.content?.videoUrl && (
                <div className="bg-black rounded-lg overflow-hidden" ref={containerRef}>
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={currentModule.content.videoUrl}
                      className="w-full"
                      onContextMenu={preventContextMenu}
                      onKeyDown={preventKeyboardShortcuts}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      controls={false}
                      disablePictureInPicture
                      controlsList="nodownload noremoteplayback"
                    />
                    
                    {/* Custom Controls */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity ${
                        showControls ? 'opacity-100' : 'opacity-0'
                      }`}
                      onMouseEnter={() => setShowControls(true)}
                      onMouseLeave={() => setShowControls(false)}
                    >
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={videoProgress}
                          onChange={handleVideoSeek}
                          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={isPlaying ? handleVideoPause : handleVideoPlay}
                            className="text-white hover:text-blue-400 transition-colors"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-white" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          
                          <div className="text-white text-sm">
                            {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Speed:</span>
                            <select
                              value={playbackSpeed}
                              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                              className="bg-gray-800 text-white text-sm rounded px-2 py-1"
                            >
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1">1x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="2">2x</option>
                            </select>
                          </div>
                          
                          <button
                            onClick={handleFullscreen}
                            className="text-white hover:text-blue-400 transition-colors"
                          >
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Overlay */}
                    {securityEnabled && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Protected
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Viewer */}
              {currentModule.type === 'PDF' && currentModule.content?.pdfUrl && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={currentModule.content.pdfUrl}
                      className="w-full h-96 border border-gray-200 rounded"
                      onContextMenu={preventContextMenu}
                    />
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => updateModuleProgress(currentModule.id, 100)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz */}
              {currentModule.type === 'QUIZ' && currentModule.content?.quizQuestions && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quiz</h3>
                  <div className="space-y-6">
                    {currentModule.content.quizQuestions.map((question, index) => (
                      <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={optionIndex}
                                checked={quizAnswers[index] === optionIndex}
                                onChange={() => setQuizAnswers({...quizAnswers, [index]: optionIndex})}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!showQuizResults ? (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleQuizSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-blue-800">Quiz submitted! Check your results above.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment */}
              {currentModule.type === 'ASSIGNMENT' && currentModule.content?.assignmentDetails && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Assignment</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{currentModule.content.assignmentDetails}</p>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => updateModuleProgress(currentModule.id, 100)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  </div>
                </div>
              )}

              {/* Resources */}
              {currentModule.resources && currentModule.resources.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-3">
                    {currentModule.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">{resource.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.downloadable && !securityEnabled && (
                            <button
                              onClick={() => window.open(resource.url, '_blank')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => window.open(resource.url, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Select a module to start learning</p>
                <p className="text-sm mt-2">Choose from the available modules on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
