'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Search, 
  CheckCircle, 
  X, 
  Clock, 
  User, 
  Phone,
  Briefcase,
  MessageSquare,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Settings,
  Users,
  GraduationCap,
  Monitor,
  Smartphone,
  MapPin,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface Enrollment {
  id: string;
  studentName: string;
  phone: string;
  course: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  email?: string;
  address?: string;
  enrollmentDate?: string;
  paymentStatus?: string;
  notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', iconType: 'clock' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', iconType: 'checkCircle' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', iconType: 'x' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', iconType: 'checkCircle' }
};

const categoryConfig = {
  'government': { label: 'Government Batch', color: 'bg-orange-100 text-orange-700', iconType: 'graduationCap' },
  'recorded': { label: 'Recorded Courses', color: 'bg-purple-100 text-purple-700', iconType: 'monitor' },
  'online': { label: 'Online Batch', color: 'bg-blue-100 text-blue-700', iconType: 'smartphone' },
  'offline': { label: 'Offline Batch', color: 'bg-green-100 text-green-700', iconType: 'mapPin' }
};

const getStatusIcon = (iconType: string) => {
  switch (iconType) {
    case 'clock': return <Clock className="w-4 h-4" />;
    case 'checkCircle': return <CheckCircle className="w-4 h-4" />;
    case 'x': return <X className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'graduationCap': return <GraduationCap className="w-4 h-4" />;
    case 'monitor': return <Monitor className="w-4 h-4" />;
    case 'smartphone': return <Smartphone className="w-4 h-4" />;
    case 'mapPin': return <MapPin className="w-4 h-4" />;
    case 'bookOpen': return <BookOpen className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const sampleDataByCategory: Record<string, Enrollment[]> = {
  'government': [
    {
      id: '1',
      studentName: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      course: 'Government Job Preparation',
      category: 'GOVERNMENT',
      status: 'pending',
      enrollmentDate: '2024-01-15',
      paymentStatus: 'pending'
    },
    {
      id: '2',
      studentName: 'Tom Brown',
      phone: '+1 (555) 567-8901',
      email: 'tom.brown@email.com',
      course: 'Civil Services Foundation',
      category: 'GOVERNMENT',
      status: 'approved',
      enrollmentDate: '2024-01-11',
      paymentStatus: 'completed'
    }
  ],
  'recorded': [
    {
      id: '3',
      studentName: 'Jane Smith',
      phone: '+1 (555) 234-5678',
      email: 'jane.smith@email.com',
      course: 'Full Stack Web Development',
      category: 'RECORDED',
      status: 'approved',
      enrollmentDate: '2024-01-14',
      paymentStatus: 'completed'
    },
    {
      id: '4',
      studentName: 'Alice Davis',
      phone: '+1 (555) 678-9012',
      email: 'alice.davis@email.com',
      course: 'Data Science & Machine Learning',
      category: 'RECORDED',
      status: 'pending',
      enrollmentDate: '2024-01-10',
      paymentStatus: 'pending'
    }
  ],
  'online': [
    {
      id: '5',
      studentName: 'Mike Johnson',
      phone: '+1 (555) 345-6789',
      email: 'mike.johnson@email.com',
      course: 'Live Full Stack Bootcamp',
      category: 'ONLINE',
      status: 'pending',
      enrollmentDate: '2024-01-13',
      paymentStatus: 'pending'
    },
    {
      id: '6',
      studentName: 'Bob Miller',
      phone: '+1 (555) 789-0123',
      email: 'bob.miller@email.com',
      course: 'Live Data Science Bootcamp',
      category: 'ONLINE',
      status: 'completed',
      enrollmentDate: '2024-01-09',
      paymentStatus: 'completed'
    }
  ],
  'offline': [
    {
      id: '7',
      studentName: 'Sarah Wilson',
      phone: '+1 (555) 456-7890',
      email: 'sarah.wilson@email.com',
      course: 'Classroom Full Stack Training',
      category: 'OFFLINE',
      status: 'rejected',
      enrollmentDate: '2024-01-12',
      paymentStatus: 'failed'
    },
    {
      id: '8',
      studentName: 'Eva Rodriguez',
      phone: '+1 (555) 012-3456',
      email: 'eva.rodriguez@email.com',
      course: 'Offline UI/UX Design',
      category: 'OFFLINE',
      status: 'approved',
      enrollmentDate: '2024-01-06',
      paymentStatus: 'completed'
    }
  ]
};

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

export default function CategoryEnrollmentsPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    paymentStatus: 'all'
  });

  useEffect(() => {
    // Load category-specific data
    const categoryData = sampleDataByCategory[categorySlug] || [];
    setEnrollments(categoryData);
    setFilteredEnrollments(categoryData);
    
    // Calculate stats
    const newStats = {
      total: categoryData.length,
      pending: categoryData.filter(e => e.status === 'pending').length,
      approved: categoryData.filter(e => e.status === 'approved').length,
      rejected: categoryData.filter(e => e.status === 'rejected').length
    };
    setStats(newStats);
  }, [categorySlug]);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, filters]);

  const filterEnrollments = () => {
    let filtered = [...enrollments];
    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(enrollment => 
        enrollment.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        enrollment.phone.includes(filters.search) ||
        enrollment.course.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.status === filters.status);
    }

    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.paymentStatus === filters.paymentStatus);
    }
    
    setFilteredEnrollments(filtered);
  };

  const handleStatusUpdate = (enrollmentId: string, newStatus: string) => {
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, status: newStatus as Enrollment['status'] }
          : enrollment
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pending: newStatus === 'pending' ? prev.pending + 1 : prev.pending - 1,
      approved: newStatus === 'approved' ? prev.approved + 1 : prev.approved - 1,
      rejected: newStatus === 'rejected' ? prev.rejected + 1 : prev.rejected - 1
    }));
    
    console.log(`Enrollment ${enrollmentId} status updated to ${newStatus}`);
  };

  const handleAddNote = (enrollmentId: string) => {
    console.log('Adding note for enrollment:', enrollmentId);
  };

  const handleCall = (enrollmentId: string, phoneNumber: string) => {
    console.log(`Calling student for enrollment ${enrollmentId} at ${phoneNumber}`);
  };

  const getCategoryInfo = () => {
    return categoryConfig[categorySlug as keyof typeof categoryConfig] || {
      label: 'Unknown Category',
      color: 'bg-gray-100 text-gray-700',
      iconType: 'bookOpen'
    };
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/employee')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${categoryInfo.color}`}>
            {getCategoryIcon(categoryInfo.iconType)}
            <span className="text-sm font-medium">{categoryInfo.label}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {categoryInfo.label} Enrollments
            </h1>
            <p className="text-gray-300 text-lg">
              Manage student enrollments for {categoryInfo.label.toLowerCase()} courses.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-700 to-purple-800 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-blue-600/30">
          <div>
            <p className="text-gray-200 text-lg">Total</p>
            <h2 className="text-5xl font-bold">{stats.total}</h2>
            <p className="text-gray-300">All enrollments</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            <Users className="w-8 h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-green-600/30">
          <div>
            <p className="text-gray-200 text-lg">Approved</p>
            <h2 className="text-5xl font-bold">{stats.approved}</h2>
            <p className="text-gray-300">Confirmed</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-orange-600/30">
          <div>
            <p className="text-gray-200 text-lg">Pending</p>
            <h2 className="text-5xl font-bold">{stats.pending}</h2>
            <p className="text-gray-300">Waiting review</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-600 to-pink-700 text-white rounded-2xl shadow-lg p-6 flex items-center justify-between border border-red-600/30">
          <div>
            <p className="text-gray-200 text-lg">Rejected</p>
            <h2 className="text-5xl font-bold">{stats.rejected}</h2>
            <p className="text-gray-300">Not approved</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            <X className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search enrollments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all duration-200 border"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
            
            <button
              onClick={() => setFilters({
                search: '',
                status: 'all',
                paymentStatus: 'all'
              })}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all duration-200 border"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
          
          <button className="border-gray-600 text-gray-100 hover:bg-gray-700 p-3 rounded-xl transition-all duration-200 border">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value} className="bg-gray-800">
                    {status.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all" className="bg-gray-800">All Payment Status</option>
                <option value="completed" className="bg-gray-800">Completed</option>
                <option value="pending" className="bg-gray-800">Pending</option>
                <option value="failed" className="bg-gray-800">Failed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Enrollments Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {categoryInfo.label} Enrollments
            </h2>
            <div className="text-gray-400 text-sm">
              {filteredEnrollments.length} results
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{enrollment.studentName}</div>
                        {enrollment.email && (
                          <div className="text-sm text-gray-400">{enrollment.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {enrollment.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{enrollment.course}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={enrollment.status}
                      onChange={(e) => handleStatusUpdate(enrollment.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${statusConfig[enrollment.status].color}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      enrollment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      enrollment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.paymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddNote(enrollment.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Note
                      </button>
                      <button
                        onClick={() => handleCall(enrollment.id, enrollment.phone)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredEnrollments.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No enrollments found</h3>
          <p className="text-gray-400">No enrollments match your search criteria for {categoryInfo.label.toLowerCase()}.</p>
        </div>
      )}
    </div>
  );
}
