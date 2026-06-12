'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle, Clock, Send, Eye } from 'lucide-react';

interface HomeworkSubmission {
  id: string;
  title: string;
  courseName: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'pending' | 'approved' | 'rejected';
  marks?: number;
  feedback?: string;
  code?: string;
}

export default function StudentHomework() {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/student/homework/submission', {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success && data.submissions) {
        // Transform the data to match the interface
        const transformedSubmissions = data.submissions.map((sub: any) => ({
          id: sub.id,
          title: sub.module?.title || 'Homework Assignment',
          courseName: sub.course?.title || 'Unknown Course',
          submittedAt: sub.createdAt,
          status: sub.status.toLowerCase() as any,
          marks: sub.marks,
          feedback: sub.feedback,
          code: sub.code
        }));
        setSubmissions(transformedSubmissions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Send className="w-3 h-3 mr-1" />
            Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Clock className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Homework Submissions</h1>
            <p className="text-green-100 text-sm sm:text-base">Track your homework submissions and review feedback.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-green-100 text-xs">Total Tasks</p>
              <p className="text-2xl font-bold">{loading ? '-' : submissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{submissions.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                    {submissions.filter(s => s.status === 'PENDING').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                    {submissions.filter(s => s.status === 'approved').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">All Submissions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Course
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Submitted
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Grade
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                          <div className="text-xs text-gray-500 sm:hidden mt-1">{submission.courseName}</div>
                          {submission.feedback && (
                            <div className="text-xs text-green-600 mt-1">✓ Has feedback</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {submission.courseName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                        {submission.marks !== undefined ? (
                          <span className="font-semibold">{submission.marks}/100</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center"
                          title="View Homework"
                        >
                          <Eye className="w-5 h-5" />
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600 text-sm sm:text-base">You haven't submitted any homework assignments yet.</p>
            </div>
          )}

          {/* View Homework Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedSubmission.courseName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedSubmission.status)}
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Submitted On</p>
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(selectedSubmission.submittedAt).toLocaleDateString()} at {new Date(selectedSubmission.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {selectedSubmission.marks !== undefined && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Grade</p>
                        <p className="text-gray-900 font-medium text-lg">
                          {selectedSubmission.marks} <span className="text-sm text-gray-500 font-normal">/ 100</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  {selectedSubmission.feedback && (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-medium text-blue-900 mb-2">Mentor Feedback</p>
                      <p className="text-blue-800 text-sm whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                    </div>
                  )}

                  {/* Code Section */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Submitted Code</p>
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <div className="flex items-center px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-gray-300 font-mono text-sm leading-relaxed">
                          {selectedSubmission.code || 'No code provided.'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
