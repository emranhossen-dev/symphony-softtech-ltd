'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Plus,
  Save,
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign
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

interface NewEnrollment {
  studentName: string;
  phone: string;
  email: string;
  course: string;
  category: string;
  address: string;
  notes: string;
  enrollmentDate: string;
  paymentStatus: string;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: X },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
};

const categoryConfig = {
  'GOVERNMENT': { label: 'Government Batch', color: 'bg-orange-100 text-orange-700', icon: GraduationCap },
  'RECORDED': { label: 'Recorded Courses', color: 'bg-purple-100 text-purple-700', icon: Monitor },
  'ONLINE': { label: 'Online Batch', color: 'bg-blue-100 text-blue-700', icon: Smartphone },
  'OFFLINE': { label: 'Offline Batch', color: 'bg-green-100 text-green-700', icon: MapPin }
};

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'GOVERNMENT', label: 'Government Batch' },
  { value: 'RECORDED', label: 'Recorded Courses' },
  { value: 'ONLINE', label: 'Online Batch' },
  { value: 'OFFLINE', label: 'Offline Batch' }
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

const availableCourses = [
  { name: 'Government Job Preparation', category: 'GOVERNMENT' },
  { name: 'BCS Preliminary', category: 'GOVERNMENT' },
  { name: 'Full Stack Web Development', category: 'RECORDED' },
  { name: 'React Advanced Course', category: 'RECORDED' },
  { name: 'Live Full Stack Bootcamp', category: 'ONLINE' },
  { name: 'Live Data Science Bootcamp', category: 'ONLINE' },
  { name: 'Classroom Full Stack Training', category: 'OFFLINE' },
  { name: 'Classroom Python Training', category: 'OFFLINE' }
];

