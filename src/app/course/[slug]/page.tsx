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
    background: rgba(26, 31, 76, 0.9);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(99, 102, 241, 0.3);
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

  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    border: 2px solid rgba(30, 41, 59, 0.5);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #5a67d8 0%, #6b46c1 100%);
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #667eea #1e293b;
  }

  .glass-button {
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  .glass-card {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(99, 102, 241, 0.15);
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
  originalPrice?: number;
  discountPercent?: number;
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
  const slug = params.slug as string;

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
          fetchModules()
        ]);
        // Load other data in background after page is visible
        setTimeout(() => {
          fetchCourseStats();
        }, 500);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Some features may not be available');
      } finally {
        setLoading(false);
      }
    };
    
    initializePage();
  }, [slug]);
  
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
      const response = await fetch(`/api/courses/${slug}`);
      
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
      const response = await fetch(`/api/courses/${slug}/modules`);
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules.sort((a: Module, b: Module) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
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
    console.log('Opening video modal with URL:', videoUrl);
    console.log('Video title:', title);
    console.log('Module index:', moduleIndex);
    
    // Validate and process video URL
    if (!videoUrl) {
      toast.error('No video URL provided');
      return;
    }
    
    // Check if it's a YouTube URL and convert to embed format
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    const finalVideoUrl = embedUrl || videoUrl;
    
    console.log('Final video URL to be used:', finalVideoUrl);
    
    const previewModules = modules.filter((_, index) => isPreviewModule(modules[index], index));
    setVideoModal({
      isOpen: true,
      videoUrl: finalVideoUrl,
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
  
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    
    // Only log error if there's actually an error
    if (video.error) {
      console.error('Video error details:', {
        error: video.error,
        errorCode: video.error.code,
        errorMessage: video.error.message,
        networkState: video.networkState,
        readyState: video.readyState,
        currentSrc: video.currentSrc,
        videoUrl: videoModal.videoUrl
      });
      
      setIsVideoLoading(false);
      
      switch (video.error.code) {
        case 1: // MEDIA_ERR_ABORTED
          toast.error('Video loading was aborted.');
          break;
        case 2: // MEDIA_ERR_NETWORK
          toast.error('Network error. Please check your internet connection and video URL.');
          break;
        case 3: // MEDIA_ERR_DECODE
          toast.error('Video format not supported or file is corrupted.');
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          toast.error('Video format not supported or server not reachable.');
          break;
        default:
          toast.error('Failed to load video. The video URL might be invalid or inaccessible.');
      }
    } else {
      // This might be a false positive, just log for debugging
      console.log('Video error event triggered but no error object found');
      console.log('Video state:', {
        networkState: video.networkState,
        readyState: video.readyState,
        currentSrc: video.currentSrc,
        videoUrl: videoModal.videoUrl
      });
    }
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
      const response = await fetch(`/api/courses/${slug}/stats`);
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
      const response = await fetch(`/api/courses/${slug}/learning-paths`);
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
      const response = await fetch(`/api/courses/${slug}/achievements`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
        <style jsx>{customStyles}</style>
        <div className="text-center">
          {/* Professional Loading Animation */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <BookOpen className="w-16 h-16 text-white animate-bounce" />
            </div>
            <div className="mt-8">
              <div className="w-16 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-fade-in"></div>
              <div className="w-16 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-fade-in delay-200"></div>
              <div className="w-16 h-2 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-fade-in delay-400"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in delay-600">Loading Course Details...</h2>
            <p className="text-gray-300 animate-fade-in delay-800">Please wait while we prepare the best learning experience for you</p>
            
            {/* Loading Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
              <div className="glass-card p-6 animate-slide-in">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Loading...</div>
              </div>
              <div className="glass-card p-6 animate-slide-in delay-200">
                <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Loading...</div>
              </div>
              <div className="glass-card p-6 animate-slide-in delay-400">
                <Award className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Course Not Found</h2>
          <p className="text-gray-300">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
        {/* Ultra Modern Hero Section */}
        <div className="relative overflow-hidden glass-card" style={{background: 'linear-gradient(135deg, rgba(26, 31, 76, 0.9), rgba(13, 27, 62, 0.85))'}}>
          
          <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
            {/* Smart Navigation */}
            <div className="flex items-center justify-end mb-16">
              <div className="flex items-center gap-3 glass-button px-6 py-3 rounded-2xl">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{getCategoryName(course.category)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Course Title and Details */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                {/* Premium Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Bestselling
                  </div>
                  <div className="glass-button text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🎯 {getCategoryName(course.category)}
                  </div>
                </div>
                
                {/* Modern Title */}
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {course.title}
                </h1>
                
                {/* Smart Description */}
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  {course.shortDescription || course.description}
                </p>
                
                {/* Advanced Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="glass-card p-4 text-center">
                    <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">{courseStats.totalStudents || 1250}+</div>
                    <div className="text-gray-400 text-xs">Students</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">{course.duration || '48h'}</div>
                    <div className="text-gray-400 text-xs">Duration</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">{courseStats.averageRating.toFixed(1)}</div>
                    <div className="text-gray-400 text-xs">Rating</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Award className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white">Certificate</div>
                    <div className="text-gray-400 text-xs">Included</div>
                  </div>
                </div>
                
                {/* Instructor Card */}
                <div className="glass-card p-4 flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">Expert Instructor</div>
                    <div className="text-white/70 text-sm">Industry Professional • 10+ years</div>
                  </div>
                  <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    Verified
                  </div>
                </div>

              </div>

              {/* Right Column - Course Image and Pricing */}
              <div className="lg:col-span-1 order-2 lg:order-2">
                <div className="glass-card overflow-hidden sticky top-8">
                  {/* Course Image */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-80 object-fill"
                    />
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Minimal Pricing Section */}
                  <div className="p-6">
                    {/* Price row with 3 items */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Price</div>
                        <div className="text-2xl font-bold text-white">
                          ৳{course.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Original Price</div>
                        <div className="text-xl font-semibold text-white/50">
                          <s>৳{course.originalPrice ? course.originalPrice.toLocaleString() : (course.price * 1.5).toLocaleString()}</s>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Discount</div>
                        <div className="text-xl font-bold text-red-400">
                          {course.discountPercent ? `${course.discountPercent}% OFF` : '33% OFF'}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 mb-4"
                    >
                      Enroll Now
                    </Button>
                    
                    {/* Features in 2 columns */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">{modules.length} lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Certificate</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Resources</span>
                      </div>
                    </div>
                    
                    <div className="text-center text-gray-400 text-sm">
                      30-day money-back guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* What You'll Achieve */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">What You'll Achieve</h2>
            <p className="text-lg text-gray-300">After completing this course, you'll have the skills to:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Build Projects</h4>
              <p className="text-sm text-gray-400">Create real-world applications</p>
            </div>
            
            <div className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Solve Problems</h4>
              <p className="text-sm text-gray-400">Think critically and debug effectively</p>
            </div>
            
            <div className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Work in Teams</h4>
              <p className="text-sm text-gray-400">Collaborate on complex projects</p>
            </div>
            
            <div className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Get Hired</h4>
              <p className="text-sm text-gray-400">Land your dream tech job</p>
            </div>
          </div>
        </div>
        
        {/* Course Curriculum */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 glass-button px-6 py-3 rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold">Course Content</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Course Modules</h2>
            <p className="text-lg text-gray-300">
              {modules.length} modules included
            </p>
          </div>
          
          <div className="overflow-y-auto bg-slate-900 border-2 border-purple-500 rounded-lg module-scroll" style={{height: '550px'}}>
            {modules.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Content Coming Soon</h3>
                <p className="text-gray-400">We're preparing exceptional content for you</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-500/20">
                {modules.map((module, index) => {
                  const isPreview = isPreviewModule(module, index);
                  const isLocked = !isPreview && !enrolledModules.has(module.id);

                  return (
                    <div key={module.id} className="p-6 hover:bg-purple-900/20 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-lg text-white">
                            {module.order}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
                            <div className="flex items-center gap-3">
                              {isPreview && (
                                <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                                    🔥 FREE PREVIEW
                                  </span>
                              )}
                              {module.videoUrl && (
                                <span className="flex items-center gap-1 text-gray-400 text-sm">
                                  <Video className="w-4 h-4" />
                                  <span>Video</span>
                                </span>
                              )}
                              {module.homework && (
                                <span className="flex items-center gap-1 text-gray-400 text-sm">
                                  <FileText className="w-4 h-4" />
                                  <span>Assignment</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {module.videoUrl && isPreview && (
                            <Button
                              onClick={() => openVideoModal(module.videoUrl!, module.title)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg text-sm"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          )}
                          {isLocked ? (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Lock className="w-4 h-4" />
                              <span className="text-sm font-medium">Locked</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-400">
                              <Unlock className="w-4 h-4" />
                              <span className="text-sm font-bold">Available</span>
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
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{videoModal.title}</h3>
              <Button
                onClick={closeVideoModal}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>
            <div className="aspect-video bg-black">
              {videoModal.videoUrl ? (
                (() => {
                  const isYouTube = videoModal.videoUrl.includes('youtube.com/embed');
                  if (isYouTube) {
                    return (
                      <iframe
                        src={videoModal.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onLoad={() => setIsVideoLoading(false)}
                        onError={() => {
                          setIsVideoLoading(false);
                          toast.error('Failed to load YouTube video');
                        }}
                      />
                    );
                  } else {
                    return (
                      <video
                        ref={videoRef}
                        src={videoModal.videoUrl}
                        controls
                        className="w-full h-full"
                        autoPlay
                        onLoadedData={handleVideoLoaded}
                        onError={handleVideoError}
                        onTimeUpdate={handleVideoTimeUpdate}
                        playsInline
                      />
                    );
                  }
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                    <p>Video preview not available</p>
                  </div>
                </div>
              )}
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p>Loading video...</p>
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
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Course Enrollment</h3>
                  <p className="text-gray-400">Start your learning journey today</p>
                </div>
                <Button
                  onClick={() => setShowEnrollmentForm(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="glass-card p-6 mb-6">
                <h4 className="font-semibold text-white mb-2">{course?.title}</h4>
                <div className="text-2xl font-bold text-blue-400">
                  ৳{course?.price.toLocaleString()}
                </div>
              </div>
              
              <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={enrollmentForm.fullName}
                      onChange={(e) => setEnrollmentForm({...enrollmentForm, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={enrollmentForm.phone}
                      onChange={(e) => setEnrollmentForm({...enrollmentForm, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={enrollmentForm.email}
                    onChange={(e) => setEnrollmentForm({...enrollmentForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={enrollmentForm.address}
                    onChange={(e) => setEnrollmentForm({...enrollmentForm, address: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                    rows={4}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
                  <div>
                    <div className="text-xl font-bold text-blue-400">
                      Total: ৳{course?.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Including all taxes</div>
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
