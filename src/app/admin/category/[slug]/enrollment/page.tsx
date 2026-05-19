"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  BookOpen,
  FileText,
  RefreshCw,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Settings,
  Grid,
  List,
  Filter as FilterIcon,
  Edit,
  Trash2,
  X,
  User,
  UserCheck,
  ClockIcon,
  PhoneMissed,
  UserX,
  MessageCircle,
  MessageSquareIcon,
  Headphones
} from 'lucide-react';
import CallManagementPanel from '@/components/admin/CallManagementPanel';
import CategorySwitcher from '@/components/admin/CategorySwitcher';
import EmptyState from '@/components/admin/EmptyState';
import SkeletonLoader from '@/components/admin/SkeletonLoader';
import ThemeToggle from '@/components/admin/ThemeToggle';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import AdvancedFilters from '@/components/admin/AdvancedFilters';

// CRM Types
interface CallStatus {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface CRMAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
}

// CRM Status Options
const callStatuses: CallStatus[] = [
  {
    id: 'interested',
    name: 'Interested',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <UserCheck className="w-3 h-3" />
  },
  {
    id: 'call-later',
    name: 'Call Later',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <ClockIcon className="w-3 h-3" />
  },
  {
    id: 'no-answer',
    name: 'No Answer',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <PhoneMissed className="w-3 h-3" />
  },
  {
    id: 'rejected',
    name: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <UserX className="w-3 h-3" />
  }
];

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseName: string;
  status: 'APPLIED' | 'ADMITTED' | 'REJECTED' | 'WAITING' | 'NEXT_BATCH';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  amount?: number;
  appliedDate: string;
  assignedMentor?: string;
  educationLevel?: string;
  notes?: string;
  address?: string;
  whyJoin?: string;
  // CRM Fields
  callStatus?: 'interested' | 'call-later' | 'no-answer' | 'rejected';
  lastCallDate?: string;
  callNotes?: string;
  recordingUrl?: string;
  callCount?: number;
  whatsappOptIn?: boolean;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  assignedEmployee?: string;
  // Legacy fields for backward compatibility
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  courseId?: string;
  category?: string;
  enrollmentDate?: string;
  mentor?: string;
  progress?: number;
}

interface EnrollmentStats {
  total: number;
  applied: number;
  admitted: number;
  rejected: number;
  waiting: number;
  nextBatch: number;
  paymentPending: number;
}

