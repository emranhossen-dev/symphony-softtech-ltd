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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200/60"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Students Preview
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {course && (
                    <>
                      <span className="text-gray-600">
                        Course: <span className="font-medium text-green-600">{course.title}</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        Category: <span className="font-medium text-green-600">{getCategoryName(course.category)}</span>
                      </span>
                    </>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {stats.total} student{stats.total !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleExportStudents}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Payment Pending</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.paymentPending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search students by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-white/70 backdrop-blur-sm border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-lg bg-white/70 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-lg bg-white/70 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500/20 text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStudents}
                disabled={loading}
                className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'No Students Found' : 'No Students Yet'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
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
              <Card key={student.id} className="bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200/60 hover:border-gray-300/80 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{student.fullName}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {student.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {student.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{student.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Enrolled: {new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                        {student.educationLevel && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>Education: {student.educationLevel}</span>
                          </div>
                        )}
                        {student.preferredBatchTime && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Preferred: {student.preferredBatchTime}</span>
                          </div>
                        )}
                      </div>

                      {student.whyJoin && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Why joined:</span> {student.whyJoin}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <Badge className={getStatusColor(student.enrollmentStatus)}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(student.enrollmentStatus)}
                          {student.enrollmentStatus.replace('_', ' ')}
                        </div>
                      </Badge>

                      {student.enrollmentStatus === 'PENDING_REVIEW' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(student.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(student.id, 'REJECTED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {student.enrollmentStatus === 'PAYMENT_PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(student.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Payment
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
