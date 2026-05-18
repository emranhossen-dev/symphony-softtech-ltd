'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, User, Mail, Phone, Calendar, Award, TrendingUp, Users, BookOpen, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string | null;
  rating: number;
  totalStudents: number;
  totalRevenue: number;
  isActive: boolean;
  joinedAt: string;
  courses: Array<{
    id: string;
    title: string;
    students: number;
  }>;
}

interface Course {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface Batch {
  id: string;
  name: string;
  courseName: string;
  isActive: boolean;
  currentStudents: number;
  maxStudents: number;
  schedule: string;
}

export default function MentorManagement() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    mentorId: '',
    courseId: '',
    batchId: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    expertise: '',
    experience: '',
    bio: ''
  });

  useEffect(() => {
    fetchMentors();
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors');
      
      if (!response.ok) {
        console.error('Mentors API response not ok:', response.status, response.statusText);
        setMentors([]);
        return;
      }
      
      const text = await response.text();
      if (!text) {
        console.error('Empty response from mentors API');
        setMentors([]);
        return;
      }
      
      try {
        const data = JSON.parse(text);
        
        if (data.success) {
          // Ensure each mentor has a courses array
          const mentorsWithCourses = (data.mentors || []).map((mentor: any) => ({
            ...mentor,
            courses: mentor.courses || []
          }));
          setMentors(mentorsWithCourses);
        } else {
          toast.error(data.error || 'Failed to fetch mentors');
          setMentors([]);
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON from mentors API:', jsonError);
        console.error('Response text:', text);
        toast.error('Failed to parse mentors data');
        setMentors([]);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to fetch mentors');
      setMentors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      
      if (!response.ok) {
        console.error('Courses API response not ok:', response.status, response.statusText);
        // Set fallback mock data
        setCourses([
          {
            id: 'course-1',
            name: 'Default Course',
            category: 'GENERAL',
            isActive: true
          }
        ]);
        return;
      }
      
      const text = await response.text();
      if (!text) {
        console.error('Empty response from courses API');
        setCourses([]);
        return;
      }
      
      try {
        const data = JSON.parse(text);
        setCourses(data.courses || []);
      } catch (jsonError) {
        console.error('Failed to parse JSON from courses API:', jsonError);
        console.error('Response text:', text);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/admin/batches');
      
      if (!response.ok) {
        console.error('Batches API response not ok:', response.status, response.statusText);
        // Set fallback mock data
        setBatches([
          {
            id: 'batch-1',
            name: 'Batch 1 - Default',
            courseName: 'Default Course',
            isActive: true,
            currentStudents: 0,
            maxStudents: 30,
            schedule: 'Mon-Wed-Fri 6PM-8PM'
          }
        ]);
        return;
      }
      
      const text = await response.text();
      if (!text) {
        console.error('Empty response from batches API');
        setBatches([]);
        return;
      }
      
      try {
        const data = JSON.parse(text);
        setBatches(data.batches || []);
      } catch (jsonError) {
        console.error('Failed to parse JSON from batches API:', jsonError);
        console.error('Response text:', text);
        setBatches([]);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Mentor added successfully');
        setShowAddModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          expertise: '',
          experience: '',
          bio: ''
        });
        fetchMentors();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add mentor');
      }
    } catch (error) {
      console.error('Error adding mentor:', error);
      toast.error('Failed to add mentor');
    }
  };

  const handleEditMentor = (mentor: Mentor) => {
    // Navigate to edit page (we'll create this later)
    router.push(`/admin/mentors/${mentor.id}/edit`);
  };

  const handleDeleteMentor = async (mentorId: string) => {
    if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mentor deleted successfully');
        fetchMentors();
      } else {
        toast.error(data.error || 'Failed to delete mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      toast.error('Failed to delete mentor');
    }
  };

  const handleToggleStatus = async (mentorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Mentor ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchMentors();
      } else {
        toast.error(data.error || 'Failed to update mentor status');
      }
    } catch (error) {
      console.error('Error updating mentor status:', error);
      toast.error('Failed to update mentor status');
    }
  };

  const handleAssignCourse = async () => {
    try {
      const response = await fetch('/api/admin/mentor/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        toast.success('Course assigned successfully');
        setShowAssignModal(false);
        setAssignmentData({ mentorId: '', courseId: '', batchId: '' });
        fetchMentors();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course');
    }
  };

  const handleAssignBatch = async () => {
    try {
      const response = await fetch('/api/admin/mentor/assign-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        toast.success('Batch assigned successfully');
        setShowAssignModal(false);
        setAssignmentData({ mentorId: '', courseId: '', batchId: '' });
        fetchMentors();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign batch');
      }
    } catch (error) {
      console.error('Error assigning batch:', error);
      toast.error('Failed to assign batch');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && mentor.isActive) ||
                         (statusFilter === 'inactive' && !mentor.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const openAssignModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setAssignmentData({ ...assignmentData, mentorId: mentor.id });
    setShowAssignModal(true);
  };

  const openDetailsModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Mentor Management</h1>
          <p className="text-gray-400 mt-1">Manage mentors, assignments, and performance</p>
        </div>
        <button
          onClick={() => router.push('/admin/mentors/add')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Mentor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Mentors</p>
              <p className="text-2xl font-bold text-white">{mentors.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Mentors</p>
              <p className="text-2xl font-bold text-green-400">{mentors.filter(m => m.isActive).length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">
                {mentors.reduce((sum, m) => sum + (m.totalStudents || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-400">
                {mentors.length > 0 
                  ? (mentors.reduce((sum, m) => sum + (m.rating || 0), 0) / mentors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentors by name, email, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expertise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredMentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {mentor.image ? (
                        <img
                          src={mentor.image}
                          alt={mentor.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {mentor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mentor.courses?.length || 0} courses
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{mentor.email}</div>
                    <div className="text-sm text-gray-500">{mentor.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {mentor.courses.length} courses
                    </div>
                    <div className="text-xs text-gray-500">
                      {mentor.totalStudents} students
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {mentor.totalStudents} students
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {mentor.rating.toFixed(1)} rating
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mentor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailsModal(mentor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditMentor(mentor)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Mentor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(mentor.id, mentor.isActive)}
                        className={`${
                          mentor.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                        }`}
                        title={mentor.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {mentor.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMentor(mentor.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Mentor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Course/Batch Modal */}
      {showAssignModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Assign to {selectedMentor.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={assignmentData.courseId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  value={assignmentData.batchId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} - {batch.courseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {assignmentData.courseId && (
                <button
                  onClick={handleAssignCourse}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Assign Course
                </button>
              )}
              {assignmentData.batchId && (
                <button
                  onClick={handleAssignBatch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Batch
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mentor Details Modal */}
      {showDetailsModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                {selectedMentor.name}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMentor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedMentor.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Professional Info</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedMentor.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedMentor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span className="text-sm ml-2">
                        {new Date(selectedMentor.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedMentor.totalStudents}
                      </div>
                      <div className="text-xs text-gray-600">Total Students</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        ⭐ {selectedMentor.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">Average Rating</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedMentor.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Total Revenue</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedMentor.courses.length}
                      </div>
                      <div className="text-xs text-gray-600">Active Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Image */}
            {selectedMentor.image && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Profile Image</h3>
                <img
                  src={selectedMentor.image}
                  alt={selectedMentor.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}

            {/* Assigned Courses */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Assigned Courses</h3>
              {selectedMentor.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMentor.courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-blue-600 mt-1">
                        {course.students} students enrolled
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No courses assigned</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
