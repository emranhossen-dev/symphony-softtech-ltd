import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Large Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 animate-spin" />
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the page...</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 loading-progress-bar"></div>
        </div>
        
        {/* Animated Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
