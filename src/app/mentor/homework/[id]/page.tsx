'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, Download, Star } from 'lucide-react';
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
  feedback?: string;
  marks?: number;
  code?: string;
  fileUrl?: string;
  courseName: string;
  courseSlug: string;
  moduleId: string;
  courseId: string;
}

export default function HomeworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [marksValue, setMarksValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch('/api/mentor/homework', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.submissions) {
          const found = data.submissions.find((s: HomeworkSubmission) => s.id === submissionId);
          if (found) {
            setSubmission(found);
            setFeedbackText(found.feedback || '');
            setMarksValue(found.marks?.toString() || '');
          } else {
            toast.error('Submission not found');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'APPROVED':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </div>
        );
      case 'REJECTED':
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

  const handleGrade = async (status: 'APPROVED' | 'REJECTED') => {
    if (!submission) return;
    setErrorMessage('');

    try {
      const response = await fetch(`/api/mentor/homework/${submission.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          feedback: feedbackText,
          marks: marksValue
        })
      });

      const data = await response.json();
      console.log('Full error data:', JSON.stringify(data, null, 2));
      if (response.ok) {
        toast.success(`Homework ${status.toLowerCase()}!`);
        setSubmission(prev => prev ? { ...prev, status, feedback: feedbackText, marks: parseInt(marksValue) || undefined } : null);
        // Full page reload to ensure fresh data after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/mentor/homework';
        }, 1500);
      } else {
        const errMsg = data.error || 'Failed to grade homework';
        const fullError = `${errMsg} | CODE: ${data.code || 'none'} | META: ${JSON.stringify(data.meta || {})}`;
        setErrorMessage(fullError);
        toast.error(errMsg);
      }
    } catch (error: any) {
      console.error('Error grading homework:', error);
      setErrorMessage(error.message || 'Failed to grade homework');
      toast.error('Failed to grade homework');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Submission not found</h3>
          <button
            onClick={() => router.push('/mentor/homework')}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homework
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/mentor/homework')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homework
        </button>

        {/* Header Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{submission.homeworkTitle}</h1>
              <p className="text-gray-400 mt-1">{submission.courseName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Status:</span>
              {getStatusBadge(submission.status)}
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Student Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {submission.studentName?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-white font-medium">{submission.studentName}</p>
              <p className="text-sm text-gray-400">{submission.studentEmail}</p>
            </div>
            <div className="ml-auto text-sm text-gray-400">
              <Calendar className="w-4 h-4 inline mr-1" />
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Code / Content */}
        {submission.code && (
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Submitted Code / Answer</h2>
            <pre className="p-4 bg-slate-950 rounded-lg overflow-x-auto text-sm text-gray-300 border border-slate-700">
              <code>{submission.code}</code>
            </pre>
          </div>
        )}

        {/* File URL */}
        {submission.fileUrl && (
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Attached File</h2>
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download File
            </a>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-200 font-medium">Error: {errorMessage}</p>
          </div>
        )}

        {/* Grade & Feedback (only for pending) */}
        {submission.status === 'PENDING' && (
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Review</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksValue}
                  onChange={(e) => setMarksValue(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Enter marks..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Write feedback for the student..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleGrade('APPROVED')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleGrade('REJECTED')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show existing feedback for non-pending */}
        {submission.status !== 'PENDING' && (
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Review Result</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium">Status: {submission.status}</span>
              </div>
              {submission.marks !== undefined && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Marks: {submission.marks}/100</span>
                </div>
              )}
              {submission.feedback && (
                <div>
                  <span className="text-sm text-gray-400">Feedback:</span>
                  <p className="text-gray-200 mt-1">{submission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
