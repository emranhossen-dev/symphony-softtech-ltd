import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Calendar, BookOpen, DollarSign, Clock, CheckCircle, XCircle, Edit, Save, User } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseName: string;
  status: string;
  paymentStatus: string;
  amount?: number;
  appliedDate: string;
  address?: string;
  educationLevel?: string;
  whyJoin?: string;
}

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onSave?: (student: Student) => void;
}

export default function StudentDetailModal({ student, onClose, onSave }: StudentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);

  if (!student) return null;

  const handleEdit = () => {
    setEditedStudent({ ...student });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedStudent && onSave) {
      onSave(editedStudent);
    }
    setIsEditing(false);
    setEditedStudent(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStudent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-900/50 text-green-400 border-green-700';
      case 'REJECTED': return 'bg-red-900/50 text-red-400 border-red-700';
      case 'PENDING_REVIEW': return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const currentStudent = editedStudent || student;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {currentStudent.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStudent.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{currentStudent.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(currentStudent.status)}`}>
              {currentStudent.status === 'APPROVED' && <CheckCircle className="w-4 h-4" />}
              {currentStudent.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
              {currentStudent.status === 'PENDING_REVIEW' && <Clock className="w-4 h-4" />}
              {currentStudent.status}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-full border ${
              currentStudent.paymentStatus === 'PAID' ? 'bg-green-900/50 text-green-400 border-green-700' :
              currentStudent.paymentStatus === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' :
              'bg-gray-800 text-gray-300 border-gray-600'
            }`}>
              <DollarSign className="w-4 h-4" />
              {currentStudent.paymentStatus}
            </span>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentStudent.phone}
                    onChange={(e) => setEditedStudent({ ...currentStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{currentStudent.phone}</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentStudent.email}
                    onChange={(e) => setEditedStudent({ ...currentStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{currentStudent.email}</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl md:col-span-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Address
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentStudent.address || ''}
                    onChange={(e) => setEditedStudent({ ...currentStudent, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{currentStudent.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Course Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <BookOpen className="w-4 h-4" />
                  Course Name
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{currentStudent.courseName}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{currentStudent.amount ? `৳${currentStudent.amount.toLocaleString()}` : 'Not specified'}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Applied Date
                </div>
                <p className="text-gray-900 dark:text-white font-medium">{new Date(currentStudent.appliedDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Education Level
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentStudent.educationLevel || ''}
                    onChange={(e) => setEditedStudent({ ...currentStudent, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">{currentStudent.educationLevel || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(currentStudent.whyJoin || isEditing) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Why Join?</h3>
              {isEditing ? (
                <textarea
                  value={currentStudent.whyJoin || ''}
                  onChange={(e) => setEditedStudent({ ...currentStudent, whyJoin: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-xl text-gray-900 dark:text-white"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  {currentStudent.whyJoin || 'Not provided'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
