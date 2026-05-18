"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  User,
  MapPin,
  BookOpen,
  TrendingUp,
  Award,
  GraduationCap
} from 'lucide-react';

interface Student {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  enrollmentStatus: 'PENDING_REVIEW' | 'PAYMENT_PENDING' | 'APPROVED' | 'REJECTED';
  educationLevel?: string;
  whyJoin?: string;
  preferredBatchTime?: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    category: string;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  duration?: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

const StudentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchStudents();
    fetchCourse();
  }, [courseId, statusFilter, sortBy]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/courses/${courseId}/students?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const handleStatusUpdate = async (studentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ enrollmentStatus: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Student status updated successfully');
        fetchStudents();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExportStudents = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Address', 'Status', 'Enrollment Date'],
      ...students.map(student => [
        student.fullName,
        student.email,
        student.phoneNumber,
        student.address,
        student.enrollmentStatus,
        new Date(student.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.title || 'students'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Student list exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-400/30';
      case 'PENDING_REVIEW':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-400/30';
      case 'PAYMENT_PENDING':
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-400/30';
      case 'REJECTED':
        return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING_REVIEW':
        return <Clock className="w-4 h-4" />;
      case 'PAYMENT_PENDING':
        return <Clock className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber.includes(searchTerm)
  );

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
  };

  const getStatusStats = () => {
    const stats = students.reduce((acc, student) => {
      acc[student.enrollmentStatus] = (acc[student.enrollmentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: students.length,
      approved: stats.APPROVED || 0,
      pending: stats.PENDING_REVIEW || 0,
      paymentPending: stats.PAYMENT_PENDING || 0,
      rejected: stats.REJECTED || 0
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      </div>
      
      {/* Header */}
      <div className="relative border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
                className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ArrowLeft className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Back</span>
              </Button>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <h1 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-white">
                    Students <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Preview</span>
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {course && (
                    <>
                      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-xs text-gray-300 uppercase tracking-wide">Course</span>
                        <span className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px]" title={course.title}>
                          {course.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <span className="text-xs text-gray-300 uppercase tracking-wide">Category</span>
                        <span className="text-sm font-medium text-white">
                          {getCategoryName(course.category)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-blue-400/30">
                    <Users className="w-3 h-3 text-blue-300" />
                    <span className="text-sm font-bold text-blue-300">
                      {stats.total} {stats.total === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleExportStudents}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Download className="w-4 h-4 relative z-10" />
              <span className="hidden sm:inline ml-2 relative z-10">Export CSV</span>
              <span className="sm:hidden relative z-10">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-300 uppercase tracking-wider mb-1">Approved</p>
                  <p className="text-3xl font-bold text-white">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-yellow-300 uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-300 uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-3xl font-bold text-white">{stats.paymentPending}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-300 uppercase tracking-wider mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Search students by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-400 focus:ring-blue-400/20 h-12 text-white placeholder-gray-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-40 xl:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 text-white transition-all duration-300"
                >
                  <option value="all" className="bg-gray-900">All Status</option>
                  <option value="APPROVED" className="bg-gray-900">Approved</option>
                  <option value="PENDING_REVIEW" className="bg-gray-900">Pending Review</option>
                  <option value="PAYMENT_PENDING" className="bg-gray-900">Payment Pending</option>
                  <option value="REJECTED" className="bg-gray-900">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div className="w-full sm:w-40 xl:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg focus:border-blue-400 focus:ring-blue-400/20 text-white transition-all duration-300"
                >
                  <option value="newest" className="bg-gray-900">Newest First</option>
                  <option value="oldest" className="bg-gray-900">Oldest First</option>
                  <option value="name" className="bg-gray-900">Name (A-Z)</option>
                </select>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStudents}
                disabled={loading}
                className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 border-white/10 hover:border-white/20 text-white transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-12 shadow-2xl border border-white/10">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {searchTerm ? 'No Students Found' : 'No Students Yet'}
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'No students have enrolled in this course yet.'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className={`group relative overflow-hidden bg-white/5 backdrop-blur-xl border transition-all duration-300 ${
                student.enrollmentStatus === 'APPROVED' 
                  ? 'border-white/10 hover:border-blue-400/50 hover:transform hover:scale-[1.02] cursor-pointer' 
                  : 'border-white/10 hover:border-white/20 hover:transform hover:scale-[1.02]'
              }`}
              onClick={() => student.enrollmentStatus === 'APPROVED' && router.push(`/admin/category/${slug}/enrollments`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 ${
                  student.enrollmentStatus === 'APPROVED' 
                    ? 'from-blue-500/10 to-purple-500/10 group-hover:opacity-100' 
                    : 'from-blue-500/5 to-purple-500/5 group-hover:opacity-100'
                }`}></div>
                <CardContent className="relative p-6">
                  <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => student.enrollmentStatus === 'APPROVED' && router.push(`/admin/category/${slug}/enrollments`)}
                        >
                          <div className="relative">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                              student.enrollmentStatus === 'APPROVED' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110 cursor-pointer' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>
                              <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white/10 transition-all duration-300 ${
                              student.enrollmentStatus === 'APPROVED' 
                                ? 'bg-green-400 animate-pulse' 
                                : 'bg-gray-400'
                            }`}></div>
                            {student.enrollmentStatus === 'APPROVED' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className={`text-lg sm:text-xl font-bold truncate mb-1 transition-colors duration-300 ${
                              student.enrollmentStatus === 'APPROVED' 
                                ? 'text-white group-hover:text-blue-300 cursor-pointer' 
                                : 'text-white'
                            }`}>{student.fullName}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300">
                              <span className="flex items-center gap-1.5 truncate">
                                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="truncate">{student.email}</span>
                              </span>
                              <span className="flex items-center gap-1.5 truncate">
                                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="truncate">{student.phoneNumber}</span>
                              </span>
                            </div>
                            {student.enrollmentStatus === 'APPROVED' && (
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span>Click to view enrollments</span>
                                <span className="text-blue-400">→</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
                          student.enrollmentStatus === 'APPROVED' 
                            ? 'bg-white/5 border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-400/30 cursor-pointer' 
                            : 'bg-white/5 border-white/5'
                        }`}>
                          <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="truncate text-gray-300">{student.address}</span>
                        </div>
                        <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
                          student.enrollmentStatus === 'APPROVED' 
                            ? 'bg-white/5 border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-400/30 cursor-pointer' 
                            : 'bg-white/5 border-white/5'
                        }`}>
                          <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate text-gray-300">{new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                        {student.educationLevel && (
                          <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
                            student.enrollmentStatus === 'APPROVED' 
                              ? 'bg-white/5 border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-400/30 cursor-pointer' 
                              : 'bg-white/5 border-white/5'
                          }`}>
                            <BookOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className="truncate text-gray-300">{student.educationLevel}</span>
                          </div>
                        )}
                        {student.preferredBatchTime && (
                          <div className={`flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg border transition-all duration-300 ${
                            student.enrollmentStatus === 'APPROVED' 
                              ? 'bg-white/5 border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-400/30 cursor-pointer' 
                              : 'bg-white/5 border-white/5'
                          }`}>
                            <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <span className="truncate text-gray-300">{student.preferredBatchTime}</span>
                          </div>
                        )}
                      </div>

                      {student.whyJoin && (
                        <div className={`mt-4 p-4 backdrop-blur-sm rounded-lg border transition-all duration-300 ${
                          student.enrollmentStatus === 'APPROVED' 
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-400/30 cursor-pointer' 
                            : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-white/10'
                        }`}>
                          <p className="text-sm text-blue-300">
                            <span className="font-medium text-white">Why joined:</span> {student.whyJoin}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="w-full sm:w-auto">
                        <Badge className={`${getStatusColor(student.enrollmentStatus)} justify-center whitespace-nowrap shadow-lg backdrop-blur-sm border-0`}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(student.enrollmentStatus)}
                            <span className="text-sm font-medium">{student.enrollmentStatus.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </div>

                      {student.enrollmentStatus === 'PENDING_REVIEW' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(student.id, 'APPROVED')}
                            className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="ml-2">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(student.id, 'REJECTED')}
                            className="group bg-white/5 backdrop-blur-sm hover:bg-white/10 border-red-400/30 hover:border-red-400/50 text-red-400 hover:text-red-300 transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="ml-2">Reject</span>
                          </Button>
                        </div>
                      )}

                      {student.enrollmentStatus === 'PAYMENT_PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(student.id, 'APPROVED')}
                          className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                        >
                          <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="ml-2">Confirm Payment</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
