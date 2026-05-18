"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  UserCheck,
  UserX,
  ArrowRight,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  UserPlus,
  TrendingUp,
  BookOpen,
  Star,
  Award,
  Target,
  Activity,
  BarChart3,
  Eye,
  Filter,
  Download,
  Zap,
  Globe,
  Video,
  Building,
  Monitor,
  PlayCircle,
  Users2,
  GraduationCap,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Settings
} from "lucide-react";
import CategorySwitcher from '@/components/admin/CategorySwitcher';
import EmptyState from '@/components/admin/EmptyState';
import SkeletonLoader from '@/components/admin/SkeletonLoader';
import StatsChart from '@/components/admin/StatsChart';
import ThemeToggle from '@/components/admin/ThemeToggle';

type EnrollmentStatus = 'PENDING_REVIEW' | 'PAYMENT_PENDING' | 'APPROVED' | 'ADMITTED' | 'WAITING' | 'REJECTED';

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: EnrollmentStatus;
  paymentStatus: 'pending' | 'paid' | 'failed';
  assignedMentor?: string;
  appliedDate: string;
  avatar?: string;
  categoryId: string;
}

interface CategoryStats {
  applied: number;
  waiting: number;
  admitted: number;
  nextBatch: number;
  rejected: number;
  totalRevenue: number;
  activeMentors: number;
  completionRate: number;
  monthlyGrowth: number;
  totalCourses: number;
  activeStudents: number;
  averageRating: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

const CategoryAdmissionControl = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EnrollmentStatus>('PENDING_REVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [enrollments, setEnrollments] = useState<Student[]>([]);
  const [showRecentEnrollments, setShowRecentEnrollments] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Tab configuration
  const tabs = [
    { 
      id: 'PENDING_REVIEW' as EnrollmentStatus, 
      label: 'Applicants', 
      icon: <UserPlus className="w-4 h-4" />,
      color: 'blue'
    },
    { 
      id: 'PAYMENT_PENDING' as EnrollmentStatus, 
      label: 'Waiting', 
      icon: <Clock className="w-4 h-4" />,
      color: 'yellow'
    },
    { 
      id: 'APPROVED' as EnrollmentStatus, 
      label: 'Admitted', 
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green'
    },
    { 
      id: 'REJECTED' as EnrollmentStatus, 
      label: 'Rejected', 
      icon: <Ban className="w-4 h-4" />,
      color: 'red'
    }
  ];

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all categories
      const categoriesResponse = await fetch('/api/admin/categories');
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success) {
        setAllCategories(categoriesData.data || []);
      }
      
