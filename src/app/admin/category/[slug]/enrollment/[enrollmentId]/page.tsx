"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  Edit,
  Save,
  X
} from "lucide-react";

type EnrollmentStatus = 'APPLIED' | 'ADMITTED' | 'REJECTED' | 'WAITING' | 'NEXT_BATCH';

interface Enrollment {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  courseName: string;
  educationLevel?: string;
  whyJoin?: string;
  preferredBatchTime?: string;
  enrollmentStatus: EnrollmentStatus;
  paymentStatus?: string;
  assignedMentor?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Array<{
    id: string;
    paymentMethod: string;
    transactionId?: string;
    amount?: number;
    paymentStatus: string;
    createdAt: string;
  }>;
}

const EnrollmentDetail = () => {
  const params = useParams();
  const router = useRouter();
  // In nested routes, params will contain both slug and enrollmentId
  const slug = params.slug as string;
  const enrollmentId = params.enrollmentId as string;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Enrollment>>({});

  useEffect(() => {
    if (slug && enrollmentId) {
      fetchEnrollment();
    }
  }, [slug, enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setEnrollment(data.enrollment);
        setFormData(data.enrollment);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: EnrollmentStatus) => {
    try {
      console.log('Changing status to:', newStatus);
      console.log('Enrollment ID:', enrollmentId);
      
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
      
      if (data.success) {
        setEnrollment(prev => prev ? { ...prev, enrollmentStatus: newStatus } : null);
        alert(`Status updated to ${newStatus}`);
      } else {
        alert('Failed to update status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setEnrollment(data.enrollment);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  const getStatusColor = (status: EnrollmentStatus) => {
    const colors: Record<EnrollmentStatus, string> = {
      'APPLIED': 'bg-blue-900/50 text-blue-400',
      'WAITING': 'bg-yellow-900/50 text-yellow-400',
      'ADMITTED': 'bg-green-900/50 text-green-400',
      'REJECTED': 'bg-red-900/50 text-red-400',
      'NEXT_BATCH': 'bg-purple-900/50 text-purple-400'
    };
    return colors[status] || 'bg-gray-800 text-gray-300';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Enrollment Not Found</h2>
          <p className="text-gray-400">The requested enrollment does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/category/${slug}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {slug.charAt(0).toUpperCase() + slug.slice(1)} Category
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-400">Enrollment ID: {enrollmentId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(enrollment);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Student Information</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.enrollmentStatus)} border border-opacity-30`}>
            {enrollment.enrollmentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-800"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{enrollment.fullName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-800"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{enrollment.phoneNumber}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-800"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{enrollment.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
              {editing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-800"
                  rows={2}
                />
              ) : (
                <span className="text-white">{enrollment.address}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Course</label>
              <span className="text-white font-medium">{enrollment.courseName}</span>
            </div>

            {enrollment.educationLevel && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Education Level</label>
                <span className="text-white">{enrollment.educationLevel}</span>
              </div>
            )}

            {enrollment.whyJoin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason for Joining</label>
                <span className="text-white">{enrollment.whyJoin}</span>
              </div>
            )}

            {enrollment.preferredBatchTime && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Batch Time</label>
                <span className="text-white">{enrollment.preferredBatchTime}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied: {new Date(enrollment.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated: {new Date(enrollment.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Status Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStatusChange('APPLIED')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Applied
          </button>
          
          <button
            onClick={() => handleStatusChange('WAITING')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Waiting
          </button>
          
          <button
            onClick={() => handleStatusChange('ADMITTED')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Admit
          </button>
          
          <button
            onClick={() => handleStatusChange('NEXT_BATCH')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Next Batch
          </button>
          
          <button
            onClick={() => handleStatusChange('REJECTED')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Ban className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>

      {/* Payments */}
      {enrollment.payments && enrollment.payments.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
          <div className="space-y-3">
            {enrollment.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-white">{payment.paymentMethod}</div>
                  {payment.transactionId && (
                    <div className="text-sm text-gray-400">Transaction: {payment.transactionId}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {payment.amount ? `৳${payment.amount}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-400">{payment.paymentStatus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentDetail;
