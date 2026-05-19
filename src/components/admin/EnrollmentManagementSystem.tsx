"use client";

import React, { useState, useEffect } from 'react';
import { formatBDT } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  CreditCard,
  Mail,
  MapPin,
  GraduationCap,
  Monitor,
  Smartphone,
  Filter,
  X as CloseIcon,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  MessageSquare,
  Video,
  History,
  Activity,
  Bell,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Archive,
  Send,
  Save,
  PhoneCall,
  MessageCircle,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Users,
  FileSpreadsheet,
  FileDown,
  Settings,
  Zap,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  FilterX,
  SearchX,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Copy,
  Share2,
  Printer,
  Mailbox,
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Enrollment {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  courseName: string;
  category: string;
  enrollmentStatus: string;
  paymentStatus?: string;
  educationLevel?: string;
  whyJoin?: string;
  preferredBatchTime?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  notes?: string;
  callHistory?: Array<{
    id: string;
    date: string;
    duration: number;
    notes: string;
    outcome: string;
  }>;
  communicationLogs?: Array<{
    id: string;
    type: 'call' | 'email' | 'sms';
    date: string;
    subject: string;
    content: string;
    status: string;
  }>;
}

interface StudentProfile {
  enrollment: Enrollment;
  paymentHistory?: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

interface Stats {
  total: number;
  applied: number;
  admitted: number;
  rejected: number;
  waiting: number;
  nextBatch: number;
  paymentPending: number;
}

const statusConfig = {
  APPLIED: { label: 'Applied', color: 'badge-secondary', icon: Clock },
  WAITING: { label: 'Waiting', color: 'badge-secondary', icon: Clock },
  ADMITTED: { label: 'Admitted', color: 'badge-primary', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'badge-danger', icon: X },
  NEXT_BATCH: { label: 'Next Batch', color: 'badge-primary', icon: CheckCircle }
};

const paymentConfig = {
  PENDING: { label: 'Pending', color: 'badge-secondary' },
  COMPLETED: { label: 'Completed', color: 'badge-primary' },
  FAILED: { label: 'Failed', color: 'badge-danger' },
  REFUNDED: { label: 'Refunded', color: 'badge-danger' }
};

const categoryConfig = {
  GOVERNMENT: { label: 'Government', color: 'badge-primary' },
  RECORDED: { label: 'Recorded', color: 'badge-secondary' },
  ONLINE: { label: 'Online', color: 'badge-primary' },
  OFFLINE: { label: 'Offline', color: 'badge-secondary' }
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
  { value: 'APPLIED', label: 'Applied' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'ADMITTED', label: 'Admitted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'NEXT_BATCH', label: 'Next Batch' }
];

export default function EnrollmentManagementSystem() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    applied: 0,
    admitted: 0,
    rejected: 0,
    waiting: 0,
    nextBatch: 0,
    paymentPending: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [enrollmentNotes, setEnrollmentNotes] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
    educationLevel: 'all',
    hasNotes: false,
    hasCallHistory: false
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, filters]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/enrollments', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform API response to match frontend interface
        const transformedEnrollments = data.enrollments.map((e: any) => ({
          id: e.id,
          fullName: e.fullName || e.user?.name || '',
          email: e.email || e.user?.email || '',
          phoneNumber: e.phoneNumber || '',
          address: e.address || '',
          courseName: e.courseName || e.course?.title || '',
          category: e.category || e.course?.category || '',
          enrollmentStatus: e.enrollmentStatus,
          paymentStatus: e.paymentStatus || (e.payments?.[0]?.paymentStatus) || '',
          educationLevel: e.educationLevel,
          whyJoin: e.whyJoin,
          preferredBatchTime: e.preferredBatchTime,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          lastActivity: e.lastActivity,
          notes: e.notes,
          callHistory: e.callHistory,
          communicationLogs: e.communicationLogs
        }));

        console.log('Transformed enrollments:', transformedEnrollments);
        setEnrollments(transformedEnrollments);

        // Map API stats to our Stats interface
        const mappedStats: Stats = {
          total: data.stats?.totalEnrollments || transformedEnrollments.length || 0,
          applied: data.stats?.pendingEnrollments || 0,
          admitted: data.stats?.approvedEnrollments || 0,
          rejected: data.stats?.rejectedEnrollments || 0,
          waiting: data.stats?.paymentPendingEnrollments || 0,
          nextBatch: 0, // API doesn't provide this, calculate from enrollments
          paymentPending: data.stats?.paymentPendingEnrollments || 0
        };

