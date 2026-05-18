'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Briefcase,
  ArrowLeft,
  GraduationCap,
  Monitor,
  Smartphone,
  MapPin,
  FileText
} from 'lucide-react';

interface CategoryStats {
  totalEnrollments: number;
  activeStudents: number;
  completedCourses: number;
  pendingApprovals: number;
  totalRevenue: number;
  averageCompletionTime: number;
  popularCourses: Array<{
    name: string;
    enrollments: number;
    completionRate: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseName: string;
    enrollmentDate: string;
    status: string;
  }>;
}

const categoryConfig = {
  'government': { 
    label: 'Government Batch', 
    color: 'from-orange-600 to-red-700',
    bgColor: 'bg-orange-500/20',
    icon: GraduationCap,
    description: 'Official certified programs with job placement support'
  },
  'recorded': { 
    label: 'Recorded Courses', 
    color: 'from-purple-600 to-pink-700',
    bgColor: 'bg-purple-500/20',
    icon: Monitor,
    description: 'Learn at your own pace with HD video lessons available 24/7'
  },
  'online': { 
    label: 'Online Batch', 
    color: 'from-blue-600 to-cyan-700',
    bgColor: 'bg-blue-500/20',
    icon: Smartphone,
    description: 'Interactive live sessions with real-time mentor support'
  },
  'offline': { 
    label: 'Offline Batch', 
    color: 'from-green-600 to-emerald-700',
    bgColor: 'bg-green-500/20',
    icon: MapPin,
    description: 'In-person training with hands-on practical experience'
  }
};

const mockStatsByCategory: Record<string, CategoryStats> = {
  'government': {
    totalEnrollments: 156,
    activeStudents: 89,
    completedCourses: 67,
    pendingApprovals: 12,
    totalRevenue: 2340000,
    averageCompletionTime: 180,
    popularCourses: [
      { name: 'Government Job Preparation', enrollments: 45, completionRate: 78 },
      { name: 'Civil Services Foundation', enrollments: 38, completionRate: 82 },
      { name: 'Banking Exam Preparation', enrollments: 32, completionRate: 75 }
    ],
    recentEnrollments: [
      { id: '1', studentName: 'Rahul Kumar', courseName: 'Government Job Preparation', enrollmentDate: '2024-01-15', status: 'pending' },
      { id: '2', studentName: 'Priya Sharma', courseName: 'Civil Services Foundation', enrollmentDate: '2024-01-14', status: 'approved' },
      { id: '3', studentName: 'Amit Singh', courseName: 'Banking Exam Preparation', enrollmentDate: '2024-01-13', status: 'pending' }
    ]
  },
  'recorded': {
    totalEnrollments: 234,
    activeStudents: 156,
    completedCourses: 178,
    pendingApprovals: 8,
    totalRevenue: 3520000,
    averageCompletionTime: 120,
    popularCourses: [
      { name: 'Full Stack Web Development', enrollments: 67, completionRate: 85 },
      { name: 'Data Science & Machine Learning', enrollments: 54, completionRate: 79 },
      { name: 'Mobile App Development', enrollments: 43, completionRate: 82 }
    ],
    recentEnrollments: [
      { id: '4', studentName: 'Sneha Patel', courseName: 'Full Stack Web Development', enrollmentDate: '2024-01-15', status: 'approved' },
      { id: '5', studentName: 'Vikram Reddy', courseName: 'Data Science & Machine Learning', enrollmentDate: '2024-01-14', status: 'pending' },
      { id: '6', studentName: 'Anjali Gupta', courseName: 'Mobile App Development', enrollmentDate: '2024-01-13', status: 'approved' }
    ]
  },
  'online': {
    totalEnrollments: 189,
    activeStudents: 134,
    completedCourses: 155,
    pendingApprovals: 15,
    totalRevenue: 4560000,
    averageCompletionTime: 90,
    popularCourses: [
      { name: 'Live Full Stack Bootcamp', enrollments: 58, completionRate: 88 },
      { name: 'Live Data Science Bootcamp', enrollments: 47, completionRate: 84 },
      { name: 'Live Mobile Development', enrollments: 39, completionRate: 81 }
    ],
    recentEnrollments: [
      { id: '7', studentName: 'Karan Mehta', courseName: 'Live Full Stack Bootcamp', enrollmentDate: '2024-01-15', status: 'pending' },
      { id: '8', studentName: 'Divya Nair', courseName: 'Live Data Science Bootcamp', enrollmentDate: '2024-01-14', status: 'approved' },
      { id: '9', studentName: 'Rohit Verma', courseName: 'Live Mobile Development', enrollmentDate: '2024-01-13', status: 'pending' }
    ]
  },
  'offline': {
    totalEnrollments: 98,
    activeStudents: 67,
    completedCourses: 31,
    pendingApprovals: 6,
    totalRevenue: 1890000,
    averageCompletionTime: 150,
    popularCourses: [
      { name: 'Classroom Full Stack Training', enrollments: 28, completionRate: 92 },
      { name: 'Offline UI/UX Design', enrollments: 23, completionRate: 87 },
      { name: 'In-person Data Science Lab', enrollments: 19, completionRate: 89 }
    ],
    recentEnrollments: [
      { id: '10', studentName: 'Pooja Joshi', courseName: 'Classroom Full Stack Training', enrollmentDate: '2024-01-15', status: 'approved' },
      { id: '11', studentName: 'Manish Kumar', courseName: 'Offline UI/UX Design', enrollmentDate: '2024-01-14', status: 'pending' },
      { id: '12', studentName: 'Neha Singh', courseName: 'In-person Data Science Lab', enrollmentDate: '2024-01-13', status: 'approved' }
    ]
  }
};

