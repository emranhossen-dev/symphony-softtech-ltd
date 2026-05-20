'use client';

import { useRef, useState, useEffect } from 'react';

interface SimpleVideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function SimpleVideoPlayer({ 
  videoUrl, 
  title = "Video Content",
  onProgress,
  onComplete,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: SimpleVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      onProgress?.(progress);
      
      if (video.currentTime === video.duration) {
        onComplete?.();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * video.duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
          <p className="text-gray-500">No video available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Video Element - 16:9 Aspect Ratio */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        <div className="w-full max-w-full" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            onClick={togglePlay}
            src={videoUrl}
          />
        </div>
        
        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* YouTube-style Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-3">
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-gray-700 rounded-full cursor-pointer mb-3 group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-100 group-hover:bg-red-500"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          {/* Left Controls - Play/Pause, Previous, Next */}
          <div className="flex items-center gap-3">
            {/* Previous Button */}
            <button 
              onClick={() => {
                console.log('Video player previous button clicked');
                console.log('hasPrevious:', hasPrevious);
                onPrevious?.();
              }}
              disabled={!hasPrevious}
              className={`${hasPrevious ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'} transition-colors`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Next Button */}
            <button 
              onClick={() => {
                console.log('Video player next button clicked');
                console.log('hasNext:', hasNext);
                onNext?.();
              }}
              disabled={!hasNext}
              className={`${hasNext ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'} transition-colors`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Time Display */}
          <div className="text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-gray-400">{formatTime(duration)}</span>
          </div>

          {/* Right Controls - Volume */}
          <div className="flex items-center gap-2">
            {/* Volume Button */}
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            
            {/* Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="1"
              className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
              onChange={(e) => {
                const video = videoRef.current;
                if (video) {
                  video.volume = parseFloat(e.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
