'use client';

import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Clock, 
  Users, 
  Award,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  category: string;
  duration: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  attendancePercentage: number;
  canReceiveCertificate: boolean;
  certificateEligible: boolean;
  certificate?: {
    id: string;
    certificateUrl: string;
    verificationId: string;
    issuedAt: string;
  };
  enrolledAt: string;
  lastAccessed: string;
  enrollmentStatus: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface EnhancedCourseCardProps {
  course: Course;
  onContinue?: (courseId: string, courseSlug: string) => void;
}

export default function EnhancedCourseCard({ course, onContinue }: EnhancedCourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'APPLIED': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'WAITING': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'ADMITTED': return 'Enrolled';
      case 'APPLIED': return 'Pending Approval';
      case 'WAITING': return 'Payment Required';
      case 'REJECTED': return 'Enrollment Rejected';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ADMITTED': return <CheckCircle className="w-4 h-4" />;
      case 'APPLIED': return <Clock className="w-4 h-4" />;
      case 'WAITING': return <AlertCircle className="w-4 h-4" />;
      case 'REJECTED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GOVERNMENT': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'ONLINE': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'OFFLINE': 'bg-green-500/20 text-green-300 border border-green-500/30',
      'RECORDED': 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  };

  const getTimeSpent = () => {
    // Calculate time spent based on completed modules (assuming 30 min per module)
    return Math.round(course.completedModules * 0.5);
  };

  const getNextModuleInfo = () => {
    if (course.progress >= 100) {
      return { text: 'Course Completed', icon: <Award className="w-4 h-4" /> };
    }
    if (course.progress === 0) {
      return { text: 'Start Course', icon: <PlayCircle className="w-4 h-4" /> };
    }
    return { text: 'Continue Learning', icon: <TrendingUp className="w-4 h-4" /> };
  };

  const nextModuleInfo = getNextModuleInfo();

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 group">
      {/* Course Header with Image */}
      <div className="relative h-48 border-b border-purple-500/10">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-purple-400 opacity-60" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getStatusColor(course.enrollmentStatus)}`}>
            {getStatusIcon(course.enrollmentStatus)}
            {getStatusMessage(course.enrollmentStatus)}
          </div>
        </div>

        {/* Progress Overlay */}
        {course.enrollmentStatus === 'ADMITTED' && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between text-white text-xs">
              <span>{course.progress}% Complete</span>
              <span>{course.completedModules}/{course.totalModules} modules</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Title and Category */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">{course.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(course.category)}`}>
              {course.category}
            </span>
            <span className="text-xs text-gray-400">• {course.duration}</span>
          </div>
        </div>

        {/* Course Overview */}
        <div className="space-y-3 mb-4">
          {/* Instructor */}
          {course.mentor && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Instructor: {course.mentor.name}</span>
            </div>
          )}

          {/* Progress Stats */}
          {course.enrollmentStatus === 'ADMITTED' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{getTimeSpent()}h spent</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>{course.progress}% progress</span>
              </div>
            </div>
          )}

          {/* Enrollment Date */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Enrolled {new Date(course.enrolledAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Certificate Status */}
        {course.enrollmentStatus === 'ADMITTED' && course.certificate && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Certificate Earned!</span>
            </div>
            <p className="text-xs text-green-300/80 mt-1">
              Issued on {new Date(course.certificate.issuedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Certificate Eligibility */}
        {course.enrollmentStatus === 'ADMITTED' && course.certificateEligible && !course.certificate && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 text-yellow-400">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Certificate Available!</span>
            </div>
            <p className="text-xs text-yellow-300/80 mt-1">
              Complete the course to claim your certificate
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {course.enrollmentStatus === 'ADMITTED' ? (
            <button
              onClick={() => onContinue?.(course.id, course.slug)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-purple-500/20 shadow-lg"
            >
              {nextModuleInfo.icon}
              {nextModuleInfo.text}
            </button>
          ) : course.enrollmentStatus === 'APPLIED' ? (
            <div className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium py-3 px-4 rounded-lg text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Application Under Review</span>
              </div>
            </div>
          ) : course.enrollmentStatus === 'WAITING' ? (
            <div className="w-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium py-3 px-4 rounded-lg text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Payment Required</span>
              </div>
            </div>
          ) : (
            <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium py-3 px-4 rounded-lg text-center text-sm">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Enrollment Rejected</span>
              </div>
            </div>
          )}

          {/* View Details Button */}
          <button
            onClick={() => window.location.href = `/student/course/${course.id}`}
            className="w-full bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            View Course Details
          </button>
        </div>
      </div>
    </div>
  );
}
