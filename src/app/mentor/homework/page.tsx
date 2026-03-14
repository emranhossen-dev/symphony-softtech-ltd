'use client';

import { FileText, User, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface HomeworkSubmission {
  id: string;
  studentName: string;
  courseName: string;
  moduleName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  grade?: number;
}

export default function MentorHomework() {
  const submissions: HomeworkSubmission[] = [
    {
      id: '1',
      studentName: 'John Doe',
      courseName: 'Web Development Basics',
      moduleName: 'HTML Portfolio Project',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      courseName: 'React Advanced Concepts',
      moduleName: 'Component Library',
      submittedAt: '2024-01-15T09:15:00Z',
      status: 'pending'
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      courseName: 'Web Development Basics',
      moduleName: 'CSS Animation Challenge',
      submittedAt: '2024-01-14T16:45:00Z',
      status: 'approved',
      grade: 85
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      courseName: 'Node.js Backend Development',
      moduleName: 'REST API Project',
      submittedAt: '2024-01-14T14:20:00Z',
      status: 'rejected',
      grade: 45
    },
    {
      id: '5',
      studentName: 'Tom Brown',
      courseName: 'React Advanced Concepts',
      moduleName: 'State Management Implementation',
      submittedAt: '2024-01-13T11:30:00Z',
      status: 'approved',
      grade: 92
    },
    {
      id: '6',
      studentName: 'Alice Davis',
      courseName: 'Python Programming',
      moduleName: 'Data Analysis Project',
      submittedAt: '2024-01-12T08:45:00Z',
      status: 'pending'
    },
    {
      id: '7',
      studentName: 'Bob Miller',
      courseName: 'Database Design Fundamentals',
      moduleName: 'SQL Schema Design',
      submittedAt: '2024-01-11T15:20:00Z',
      status: 'approved',
      grade: 88
    },
    {
      id: '8',
      studentName: 'Charlie Garcia',
      courseName: 'Mobile App Development',
      moduleName: 'React Native UI',
      submittedAt: '2024-01-10T13:10:00Z',
      status: 'rejected',
      grade: 52
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const handleView = (submissionId: string) => {
    console.log('View submission:', submissionId);
    // TODO: Implement view logic
    alert(`Viewing submission ${submissionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Homework Review</h1>
        <p className="text-gray-600 mt-1">Review and grade student homework submissions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {submissions.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {submissions.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {submissions.filter(s => s.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Submissions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.studentName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.courseName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {submission.moduleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(submission.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No homework submissions</h3>
          <p className="text-gray-600">Students haven't submitted any homework yet.</p>
        </div>
      )}
    </div>
  );
}
