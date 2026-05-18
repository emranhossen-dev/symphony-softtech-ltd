"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

function RouteLoadingContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo with Spinner */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative bg-white rounded-lg p-2">
            <Image
              src="/Logo.jpeg"
              alt="Symphony Institute of Technology"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 border-4 border-blue-200 border-t-blue-600 rounded-lg animate-spin"></div>
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

export default function RouteLoading() {
  return (
    <Suspense fallback={null}>
      <RouteLoadingContent />
    </Suspense>
  );
}
