'use client';

import { Home, User, Settings, Search, Menu } from 'lucide-react';

export default function TestIcons() {
  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Icon Test</h1>
      
      <div className="flex gap-4 mb-4">
        {/* Test with different colors */}
        <Home className="w-8 h-8 text-black" />
        <User className="w-8 h-8 text-blue-500" />
        <Settings className="w-8 h-8 text-green-500" />
        <Search className="w-8 h-8 text-red-500" />
        <Menu className="w-8 h-8 text-purple-500" />
      </div>
      
      <div className="flex gap-4 mb-4 bg-gray-800 p-4">
        {/* Test on dark background */}
        <Home className="w-8 h-8 text-white" />
        <User className="w-8 h-8 text-gray-300" />
        <Settings className="w-8 h-8 text-blue-400" />
        <Search className="w-8 h-8 text-green-400" />
        <Menu className="w-8 h-8 text-red-400" />
      </div>
      
      <div className="flex gap-4">
        {/* Test without color (should be invisible) */}
        <Home className="w-8 h-8" />
        <User className="w-8 h-8" />
        <Settings className="w-8 h-8" />
        <Search className="w-8 h-8" />
        <Menu className="w-8 h-8" />
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        If you can see the icons above, lucide-react is working fine.
        The issue might be with color classes in your components.
      </p>
    </div>
  );
}
