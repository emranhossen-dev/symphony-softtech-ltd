'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  marks?: number;
  feedback?: string;
  code?: string;
  fileUrl?: string;
  courseName: string;
  courseSlug: string;
  moduleId: string;
  courseId: string;
}

export default function MentorHomework() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Fetch on mount and whenever refreshKey changes
  useEffect(() => {
    fetchHomeworkSubmissions();
  }, [refreshKey]);

  // Refresh when tab becomes visible (after navigating back from detail page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[HW List] Tab visible, refreshing...');
        setRefreshKey(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchHomeworkSubmissions = async () => {
    console.log('[HW List] Fetching submissions...');
    try {
      const response = await fetch(`/api/mentor/homework?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[HW List] Fetched:', data.submissions?.length, 'items');
        if (data.success) {
          // Log each submission status for debugging
          data.submissions?.forEach((s: any) => {
            console.log(`[HW List] ${s.studentName}: status=${s.status}`);
          });
          setSubmissions(data.submissions || []);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load homework submissions');
      }
    } catch (error) {
      console.error('Error fetching homework submissions:', error);
      toast.error('Failed to load homework submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'APPROVED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full text-xs font-medium w-fit">
            <CheckCircle className="w-3 h-3" />
            Approved
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-full text-xs font-medium w-fit">
            <XCircle className="w-3 h-3" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const handleView = (submission: HomeworkSubmission) => {
    router.push(`/mentor/homework/${submission.id}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Homework Review</h1>
          <p className="text-gray-300 mt-1">Review and grade student homework submissions.</p>
        </div>
        <button
          onClick={() => setRefreshKey(Date.now())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Pending Review</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">
                {submissions.filter(s => s.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Approved</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {submissions.filter(s => s.status === 'APPROVED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-2">
                {submissions.filter(s => s.status === 'REJECTED').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">All Submissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Homework
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {submission.studentName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {submission.studentEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {submission.courseName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    {submission.homeworkTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(submission)}
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
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No homework submissions</h3>
          <p className="text-gray-400">Students haven't submitted any homework yet.</p>
        </div>
      )}
    </div>
  );
}
