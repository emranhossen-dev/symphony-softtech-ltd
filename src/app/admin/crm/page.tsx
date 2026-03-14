'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, MessageSquare, Clock, CheckCircle, XCircle, Calendar, User, Mail, PhoneCall, FileText, Plus, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  assignedEmployee?: {
    id: string;
    name: string;
    email: string;
  };
  followUps: Array<{
    id: string;
    type: 'CALL' | 'EMAIL' | 'SMS' | 'VISIT';
    status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED';
    scheduledAt: string;
    completedAt?: string;
    notes: string;
    duration?: number;
    nextFollowUp?: string;
  }>;
  lastCall?: {
    id: string;
    status: string;
    completedAt: string;
    notes: string;
    duration: number;
  };
  callHistory: Array<{
    id: string;
    type: string;
    status: string;
    scheduledAt: string;
    completedAt?: string;
    notes: string;
    duration?: number;
    employee: {
      name: string;
    };
  }>;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function EmployeeCRM() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [followUpData, setFollowUpData] = useState({
    enrollmentId: '',
    type: 'CALL' as 'CALL' | 'EMAIL' | 'SMS' | 'VISIT',
    scheduledAt: '',
    notes: '',
    nextFollowUp: ''
  });
  const [callData, setCallData] = useState({
    enrollmentId: '',
    status: 'COMPLETED' as 'COMPLETED' | 'MISSED' | 'RESCHEDULED',
    notes: '',
    duration: 0,
    nextFollowUp: ''
  });

  useEffect(() => {
    fetchEnrollments();
    fetchEmployees();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/crm/enrollments');
      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/crm/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpData)
      });

      if (response.ok) {
        toast.success('Follow-up scheduled successfully');
        setShowFollowUpModal(false);
        setFollowUpData({
          enrollmentId: '',
          type: 'CALL',
          scheduledAt: '',
          notes: '',
          nextFollowUp: ''
        });
        fetchEnrollments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to schedule follow-up');
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast.error('Failed to schedule follow-up');
    }
  };

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/crm/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData)
      });

      if (response.ok) {
        toast.success('Call logged successfully');
        setShowCallModal(false);
        setCallData({
          enrollmentId: '',
          status: 'COMPLETED',
          notes: '',
          duration: 0,
          nextFollowUp: ''
        });
        fetchEnrollments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to log call');
      }
    } catch (error) {
      console.error('Error logging call:', error);
      toast.error('Failed to log call');
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/crm/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, status: newStatus })
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchEnrollments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.enrollmentStatus === statusFilter;
    
    const hasPendingFollowUp = enrollment.followUps.some(f => f.status === 'PENDING');
    const matchesFollowUp = followUpFilter === 'all' || 
                           (followUpFilter === 'pending' && hasPendingFollowUp) ||
                           (followUpFilter === 'none' && !hasPendingFollowUp);
    
    return matchesSearch && matchesStatus && matchesFollowUp;
  });

  const openFollowUpModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setFollowUpData({ ...followUpData, enrollmentId: enrollment.id });
    setShowFollowUpModal(true);
  };

  const openCallModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setCallData({ ...callData, enrollmentId: enrollment.id });
    setShowCallModal(true);
  };

  const openHistoryModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowHistoryModal(true);
  };

  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-4 h-4" />;
      case 'EMAIL': return <Mail className="w-4 h-4" />;
      case 'SMS': return <MessageSquare className="w-4 h-4" />;
      case 'VISIT': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800';
      case 'INTERESTED': return 'bg-purple-100 text-purple-800';
      case 'NOT_INTERESTED': return 'bg-red-100 text-red-800';
      case 'ENROLLED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'MISSED': return 'bg-red-100 text-red-800';
      case 'RESCHEDULED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Employee CRM System</h1>
          <p className="text-gray-600 mt-1">Manage follow-ups, calls, and customer relationships</p>
        </div>
        <button
          onClick={() => setShowFollowUpModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Follow-up
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Follow-ups</p>
              <p className="text-2xl font-bold text-yellow-600">
                {enrollments.reduce((sum, e) => 
                  sum + e.followUps.filter(f => f.status === 'PENDING').length, 0
                )}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Calls</p>
              <p className="text-2xl font-bold text-green-600">
                {enrollments.reduce((sum, e) => 
                  sum + e.callHistory.filter(c => c.status === 'COMPLETED').length, 0
                )}
              </p>
            </div>
            <PhoneCall className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {enrollments.length > 0 
                  ? Math.round((enrollments.filter(e => e.enrollmentStatus === 'ENROLLED').length / enrollments.length) * 100)
                  : 0
                }%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or course..."
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
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="ENROLLED">Enrolled</option>
            </select>
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Follow-ups</option>
              <option value="pending">Has Pending</option>
              <option value="none">No Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Follow-ups
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Call
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{enrollment.fullName}</div>
                      <div className="text-sm text-gray-500">{enrollment.email}</div>
                      <div className="text-sm text-gray-500">{enrollment.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{enrollment.courseName}</div>
                    <div className="text-sm text-gray-500">{enrollment.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={enrollment.enrollmentStatus}
                      onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(enrollment.enrollmentStatus)}`}
                    >
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="NOT_INTERESTED">Not Interested</option>
                      <option value="ENROLLED">Enrolled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {enrollment.followUps.slice(0, 2).map((followUp) => (
                        <div key={followUp.id} className="flex items-center gap-2 text-xs">
                          {getFollowUpIcon(followUp.type)}
                          <span className={`px-2 py-1 rounded-full ${getFollowUpStatusColor(followUp.status)}`}>
                            {followUp.status}
                          </span>
                          <span className="text-gray-500">
                            {new Date(followUp.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {enrollment.followUps.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{enrollment.followUps.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.lastCall ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(enrollment.lastCall.completedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {enrollment.lastCall.status} • {enrollment.lastCall.duration}min
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No calls yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openFollowUpModal(enrollment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Schedule Follow-up"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openCallModal(enrollment)}
                        className="text-green-600 hover:text-green-900"
                        title="Log Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openHistoryModal(enrollment)}
                        className="text-purple-600 hover:text-purple-900"
                        title="View History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Follow-up Modal */}
      {showFollowUpModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Schedule Follow-up - {selectedEnrollment.fullName}
            </h2>
            <form onSubmit={handleScheduleFollowUp}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    value={followUpData.type}
                    onChange={(e) => setFollowUpData({ ...followUpData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="VISIT">In-Person Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={followUpData.scheduledAt}
                    onChange={(e) => setFollowUpData({ ...followUpData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    required
                    value={followUpData.notes}
                    onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Purpose of follow-up, topics to discuss, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Follow-up (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={followUpData.nextFollowUp}
                    onChange={(e) => setFollowUpData({ ...followUpData, nextFollowUp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Call Modal */}
      {showCallModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Log Call - {selectedEnrollment.fullName}
            </h2>
            <form onSubmit={handleLogCall}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Status
                  </label>
                  <select
                    value={callData.status}
                    onChange={(e) => setCallData({ ...callData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="MISSED">Missed</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={callData.duration}
                    onChange={(e) => setCallData({ ...callData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conversation Notes
                  </label>
                  <textarea
                    required
                    value={callData.notes}
                    onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Summary of conversation, key points discussed, outcome, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Follow-up (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={callData.nextFollowUp}
                    onChange={(e) => setCallData({ ...callData, nextFollowUp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Log Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call History Modal */}
      {showHistoryModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                Call History - {selectedEnrollment.fullName}
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm ml-2">{selectedEnrollment.email}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm ml-2">{selectedEnrollment.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Course:</span>
                  <span className="text-sm ml-2">{selectedEnrollment.courseName}</span>
                </div>
              </div>
            </div>

            {/* Follow-ups */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Scheduled Follow-ups</h3>
              {selectedEnrollment.followUps.length > 0 ? (
                <div className="space-y-3">
                  {selectedEnrollment.followUps.map((followUp) => (
                    <div key={followUp.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getFollowUpIcon(followUp.type)}
                          <span className="font-medium">{followUp.type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getFollowUpStatusColor(followUp.status)}`}>
                            {followUp.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(followUp.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{followUp.notes}</div>
                      {followUp.nextFollowUp && (
                        <div className="text-xs text-blue-600">
                          Next follow-up: {new Date(followUp.nextFollowUp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No follow-ups scheduled</p>
              )}
            </div>

            {/* Call History */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Call History</h3>
              {selectedEnrollment.callHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedEnrollment.callHistory.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{call.type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getFollowUpStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                          {call.duration && (
                            <span className="text-sm text-gray-500">{call.duration} min</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {call.completedAt 
                            ? new Date(call.completedAt).toLocaleString()
                            : new Date(call.scheduledAt).toLocaleString()
                          }
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{call.notes}</div>
                      <div className="text-xs text-gray-500">
                        By: {call.employee.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No call history</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
