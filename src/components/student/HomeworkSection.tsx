'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HomeworkSectionProps {
  homework?: string | null;
  moduleId?: string;
  courseId?: string;
}

interface HomeworkSubmission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  code?: string | null;
  fileUrl?: string | null;
  feedback?: string | null;
  mentor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  submittedAt: string;
  reviewedAt?: string | null;
}

export default function HomeworkSection({ homework, moduleId, courseId }: HomeworkSectionProps) {
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [code, setCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (moduleId) {
      fetchHomeworkStatus();
    }
  }, [moduleId]);

  const fetchHomeworkStatus = async () => {
    if (!moduleId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/student/homework/status?moduleId=${moduleId}`);
      const data = await response.json();
      
      if (data.success && data.submission) {
        setSubmission(data.submission);
      }
    } catch (error) {
      console.error('Error fetching homework status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() && !selectedFile) {
      alert('Please provide code or upload a file');
      return;
    }

    if (!moduleId || !courseId) {
      alert('Module and Course information is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('moduleId', moduleId);
      formData.append('courseId', courseId);
      formData.append('code', code);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/student/homework/submission', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh status
        await fetchHomeworkStatus();
        // Clear form
        setCode('');
        setSelectedFile(null);
        alert('Homework submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit homework');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      alert('Failed to submit homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </div>
        );
      case 'APPROVED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  if (!homework) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Homework Assignment</h3>
            </div>
            {submission && getStatusBadge(submission.status)}
          </div>
        </div>

        {/* Assignment Description */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-gray-700 whitespace-pre-wrap">
            {homework}
          </div>
        </div>

        {/* Submission Status and Feedback */}
        {submission && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
                <div className="text-sm text-gray-600">
                  <p>Submitted: {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}</p>
                  {submission.reviewedAt && (
                    <p>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()} at {new Date(submission.reviewedAt).toLocaleTimeString()}</p>
                  )}
                  {submission.mentor && (
                    <p>Reviewed by: {submission.mentor.name}</p>
                  )}
                </div>
              </div>

              {submission.feedback && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mentor Feedback</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submission Actions */}
        <div className="p-6">
          <div className="flex gap-4">
            {/* Start Homework Button - Opens Playground */}
            <button
              onClick={() => {
                if (moduleId && courseId) {
                  // Create a homework ID based on moduleId
                  const homeworkId = `hw-${moduleId}`;
                  window.location.href = `/student/playground/${homeworkId}`;
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Start Homework in Playground
            </button>

            {/* Traditional Submit (for file uploads) */}
            {!submission || submission.status === 'REJECTED' ? (
              <details className="flex-1">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                  Or submit file/text instead
                </summary>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {/* Code Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Solution
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code here..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      or Upload File
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedFile ? selectedFile.name : 'Choose file...'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || (!code.trim() && !selectedFile)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Homework
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </details>
            ) : (
              <div className="flex-1 bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Homework submitted and awaiting review</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
