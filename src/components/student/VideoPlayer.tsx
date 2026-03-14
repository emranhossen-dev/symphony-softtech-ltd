'use client';

import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string | null;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <div className="mb-6">
      {/* Responsive 16:9 Video Player Placeholder */}
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden shadow-sm">
        {/* 16:9 Aspect Ratio Container */}
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            {/* Play Button */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-opacity-30 transition-colors cursor-pointer">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-white text-sm opacity-75">
                {videoUrl ? 'Click to play video' : 'Video placeholder'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