function EmployeeEnrollmentsContent() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const [showNewForm, setShowNewForm] = useState(action === 'new');
  const [successMessage, setSuccessMessage] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
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
      id: '3',
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
      id: '4',
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
      id: '5',
      studentName: 'Tom Brown',
      phone: '+1 (555) 567-8901',
      email: 'tom.brown@email.com',
      course: 'Civil Services Foundation',
      category: 'GOVERNMENT',
      status: 'approved',
      enrollmentDate: '2024-01-11',
      paymentStatus: 'completed'
    },
    {
      id: '6',
      studentName: 'Alice Davis',
      phone: '+1 (555) 678-9012',
      email: 'alice.davis@email.com',
      course: 'Data Science & Machine Learning',
      category: 'RECORDED',
      status: 'pending',
      enrollmentDate: '2024-01-10',
      paymentStatus: 'pending'
    },
    {
      id: '7',
      studentName: 'Bob Miller',
      phone: '+1 (555) 789-0123',
      email: 'bob.miller@email.com',
      course: 'Live Data Science Bootcamp',
      category: 'ONLINE',
      status: 'completed',
      enrollmentDate: '2024-01-09',
      paymentStatus: 'completed'
    },
    {
      id: '8',
      studentName: 'Charlie Garcia',
      phone: '+1 (555) 890-1234',
      email: 'charlie.garcia@email.com',
      course: 'Mobile App Development',
      category: 'RECORDED',
      status: 'approved',
      enrollmentDate: '2024-01-08',
      paymentStatus: 'completed'
    },
    {
      id: '9',
      studentName: 'Diana Martinez',
      phone: '+1 (555) 901-2345',
      email: 'diana.martinez@email.com',
      course: 'Live Mobile Development',
      category: 'ONLINE',
      status: 'pending',
      enrollmentDate: '2024-01-07',
      paymentStatus: 'pending'
    },
    {
      id: '10',
      studentName: 'Eva Rodriguez',
      phone: '+1 (555) 012-3456',
      email: 'eva.rodriguez@email.com',
      course: 'Offline UI/UX Design',
      category: 'OFFLINE',
      status: 'approved',
      enrollmentDate: '2024-01-06',
      paymentStatus: 'completed'
    }
  ]);

  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>(enrollments);
  const [stats, setStats] = useState<Stats>({
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    paymentStatus: 'all'
  });

  // New enrollment form state
  const [newEnrollment, setNewEnrollment] = useState<NewEnrollment>({
    studentName: '',
    phone: '',
    email: '',
    course: '',
    category: '',
    address: '',
    notes: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending'
  });

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
        enrollment.course.toLowerCase().includes(filters.search.toLowerCase()) ||
        enrollment.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.category === filters.category);
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
    // TODO: Implement note functionality
  };

  const handleNewEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new enrollment
    const enrollment: Enrollment = {
      id: Date.now().toString(),
      ...newEnrollment,
      status: 'pending'
    };
    
    // Add to enrollments
    setEnrollments(prev => [enrollment, ...prev]);
    
    // Show success message
    setSuccessMessage(`Successfully enrolled ${newEnrollment.studentName} in ${newEnrollment.course}!`);
    
    // Reset form
    setNewEnrollment({
      studentName: '',
      phone: '',
      email: '',
      course: '',
      category: '',
      address: '',
      notes: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending'
    });
    
    // Close form
    setShowNewForm(false);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
    
    console.log('New enrollment created successfully:', enrollment);
  };

  const handleCourseChange = (courseName: string) => {
    const course = availableCourses.find(c => c.name === courseName);
    if (course) {
      setNewEnrollment(prev => ({
        ...prev,
        course: courseName,
        category: course.category
      }));
    }
  };

  const handleCancelNewEnrollment = () => {
    setNewEnrollment({
      studentName: '',
      phone: '',
      email: '',
      course: '',
      category: '',
      address: '',
      notes: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending'
    });
    setShowNewForm(false);
  };

  const handleCall = (enrollmentId: string, phoneNumber: string) => {
    console.log(`Calling student for enrollment ${enrollmentId} at ${phoneNumber}`);
    // TODO: Implement real call integration
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
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 to-black">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-4 px-1 sm:px-2 lg:px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Student Enrollments</h1>
            <p className="text-gray-300 text-base sm:text-lg">
              Manage student enrollments and track their progress through different course categories.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Enrollment Form - Show when action=new */}
      {showNewForm && (
        <div className="mb-2 px-0">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Add New Enrollment
                </h2>
                <button
                  onClick={handleCancelNewEnrollment}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
          </div>
          
          <form onSubmit={handleNewEnrollmentSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Student Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEnrollment.studentName}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, studentName: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student's full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newEnrollment.phone}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+880 1234-567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEnrollment.email}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="student@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={newEnrollment.address}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter student's address"
                  />
                </div>
              </div>
              
              {/* Course Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Course *
                  </label>
                  <select
                    required
                    value={newEnrollment.course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a course</option>
                    {availableCourses.map((course) => (
                      <option key={course.name} value={course.name}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-300">
                    {newEnrollment.category || 'Auto-selected based on course'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enrollment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEnrollment.enrollmentDate}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={newEnrollment.paymentStatus}
                    onChange={(e) => setNewEnrollment(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                value={newEnrollment.notes}
                onChange={(e) => setNewEnrollment(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Add any additional notes about this enrollment..."
              />
            </div>
            
            {/* Form Actions */}
            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCancelNewEnrollment}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Create Enrollment
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="mb-2 px-0">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-700 to-purple-800 text-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-between border border-blue-600/30">
          <div>
            <p className="text-gray-200 text-sm sm:text-lg">Total</p>
            <h2 className="text-3xl sm:text-5xl font-bold">{stats.total}</h2>
            <p className="text-gray-300 text-xs sm:text-sm">All enrollments</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-between border border-green-600/30">
          <div>
            <p className="text-gray-200 text-sm sm:text-lg">Approved</p>
            <h2 className="text-3xl sm:text-5xl font-bold">{stats.approved}</h2>
            <p className="text-gray-300 text-xs sm:text-sm">Confirmed</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-between border border-orange-600/30">
          <div>
            <p className="text-gray-200 text-sm sm:text-lg">Pending</p>
            <h2 className="text-3xl sm:text-5xl font-bold">{stats.pending}</h2>
            <p className="text-gray-300 text-xs sm:text-sm">Waiting review</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-600 to-pink-700 text-white rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-between border border-red-600/30">
          <div>
            <p className="text-gray-200 text-sm sm:text-lg">Rejected</p>
            <h2 className="text-3xl sm:text-5xl font-bold">{stats.rejected}</h2>
            <p className="text-gray-300 text-xs sm:text-sm">Not approved</p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold">
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-0 mb-2 border border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search enrollments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-sm"
              />
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 border text-sm sm:text-base whitespace-nowrap"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
            </button>
            
            <button
              onClick={() => setFilters({
                search: '',
                category: 'all',
                status: 'all',
                paymentStatus: 'all'
              })}
              className="border-gray-600 text-gray-100 hover:bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 border text-sm sm:text-base whitespace-nowrap"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
          
          <button className="border-gray-600 text-gray-100 hover:bg-gray-700 p-2 sm:p-3 rounded-xl transition-all duration-200 border">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} className="bg-gray-800">
                    {category.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
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
                className="bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
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
        <div className="p-0 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-white">All Enrollments</h2>
            <div className="text-gray-400 text-sm">
              {filteredEnrollments.length} results
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="w-full">
            <table className="w-full min-w-[1000px]">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                    {/* Mobile Card View */}
                    <td className="sm:hidden" colSpan={6}>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{enrollment.studentName}</div>
                              {enrollment.email && (
                                <div className="text-xs text-gray-400 mt-1">{enrollment.email}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {enrollment.phone}
                        </div>
                        
                        <div className="text-sm text-white mb-2">{enrollment.course}</div>
                        
                        <div className="flex items-center">
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryConfig[enrollment.category as keyof typeof categoryConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {getCategoryIcon(enrollment.category)}
                            <span className="ml-1">{enrollment.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center">
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
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enrollment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            enrollment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            enrollment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.paymentStatus || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleAddNote(enrollment.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Note</span>
                          </button>
                          <button
                            onClick={() => handleCall(enrollment.id, enrollment.phone)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">Call</span>
                          </button>
                        </div>
                      </div>
                    </td>
                    
                    {/* Desktop Table View */}
                    <>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{enrollment.studentName}</div>
                            {enrollment.email && (
                              <div className="text-xs text-gray-400">{enrollment.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {enrollment.phone}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{enrollment.course}</div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryConfig[enrollment.category as keyof typeof categoryConfig]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {getCategoryIcon(enrollment.category)}
                            <span className="ml-1">{enrollment.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
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
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enrollment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          enrollment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          enrollment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.paymentStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-sm font-medium">
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
                    </>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredEnrollments.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No enrollments found</h3>
          <p className="text-gray-400">No enrollments match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function EmployeeEnrollments() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">Loading...</div>}>
      <EmployeeEnrollmentsContent />
    </Suspense>
  );
}
