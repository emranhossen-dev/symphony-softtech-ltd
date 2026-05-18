import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'list' | 'stats';
  count?: number;
}

export default function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-4 bg-gray-200 rounded-xl w-16 h-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="h-1 bg-gray-200 mt-4 rounded"></div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="p-4 bg-gray-200 rounded-xl w-16 h-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-1 bg-gray-200 mt-4 rounded"></div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'stats':
        return renderStatsSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className={type === 'stats' ? '' : 'space-y-4'}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
