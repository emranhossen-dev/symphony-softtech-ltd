'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Save, 
  CheckCircle, 
  ArrowLeft, 
  Code, 
  FileText, 
  Clock,
  Terminal,
  Settings,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Module {
  id: string;
  title: string;
  homework?: string;
  order: number;
}

interface HomeworkSubmission {
  id: string;
  code?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  submittedAt: string;
}

interface TestResult {
  passed: boolean;
  output?: string;
  error?: string;
}

export default function HomeworkPlayground() {
  const { user } = useAuth();
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleId = params.moduleId as string;
  
  const [module, setModule] = useState<Module | null>(null);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'console'>('code');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (courseSlug && moduleId) {
      fetchModuleData();
      fetchExistingSubmission();
    }
  }, [courseSlug, moduleId]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseSlug}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const targetModule = data.course.modules.find((m: Module) => m.id === moduleId);
        if (targetModule) {
          setModule(targetModule);
        }
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSubmission = async () => {
    try {
      const response = await fetch(`/api/student/homework/submission/${moduleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.submission) {
          setSubmission(data.submission);
          if (data.submission.code) {
            setCode(data.submission.code);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching existing submission:', error);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const response = await fetch(`/api/student/homework/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          language: 'javascript',
          moduleId 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.results || []);
        toast.success('Code executed successfully!');
      } else {
        setTestResults([{
          passed: false,
          error: data.error || 'Code execution failed'
        }]);
        toast.error('Code execution failed');
      }
    } catch (error) {
      console.error('Error running code:', error);
      setTestResults([{
        passed: false,
        error: 'Failed to run code'
      }]);
      toast.error('Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const submitHomework = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/student/homework/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          moduleId,
          code 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmission(data.submission);
        setShowSuccessModal(true);
      } else {
        toast.error(data.error || 'Failed to submit homework');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/student/learn/${courseSlug}`);
  };

  const goToClass = () => {
    setShowSuccessModal(false);
    router.push(`/student/learn/${courseSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Module not found</h2>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go back to course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={goBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Homework Playground</h1>
                <p className="text-sm text-gray-500">
                  Module {module.order}: {module.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {submission && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    submission.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : submission.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {submission.status}
                  </span>
                  {submission.submittedAt && (
                    <span className="text-sm text-gray-500">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Assignment</h2>
              </div>
              <div className="p-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {module.homework || 'Complete the coding assignment below.'}
                  </p>
                </div>
                
                {submission?.feedback && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Feedback</h4>
                    <p className="text-sm text-blue-700">{submission.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Editor Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        activeTab === 'code'
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Code className="w-4 h-4 inline mr-1" />
                      Code
                    </button>
                    <button
                      onClick={() => setActiveTab('console')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        activeTab === 'console'
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Terminal className="w-4 h-4 inline mr-1" />
                      Console
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isRunning ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                      onClick={submitHomework}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="h-96">
                {activeTab === 'code' && (
                  <div className="h-full relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
                      placeholder="// Write your code here..."
                      spellCheck={false}
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-500">
                      {code.length} characters
                    </div>
                  </div>
                )}

                {activeTab === 'console' && (
                  <div className="h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-y-auto">
                    {testResults.length === 0 ? (
                      <div className="text-gray-500">
                        <Terminal className="w-4 h-4 inline mr-2" />
                        Run your code to see output here...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded ${
                              result.passed
                                ? 'bg-green-900 text-green-100'
                                : 'bg-red-900 text-red-100'
                            }`}
                          >
                            {result.passed ? (
                              <div>
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                Test passed
                                {result.output && (
                                  <div className="mt-1 text-xs">{result.output}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium">Error:</span> {result.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>JavaScript</span>
                    <span>UTF-8</span>
                    <span>LF</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Line 1, Column 1</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
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
}