      // Fetch current category data
      const response = await fetch(`/api/admin/categories/${categoryId}/admissions`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.category);
        setStudents(data.students);
        setStats(data.stats);
        setEnrollments(data.students || []);
      } else {
        // If API fails, set default category data
        const defaultCategory = {
          id: categoryId,
          name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
          slug: categoryId,
          description: `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} training programs`,
          color: categoryId === 'government' ? 'green' : categoryId === 'online' ? 'blue' : categoryId === 'offline' ? 'purple' : 'orange',
          icon: categoryId === 'government' ? '🏛️' : categoryId === 'online' ? '💻' : categoryId === 'offline' ? '📚' : '🎥'
        };
        setCategory(defaultCategory);
        setStudents([]);
        setEnrollments([]);
        setStats({
          applied: 0,
          waiting: 0,
          admitted: 0,
          nextBatch: 0,
          rejected: 0,
          totalRevenue: 0,
          activeMentors: 0,
          completionRate: 0,
          monthlyGrowth: 0,
          totalCourses: 0,
          activeStudents: 0,
          averageRating: 0
        });
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      // Set default category data even on network error
      const defaultCategory = {
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        slug: categoryId,
        description: `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} training programs`,
        color: categoryId === 'government' ? 'green' : categoryId === 'online' ? 'blue' : categoryId === 'offline' ? 'purple' : 'orange',
        icon: categoryId === 'government' ? '🏛️' : categoryId === 'online' ? '💻' : categoryId === 'offline' ? '📚' : '🎥'
      };
      setCategory(defaultCategory);
      setStudents([]);
      setEnrollments([]);
      setStats({
        applied: 0,
        waiting: 0,
        admitted: 0,
        nextBatch: 0,
        rejected: 0,
        totalRevenue: 0,
        activeMentors: 0,
        completionRate: 0,
        monthlyGrowth: 0,
        totalCourses: 0,
        activeStudents: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: EnrollmentStatus) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setStudents(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, status: newStatus }
            : student
        ));
        
        // Refresh stats
        fetchCategoryData();
      }
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

  const filteredStudents = students.filter(student => 
    student.status === activeTab &&
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.phone.includes(searchTerm))
  );

  const getStatusColor = (status: EnrollmentStatus) => {
    const colors: Record<EnrollmentStatus, string> = {
      'PENDING_REVIEW': 'bg-blue-100 text-blue-800',
      'PAYMENT_PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'ADMITTED': 'bg-green-100 text-green-800',
      'WAITING': 'bg-yellow-100 text-yellow-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryAccentColor = () => {
    const colorMap: { [key: string]: string } = {
      'green': 'border-green-500 text-green-400 bg-green-900/50',
      'blue': 'border-blue-500 text-blue-400 bg-blue-900/50',
      'purple': 'border-purple-500 text-purple-400 bg-purple-900/50',
      'orange': 'border-orange-500 text-orange-400 bg-orange-900/50'
    };
    return colorMap[category?.color || 'green'] || colorMap['green'];
  };

  const getCategoryIcon = () => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'government': <Building className="w-6 h-6" />,
      'online': <Globe className="w-6 h-6" />,
      'offline': <Monitor className="w-6 h-6" />,
      'recorded': <Video className="w-6 h-6" />
    };
    return iconMap[categoryId] || <BookOpen className="w-6 h-6" />;
  };

  const getCategoryGradient = () => {
    const gradientMap: { [key: string]: string } = {
      'government': 'from-green-500 to-emerald-600',
      'online': 'from-blue-500 to-cyan-600',
      'offline': 'from-purple-500 to-pink-600',
      'recorded': 'from-orange-500 to-red-600'
    };
    return gradientMap[categoryId] || 'from-gray-500 to-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const recentEnrollments = enrollments.slice(0, 5);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <SkeletonLoader type="card" count={1} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonLoader type="stats" count={4} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonLoader type="list" count={5} />
            </div>
            <SkeletonLoader type="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900">
      {/* Beautiful Header */}
      <div className={`bg-gradient-to-r ${getCategoryGradient()} text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-32 translate-y-32"></div>
        
        <div className="relative px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl border border-white border-opacity-30">
                {getCategoryIcon()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold">{category?.name || 'Category'} Overview</h1>
                  <div className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-lg rounded-full text-sm font-medium">
                    {categoryId}
                  </div>
                </div>
                <p className="text-white text-opacity-90 text-lg max-w-2xl">
                  {category?.description || 'Manage and track category performance metrics'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/admin/category/${categoryId}/enrollment`)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 font-medium shadow-lg"
              >
                <Users className="w-5 h-5" />
                View All Enrollments
              </button>
              <ThemeToggle />
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchCategoryData();
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                className="p-3 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl hover:bg-opacity-30 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Category Overview</h2>
          </div>
          <p className="text-gray-400 ml-15">Key metrics and performance indicators for this category</p>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students Card */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-900/50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {stats.monthlyGrowth || 0}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-white">{stats.applied + stats.admitted || 0}</p>
                  <p className="text-gray-500 text-xs">Active enrollments</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </div>

            {/* Revenue Card */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-900/50 rounded-xl">
                    <span className="text-2xl text-green-400">৳</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue || 0)}</p>
                  <p className="text-gray-500 text-xs">This month</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            </div>

            {/* Pending Applications */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-900/50 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {stats.waiting || 0}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">Pending Review</p>
                  <p className="text-3xl font-bold text-white">{stats.waiting || 0}</p>
                  <p className="text-gray-500 text-xs">Need approval</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-900/50 rounded-xl">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    {stats.completionRate || 0}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.completionRate || 0}%</p>
                  <p className="text-gray-500 text-xs">Average completion</p>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-px bg-gray-700 flex-1"></div>
          <div className="text-gray-400 text-sm font-medium">Analytics</div>
          <div className="h-px bg-gray-700 flex-1"></div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <StatsChart
            data={[
              { label: 'Applied', value: stats?.applied || 0, color: '#3B82F6' },
              { label: 'Waiting', value: stats?.waiting || 0, color: '#F59E0B' },
              { label: 'Admitted', value: stats?.admitted || 0, color: '#10B981' },
              { label: 'Rejected', value: stats?.rejected || 0, color: '#EF4444' }
            ]}
            title="Enrollment Status Distribution"
            type="bar"
            height={200}
          />
          <StatsChart
            data={[
              { label: 'Jan', value: Math.floor((stats?.monthlyGrowth || 0) * 0.8) },
              { label: 'Feb', value: Math.floor((stats?.monthlyGrowth || 0) * 0.9) },
              { label: 'Mar', value: stats?.monthlyGrowth || 0 },
              { label: 'Apr', value: Math.floor((stats?.monthlyGrowth || 0) * 1.1) },
              { label: 'May', value: Math.floor((stats?.monthlyGrowth || 0) * 1.2) }
            ]}
            title="Monthly Enrollment Trend"
            type="line"
            height={200}
          />
        </div>

        {/* Section Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-px bg-gray-700 flex-1"></div>
          <div className="text-gray-400 text-sm font-medium">Recent Activity</div>
          <div className="h-px bg-gray-700 flex-1"></div>
        </div>

        {/* Recent Enrollments & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Enrollments */}
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Enrollments</h3>
                  <p className="text-sm text-gray-400">Latest student applications</p>
                </div>
                <button
                  onClick={() => setShowRecentEnrollments(!showRecentEnrollments)}
                  className="text-gray-400 hover:text-white"
                >
                  {showRecentEnrollments ? <Eye className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {enrollment.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{enrollment.name}</p>
                          <p className="text-sm text-gray-400">{enrollment.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                          {getStatusColor(enrollment.status)}
                          {enrollment.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(enrollment.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="enrollments"
                  title="No Enrollments Yet"
                  description={`No enrollments found for ${category?.name || 'this category'}. Start by adding new enrollments to track student applications.`}
                  actionLabel="Add First Enrollment"
                  onAction={() => router.push(`/admin/category/${categoryId}/enrollment`)}
                />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <p className="text-sm text-gray-400">Common tasks</p>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => router.push(`/admin/category/${categoryId}/enrollment`)}
                className="w-full flex items-center gap-3 p-4 bg-blue-900/50 text-blue-400 rounded-xl hover:bg-blue-900/70 transition-colors group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add New Enrollment</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-green-900/50 text-green-400 rounded-xl hover:bg-green-900/70 transition-colors group">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Export Data</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-purple-900/50 text-purple-400 rounded-xl hover:bg-purple-900/70 transition-colors group">
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">View Analytics</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-yellow-900/50 text-yellow-400 rounded-xl hover:bg-yellow-900/70 transition-colors group">
                <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Category Settings</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-px bg-gray-200 flex-1"></div>
          <div className="text-gray-400 text-sm font-medium">Category Navigation</div>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Category Navigation */}
        <CategorySwitcher
          categories={allCategories}
          currentSlug={categoryId}
          basePath="/admin/category"
          title="All Categories"
          description="Navigate between different course categories"
        />
      </div>
    </div>
  );
};

export default CategoryAdmissionControl;