export default function CategoryOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  
  const [stats, setStats] = useState<CategoryStats>({
    totalEnrollments: 0,
    activeStudents: 0,
    completedCourses: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    averageCompletionTime: 0,
    popularCourses: [],
    recentEnrollments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading category-specific stats
    setTimeout(() => {
      const categoryStats = mockStatsByCategory[categorySlug] || mockStatsByCategory['government'];
      setStats(categoryStats);
      setLoading(false);
    }, 1000);
  }, [categorySlug]);

  const getCategoryInfo = () => {
    return categoryConfig[categorySlug as keyof typeof categoryConfig] || categoryConfig['government'];
  };

  const categoryInfo = getCategoryInfo();
  const IconComponent = categoryInfo.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/employee')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${categoryInfo.bgColor} border border-white/20`}>
            <IconComponent className="w-5 h-5" />
            <span className="text-sm font-medium">{categoryInfo.label}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {categoryInfo.label} Overview
            </h1>
            <p className="text-gray-300 text-lg">
              {categoryInfo.description}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/employee/category/${categorySlug}/enrollments`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View All Enrollments
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`bg-gradient-to-br ${categoryInfo.color} text-white rounded-2xl shadow-lg p-6 border border-white/20`}>
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-white/80" />
            <span className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.totalEnrollments}</h3>
          <p className="text-white/80">Total Enrollments</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl shadow-lg p-6 border border-green-600/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-white/80" />
            <span className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.activeStudents}</h3>
          <p className="text-white/80">Active Students</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg p-6 border border-blue-600/30">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-white/80" />
            <span className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded-full">Done</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.completedCourses}</h3>
          <p className="text-white/80">Completed Courses</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-lg p-6 border border-orange-600/30">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-white/80" />
            <span className="text-sm text-white/70 bg-white/20 px-2 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.pendingApprovals}</h3>
          <p className="text-white/80">Pending Approvals</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue & Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Avg. Completion</p>
              <p className="text-2xl font-bold text-blue-400">{stats.averageCompletionTime} days</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Popular Courses
          </h3>
          <div className="space-y-3">
            {stats.popularCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{course.name}</p>
                  <p className="text-gray-400 text-sm">{course.enrollments} enrollments</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{course.completionRate}%</p>
                  <p className="text-gray-400 text-xs">completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Enrollments
          </h3>
          <button
            onClick={() => router.push(`/employee/category/${categorySlug}/enrollments`)}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stats.recentEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-white">{enrollment.studentName}</td>
                  <td className="px-4 py-3 text-gray-300">{enrollment.courseName}</td>
                  <td className="px-4 py-3 text-gray-400">{enrollment.enrollmentDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
