import React from 'react';
import { Users, Plus, FileText, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  type: 'enrollments' | 'courses' | 'stats' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  const getDefaultConfig = () => {
    switch (type) {
      case 'enrollments':
        return {
          icon: icon || <Users className="w-16 h-16" />,
          title: title || 'No Enrollments Yet',
          description: description || 'Start by adding new enrollments to track student applications and manage admissions.',
          actionLabel: actionLabel || 'Add First Enrollment'
        };
      case 'courses':
        return {
          icon: icon || <FileText className="w-16 h-16" />,
          title: title || 'No Courses Yet',
          description: description || 'Create your first course to start offering training programs.',
          actionLabel: actionLabel || 'Add First Course'
        };
      case 'stats':
        return {
          icon: icon || <TrendingUp className="w-16 h-16" />,
          title: title || 'No Data Available',
          description: description || 'Start adding enrollments to see statistics and analytics.',
          actionLabel: actionLabel || 'Get Started'
        };
      default:
        return {
          icon: icon || <Users className="w-16 h-16" />,
          title: title || 'No Data Found',
          description: description || 'There is no data to display at the moment.',
          actionLabel: actionLabel || 'Add Data'
        };
    }
  };

  const config = getDefaultConfig();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative">
        {/* Background circles */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
        
        {/* Icon container */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
          <div className="text-white">
            {config.icon}
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="mt-8 text-center max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {config.title}
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Action button */}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-8 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          {config.actionLabel}
        </button>
      )}

      {/* Decorative elements */}
      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
