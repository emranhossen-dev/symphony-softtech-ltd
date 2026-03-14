"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  CheckCircle, 
  X, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  BookOpen,
  Download,
  RefreshCw,
  Eye,
  UserPlus,
  Phone,
  CreditCard
} from 'lucide-react';

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  courseName: string;
  category: string;
  enrollmentStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface Stats {
  total: number;
  pendingReview: number;
  paymentPending: number;
  approved: number;
}

const statusConfig = {
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' }
};

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'RECORDED', label: 'Recorded' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' }
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendingReview: 0,
    paymentPending: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const response = await fetch(`/api/admin/enrollments?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEnrollments(data.enrollments);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string, paymentStatus?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [enrollmentId]: true }));
      
      const response = await fetch('/api/admin/enrollment/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          status,
          paymentStatus
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, enrollmentStatus: status, paymentStatus: paymentStatus || enrollment.paymentStatus }
              : enrollment
          )
        );

        if (data.counts) {
          setStats(prev => ({
            ...prev,
            pendingReview: data.counts.pendingApprovals,
            paymentPending: data.counts.pendingPayments
          }));

          window.dispatchEvent(new CustomEvent('updateSidebarCounts', {
            detail: {
              pendingApprovals: data.counts.pendingApprovals,
              pendingPayments: data.counts.pendingPayments
            }
          }));
        }

        const action = status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'updated';
        toast.success(`Enrollment ${action} successfully!`);
      } else {
        toast.error(data.error || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      toast.error('Failed to update enrollment');
    } finally {
      setActionLoading(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const handleApprove = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'APPROVED');
  };

  const handleReject = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'REJECTED');
  };

  const handleVerifyPayment = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'APPROVED', 'PAID');
  };

  useEffect(() => {
    fetchEnrollments();
  }, [filters.category, filters.status]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Enrollment Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and review all student enrollments</p>
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Enrollment
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pendingReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payment Pending</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.paymentPending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>Select category</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>Select status</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button 
                  variant="outline" 
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={fetchEnrollments}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900">All Enrollments</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                  {enrollments.length} Total
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {enrollments.map((enrollment) => {
                    const statusInfo = statusConfig[enrollment.enrollmentStatus as keyof typeof statusConfig];
                    
                    return (
                      <TableRow key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{enrollment.fullName}</div>
                              <div className="text-sm text-gray-500">{enrollment.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            {enrollment.phoneNumber}
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{enrollment.courseName}</div>
                            <div className="text-gray-500">{enrollment.category}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <Badge 
                            variant="outline" 
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              enrollment.category === 'GOVERNMENT' ? 'bg-green-50 text-green-700 border-green-200' :
                              enrollment.category === 'RECORDED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              enrollment.category === 'ONLINE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              enrollment.category === 'OFFLINE' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {enrollment.category}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <Badge 
                            variant="outline" 
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo?.color}`}
                          >
                            {statusInfo?.label || enrollment.enrollmentStatus}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {enrollment.enrollmentStatus === 'PENDING_REVIEW' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprove(enrollment.id)}
                                  disabled={actionLoading[enrollment.id]}
                                >
                                  {actionLoading[enrollment.id] ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(enrollment.id)}
                                  disabled={actionLoading[enrollment.id]}
                                >
                                  {actionLoading[enrollment.id] ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4 mr-1" />
                                  )}
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {enrollment.enrollmentStatus === 'PAYMENT_PENDING' && (
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                  onClick={() => handleVerifyPayment(enrollment.id)}
                                  disabled={actionLoading[enrollment.id]}
                                >
                                  {actionLoading[enrollment.id] ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <CreditCard className="w-4 h-4 mr-1" />
                                  )}
                                  Verify Payment
                                </Button>
                                <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            )}

                            {enrollment.enrollmentStatus === 'APPROVED' && (
                              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            )}

                            {enrollment.enrollmentStatus === 'REJECTED' && (
                              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {enrollments.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or check back later for new enrollments.
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading enrollments...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
