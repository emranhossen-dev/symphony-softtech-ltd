import { Loader2, Shield } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        {/* Admin Logo/Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Shield className="w-12 h-12 text-white animate-pulse" />
          </div>
          {/* Rotating Ring */}
          <div className="absolute -inset-2 border-2 border-white/20 rounded-2xl animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute -inset-4 border border-white/10 rounded-2xl animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
          <p className="text-purple-200">Loading your dashboard...</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-80 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 loading-progress-bar"></div>
        </div>
        
        {/* Animated Dots */}
        <div className="flex space-x-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading Spinner */}
        <div className="relative">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        </div>
      </div>
    </div>
  );
}