export default function CategoryEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats>({
    total: 0,
    applied: 0,
    admitted: 0,
    rejected: 0,
    waiting: 0,
    nextBatch: 0,
    paymentPending: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showCallManagement, setShowCallManagement] = useState<Enrollment | null>(null);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [currentUserId, setCurrentUserId] = useState('user-1'); // Mock current user ID
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExportModal, setShowExportModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [courseFilter, setCourseFilter] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Enrollment | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAdvancedFiltersPanel, setShowAdvancedFiltersPanel] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: 'all',
    paymentStatus: 'all',
    educationLevel: 'all',
    hasNotes: false,
    hasCallHistory: false
  });
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  
  // CRM State
  const [showCRMPanel, setShowCRMPanel] = useState<Enrollment | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<Enrollment | null>(null);
  const [showRecordingsModal, setShowRecordingsModal] = useState<Enrollment | null>(null);
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('');
  const [callNotes, setCallNotes] = useState('');

  // CRM Helper Functions
  const getCallStatusColor = (status?: string) => {
    const statusConfig = callStatuses.find(s => s.id === status);
    return statusConfig ? `${statusConfig.bgColor} ${statusConfig.color}` : 'bg-gray-100 text-gray-700';
  };

  const getCallStatusIcon = (status?: string) => {
    const statusConfig = callStatuses.find(s => s.id === status);
    return statusConfig?.icon || <ClockIcon className="w-3 h-3" />;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleCRMAction = (action: string, enrollment: Enrollment) => {
    console.log('CRM Action:', action, 'Enrollment:', enrollment);
    switch (action) {
      case 'call':
        setShowCRMPanel(enrollment);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${enrollment.phone.replace(/\D/g, '')}`, '_blank');
        break;
      case 'sms':
        window.open(`sms:${enrollment.phone}`, '_blank');
        break;
      case 'notes':
        console.log('Opening notes modal for:', enrollment);
        setShowNotesModal(enrollment);
        break;
      case 'recordings':
        setShowRecordingsModal(enrollment);
        break;
    }
  };

  const updateCallStatus = async (enrollmentId: string, status: string, notes?: string) => {
    try {
      // API call to update call status
      console.log('Updating call status:', { enrollmentId, status, notes });
      // Update local state
      setEnrollments(prev => prev.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { 
              ...enrollment, 
              callStatus: status as any, 
              callNotes: notes || enrollment.callNotes,
              lastCallDate: new Date().toISOString(),
              callCount: (enrollment.callCount || 0) + 1
            }
          : enrollment
      ));
      setShowNotesModal(null);
      setCallNotes('');
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchEnrollments();
      fetchAllCategories();
    }
  }, [params.slug, searchQuery, statusFilter, currentPage]);

  const fetchAllCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setAllCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Auth utility function
const getAuthToken = () => {
  let token = localStorage.getItem('auth_token');
  
  // If no token, set the default admin token
  if (!token) {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbWZlZDlkeDAwMDdiOGN5cHJ5ZTM1enciLCJlbWFpbCI6ImZhaXlhei5zdW1vbkBnbWFpbC5jb20iLCJuYW1lIjoiRmFpeWF6IFN1bW9uIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODY0NjY0LCJleHAiOjE3NzM0Njk0NjR9.0Ic89Ld8ImFtSQWMeEyBvAaIxQQHjgOT3zHQKhjdVbA';
    localStorage.setItem('auth_token', token);
  }
  
  return token;
};

const fetchEnrollments = async () => {
    try {
      setLoading(true);
      // Build query parameters object, filtering out undefined values
      const queryObj: Record<string, string> = {
        page: currentPage.toString(),
        search: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter
      };
      
      // Only add category if it exists
      const category = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      if (category) {
        queryObj.category = category;
      }
      
      const queryParams = new URLSearchParams(queryObj);

      const token = getAuthToken();
      console.log('Fetching enrollments with token:', !!token);
      
      // Use category-specific admissions API instead of general enrollments API
      const apiUrl = category ? `/api/admin/categories/${category}/admissions` : `/api/admin/enrollments?${queryParams}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetch response:', data);

      if (data.success) {
        console.log('Setting enrollments:', data.students || data.enrollments);
        // Transform data to match expected format
        const students = data.students || data.enrollments || [];
        
        // Log the actual data structure for debugging
        console.log('Students data:', students);
        console.log('Students length:', students.length);
        
        setEnrollments(students);
        
        // Map stats correctly from category API or general API
        if (data.stats) {
          const mappedStats: EnrollmentStats = {
            total: students.length,
            applied: data.stats.applied || 0,
            admitted: data.stats.admitted || data.stats.approvedEnrollments || 0,
            rejected: data.stats.rejected || 0,
            waiting: data.stats.waiting || 0,
            nextBatch: data.stats.nextBatch || 0,
            paymentPending: data.stats.waiting || 0
          };
          
          console.log('Mapped stats:', mappedStats);
          setStats(mappedStats);
        } else {
          // Create default stats if none provided - calculate from enrollments
          const defaultStats: EnrollmentStats = {
            total: students.length,
            applied: students.filter((s: { status: string; }) => s.status === 'APPLIED').length,
            admitted: students.filter((s: { status: string; }) => s.status === 'ADMITTED').length,
            rejected: students.filter((s: { status: string; }) => s.status === 'REJECTED').length,
            waiting: students.filter((s: { status: string; }) => s.status === 'WAITING').length,
            nextBatch: students.filter((s: { status: string; }) => s.status === 'NEXT_BATCH').length,
            paymentPending: students.filter((s: { status: string; }) => s.status === 'WAITING').length
          };
          
          console.log('Default stats:', defaultStats);
          setStats(defaultStats);
        }
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      
      // Set empty data instead of mock data
      setEnrollments([]);
      setStats({
        total: 0,
        applied: 0,
        admitted: 0,
        rejected: 0,
        waiting: 0,
        nextBatch: 0,
        paymentPending: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      console.log('Updating enrollment status:', { enrollmentId, newStatus });
      setActionLoading(prev => ({ ...prev, [enrollmentId]: true }));
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        fetchEnrollments(); // Refresh the list
        alert(`Status updated to ${newStatus}`);
      } else {
        alert('Failed to update status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      alert('Error updating status');
    } finally {
      setActionLoading(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const editEnrollment = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      setEditingEnrollment(enrollment);
    }
  };

  const saveEnrollmentChanges = async () => {
    if (!editingEnrollment) return;
    
    try {
      const token = getAuthToken();
      
      // Use the category-specific API for updates
      const category = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      const updateUrl = category 
        ? `/api/admin/categories/${category}/admissions/${editingEnrollment.id}`
        : `/api/admin/enrollments/${editingEnrollment.id}`;
      
      console.log('Update URL:', updateUrl);
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: editingEnrollment.status,
          paymentStatus: editingEnrollment.paymentStatus
        })
      });

      const result = await response.json();
      console.log('Update response:', result);

      if (response.ok) {
        console.log('Enrollment updated successfully');
        setEditingEnrollment(null);
        fetchEnrollments(); // Refresh list
        alert('Enrollment updated successfully!');
      } else {
        console.error('Failed to update enrollment:', result);
        const errorMessage = result.error || result.message || 'Unknown error occurred';
        alert(`Failed to save: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving enrollment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error saving enrollment: ${errorMessage}`);
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        const token = getAuthToken();
        
        console.log('Deleting enrollment:', enrollmentId);
        console.log('Token available:', !!token);
        
        // Use the category-specific API for deletion
        const category = Array.isArray(params.slug) ? params.slug[0] : params.slug;
        const deleteUrl = category 
          ? `/api/admin/categories/${category}/admissions/${enrollmentId}`
          : `/api/admin/enrollments/${enrollmentId}`;
        
        console.log('Delete URL:', deleteUrl);
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Delete response status:', response.status);
        const result = await response.json();
        console.log('Delete response:', result);

        if (response.ok) {
          console.log('Delete successful, refreshing list...');
          fetchEnrollments(); // Refresh the list
          // Show success message
          alert('Enrollment deleted successfully!');
        } else {
          console.error('Delete failed:', result);
          const errorMessage = result.error || result.message || 'Unknown error occurred';
          alert(`Delete failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Error deleting enrollment: ${errorMessage}`);
      }
    }
  };

  const viewStudentDetails = (enrollment: Enrollment) => {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    router.push(`/admin/category/${slug}/enrollment/${enrollment.id}`);
  };

  const handleStudentModalClose = () => {
    setShowStudentModal(false);
    setSelectedStudentForView(null);
  };

  const handleStudentSave = (updatedStudent: any) => {
    // Update the enrollment in the list
    setEnrollments(prev => prev.map(e => 
      e.id === updatedStudent.id ? { ...e, ...updatedStudent } : e
    ));
    setShowStudentModal(false);
    setSelectedStudentForView(null);
  };

  const handleAdvancedFilterChange = (newFilters: any) => {
    setAdvancedFilters(newFilters);
    // Apply filters to enrollments
    let filtered = [...enrollments];
    
    if (newFilters.paymentStatus !== 'all') {
      filtered = filtered.filter(e => e.paymentStatus === newFilters.paymentStatus);
    }
    
    if (newFilters.educationLevel !== 'all') {
      filtered = filtered.filter(e => e.educationLevel === newFilters.educationLevel);
    }
    
    if (newFilters.hasNotes) {
      filtered = filtered.filter(e => e.notes && e.notes.trim() !== '');
    }
    
    if (newFilters.hasCallHistory) {
      filtered = filtered.filter(e => e.callCount && e.callCount > 0);
    }
    
    if (newFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (newFilters.dateRange) {
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
      
      filtered = filtered.filter(e => new Date(e.appliedDate) >= filterDate);
    }
    
    setEnrollments(filtered);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      dateRange: 'all',
      paymentStatus: 'all',
      educationLevel: 'all',
      hasNotes: false,
      hasCallHistory: false
    });
    fetchEnrollments(); // Reset to original data
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-900/50 text-blue-400 border-blue-700';
      case 'WAITING':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'ADMITTED':
        return 'bg-green-900/50 text-green-400 border-green-700';
      case 'REJECTED':
        return 'bg-red-900/50 text-red-400 border-red-700';
      case 'NEXT_BATCH':
        return 'bg-purple-900/50 text-purple-400 border-purple-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <Clock className="w-4 h-4" />;
      case 'WAITING':
        return <Clock className="w-4 h-4" />;
      case 'ADMITTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'NEXT_BATCH':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) return '৳0';
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryGradient = () => {
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const gradientMap: { [key: string]: string } = {
      'government': 'from-green-500 to-emerald-600',
      'online': 'from-blue-500 to-cyan-600',
      'offline': 'from-purple-500 to-pink-600',
      'recorded': 'from-orange-500 to-red-600'
    };
    return slug && gradientMap[slug] ? gradientMap[slug] : 'from-gray-500 to-gray-600';
  };

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
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    {params.slug ? (Array.isArray(params.slug) ? params.slug[0] : params.slug).charAt(0).toUpperCase() + (Array.isArray(params.slug) ? params.slug[0] : params.slug).slice(1) : 'Category'} Enrollments
                  </h1>
                  <div className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-lg rounded-full text-sm font-medium">
                    {Array.isArray(params.slug) ? params.slug[0] : params.slug}
                  </div>
                </div>
                <p className="text-white text-opacity-90 text-lg max-w-2xl">
                  Manage student enrollments and track application status
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open(`/admin/category/${Array.isArray(params.slug) ? params.slug[0] : params.slug}`, '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-lg text-white rounded-xl hover:bg-opacity-30 transition-all font-medium border border-white border-opacity-30"
              >
                <Eye className="w-5 h-5" />
                Overview
              </button>
              <ThemeToggle />
              <button
                onClick={fetchEnrollments}
                className="p-3 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl hover:bg-opacity-30 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
            <h2 className="text-2xl font-bold text-gray-900">Enrollment Management</h2>
          </div>
          <p className="text-gray-600 ml-15">Manage and track student enrollments for this category</p>
        </div>

        {/* Category Switcher */}
        <CategorySwitcher
          categories={allCategories}
          currentSlug={Array.isArray(params.slug) ? params.slug[0] : params.slug || ''}
          basePath="/admin/category/[slug]/enrollment"
          title="Switch Category"
          description="View enrollments for different categories"
        />

        {/* Advanced Filters */}
        <AdvancedFilters
          onFilterChange={handleAdvancedFilterChange}
          onClear={handleClearAdvancedFilters}
        />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* Total Card */}
          <div className="bg-gradient-to-br from-blue-700 to-purple-800 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-blue-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.total}</h2>
            <p className="text-gray-200 text-sm">Total</p>
          </div>

          {/* Applied Card */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-cyan-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.applied}</h2>
            <p className="text-gray-200 text-sm">Applied</p>
          </div>

          {/* Admitted Card */}
          <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-green-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.admitted}</h2>
            <p className="text-gray-200 text-sm">Admitted</p>
          </div>

          {/* Waiting Card */}
          <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-orange-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.waiting}</h2>
            <p className="text-gray-200 text-sm">Waiting</p>
          </div>

          {/* Rejected Card */}
          <div className="bg-gradient-to-br from-red-600 to-pink-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-red-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <X className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.rejected}</h2>
            <p className="text-gray-200 text-sm">Rejected</p>
          </div>

          {/* Next Batch Card */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center border border-purple-600/30">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{stats.nextBatch}</h2>
            <p className="text-gray-200 text-sm">Next Batch</p>
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-px bg-gray-700 flex-1"></div>
          <div className="text-gray-400 text-sm font-medium">Search & Filter</div>
          <div className="h-px bg-gray-700 flex-1"></div>
        </div>

        {/* Advanced Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 lg:p-6 border-b border-gray-700">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by student name, email, phone, or course..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 bg-gray-800"
                    />
                  </div>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-gray-700 text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-gray-700 text-blue-400 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="APPLIED">Applied</option>
                    <option value="WAITING">Waiting</option>
                    <option value="ADMITTED">Admitted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="NEXT_BATCH">Next Batch</option>
                  </select>
                  
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors text-sm"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Advanced Filters</span>
                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={fetchEnrollments}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="p-4 lg:p-6 bg-gray-800 border-t border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white bg-gray-800"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course Filter</label>
                    <input
                      type="text"
                      placeholder="Filter by course..."
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white bg-gray-800"
                    >
                      <option value="date">Date</option>
                      <option value="name">Name</option>
                      <option value="course">Course</option>
                      <option value="status">Status</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white bg-gray-800"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setCourseFilter('');
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={fetchEnrollments}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Enrollments Table */}
        <div className="px-4 lg:px-6 py-4 lg:py-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Recent Enrollments</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{enrollments.length} results</span>
                  <span>•</span>
                  <span>Page {currentPage}</span>
                </div>
              </div>
            </div>
        
        <div className="w-full overflow-x-auto rounded-xl border border-gray-700 shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 sticky top-0 z-10 shadow-md">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700">
                  Student
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700">
                  Course
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700 hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700 hidden sm:table-cell">
                  Payment
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700 hidden lg:table-cell">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700 hidden sm:table-cell">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700 hidden md:table-cell">
                  Call Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700">
                  CRM Actions
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider border-b-2 border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-1 py-4">
                    <SkeletonLoader type="table" count={1} />
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-1 py-4">
                    <EmptyState
                      type="enrollments"
                      title="No Enrollments Found"
                      description="No enrollments found for this category. Start by adding new enrollments to track student applications."
                      actionLabel="Add First Enrollment"
                      onAction={() => router.push('/admin/enrollments/new')}
                    />
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 transition-all duration-200 hover:shadow-md group">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <span className="text-sm font-bold text-white">
                              {enrollment.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {enrollment.name || 'Unknown Student'}
                          </div>
                          <div className="text-xs text-gray-400 truncate hidden sm:block">
                            {enrollment.email || 'No email'}
                          </div>
                          <div className="text-xs text-gray-400 truncate hidden lg:block">
                            {enrollment.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {enrollment.courseName || 'Unknown Course'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                          {getStatusIcon(enrollment.status)}
                          <span>{enrollment.status?.replace('_', ' ') || 'Unknown'}</span>
                        </div>
                        <select
                          value={enrollment.status}
                          onChange={(e) => updateEnrollmentStatus(enrollment.id, e.target.value)}
                          disabled={actionLoading[enrollment.id]}
                          className="w-28 rounded-md border border-gray-600 bg-gray-700/50 px-2 py-1 text-xs text-white focus:border-blue-400 focus:outline-none"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="ADMITTED">Admitted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="WAITING">Waiting</option>
                          <option value="NEXT_BATCH">Next Batch</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                        enrollment.paymentStatus === 'PAID' ? 'bg-green-900/50 text-green-400 border border-green-700' :
                        enrollment.paymentStatus === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' :
                        enrollment.paymentStatus === 'FAILED' ? 'bg-red-900/50 text-red-400 border border-red-700' :
                        'bg-gray-800 text-gray-300 border border-gray-600'
                      }`}>
                        <span>{enrollment.paymentStatus || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="text-sm font-semibold text-white">
                        {formatCurrency(enrollment.amount)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="text-xs text-gray-400">
                        {formatDate(enrollment.appliedDate)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      {enrollment.callStatus && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getCallStatusColor(enrollment.callStatus)}`}>
                          {getCallStatusIcon(enrollment.callStatus)}
                          <span className="hidden sm:inline">{callStatuses.find(s => s.id === enrollment.callStatus)?.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Call Button */}
                        <button
                          onClick={() => handleCRMAction('call', enrollment)}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="📞 Call Applicant"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                        
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleCRMAction('whatsapp', enrollment)}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors hidden sm:inline-flex"
                          title="💬 WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </button>
                        
                        {/* SMS Button */}
                        <button
                          onClick={() => handleCRMAction('sms', enrollment)}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors hidden md:inline-flex"
                          title="📩 SMS"
                        >
                          <MessageSquareIcon className="w-3 h-3" />
                        </button>
                        
                        {/* Notes Button */}
                        <button
                          onClick={() => handleCRMAction('notes', enrollment)}
                          className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors hidden lg:inline-flex"
                          title="📝 Notes"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                        
                        {/* Recordings Button */}
                        <button
                          onClick={() => handleCRMAction('recordings', enrollment)}
                          className="p-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors hidden xl:inline-flex"
                          title="🎧 Recordings"
                        >
                          <Headphones className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => viewStudentDetails(enrollment)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this enrollment?')) {
                              deleteEnrollment(enrollment.id);
                            }
                          }}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          title="Delete Enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* CRM Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  📝 Call Notes - {showNotesModal.studentName}
                </h3>
                <button
                  onClick={() => setShowNotesModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Call Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {callStatuses.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setSelectedCallStatus(status.id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          selectedCallStatus === status.id
                            ? 'border-blue-500 bg-blue-900/50 text-blue-400'
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
                          {status.icon}
                          {status.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Call Notes
                  </label>
                  <textarea
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Enter call notes, conversation details, follow-up actions..."
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNotesModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateCallStatus(showNotesModal.id, selectedCallStatus, callNotes)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRM Recordings Modal */}
      {showRecordingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  🎧 Call Recordings - {showRecordingsModal.studentName}
                </h3>
                <button
                  onClick={() => setShowRecordingsModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {showRecordingsModal.recordingUrl ? (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Latest Recording</span>
                      <span className="text-xs text-gray-400">
                        {showRecordingsModal.lastCallDate ? formatDate(showRecordingsModal.lastCallDate) : 'Unknown date'}
                      </span>
                    </div>
                    <audio controls className="w-full">
                      <source src={showRecordingsModal.recordingUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No recordings available</p>
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-2">Call History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Calls</span>
                      <span className="font-medium text-white">{showRecordingsModal.callCount || 0}</span>
                    </div>
                    {showRecordingsModal.lastCallDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Call</span>
                        <span className="font-medium text-white">{formatDate(showRecordingsModal.lastCallDate)}</span>
                      </div>
                    )}
                    {showRecordingsModal.callNotes && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-400">Latest Notes:</span>
                        <p className="text-sm text-gray-300 mt-1">{showRecordingsModal.callNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRM Panel Modal */}
      {showCRMPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">📞 CRM Call Management</h3>
                  <p className="text-gray-600">
                    {showCRMPanel.name} - {showCRMPanel.phone}
                  </p>
                </div>
                <button
                  onClick={() => setShowCRMPanel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="font-medium">{showCRMPanel.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="font-medium">{showCRMPanel.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="font-medium">{showCRMPanel.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Course</span>
                      <span className="font-medium">{showCRMPanel.courseName}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-gray-900">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => window.open(`tel:${showCRMPanel.phone}`, '_self')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/${showCRMPanel.phone.replace(/\D/g, '')}`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => window.open(`sms:${showCRMPanel.phone}`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquareIcon className="w-4 h-4" />
                        Send SMS
                      </button>
                      <button
                        onClick={() => setShowNotesModal(showCRMPanel)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Add Notes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Call History */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Call History</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {showCRMPanel.callCount ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Calls</span>
                          <span className="font-medium">{showCRMPanel.callCount}</span>
                        </div>
                        {showCRMPanel.lastCallDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Last Call</span>
                            <span className="font-medium">{formatDate(showCRMPanel.lastCallDate)}</span>
                          </div>
                        )}
                        {showCRMPanel.callStatus && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getCallStatusColor(showCRMPanel.callStatus)}`}>
                              {getCallStatusIcon(showCRMPanel.callStatus)}
                              {callStatuses.find(s => s.id === showCRMPanel.callStatus)?.name}
                            </div>
                          </div>
                        )}
                        {showCRMPanel.callNotes && (
                          <div>
                            <span className="text-sm text-gray-600">Latest Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{showCRMPanel.callNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No call history yet</p>
                      </div>
                    )}
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-gray-900">Communication Preferences</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">WhatsApp</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          showCRMPanel.whatsappOptIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {showCRMPanel.whatsappOptIn ? 'Opted In' : 'Not Available'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SMS</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          showCRMPanel.smsOptIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {showCRMPanel.smsOptIn ? 'Opted In' : 'Not Available'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          showCRMPanel.emailOptIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {showCRMPanel.emailOptIn ? 'Opted In' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">📋 Enrollment Details</h3>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Student Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="font-medium">{selectedEnrollment.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="font-medium">{selectedEnrollment.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="font-medium">{selectedEnrollment.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Course</span>
                      <span className="font-medium">{selectedEnrollment.courseName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Enrollment Status</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedEnrollment.status === 'ADMITTED' ? 'bg-green-100 text-green-800' :
                        selectedEnrollment.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' :
                        selectedEnrollment.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEnrollment.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedEnrollment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        selectedEnrollment.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEnrollment.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-medium">{formatCurrency(selectedEnrollment.amount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Applied Date</span>
                      <span className="font-medium">{formatDate(selectedEnrollment.appliedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {editingEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">✏️ Edit Enrollment</h3>
                <button
                  onClick={() => setEditingEnrollment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                    <input
                      type="text"
                      value={editingEnrollment.name}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingEnrollment.email}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editingEnrollment.phone}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input
                      type="text"
                      value={editingEnrollment.courseName}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, courseName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingEnrollment.status}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="WAITING">Waiting</option>
                      <option value="ADMITTED">Admitted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={editingEnrollment.paymentStatus}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, paymentStatus: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={editingEnrollment.amount || 0}
                      onChange={(e) => setEditingEnrollment({...editingEnrollment, amount: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditingEnrollment(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEnrollmentChanges}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudentForView && (
        <StudentDetailModal
          student={{
            id: selectedStudentForView.id,
            name: selectedStudentForView.name || 'Unknown',
            email: selectedStudentForView.email || 'No email',
            phone: selectedStudentForView.phone || 'No phone',
            courseName: selectedStudentForView.courseName || 'Unknown Course',
            status: selectedStudentForView.status || 'Unknown',
            paymentStatus: selectedStudentForView.paymentStatus || 'Unknown',
            amount: selectedStudentForView.amount,
            appliedDate: selectedStudentForView.appliedDate || new Date().toISOString(),
            address: selectedStudentForView.address,
            educationLevel: selectedStudentForView.educationLevel,
            whyJoin: selectedStudentForView.whyJoin
          }}
          onClose={handleStudentModalClose}
          onSave={handleStudentSave}
        />
      )}
    </div>
  );
}
