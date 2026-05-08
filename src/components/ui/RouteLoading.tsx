"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RouteLoadingProps {
  isLoading?: boolean;
  message?: string;
}

export default function RouteLoading({ isLoading = false, message = "Loading..." }: RouteLoadingProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(message);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setLoadingMessage(message);
    } else {
      // Add a small delay to prevent flickering for fast loads
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, message]);

  if (!showLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 max-w-sm mx-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">{loadingMessage}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment...</p>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
