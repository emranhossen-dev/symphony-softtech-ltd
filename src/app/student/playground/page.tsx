"use client";

import { useState, useEffect, use } from 'react';
import { Play, Save, ChevronLeft, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');
  const courseSlug = searchParams.get('courseSlug');
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    h1 {
      color: #333;
    }
    button {
      padding: 10px 20px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a live preview of your HTML code.</p>
    <button onclick="console.log('Button clicked!')">Click Me</button>
  </div>
  <script>
    console.log('Page loaded!');
  </script>
</body>
</html>`);
  const [output, setOutput] = useState('');
  const [outputMode, setOutputMode] = useState<'live' | 'console'>('live');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = useState(false);

  useEffect(() => {
    if (!moduleId) return;

    const checkSubmissionStatus = async () => {
      try {
        const response = await fetch(`/api/student/homework/status?moduleId=${moduleId}`);
        const data = await response.json();
        
        if (data.success && data.submission) {
          setShowAlreadySubmittedModal(true);
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      }
    };

    checkSubmissionStatus();
  }, [moduleId]);

  const handleRun = () => {
    setOutputMode('console');

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Extract and run JavaScript from the code
      const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/);
      if (scriptMatch) {
        const jsCode = scriptMatch[1];
        eval(jsCode);
      }

      console.log = originalLog;
      setOutput(logs.length > 0 ? logs.join('\n') : 'No console output');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSave = () => {
    // In a real app, save the code to the database
    console.log('Saving code for module:', moduleId);
    alert('Code saved successfully!');
  };

  const handleSubmit = async () => {
    if (!moduleId || !courseId) {
      alert('Module ID and Course ID are required');
      console.error('Missing IDs:', { moduleId, courseId });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('moduleId', moduleId);
      formData.append('courseId', courseId);
      formData.append('code', code);

      console.log('Submitting homework:', { moduleId, courseId });

      const response = await fetch('/api/student/homework/submission', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      console.log('Submission response:', data);

      if (data.success) {
        setShowSuccessModal(true);
      } else {
        alert(data.error || 'Failed to submit homework');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      alert('Failed to submit homework');
      setIsSubmitting(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f4c] to-[#0d1b3e] ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      {!isFullScreen && (
        <div className="glass-nav border-b border-purple-500/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-white">Code Playground</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex ${isFullScreen ? 'h-screen' : 'h-[calc(100vh-73px)]'}`}>
        {/* Code Editor */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Code Editor</h2>
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Run Code</span>
            </button>
          </div>
          <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-purple-500/30">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-green-400 font-mono p-4 focus:outline-none resize-none"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

        {/* Output */}
        <div className="w-96 bg-gray-900/50 border-l border-purple-500/30 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Output</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setOutputMode('live')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  outputMode === 'live'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setOutputMode('console')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  outputMode === 'console'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Console
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl overflow-hidden border border-purple-500/30">
            {outputMode === 'live' ? (
              <iframe
                srcDoc={code}
                title="Live Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 p-4 overflow-auto">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {output || 'Run your code to see console output...'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={toggleFullScreen}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-5 h-5" />
              <span className="text-sm font-medium">Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-5 h-5" />
              <span className="text-sm font-medium">Full Screen</span>
            </>
          )}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#161b40] to-[#0d1333] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
              <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Homework Submitted!</h3>
            <p className="text-gray-300 mb-6">Welcome back! Your homework has been successfully submitted. Click the button below to resume your learning journey.</p>
            <button
              onClick={() => {
                if (courseSlug) {
                  window.location.href = `/student/learn/${courseSlug}`;
                } else {
                  router.back();
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 active:scale-95"
            >
              Go to Course Video
            </button>
          </div>
        </div>
      )}

      {/* Already Submitted Modal */}
      {showAlreadySubmittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#161b40] to-[#0d1333] border border-blue-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Already Submitted</h3>
            <p className="text-gray-300 mb-6">You have already submitted homework for this module. You can resubmit or view your current submission.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAlreadySubmittedModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all border border-gray-600"
              >
                Resubmit
              </button>
              <button
                onClick={() => router.push('/student/homework')}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
              >
                View Homework
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
