"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, CheckCircle, Play } from 'lucide-react';
import CodePlayground from '@/components/student/CodePlayground';
import toast from 'react-hot-toast';

interface Homework {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  courseId: string;
  courseSlug?: string;
  dueDate?: string;
}

interface HomeworkSubmission {
  id: string;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  submittedAt: string;
}

const PlaygroundPage = () => {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params.homeworkId as string;

  const [homework, setHomework] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchHomework();
    fetchSubmission();
  }, [homeworkId]);

  const fetchHomework = async () => {
    try {
      const response = await fetch(`/api/student/homework/${homeworkId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setHomework(data.homework);
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast.error('Failed to load homework');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/student/homework/submission/${homeworkId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.submission) {
        setSubmission(data.submission);
        setCode(data.submission.code);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    }
  };

  const handleSave = async (codeToSave: string) => {
    try {
      const response = await fetch('/api/student/homework/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          homeworkId,
          code: codeToSave,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Code saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save code');
      }
    } catch (error) {
      console.error('Error saving code:', error);
      toast.error('Failed to save code');
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/student/homework/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          homeworkId,
          code,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowSuccessModal(true);
        await fetchSubmission(); // Refresh submission status
      } else {
        toast.error(data.error || 'Failed to submit homework');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const goToClass = () => {
    setShowSuccessModal(false);
    // Navigate to course learn page using slug if available
    if (homework?.courseSlug) {
      router.push(`/student/learn/${homework.courseSlug}`);
    } else if (homework?.courseId) {
      router.push(`/student/course-view/${homework.courseId}`);
    } else {
      router.push('/student/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Homework Not Found</h2>
          <p className="text-gray-600">The homework assignment you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{homework.title}</h1>
                <p className="text-sm text-gray-600">Homework Assignment</p>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex items-center gap-3">
              {submission && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    submission.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={submitting || (!submission?.code && !code.trim())}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {submission ? 'Resubmit' : 'Submit Homework'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Homework Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {homework.description}
                  </div>
                </div>

                {homework.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(homework.dueDate).toLocaleDateString()} at {new Date(homework.dueDate).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {submission && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Submission Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          submission.status === 'APPROVED' ? 'text-green-600' :
                          submission.status === 'REJECTED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Submitted:</span>
                        <span className="text-gray-900">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {submission?.feedback && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Mentor Feedback</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                      {submission.feedback}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Write your solution in the code editor</li>
                    <li>• Test your code using the Run button</li>
                    <li>• Save your work periodically</li>
                    <li>• Submit when you're ready for review</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Code Playground */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Editor</h2>
              
              <CodePlayground
                initialCode={submission?.code || ''}
                language="javascript"
                theme="vs-dark"
                onCodeChange={setCode}
                onRun={() => console.log('Code run')}
                onSave={handleSave}
                homeworkTitle={homework.title}
                moduleId={homework.moduleId}
                courseId={homework.courseId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Homework Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Great job! Your homework has been submitted successfully and is now under review.
            </p>
            <div className="space-y-3">
              <button
                onClick={goToClass}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Go to Class
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundPage;