        // Calculate nextBatch from enrollments if not provided
        if (transformedEnrollments) {
          mappedStats.nextBatch = transformedEnrollments.filter((e: any) => e.enrollmentStatus === 'NEXT_BATCH').length;
          // Also calculate other stats from enrollments for accuracy
          mappedStats.applied = transformedEnrollments.filter((e: any) => e.enrollmentStatus === 'APPLIED').length;
          mappedStats.admitted = transformedEnrollments.filter((e: any) => e.enrollmentStatus === 'ADMITTED').length;
          mappedStats.rejected = transformedEnrollments.filter((e: any) => e.enrollmentStatus === 'REJECTED').length;
          mappedStats.waiting = transformedEnrollments.filter((e: any) => e.enrollmentStatus === 'WAITING').length;
        }

        setStats(mappedStats);
      } else {
        toast.error(data.error || 'Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = () => {
    console.log('filterEnrollments called with filters:', filters);
    console.log('Total enrollments:', enrollments.length);

    let filtered = [...enrollments];

    // Filter by search
    if (filters.search) {
      console.log('Filtering by search:', filters.search);
      filtered = filtered.filter(enrollment =>
        enrollment.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        enrollment.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        enrollment.phoneNumber.includes(filters.search) ||
        enrollment.courseName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category !== 'all') {
      console.log('Filtering by category:', filters.category);
      filtered = filtered.filter(enrollment => enrollment.category === filters.category);
    }

    // Filter by status
    if (filters.status !== 'all') {
      console.log('Filtering by status:', filters.status);
      filtered = filtered.filter(enrollment => enrollment.enrollmentStatus === filters.status);
    }

    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      console.log('Filtering by payment status:', filters.paymentStatus);
      filtered = filtered.filter(enrollment => enrollment.paymentStatus === filters.paymentStatus);
    }

    // Filter by education level
    if (filters.educationLevel !== 'all') {
      console.log('Filtering by education level:', filters.educationLevel);
      filtered = filtered.filter(enrollment => enrollment.educationLevel === filters.educationLevel);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      console.log('Filtering by date range:', filters.dateRange);
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(enrollment =>
        new Date(enrollment.createdAt) >= filterDate
      );
    }

    // Filter by notes
    if (filters.hasNotes) {
      console.log('Filtering by has notes');
      filtered = filtered.filter(enrollment => enrollment.notes && enrollment.notes.trim() !== '');
    }

    // Filter by call history
    if (filters.hasCallHistory) {
      console.log('Filtering by has call history');
      filtered = filtered.filter(enrollment =>
        enrollment.callHistory && enrollment.callHistory.length > 0
      );
    }

    // Sort enrollments
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Enrollment];
      const bValue = b[sortBy as keyof Enrollment];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log('Filtered enrollments count:', filtered.length);
    setFilteredEnrollments(filtered);
  };

  const updateEnrollmentStatus = async (enrollmentId: string, newStatus: string) => {
    console.log('updateEnrollmentStatus called with:', { enrollmentId, newStatus });

    if (!newStatus) {
      console.log('No new status provided, returning');
      return;
    }
    if (!enrollmentId) {
      console.log('No enrollmentId provided, returning');
      return;
    }

    console.log('Updating enrollment status:', { enrollmentId, newStatus });

    // Store old enrollments for revert on error
    const oldEnrollments = [...enrollments];

    try {
      // Optimistic update - update UI immediately
      console.log('Doing optimistic update...');
      setEnrollments(prev =>
        prev.map(enrollment =>
          enrollment.id === enrollmentId
            ? { ...enrollment, enrollmentStatus: newStatus }
            : enrollment
        )
      );

      setActionLoading(prev => ({ ...prev, [enrollmentId]: true }));

      const requestBody = {
        id: enrollmentId,
        enrollmentStatus: newStatus
      };
      console.log('Sending request to /api/admin/enrollments with body:', requestBody);

      const response = await fetch('/api/admin/enrollments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Revert optimistic update on error
        console.log('Response not ok, reverting...');
        setEnrollments(oldEnrollments);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Update successful, refreshing enrollments...');
        // Refresh from server to ensure state is consistent
        await fetchEnrollments();

        const action = newStatus === 'ADMITTED' ? 'admitted' : newStatus === 'REJECTED' ? 'rejected' : 'updated';
        toast.success(`Enrollment ${action} successfully!`);

        // Dispatch event to update sidebar counts
        window.dispatchEvent(new CustomEvent('updateSidebarCounts', {
          detail: {
            pendingApprovals: data.counts?.pendingApprovals || 0,
            pendingPayments: data.counts?.pendingPayments || 0
          }
        }));
      } else {
        console.log('Update failed, reverting...');
        setEnrollments(oldEnrollments);
        toast.error(data.error || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
      setEnrollments(oldEnrollments);
      toast.error('Failed to update enrollment. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const handleApprove = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'ADMITTED');
  };

  const handleReject = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'REJECTED');
  };

  const handleVerifyPayment = (enrollmentId: string) => {
    updateEnrollmentStatus(enrollmentId, 'ADMITTED');
  };

  const handleStartCall = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowCallModal(true);
    setIsCallActive(true);
    setCallDuration(0);
    setCallNotes('');
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    toast.success('Call ended successfully');
  };

  const handleSaveCallNotes = async () => {
    if (!selectedEnrollment) return;
    
    try {
      // Mock API call to save call notes
      const newCallRecord = {
        id: `call-${Date.now()}`,
        date: new Date().toISOString(),
        duration: callDuration,
        notes: callNotes,
        outcome: 'completed'
      };
      
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === selectedEnrollment.id 
            ? {
                ...enrollment,
                callHistory: [...(enrollment.callHistory || []), newCallRecord],
                lastActivity: new Date().toISOString()
              }
            : enrollment
        )
      );
      
      toast.success('Call notes saved successfully');
      setShowCallModal(false);
      setCallNotes('');
      setCallDuration(0);
    } catch (error) {
      toast.error('Failed to save call notes');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnrollment) return;
    
    try {
      // Mock API call to save notes
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === selectedEnrollment.id 
            ? {
                ...enrollment,
                notes: enrollmentNotes,
                lastActivity: new Date().toISOString()
              }
            : enrollment
        )
      );
      
      toast.success('Notes saved successfully');
      setShowNotesModal(false);
      setEnrollmentNotes('');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowEditModal(true);
  };

  const handleUpdateEnrollment = async (updatedData: Partial<Enrollment>) => {
    if (!selectedEnrollment) return;
    
    try {
      // Mock API call to update enrollment
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === selectedEnrollment.id 
            ? { ...enrollment, ...updatedData, updatedAt: new Date().toISOString() }
            : enrollment
        )
      );
      
      toast.success('Enrollment updated successfully');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update enrollment');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEnrollments.length === 0) {
      toast.error('Please select enrollments first');
      return;
    }
    
    try {
      // Mock API call for bulk actions
      setActionLoading(prev => ({ ...prev, bulk: true }));
      
      switch (action) {
        case 'approve':
          setEnrollments(prev => 
            prev.map(enrollment => 
              selectedEnrollments.includes(enrollment.id)
                ? { ...enrollment, enrollmentStatus: 'ADMITTED' }
                : enrollment
            )
          );
          toast.success(`${selectedEnrollments.length} enrollments admitted`);
          break;
        case 'reject':
          setEnrollments(prev => 
            prev.map(enrollment => 
              selectedEnrollments.includes(enrollment.id)
                ? { ...enrollment, enrollmentStatus: 'REJECTED' }
                : enrollment
            )
          );
          toast.success(`${selectedEnrollments.length} enrollments rejected`);
          break;
        case 'delete':
          setEnrollments(prev => prev.filter(enrollment => !selectedEnrollments.includes(enrollment.id)));
          toast.success(`${selectedEnrollments.length} enrollments deleted`);
          break;
        case 'export':
          // Export functionality will be implemented separately
          toast.success('Export started');
          break;
      }
      
      setSelectedEnrollments([]);
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // Mock export functionality
    toast.success(`Exporting ${filteredEnrollments.length} enrollments as ${format.toUpperCase()}`);
  };

  const handleSelectAll = () => {
    if (selectedEnrollments.length === filteredEnrollments.length) {
      setSelectedEnrollments([]);
    } else {
      setSelectedEnrollments(filteredEnrollments.map(e => e.id));
    }
  };

  const handleSelectEnrollment = (enrollmentId: string) => {
    setSelectedEnrollments(prev => 
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const viewStudentProfile = async (enrollment: Enrollment) => {
    try {
      const response = await fetch(`/api/admin/enrollment/${enrollment.id}/profile`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStudentProfile(data.profile);
        setShowProfileDrawer(true);
      } else {
        toast.error(data.error || 'Failed to fetch student profile');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast.error('Failed to fetch student profile. Please try again.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'GOVERNMENT': return <GraduationCap className="w-4 h-4" />;
      case 'RECORDED': return <Monitor className="w-4 h-4" />;
      case 'ONLINE': return <Smartphone className="w-4 h-4" />;
      case 'OFFLINE': return <MapPin className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admissions • Applicants</h1>
          <p className="text-gray-300 text-lg">
            Manage applications with high contrast, clear actions and quick stats. Use
            filters to drill down or export lists for reporting.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            New Applicant
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-100 hover:bg-gray-800 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200">
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-700 to-purple-800 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-blue-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.total}</h2>
          <p className="text-gray-200 text-sm">Total</p>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-cyan-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.applied}</h2>
          <p className="text-gray-200 text-sm">Applied</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-green-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.admitted}</h2>
          <p className="text-gray-200 text-sm">Admitted</p>
        </Card>
        <Card className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-orange-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.waiting}</h2>
          <p className="text-gray-200 text-sm">Waiting</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-600 to-pink-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-red-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.rejected}</h2>
          <p className="text-gray-200 text-sm">Rejected</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-purple-600/30">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{stats.nextBatch}</h2>
          <p className="text-gray-200 text-sm">Next Batch</p>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                category: 'all',
                status: 'all',
                paymentStatus: 'all',
                dateRange: 'all',
                educationLevel: 'all',
                hasNotes: false,
                hasCallHistory: false
              })}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
            
            <div className="relative">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-100 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
                onMouseEnter={() => setShowBulkActions(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport('csv')}
                      className="w-full justify-start text-left hover:bg-gray-700 text-gray-100"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport('excel')}
                      className="w-full justify-start text-left hover:bg-gray-700 text-gray-100"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export as Excel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport('pdf')}
                      className="w-full justify-start text-left hover:bg-gray-700 text-gray-100"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Export as PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            className="border-gray-600 text-gray-100 hover:bg-gray-700 p-3 rounded-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-gray-100">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="text-gray-100">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-100">All Payment Status</SelectItem>
                  <SelectItem value="PAID" className="text-gray-100">Paid</SelectItem>
                  <SelectItem value="PENDING" className="text-gray-100">Pending</SelectItem>
                  <SelectItem value="FAILED" className="text-gray-100">Failed</SelectItem>
                  <SelectItem value="REFUNDED" className="text-gray-100">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-100">All Time</SelectItem>
                  <SelectItem value="today" className="text-gray-100">Today</SelectItem>
                  <SelectItem value="week" className="text-gray-100">This Week</SelectItem>
                  <SelectItem value="month" className="text-gray-100">This Month</SelectItem>
                  <SelectItem value="quarter" className="text-gray-100">This Quarter</SelectItem>
                  <SelectItem value="year" className="text-gray-100">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

        {/* Table Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEnrollments.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700"
                />
                {selectedEnrollments.length > 0 && (
                  <span className="text-gray-300 text-sm">
                    {selectedEnrollments.length} Selected
                  </span>
                )}
              </div>
              
              {selectedEnrollments.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                  className="border-red-600 text-red-400 hover:bg-red-900/20 px-3 py-2 rounded-lg text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>12 / page</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm"
                >
                  PREV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-700 px-3 py-1 rounded-lg text-sm"
                >
                  NEXT
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 p-2 rounded-lg"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">APPLICANT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">COURSE & DATE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">BATCH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">NOTE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SCORE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SMS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEnrollments.map((enrollment, index) => (
                <tr key={enrollment.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedEnrollments.includes(enrollment.id)}
                        onChange={() => handleSelectEnrollment(enrollment.id)}
                        className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700"
                      />
                      <span>{index + 1}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{enrollment.fullName}</div>
                        <div className="text-xs text-gray-400">{enrollment.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm text-white">{enrollment.courseName}</div>
                      <div className="text-xs text-gray-400">{new Date(enrollment.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-300">{enrollment.preferredBatchTime || 'N/A'}</span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setEnrollmentNotes(enrollment.notes || '');
                        setShowNotesModal(true);
                      }}
                      className="text-gray-400 hover:text-white hover:bg-gray-700 p-1"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-sm text-gray-300">75%</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Sent</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={statusConfig[enrollment.enrollmentStatus as keyof typeof statusConfig]?.color || 'badge-secondary'}>
                        {statusConfig[enrollment.enrollmentStatus as keyof typeof statusConfig]?.label || enrollment.enrollmentStatus}
                      </Badge>
                      <select
                        value={enrollment.enrollmentStatus}
                        onChange={(e) => updateEnrollmentStatus(enrollment.id, e.target.value)}
                        disabled={actionLoading[enrollment.id]}
                        className="w-32 rounded-md border border-gray-600 bg-gray-700/50 px-2 py-1 text-sm text-white focus:border-blue-400 focus:outline-none"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="ADMITTED">Admitted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WAITING">Waiting</option>
                        <option value="NEXT_BATCH">Next Batch</option>
                      </select>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartCall(enrollment)}
                        className="text-gray-400 hover:text-green-400 hover:bg-gray-700 p-1"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewStudentProfile(enrollment)}
                        className="text-gray-400 hover:text-blue-400 hover:bg-gray-700 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEnrollment(enrollment)}
                        className="text-gray-400 hover:text-purple-400 hover:bg-gray-700 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBulkAction('delete')}
                        className="text-gray-400 hover:text-red-400 hover:bg-gray-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEnrollments.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No applicants found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or check back later for new applicants.
            </p>
            <Button
              onClick={() => setFilters({
                search: '',
                category: 'all',
                status: 'all',
                paymentStatus: 'all',
                dateRange: 'all',
                educationLevel: 'all',
                hasNotes: false,
                hasCallHistory: false
              })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <SearchX className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-400">Loading applicants...</p>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCallModal(false)} />
          <div className="absolute inset-4 md:inset-8 bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <PhoneCall className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Call Student</h2>
                  <p className="text-sm text-gray-300">{selectedEnrollment.fullName} - {selectedEnrollment.phoneNumber}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCallModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Call Status */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                    {isCallActive ? (
                      <PhoneCall className="w-16 h-16 text-green-600 animate-pulse" />
                    ) : (
                      <Phone className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-2">
                    {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <p className="text-lg text-gray-300 mb-6">
                    {isCallActive ? 'Call in progress...' : 'Ready to call'}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-4">
                    {!isCallActive ? (
                      <Button
                        onClick={() => {
                          setIsCallActive(true);
                          // Start timer
                          const interval = setInterval(() => {
                            setCallDuration(prev => {
                              if (prev >= 300) { // 5 minutes max
                                clearInterval(interval);
                                setIsCallActive(false);
                                return prev;
                              }
                              return prev + 1;
                            });
                          }, 1000);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                      >
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Start Call
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEndCall}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        End Call
                      </Button>
                    )}
                  </div>
                </div>

                {/* Call Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Call Notes</label>
                  <textarea
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Enter notes about this call..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Student Info */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedEnrollment.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{selectedEnrollment.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedEnrollment.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Course:</span>
                      <span className="text-white">{selectedEnrollment.courseName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowCallModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCallNotes}
                disabled={!callNotes.trim() || isCallActive}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Call Notes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotesModal(false)} />
          <div className="absolute inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Student Notes</h2>
                  <p className="text-sm text-gray-300">{selectedEnrollment.fullName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotesModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Notes Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={enrollmentNotes}
                    onChange={(e) => setEnrollmentNotes(e.target.value)}
                    placeholder="Enter notes about this student..."
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Previous Notes History */}
                {selectedEnrollment.notes && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Previous Notes</h4>
                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedEnrollment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Call History */}
                {selectedEnrollment.callHistory && selectedEnrollment.callHistory.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-3">Call History</h4>
                    <div className="space-y-3">
                      {selectedEnrollment.callHistory.map((call) => (
                        <div key={call.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <PhoneCall className="w-4 h-4 text-green-400" />
                              <span className="font-medium text-white">
                                {new Date(call.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              Duration: {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{call.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowNotesModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotes}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
