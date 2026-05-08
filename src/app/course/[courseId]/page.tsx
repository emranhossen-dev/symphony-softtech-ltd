"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Star, 
  Award, 
  ShoppingCart, 
  Play, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Video, 
  FileText, 
  BookOpen, 
  Target, 
  Zap, 
  Rocket, 
  Trophy,
  User,
  X,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import EnrollmentForm from '@/components/enrollment/EnrollmentForm';
import toast from 'react-hot-toast';

// Custom CSS for animations
const customStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }
  
  .animate-slide-in {
    animation: slideIn 0.6s ease-out;
  }
  
  .animate-bounce {
    animation: bounce 2s infinite;
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .hover-lift {
    transition: all 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .delay-200 { animation-delay: 200ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-800 { animation-delay: 800ms; }
  
  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .card-hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .card-hover:hover {
    transform: translateY(-10px) rotateX(5deg);
    box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  }
  
  .stats-counter {
    background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .premium-gradient {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
  }
  
  .shimmer-effect {
    position: relative;
    overflow: hidden;
  }
  
  .shimmer-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }
`;

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
  duration?: string;
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
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface EnrollmentForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

interface VideoModal {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  currentModuleIndex: number;
  playlist: Module[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackSpeed: number;
}

interface CourseStats {
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  certificate: boolean;
  subtitles: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: string[];
  estimatedTime: string;
  difficulty: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
}

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledModules, setEnrolledModules] = useState<Set<string>>(new Set());
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState<EnrollmentForm>({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });
  const [videoModal, setVideoModal] = useState<VideoModal>({
    isOpen: false,
    videoUrl: '',
    title: '',
    currentModuleIndex: 0,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackSpeed: 1
  });
  
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0,
    completionRate: 0,
    difficulty: 'Beginner',
    language: 'Bangla',
    certificate: true,
    subtitles: ['Bangla', 'English']
  });
  
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showLearningPaths, setShowLearningPaths] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        await Promise.all([
          fetchCourse(),
          fetchModules(),
          fetchCourseStats(),
          fetchLearningPaths(),
          fetchAchievements()
        ]);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Some features may not be available');
      }
    };
    
    initializePage();
  }, [courseId]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoModal.isOpen) return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          skipForward();
          break;
        case 'ArrowLeft':
          skipBackward();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videoModal.isOpen]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        return;
      }
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      if (!text) {
        console.error('Empty response received');
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text was:', text);
        return;
      }
      
      if (data.success) {
        setCourse(data.course);
      } else {
        console.error('API returned error:', data.error);
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

  const handlePurchase = () => {
    setShowEnrollmentModal(true);
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentForm.fullName || !enrollmentForm.phone || !enrollmentForm.email || !enrollmentForm.address) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...enrollmentForm,
          courseId: course?.id,
          courseName: course?.title,
          categoryId: course?.categoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit enrollment');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Enrollment submitted successfully!');
        setShowEnrollmentForm(false);
        setEnrollmentForm({ fullName: '', phone: '', email: '', address: '' });
      } else {
        toast.error(data.message || 'Failed to submit enrollment');
      }
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const isPreviewModule = (module: Module, index: number) => {
    return index < 2 && (module.title.includes('Demo') || module.title.includes('Introduction') || module.title.includes('Preview'));
  };
  
  const openVideoModal = (videoUrl: string, title: string, moduleIndex: number = 0) => {
    const previewModules = modules.filter((_, index) => isPreviewModule(modules[index], index));
    setVideoModal({
      isOpen: true,
      videoUrl,
      title,
      currentModuleIndex: moduleIndex,
      playlist: previewModules,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      isFullscreen: false,
      playbackSpeed: 1
    });
    setIsVideoLoading(true);
  };
  
  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setVideoModal({
      isOpen: false,
      videoUrl: '',
      title: '',
      currentModuleIndex: 0,
      playlist: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      isFullscreen: false,
      playbackSpeed: 1
    });
    setVideoProgress(0);
  };
  
  const togglePlayPause = () => {
    const isYouTube = getYouTubeEmbedUrl(videoModal.videoUrl).includes('youtube.com/embed');
    
    if (isYouTube) {
      // For YouTube, we can't directly control playback, just show message
      toast('Use YouTube player controls for play/pause');
    } else if (videoRef.current) {
      if (videoModal.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoModal(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };
  
  const skipForward = () => {
    const isYouTube = getYouTubeEmbedUrl(videoModal.videoUrl).includes('youtube.com/embed');
    
    if (isYouTube) {
      toast('Use YouTube player controls for seeking');
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoRef.current.duration);
    }
  };
  
  const skipBackward = () => {
    const isYouTube = getYouTubeEmbedUrl(videoModal.videoUrl).includes('youtube.com/embed');
    
    if (isYouTube) {
      toast('Use YouTube player controls for seeking');
    } else if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoModal.isMuted;
      setVideoModal(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };
  
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setVideoModal(prev => ({ ...prev, isFullscreen: true }));
      } else {
        document.exitFullscreen();
        setVideoModal(prev => ({ ...prev, isFullscreen: false }));
      }
    }
  };
  
  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setVideoModal(prev => ({ ...prev, playbackSpeed: speed }));
    }
  };
  
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progress = (current / duration) * 100;
      setVideoProgress(progress);
      setVideoModal(prev => ({ ...prev, currentTime: current, duration }));
    }
  };
  
  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
  };
  
  const handleVideoError = () => {
    setIsVideoLoading(false);
    toast.error('Failed to load video. The video URL might be invalid or inaccessible.');
  };
  
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    
    return url;
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const isYouTube = getYouTubeEmbedUrl(videoModal.videoUrl).includes('youtube.com/embed');
    
    if (isYouTube) {
      toast('Use YouTube player controls for seeking');
      return;
    }
    
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };
  
  const playNextVideo = () => {
    const nextIndex = videoModal.currentModuleIndex + 1;
    if (nextIndex < videoModal.playlist.length) {
      const nextModule = videoModal.playlist[nextIndex];
      if (nextModule.videoUrl) {
        openVideoModal(nextModule.videoUrl, nextModule.title, nextIndex);
      }
    }
  };
  
  const playPreviousVideo = () => {
    const prevIndex = videoModal.currentModuleIndex - 1;
    if (prevIndex >= 0) {
      const prevModule = videoModal.playlist[prevIndex];
      if (prevModule.videoUrl) {
        openVideoModal(prevModule.videoUrl, prevModule.title, prevIndex);
      }
    }
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Course bookmarked');
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Like removed' : 'Course liked');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.shortDescription,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
    setShareCount(prev => prev + 1);
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const fetchCourseStats = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/stats`);
      if (!response.ok) {
        console.warn('Failed to fetch course stats, using defaults');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setCourseStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching course stats:', error);
      // Set default values to prevent errors
      setCourseStats({
        totalStudents: 0,
        averageRating: 4.5,
        totalReviews: 0,
        completionRate: 85,
        difficulty: 'Beginner',
        language: 'Bangla',
        certificate: true,
        subtitles: ['Bangla', 'English']
      });
    }
  };
  
  const fetchLearningPaths = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/learning-paths`);
      if (!response.ok) {
        console.warn('Failed to fetch learning paths, using defaults');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setLearningPaths(data.paths);
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      // Set empty array to prevent errors
      setLearningPaths([]);
    }
  };
  
  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/achievements`);
      if (!response.ok) {
        console.warn('Failed to fetch achievements, using defaults');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Set empty array to prevent errors
      setAchievements([]);
    }
  };

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GOVERNMENT': 'bg-gradient-to-r from-green-600 to-orange-500',
      'ONLINE': 'bg-gradient-to-r from-green-600 to-orange-500',
      'OFFLINE': 'bg-gradient-to-r from-green-600 to-orange-500',
      'RECORDED': 'bg-gradient-to-r from-green-600 to-orange-500',
      'GRAPHIC_DESIGN': 'bg-gradient-to-r from-green-600 to-orange-500',
      'WEB_DEVELOPMENT': 'bg-gradient-to-r from-green-600 to-orange-500',
      'DIGITAL_MARKETING': 'bg-gradient-to-r from-green-600 to-orange-500'
    };
    return colors[category] || 'bg-gradient-to-r from-green-600 to-orange-500';
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/30 to-purple-50 flex items-center justify-center">
        <style jsx>{customStyles}</style>
        <div className="text-center">
          {/* Professional Loading Animation */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <BookOpen className="w-16 h-16 text-white animate-bounce" />
            </div>
            <div className="mt-8">
              <div className="w-16 h-2 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full animate-fade-in"></div>
              <div className="w-16 h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full animate-fade-in delay-200"></div>
              <div className="w-16 h-2 bg-gradient-to-r from-purple-200 to-rose-200 rounded-full animate-fade-in delay-400"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4 animate-fade-in delay-600">Loading Course Details...</h2>
            <p className="text-gray-500 animate-fade-in delay-800">Please wait while we prepare the best learning experience for you</p>
            
            {/* Loading Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-200 animate-slide-in">
                <Users className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-700">Loading...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 animate-slide-in delay-200">
                <BookOpen className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-700">Loading...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 animate-slide-in delay-400">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-700">Loading...</div>
              </div>
            </div>
          </div>
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
    <>
      <style jsx>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Ultra Modern Hero Section */}
        <div className="relative overflow-hidden">
          {/* Beautiful Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            {/* Modern Pattern Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='10' r='1'/%3E%3Ccircle cx='10' cy='50' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/svg%3E&quot;)]"></div>
            </div>
          </div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-md animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-300/20 rounded-full backdrop-blur-md animate-float-delay-3"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-pink-300/20 rounded-full backdrop-blur-md animate-float-delay-5"></div>
          <div className="absolute bottom-32 right-20 w-20 h-20 bg-blue-300/20 rounded-full backdrop-blur-md animate-float-delay-7"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
            {/* Smart Navigation */}
            <div className="flex items-center justify-between mb-16">
              <Button
                onClick={() => window.history.back()}
                className="group bg-white/10 backdrop-blur-lg border border-white/20 text-white px-6 py-3 rounded-2xl font-medium hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Back
              </Button>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 rounded-2xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{getCategoryName(course.category)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                {/* Premium Badges */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    ⭐ Bestselling
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🎯 {getCategoryName(course.category)}
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🔥 Trending
                  </div>
                </div>
                
                {/* Modern Title */}
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {course.title}
                </h1>
                
                {/* Smart Description */}
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  {course.shortDescription || course.description.substring(0, 150) + '...'}
                </p>
                
                {/* Advanced Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
                    <Users className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{courseStats.totalStudents || 1250}+</div>
                    <div className="text-white/70 text-sm">Students</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
                    <Clock className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{course.duration || '48h'}</div>
                    <div className="text-white/70 text-sm">Duration</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-300 fill-current mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{courseStats.averageRating.toFixed(1)}</div>
                    <div className="text-white/70 text-sm">Rating</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center">
                    <Award className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">Certificate</div>
                    <div className="text-white/70 text-sm">Included</div>
                  </div>
                </div>
                
                {/* Instructor Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">Expert Instructor</div>
                    <div className="text-white/70 text-sm">Industry Professional • 10+ years</div>
                  </div>
                  <div className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </div>
                </div>
              </div>
              
              {/* Smart Pricing Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-black text-white mb-2">
                        ৳{course.price.toLocaleString()}
                      </div>
                      <div className="text-white/80 line-through text-lg">
                        ৳{(course.price * 2).toLocaleString()}
                      </div>
                      <div className="inline-block mt-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                        🔥 50% OFF - Limited Time
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl mb-6 transform hover:scale-105"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Enroll Now
                    </Button>
                    
                    <div className="text-center text-gray-500 text-sm mb-6">
                      ⚡ 30-day money-back guarantee
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">{modules.length} video lessons</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ultra Modern Content Sections */}
        <div className="max-w-7xl mx-auto px-8 py-20">
          {/* Course Learning Plan - Modern */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-6 py-3 rounded-full mb-6">
                <Target className="w-5 h-5 text-indigo-600" />
                <span className="text-indigo-900 font-bold">Learning Journey</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Your Learning Path</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Step-by-step roadmap to master {course.category.toLowerCase()}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Phase 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-xl group hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Foundation</h3>
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Weeks 1-4
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Basic Concepts</p>
                      <p className="text-sm text-gray-600">Core fundamentals and terminology</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Setup & Tools</p>
                      <p className="text-sm text-gray-600">Environment configuration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">First Projects</p>
                      <p className="text-sm text-gray-600">Hands-on practice exercises</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 shadow-xl group hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Advanced Skills</h3>
                  <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Weeks 5-8
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Advanced Topics</p>
                      <p className="text-sm text-gray-600">Deep dive into complex concepts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Real Projects</p>
                      <p className="text-sm text-gray-600">Industry-relevant applications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Best Practices</p>
                      <p className="text-sm text-gray-600">Professional development patterns</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 shadow-xl group hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Career Ready</h3>
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    Weeks 9-12
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Rocket className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Portfolio Building</p>
                      <p className="text-sm text-gray-600">Create impressive projects</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Rocket className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Interview Prep</p>
                      <p className="text-sm text-gray-600">Technical and soft skills</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Rocket className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Placement</p>
                      <p className="text-sm text-gray-600">Career support and guidance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Mission & Vision - Modern */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 rounded-full mb-6">
                <Trophy className="w-5 h-5 text-amber-600" />
                <span className="text-amber-900 font-bold">Course Mission</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">What You'll Achieve</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform from beginner to professional {course.category.toLowerCase()} expert
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Mission */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                    <p className="text-amber-600 font-medium">Empowering Your Success</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Practical Skills</p>
                      <p className="text-gray-600">Hands-on experience with real-world projects and industry tools</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Expert Guidance</p>
                      <p className="text-gray-600">Learn from industry professionals with 10+ years experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Career Support</p>
                      <p className="text-gray-600">Job placement assistance and interview preparation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vision */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Vision</h3>
                    <p className="text-blue-600 font-medium">Future Success</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Become Expert</p>
                      <p className="text-gray-600">Master advanced concepts and best practices</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Build Portfolio</p>
                      <p className="text-gray-600">Create impressive projects that showcase your skills</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Get Hired</p>
                      <p className="text-gray-600">Land your dream job in the tech industry</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Learning Outcomes */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">What You'll Be Able To Do</h3>
                <p className="text-lg text-gray-600">After completing this course, you'll have the skills to:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Build Projects</h4>
                  <p className="text-sm text-gray-600">Create real-world applications</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Solve Problems</h4>
                  <p className="text-sm text-gray-600">Think critically and debug effectively</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Work in Teams</h4>
                  <p className="text-sm text-gray-600">Collaborate on complex projects</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Get Hired</h4>
                  <p className="text-sm text-gray-600">Land your dream tech job</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* What You'll Learn - Modern */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-6">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900 font-bold">Learning Outcomes</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">What You'll Master</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your skills and become a {course.category.toLowerCase()} expert
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Strong Foundation</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Master the fundamentals and build a solid understanding of core concepts.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Real Projects</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Apply your knowledge by building impressive, portfolio-ready projects.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Launch Your Career</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Get job-ready with career guidance and industry-relevant skills.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Earn Certification</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Receive a recognized certificate that validates your expertise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Curriculum - Modern */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full mb-6">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900 font-bold">Course Content</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Comprehensive Curriculum</h2>
              <p className="text-xl text-gray-600">
                {modules.length} expertly crafted modules
              </p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {modules.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Content Coming Soon</h3>
                  <p className="text-gray-500 text-lg">We're preparing exceptional content for you</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {modules.map((module, index) => {
                    const isPreview = isPreviewModule(module, index);
                    const isLocked = !isPreview && !enrolledModules.has(module.id);
                    
                    return (
                      <div key={module.id} className="p-8 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-xl text-white group-hover:scale-110 transition-transform duration-300">
                              {module.order}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
                              <div className="flex items-center gap-4">
                                {isPreview && (
                                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                    🔥 FREE PREVIEW
                                  </span>
                                )}
                                {module.videoUrl && (
                                  <span className="flex items-center gap-2 text-gray-600 font-medium">
                                    <Video className="w-5 h-5" />
                                    <span>Video Lesson</span>
                                  </span>
                                )}
                                {module.homework && (
                                  <span className="flex items-center gap-2 text-gray-600 font-medium">
                                    <FileText className="w-5 h-5" />
                                    <span>Assignment</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {module.videoUrl && isPreview && (
                              <Button
                                onClick={() => openVideoModal(module.videoUrl!, module.title)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                              >
                                <Play className="w-5 h-5 mr-2" />
                                Preview
                              </Button>
                            )}
                            {isLocked ? (
                              <div className="flex items-center gap-3 text-gray-400">
                                <Lock className="w-5 h-5" />
                                <span className="font-medium">Enroll to unlock</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-green-600">
                                <Unlock className="w-5 h-5" />
                                <span className="font-bold">Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Student Success - Modern */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-3 rounded-full mb-6">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="text-green-900 font-bold">Success Stories</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Student Success</h2>
              <p className="text-xl text-gray-600">
                Join thousands of successful graduates worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="text-5xl font-black text-gray-900 mb-6 group-hover:scale-110 transition-transform duration-300">{courseStats.averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-8 h-8 ${i < Math.floor(courseStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="text-xl font-bold text-gray-900">Average Rating</div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="text-5xl font-black text-gray-900 mb-6 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="text-xl font-bold text-gray-900 mb-4">Job Placement</div>
                <div className="text-gray-600 font-medium">Within 3 months</div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="text-5xl font-black text-gray-900 mb-6 group-hover:scale-110 transition-transform duration-300">{courseStats.totalStudents || 1250}+</div>
                <div className="text-xl font-bold text-gray-900">Happy Students</div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-sm font-bold">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 mb-2">Graduates work at</div>
                    <div className="text-gray-600">Top companies worldwide</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].map((company) => (
                    <span key={company} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors duration-300">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Description - Modern */}
          <div>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-6 py-3 rounded-full mb-6">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-indigo-900 font-bold">Course Details</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">About This Course</h2>
            </div>
            
            <div className="bg-white rounded-3xl p-16 shadow-xl border border-gray-100">
              <p className="text-xl text-gray-700 leading-relaxed text-center max-w-5xl mx-auto">
                {course.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enrollment Modal */}
        {showEnrollmentModal && course && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-2xl">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <EnrollmentForm
                course={{
                  id: course.id,
                  title: course.title,
                  price: course.price,
                  category: course.category,
                  slug: course.category.toLowerCase()
                }}
                onClose={() => setShowEnrollmentModal(false)}
              />
            </div>
          </div>
        )}
                
        {/* Professional Video Modal */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{videoModal.title}</h3>
              <Button
                onClick={closeVideoModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
            <div className="aspect-video bg-black">
              {videoModal.videoUrl ? (
                <video
                  src={videoModal.videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                    <p>Video preview not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          {/* Professional Enrollment Form Modal */}
      {showEnrollmentForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Course Enrollment</h3>
                  <p className="text-gray-600">Start your learning journey today</p>
                </div>
                <Button
                  onClick={() => setShowEnrollmentForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{course?.title}</h4>
                <div className="text-2xl font-bold text-blue-600">
                  ৳{course?.price.toLocaleString()}
                </div>
              </div>
              
              <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={enrollmentForm.fullName}
                      onChange={(e) => setEnrollmentForm({...enrollmentForm, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={enrollmentForm.phone}
                      onChange={(e) => setEnrollmentForm({...enrollmentForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={enrollmentForm.email}
                    onChange={(e) => setEnrollmentForm({...enrollmentForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={enrollmentForm.address}
                    onChange={(e) => setEnrollmentForm({...enrollmentForm, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      Total: ৳{course?.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Including all taxes</div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    Submit Enrollment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CourseDetailPage;
